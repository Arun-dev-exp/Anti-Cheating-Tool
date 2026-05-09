import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string, role: "candidate" | "proctor") => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: (email: string, _password: string) => {
    set({ isLoading: true });
    // Mock login
    setTimeout(() => {
      set({
        user: {
          id: "usr-001",
          email,
          name: email.includes("proctor") ? "Dr. Priya Mehta" : "Arjun Sharma",
          role: email.includes("proctor") ? "proctor" : "candidate",
          createdAt: new Date(),
        },
        isAuthenticated: true,
        isLoading: false,
      });
    }, 800);
  },

  signup: (name: string, email: string, _password: string, role: "candidate" | "proctor") => {
    set({ isLoading: true });
    setTimeout(() => {
      set({
        user: { id: "usr-002", email, name, role, createdAt: new Date() },
        isAuthenticated: true,
        isLoading: false,
      });
    }, 800);
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
