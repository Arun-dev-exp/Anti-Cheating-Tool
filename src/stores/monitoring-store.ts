import { create } from "zustand";
import { IntegrityEvent, RiskFactors, SignalData } from "@/types";
import { generateMockEvents } from "@/lib/integrity-engine";

interface MonitoringState {
  integrityScore: number;
  riskFactors: RiskFactors;
  events: IntegrityEvent[];
  signals: SignalData[];
  breachOverlayVisible: boolean;
  setScore: (score: number) => void;
  setRiskFactors: (r: RiskFactors) => void;
  addEvent: (e: IntegrityEvent) => void;
  toggleBreachOverlay: (v: boolean) => void;
  loadDemoState: (state: "secure" | "suspicious" | "breach") => void;
}

const secureSignals: SignalData[] = [
  { module: "keystroke", icon: "⌨", value: "42", unit: "ms", state: "NORMAL", readings: [30, 35, 38, 40, 42, 41, 39, 40, 42, 43] },
  { module: "gaze", icon: "👁", value: "97", unit: "%", state: "NORMAL", readings: [95, 96, 97, 96, 98, 97, 97, 96, 97, 97] },
  { module: "process", icon: "⚙", value: "3", unit: "active", state: "NORMAL", readings: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3] },
  { module: "liveness", icon: "🔲", value: "99", unit: "%", state: "NORMAL", readings: [98, 99, 99, 99, 98, 99, 99, 99, 99, 99] },
];

const suspiciousSignals: SignalData[] = [
  { module: "keystroke", icon: "⌨", value: "340", unit: "ms", state: "ELEVATED", readings: [42, 80, 120, 200, 280, 340, 320, 310, 330, 340] },
  { module: "gaze", icon: "👁", value: "73", unit: "%", state: "ELEVATED", readings: [97, 95, 88, 82, 76, 73, 75, 72, 74, 73] },
  { module: "process", icon: "⚙", value: "7", unit: "active", state: "ELEVATED", readings: [3, 3, 4, 5, 5, 6, 7, 7, 7, 7] },
  { module: "liveness", icon: "🔲", value: "91", unit: "%", state: "NORMAL", readings: [99, 98, 97, 95, 93, 92, 91, 91, 92, 91] },
];

const breachSignals: SignalData[] = [
  { module: "keystroke", icon: "⌨", value: "890", unit: "ms", state: "FLAGGED", readings: [340, 450, 600, 700, 780, 820, 860, 870, 880, 890] },
  { module: "gaze", icon: "👁", value: "31", unit: "%", state: "FLAGGED", readings: [73, 60, 50, 42, 38, 35, 33, 32, 31, 31] },
  { module: "process", icon: "⚙", value: "12", unit: "active", state: "FLAGGED", readings: [7, 8, 9, 10, 10, 11, 11, 12, 12, 12] },
  { module: "liveness", icon: "🔲", value: "45", unit: "%", state: "FLAGGED", readings: [91, 85, 78, 70, 60, 55, 50, 48, 46, 45] },
];

export const useMonitoringStore = create<MonitoringState>((set) => ({
  integrityScore: 92,
  riskFactors: { keystroke: 8, gaze: 12, process: 5, liveness: 3 },
  events: generateMockEvents(15),
  signals: secureSignals,
  breachOverlayVisible: false,

  setScore: (score) => set({ integrityScore: score }),
  setRiskFactors: (r) => set({ riskFactors: r }),
  addEvent: (e) => set((state) => ({ events: [e, ...state.events] })),
  toggleBreachOverlay: (v) => set({ breachOverlayVisible: v }),

  loadDemoState: (state) => {
    switch (state) {
      case "secure":
        set({
          integrityScore: 92,
          riskFactors: { keystroke: 8, gaze: 12, process: 5, liveness: 3 },
          signals: secureSignals,
          breachOverlayVisible: false,
        });
        break;
      case "suspicious":
        set({
          integrityScore: 54,
          riskFactors: { keystroke: 35, gaze: 42, process: 28, liveness: 15 },
          signals: suspiciousSignals,
          breachOverlayVisible: false,
        });
        break;
      case "breach":
        set({
          integrityScore: 21,
          riskFactors: { keystroke: 72, gaze: 85, process: 65, liveness: 55 },
          signals: breachSignals,
          breachOverlayVisible: true,
        });
        break;
    }
  },
}));
