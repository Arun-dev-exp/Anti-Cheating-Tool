"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface SessionContextType {
  sessionId: string | null;
  sessionCode: string | null;
  sessionTitle: string | null;
  interviewerName: string | null;
  durationMinutes: number | null;
  participantId: string | null;
  candidateName: string | null;
  setSessionData: (data: {
    sessionId: string;
    sessionCode: string;
    sessionTitle: string;
    interviewerName: string;
    durationMinutes: number;
  }) => void;
  setParticipantData: (data: {
    participantId: string;
    candidateName: string;
  }) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [interviewerName, setInterviewerName] = useState<string | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState<string | null>(null);

  const setSessionData = (data: {
    sessionId: string;
    sessionCode: string;
    sessionTitle: string;
    interviewerName: string;
    durationMinutes: number;
  }) => {
    setSessionId(data.sessionId);
    setSessionCode(data.sessionCode);
    setSessionTitle(data.sessionTitle);
    setInterviewerName(data.interviewerName);
    setDurationMinutes(data.durationMinutes);
  };

  const setParticipantData = (data: {
    participantId: string;
    candidateName: string;
  }) => {
    setParticipantId(data.participantId);
    setCandidateName(data.candidateName);
  };

  const clearSession = () => {
    setSessionId(null);
    setSessionCode(null);
    setSessionTitle(null);
    setInterviewerName(null);
    setDurationMinutes(null);
    setParticipantId(null);
    setCandidateName(null);
  };

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        sessionCode,
        sessionTitle,
        interviewerName,
        durationMinutes,
        participantId,
        candidateName,
        setSessionData,
        setParticipantData,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
