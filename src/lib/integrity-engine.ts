import { RiskFactors, IntegrityState, IntegrityEvent, MonitoringModule } from "@/types";

/**
 * Calculate the overall integrity score from risk factors.
 * Score = 100 - (0.25 × Keystroke + 0.30 × Gaze + 0.25 × Process + 0.20 × Liveness)
 */
export function calculateIntegrityScore(risks: RiskFactors): number {
  const raw =
    100 -
    (0.25 * risks.keystroke +
      0.3 * risks.gaze +
      0.25 * risks.process +
      0.2 * risks.liveness);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/**
 * Determine state from score
 */
export function getState(score: number): IntegrityState {
  if (score > 65) return "secure";
  if (score >= 35) return "suspicious";
  return "breach";
}

/**
 * Get status color hex from score
 */
export function getColor(score: number): string {
  if (score > 65) return "#22C55E";
  if (score >= 35) return "#F59E0B";
  return "#EF4444";
}

/**
 * Generate mock events for demo
 */
export function generateMockEvents(count: number = 10): IntegrityEvent[] {
  const modules: MonitoringModule[] = ["keystroke", "gaze", "process", "liveness"];
  const severities: ("info" | "warning" | "breach")[] = ["info", "warning", "breach"];
  const messages: Record<string, string[]> = {
    keystroke: [
      "Typing pattern within normal range",
      "Unusual key interval detected — 340ms avg",
      "Copy-paste sequence detected — clipboard activity",
    ],
    gaze: [
      "Gaze tracking stable — center focus",
      "Gaze deviation detected — 23° off-center",
      "Extended off-screen gaze — 8.2 seconds",
    ],
    process: [
      "All processes nominal — no violations",
      "New application detected in foreground",
      "Unauthorized process: chrome.exe — external browser",
    ],
    liveness: [
      "Face detection: present, single face",
      "Multiple face candidates detected",
      "Face not detected — camera obstructed",
    ],
  };

  const events: IntegrityEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const module = modules[Math.floor(Math.random() * modules.length)];
    const severityIndex = Math.random() > 0.7 ? (Math.random() > 0.5 ? 2 : 1) : 0;
    const severity = severities[severityIndex];
    const moduleMessages = messages[module];

    events.push({
      id: `evt-${i}`,
      participantId: "p-001",
      timestamp: new Date(now - i * 15000),
      module,
      severity,
      message: moduleMessages[severityIndex],
      confidence: Math.round(70 + Math.random() * 30),
      riskDelta: severity === "info" ? 0 : severity === "warning" ? 3 : 8,
    });
  }

  return events;
}
