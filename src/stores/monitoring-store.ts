import { create } from "zustand";
import { IntegrityEvent, RiskFactors, SignalData } from "@/types";

interface MonitoringState {
  integrityScore: number;
  riskFactors: RiskFactors;
  events: IntegrityEvent[];
  signals: SignalData[];
  breachOverlayVisible: boolean;
  isElectron: boolean;
  bridgeConnected: boolean;

  // Actions
  setScore: (score: number) => void;
  setRiskFactors: (r: RiskFactors) => void;
  addEvent: (e: IntegrityEvent) => void;
  updateSignal: (module: string, value: string, state: "NORMAL" | "ELEVATED" | "FLAGGED") => void;
  toggleBreachOverlay: (v: boolean) => void;
  initFromBridge: () => () => void; // Returns cleanup function
  applyScoreUpdate: (data: { score: number; state: string }) => void;
  applySignalEvent: (module: string, flagged: boolean, detail?: string) => void;
}

// Default signal cards — will be updated by real IPC signals
const defaultSignals: SignalData[] = [
  { module: "keystroke", icon: "⌨", value: "100", unit: "%", state: "NORMAL", readings: [] },
  { module: "gaze", icon: "👁", value: "100", unit: "%", state: "NORMAL", readings: [] },
  { module: "process", icon: "⚙", value: "—", unit: "active", state: "NORMAL", readings: [] },
  { module: "liveness", icon: "👤", value: "100", unit: "%", state: "NORMAL", readings: [] },
  { module: "network", icon: "🌐", value: "0", unit: "flags", state: "NORMAL", readings: [] },
];

/** Determine signal card state from risk factor value */
function riskToSignalState(value: number): "NORMAL" | "ELEVATED" | "FLAGGED" {
  if (value >= 60) return "FLAGGED";
  if (value >= 30) return "ELEVATED";
  return "NORMAL";
}

/** Update only the states of existing signals based on new risk factors */
function updateSignalStates(signals: SignalData[], risks: RiskFactors): SignalData[] {
  return signals.map((sig) => {
    switch (sig.module) {
      case "keystroke": return { ...sig, state: riskToSignalState(risks.keystroke), value: String(100 - risks.keystroke), unit: "%" };
      case "gaze": return { ...sig, state: riskToSignalState(risks.gaze), value: String(100 - risks.gaze) };
      case "process": return { ...sig, state: riskToSignalState(risks.process) };
      case "liveness": return { ...sig, state: riskToSignalState(risks.liveness), value: String(100 - risks.liveness) };
      case "network": return { ...sig, state: riskToSignalState(risks.network) };
      default: return sig;
    }
  });
}

