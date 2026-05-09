// ─────────────────────────────────────────────────────────────────────────────
// bayesian.js — Risk Score Engine (Integrity Index)
// Module: src/detection/
// Owner:  DEV1
//
// Combines all incoming signals (keystroke, gaze, process, liveness) into a
// single Integrity Index score (0–100). Enforces the Bayesian two-signal rule:
// a single flagged signal alone will NOT trigger a penalty — at least two
// concurrent flags are required. This drastically reduces false positives.
//
// Score starts at 92.  Penalties and recovery rates per signal type are defined
// in the penalty/recovery tables below.
// ─────────────────────────────────────────────────────────────────────────────

const {
  BREACH_THRESHOLD,
  AMBER_THRESHOLD,
  INITIAL_SCORE,
  EVENTS,
} = require('../../shared/constants');

// ─── State ──────────────────────────────────────────────────────────────────
let score = INITIAL_SCORE;
let mainWindow = null;
let breachEmitted = false; // Ensures breach fires exactly once per crossing

/** Tracks which signal types are currently flagged. */
let activeFlags = {
  keystroke: false,
  gaze: false,
  process: false,
  liveness: false,
};

// ─── Penalty / Recovery Tables ──────────────────────────────────────────────
// These mirror the spec table exactly.

const PENALTIES = {
  keystroke: 18,
  gaze: 15,
  process: 20,
  liveness: 25,
};

const RECOVERIES = {
  keystroke: 3,
  gaze: 2,
  process: 1,
  liveness: 2,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Bind the BrowserWindow so we can send IPC messages to the renderer.
 * @param {Electron.BrowserWindow} win
 */
function setWindow(win) {
  mainWindow = win;
}

/**
 * Count how many signal types are currently flagged.
 * @returns {number}
 */
function countActiveFlags() {
  return Object.values(activeFlags).filter(Boolean).length;
}

/**
 * Derive the risk state label from the current score.
 * @param {number} s - Current integrity score.
 * @returns {'green'|'amber'|'red'}
 */
function getState(s) {
  if (s <= BREACH_THRESHOLD) return 'red';
  if (s <= AMBER_THRESHOLD) return 'amber';
  return 'green';
}

/**
 * Safely emit an IPC event to the renderer.
 * Silently no-ops if the window has been destroyed.
 */
function emitToRenderer(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

// ─── Core Logic ─────────────────────────────────────────────────────────────

/**
 * Apply an incoming signal to the risk score engine.
 *
 * **Two-signal rule:** A penalty is only applied when ≥ 2 signal types are
 * simultaneously flagged. This prevents a single noisy sensor (e.g., keystroke
 * on a mechanical keyboard) from causing a false breach.
 *
 * **Recovery:** When a previously flagged signal clears, the score recovers by
 * the signal-specific recovery amount (capped at 100).
 *
 * **Breach:** Emitted exactly once when the score first drops to ≤ BREACH_THRESHOLD.
 * If the score recovers above the threshold and drops again, a new breach will fire.
 *
 * @param {'keystroke'|'gaze'|'process'|'liveness'} type - Signal type.
 * @param {boolean} flagged - Whether the signal is currently flagged.
 */
function applySignal(type, flagged) {
  // Validate signal type
  if (!(type in activeFlags)) {
    console.warn(`[DEV1:bayesian] Unknown signal type: "${type}" — ignoring`);
    return;
  }

  // Update the flag state for this signal
  activeFlags[type] = flagged;

  if (flagged) {
    // ── Penalty Path ──────────────────────────────────────────────────────
    // Only penalise if 2+ signals are active (Bayesian two-signal rule)
    if (countActiveFlags() >= 2) {
      score = Math.max(0, score - PENALTIES[type]);
    }
    // Single flag: recorded but no penalty applied. This is intentional.
  } else {
    // ── Recovery Path ─────────────────────────────────────────────────────
    score = Math.min(100, score + RECOVERIES[type]);
  }

  const state = getState(score);

  // Always emit score update so UI stays in sync
  emitToRenderer(EVENTS.SCORE_UPDATE, { score, state });

  // Emit breach exactly once when score first crosses into red
  if (state === 'red' && !breachEmitted) {
    breachEmitted = true;
    emitToRenderer(EVENTS.BREACH, {
      reason: `${type} anomaly — score ${score}`,
      score,
      ts: Date.now(),
    });
    console.warn(`[DEV1:bayesian] ⚠ BREACH — score ${score} (triggered by ${type})`);
  }

  // Allow re-breach if score recovers above threshold then drops again
  if (state !== 'red') {
    breachEmitted = false;
  }
}

/**
 * Get the current score and state. Useful for diagnostics.
 * @returns {{ score: number, state: string, activeFlags: Object }}
 */
function getStatus() {
  return {
    score,
    state: getState(score),
    activeFlags: { ...activeFlags },
  };
}

/**
 * Reset the engine to initial state. Useful for test harness and exam restart.
 */
function reset() {
  score = INITIAL_SCORE;
  breachEmitted = false;
  activeFlags = {
    keystroke: false,
    gaze: false,
    process: false,
    liveness: false,
  };
  console.log('[DEV1:bayesian] Risk engine reset');
}

module.exports = {
  applySignal,
  setWindow,
  getStatus,
  reset,
};
