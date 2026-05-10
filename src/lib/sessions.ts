import { supabase } from "./supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Code Generation
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a random 6-character alphanumeric session code */
export function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session CRUD
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateSessionInput {
  title: string;
  interviewerName: string;
  maxCandidates: number;
  durationMinutes: number;
  sensitivity: "low" | "medium" | "high";
  modules: string[];
}

export async function createSession(input: CreateSessionInput) {
  const code = generateSessionCode();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to create a session");

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      interviewer_id: user.id,
      code,
      title: input.title,
      interviewer_name: input.interviewerName,
      max_candidates: input.maxCandidates,
      duration_minutes: input.durationMinutes,
      sensitivity: input.sensitivity,
      modules: input.modules,
      status: "waiting",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionByCode(code: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .neq("status", "ended")
    .single();

  if (error) return null;
  return data;
}

export async function getSessionById(id: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function startSession(sessionId: string) {
  const { error } = await supabase
    .from("sessions")
    .update({ status: "active" })
    .eq("id", sessionId);

  if (error) throw error;
}

export async function endSession(sessionId: string) {
  const { error } = await supabase
    .from("sessions")
    .update({ status: "ended" })
    .eq("id", sessionId);

  if (error) throw error;
}

export async function listSessions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("interviewer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Participant CRUD
// ─────────────────────────────────────────────────────────────────────────────

export async function joinSession(sessionId: string, candidateName: string) {
  const { data, error } = await supabase
    .from("participants")
    .insert({
      session_id: sessionId,
      candidate_name: candidateName,
      integrity_score: 100,
      status: "waiting",
      risk_factors: { keystroke: 0, gaze: 0, process: 0, liveness: 0, network: 0 },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getParticipantsBySession(sessionId: string) {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("session_id", sessionId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getParticipantById(participantId: string) {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("id", participantId)
    .single();

  if (error) return null;
  return data;
}

export async function updateParticipantScore(
  participantId: string,
  integrityScore: number,
  riskFactors: Record<string, number>,
  status?: string
) {
  const update: Record<string, unknown> = {
    integrity_score: integrityScore,
    risk_factors: riskFactors,
  };
  if (status) update.status = status;

  const { error } = await supabase
    .from("participants")
    .update(update)
    .eq("id", participantId);

  if (error) throw error;
}

export async function updateParticipantStatus(participantId: string, status: string) {
  const { error } = await supabase
    .from("participants")
    .update({ status })
    .eq("id", participantId);

  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────────────────────
// Realtime Subscriptions
// ─────────────────────────────────────────────────────────────────────────────

/** Subscribe to changes on a specific session (e.g., status waiting → active) */
export function subscribeToSession(
  sessionId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel(`session-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "sessions",
        filter: `id=eq.${sessionId}`,
      },
      (payload) => callback(payload.new as Record<string, unknown>)
    )
    .subscribe();
}

/** Subscribe to participant changes for a session (joins, score updates) */
export function subscribeToParticipants(
  sessionId: string,
  onInsert: (participant: Record<string, unknown>) => void,
  onUpdate: (participant: Record<string, unknown>) => void
) {
  return supabase
    .channel(`participants-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "participants",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => onInsert(payload.new as Record<string, unknown>)
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "participants",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => onUpdate(payload.new as Record<string, unknown>)
    )
    .subscribe();
}
