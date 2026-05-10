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
  currentSession: null,
  participants: [],

  setSession: (session) => set({ currentSession: session }),

  addParticipant: (p) => set((state) => ({ participants: [...state.participants, p] })),

  updateParticipant: (id, updates) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
}));