let eventCounter = 0;

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  integrityScore: 92,
  riskFactors: { keystroke: 0, gaze: 0, process: 0, liveness: 0, network: 0 },
  events: [],
  signals: defaultSignals,
  breachOverlayVisible: false,
  isElectron: false,
  bridgeConnected: false,

  setScore: (score) => set({ integrityScore: score }),
  setRiskFactors: (r) => set((state) => ({ riskFactors: r, signals: updateSignalStates(state.signals, r) })),

  addEvent: (e) => set((s) => ({ events: [e, ...s.events].slice(0, 100) })), // Keep last 100

  updateSignal: (module, value, signalState) =>
    set((s) => ({
      signals: s.signals.map((sig) =>
        sig.module === module ? { ...sig, value, state: signalState } : sig
      ),
    })),

  toggleBreachOverlay: (v) => set({ breachOverlayVisible: v }),

  applyScoreUpdate: (data) => {
    const { score } = data;
    set({ integrityScore: score });
  },

  applySignalEvent: (module, flagged, detail) => {
    const state = get();
    const severity = flagged ? (state.integrityScore < 35 ? "breach" : "warning") : "info";
    
    const moduleMessages: Record<string, { flagged: string; clear: string }> = {
      keystroke: { flagged: "Abnormal typing rhythm detected", clear: "Typing pattern within normal range" },
      gaze: { flagged: "Off-screen gaze detected", clear: "Gaze tracking stable — center focus" },
      process: { flagged: "Unauthorized process detected", clear: "All processes nominal" },
      liveness: { flagged: "Face not detected in frame", clear: "Face detection: present, single face" },
      network: { flagged: "AI API request intercepted", clear: "Network activity normal" },
    };

    const msg = moduleMessages[module] ?? { flagged: `${module} flagged`, clear: `${module} clear` };

    const event: IntegrityEvent = {
      id: `evt-${++eventCounter}-${Date.now()}`,
      participantId: "local",
      timestamp: new Date(),
      module: module as any,
      severity: severity as any,
      message: detail ?? (flagged ? msg.flagged : msg.clear),
      confidence: flagged ? 75 + Math.round(Math.random() * 25) : 95,
      riskDelta: flagged ? (severity === "breach" ? 8 : 3) : 0,
    };

    set((s) => ({ events: [event, ...s.events].slice(0, 100) }));
  },

  /**
   * Connect to the Electron IPC bridge (window.sentinelBridge).
   * Returns a cleanup function to remove listeners.
   */
  initFromBridge: () => {
    const bridge = typeof window !== "undefined" ? (window as any).sentinelBridge : null;

    if (!bridge) {
      console.log("[MonitoringStore] No sentinelBridge — running in web-only mode");
      set({ isElectron: false, bridgeConnected: false });
      return () => {};
    }

    set({ isElectron: true, bridgeConnected: true });
    console.log("[MonitoringStore] Connected to sentinelBridge");

    // Listen for score updates from Bayesian engine
    bridge.on("signal:score-update", (data: { score: number; state: string }) => {
      get().applyScoreUpdate(data);
    });

    // Listen for breach events
    bridge.on("signal:breach", (data: { reason: string; score: number; ts: number }) => {
      set({ breachOverlayVisible: true });
      get().applySignalEvent("system", true, `BREACH: ${data.reason}`);
    });

    // Listen for keystroke signals
    bridge.on("signal:keystroke", (data: { flagged: boolean; entropy: number; ts: number }) => {
      const { riskFactors, signals } = get();
      const newRisk = data.flagged
        ? Math.min(100, riskFactors.keystroke + 12)
        : Math.max(0, riskFactors.keystroke - 3);
      const newFactors = { ...riskFactors, keystroke: newRisk };
      
      const newSignals = signals.map(sig => {
        if (sig.module === "keystroke") {
          const newReadings = [...sig.readings, data.entropy].slice(-10);
          return { ...sig, readings: newReadings };
        }
        return sig;
      });

      set({ riskFactors: newFactors, signals: updateSignalStates(newSignals, newFactors) });
      get().applySignalEvent("keystroke", data.flagged);
    });

    // Listen for process signals
    bridge.on("signal:process", (data: { flagged: boolean; processName?: string; ts: number }) => {
      const { riskFactors, signals } = get();
      const newRisk = data.flagged
        ? Math.min(100, riskFactors.process + 15)
        : Math.max(0, riskFactors.process - 1);
      const newFactors = { ...riskFactors, process: newRisk };
      
      const newSignals = signals.map(sig => {
        if (sig.module === "process") {
          return { ...sig, value: data.flagged && data.processName ? data.processName : "1" };
        }
        return sig;
      });

      set({ riskFactors: newFactors, signals: updateSignalStates(newSignals, newFactors) });
      get().applySignalEvent("process", data.flagged,
        data.flagged && data.processName ? `Unauthorized: ${data.processName}` : undefined
      );
    });

    // Listen for network signals
    bridge.on("signal:network", (data: { flagged: boolean; domain?: string; ts: number }) => {
      const { riskFactors, signals } = get();
      const newRisk = data.flagged
        ? Math.min(100, riskFactors.network + 18)
        : Math.max(0, riskFactors.network - 1);
      const newFactors = { ...riskFactors, network: newRisk };
      
      const newSignals = signals.map(sig => {
        if (sig.module === "network") {
          return { ...sig, value: data.domain ? data.domain : "Intercepted", unit: "AI API" };
        }
        return sig;
      });

      set({ riskFactors: newFactors, signals: updateSignalStates(newSignals, newFactors) });
      get().applySignalEvent("network", data.flagged,
        data.flagged && data.domain ? `AI API blocked: ${data.domain}` : undefined
      );
    });

    // Cleanup function
    return () => {
      bridge.removeListener("signal:score-update");
      bridge.removeListener("signal:breach");
      bridge.removeListener("signal:keystroke");
      bridge.removeListener("signal:process");
      bridge.removeListener("signal:network");
      set({ bridgeConnected: false });
    };
  },
}));
