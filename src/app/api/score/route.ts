import { NextRequest, NextResponse } from "next/server";
import { updateParticipantScore } from "@/lib/sessions";

/**
 * POST /api/score
 * 
 * Called by the Electron detection engine (via IPC) to push live integrity scores.
 * 
 * Body:
 * {
 *   participantId: string,
 *   integrityScore: number,
 *   riskFactors: { keystroke: number, gaze: number, process: number, liveness: number, network: number },
 *   status?: "active" | "breached" | "completed"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participantId, integrityScore, riskFactors, status } = body;

    if (!participantId || integrityScore === undefined || !riskFactors) {
      return NextResponse.json(
        { error: "Missing required fields: participantId, integrityScore, riskFactors" },
        { status: 400 }
      );
    }

    // Determine status based on score if not provided
    const computedStatus = status || (integrityScore < 35 ? "breached" : "active");

    await updateParticipantScore(participantId, integrityScore, riskFactors, computedStatus);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Score API] Error:", error);
    return NextResponse.json(
      { error: "Failed to update score" },
      { status: 500 }
    );
  }
}
