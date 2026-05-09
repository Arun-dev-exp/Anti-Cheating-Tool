// shared/constants.js — Sentinel Zero Constants
// This file is shared across all modules. DO NOT modify without team agreement.

// ─── Keystroke Detection (DEV1) ─────────────────────────────────
const KEYSTROKE_WINDOW_SIZE = 20;       // Number of keystrokes per analysis window
const ENTROPY_FLAG_MS = 5;              // Variance threshold (ms²) — below this = suspicious

// ─── Gaze (DEV2) ────────────────────────────────────────────────
const GAZE_OFFSCREEN_THRESHOLD_MS = 3000; // 3 seconds off-screen = flag

// ─── Liveness (DEV2) ────────────────────────────────────────────
const LIVENESS_CHECK_INTERVAL_MS = 10000; // Check every 10 seconds

// ─── Process Scanning (DEV3) ────────────────────────────────────
const PROCESS_SCAN_INTERVAL_MS = 30000; // 30 seconds

// ─── Scoring Thresholds ─────────────────────────────────────────
const BREACH_THRESHOLD = 35;            // Score at or below = RED (breach)
const AMBER_THRESHOLD = 60;             // Score at or below = AMBER (warning)
const INITIAL_SCORE = 92;               // Starting integrity index

// ─── Signal Weights (penalties) ─────────────────────────────────
const WEIGHT_KEYSTROKE = 18;
const WEIGHT_GAZE = 15;
const WEIGHT_PROCESS = 20;
const WEIGHT_LIVENESS = 25;

// ─── Recovery Rates (per unflagged tick) ────────────────────────
const RECOVERY_KEYSTROKE = 3;
const RECOVERY_GAZE = 2;
const RECOVERY_PROCESS = 1;
const RECOVERY_LIVENESS = 2;

// ─── IPC Event Names ────────────────────────────────────────────
const EVENTS = {
  // Session lifecycle
  SESSION_START: 'session:start',
  SESSION_END: 'session:end',
  // Signals
  KEYSTROKE: 'signal:keystroke',
  GAZE: 'signal:gaze',
  PROCESS: 'signal:process',
  LIVENESS: 'signal:liveness',
  DETECTION: 'signal:detection',
  // Score
  SCORE_UPDATE: 'signal:score-update',
  BREACH: 'signal:breach',
};

module.exports = {
  KEYSTROKE_WINDOW_SIZE,
  ENTROPY_FLAG_MS,
  GAZE_OFFSCREEN_THRESHOLD_MS,
  LIVENESS_CHECK_INTERVAL_MS,
  PROCESS_SCAN_INTERVAL_MS,
  BREACH_THRESHOLD,
  AMBER_THRESHOLD,
  INITIAL_SCORE,
  WEIGHT_KEYSTROKE,
  WEIGHT_GAZE,
  WEIGHT_PROCESS,
  WEIGHT_LIVENESS,
  RECOVERY_KEYSTROKE,
  RECOVERY_GAZE,
  RECOVERY_PROCESS,
  RECOVERY_LIVENESS,
  EVENTS,
};
