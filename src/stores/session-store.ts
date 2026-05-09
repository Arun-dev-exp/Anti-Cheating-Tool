import { create } from "zustand";
import { Session, SessionParticipant } from "@/types";

interface SessionState {
  currentSession: Session | null;
  participants: SessionParticipant[];
  setSession: (session: Session) => void;
  addParticipant: (p: SessionParticipant) => void;
  updateParticipant: (id: string, updates: Partial<SessionParticipant>) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentSession: {
    id: "sess-001",
    code: "SZ-8821",
    title: "Technical Interview — Batch 7",
    proctorId: "usr-001",
    status: "active",
    maxCandidates: 30,
    duration: 120,
    monitoringModules: ["keystroke", "gaze", "process", "liveness"],
    sensitivityLevel: "high",
    createdAt: new Date(),
    startedAt: new Date(),
  },

  participants: [
    { id: "p-001", sessionId: "sess-001", candidateId: "c-001", candidateName: "Arjun Sharma", integrityScore: 92, status: "active", verdict: null, joinedAt: new Date(), riskFactors: { keystroke: 8, gaze: 12, process: 5, liveness: 3 } },
    { id: "p-002", sessionId: "sess-001", candidateId: "c-002", candidateName: "Meera Patel", integrityScore: 87, status: "active", verdict: null, joinedAt: new Date(), riskFactors: { keystroke: 10, gaze: 15, process: 8, liveness: 5 } },
    { id: "p-003", sessionId: "sess-001", candidateId: "c-003", candidateName: "Ravi Kumar", integrityScore: 54, status: "active", verdict: null, joinedAt: new Date(), riskFactors: { keystroke: 35, gaze: 42, process: 28, liveness: 15 } },
    { id: "p-004", sessionId: "sess-001", candidateId: "c-004", candidateName: "Sneha Reddy", integrityScore: 95, status: "active", verdict: null, joinedAt: new Date(), riskFactors: { keystroke: 3, gaze: 5, process: 2, liveness: 1 } },
    { id: "p-005", sessionId: "sess-001", candidateId: "c-005", candidateName: "Amit Joshi", integrityScore: 21, status: "breached", verdict: "breached", joinedAt: new Date(), riskFactors: { keystroke: 72, gaze: 85, process: 65, liveness: 55 } },
    { id: "p-006", sessionId: "sess-001", candidateId: "c-006", candidateName: "Priya Nair", integrityScore: 78, status: "active", verdict: null, joinedAt: new Date(), riskFactors: { keystroke: 12, gaze: 18, process: 15, liveness: 10 } },
  ],

  setSession: (session) => set({ currentSession: session }),

  addParticipant: (p) => set((state) => ({ participants: [...state.participants, p] })),

  updateParticipant: (id, updates) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
}));
