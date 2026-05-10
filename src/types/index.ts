// === USER ===
export interface User {
  id: string;
  email: string;
  name: string;
  role: "candidate" | "proctor";
  avatarUrl?: string;
  createdAt: Date;
}

// === SESSION ===
export interface Session {
  id: string;
  code: string;
  title: string;
  proctorId: string;
  status: "created" | "waiting" | "active" | "ended";
  maxCandidates: number;
  duration: number; // minutes
  monitoringModules: MonitoringModule[];
  sensitivityLevel: "low" | "medium" | "high";
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

// === SESSION PARTICIPANT ===
export interface SessionParticipant {
  id: string;
  sessionId: string;
  candidateId: string;
  candidateName: string;
  integrityScore: number;
  status: "joined" | "verifying" | "active" | "breached" | "completed";
  verdict: "passed" | "flagged" | "breached" | null;
  joinedAt: Date;
  completedAt?: Date;
  riskFactors: RiskFactors;
}

// === INTEGRITY EVENT ===
export interface IntegrityEvent {
  id: string;
  participantId: string;
  timestamp: Date;
  module: MonitoringModule;
  severity: "info" | "warning" | "breach";
  message: string;
  confidence: number;
  riskDelta: number;
}

// === RISK FACTORS ===
export interface RiskFactors {
  keystroke: number;
  gaze: number;
  process: number;
  liveness: number;
  network: number;
}

// === MONITORING MODULE ===
export type MonitoringModule = "keystroke" | "gaze" | "process" | "liveness" | "network";

// === INTEGRITY STATE ===
export type IntegrityState = "secure" | "suspicious" | "breach";

// === SIGNAL DATA ===
export interface SignalData {
  module: MonitoringModule;
  icon: string;
  value: string;
  unit: string;
  state: "NORMAL" | "ELEVATED" | "FLAGGED";
  readings: number[];
}

// Helper
export function getIntegrityState(score: number): IntegrityState {
  if (score > 65) return "secure";
  if (score >= 35) return "suspicious";
  return "breach";
}

export function getIntegrityColor(score: number): string {
  if (score > 65) return "#22C55E";
  if (score >= 35) return "#F59E0B";
  return "#EF4444";
}
