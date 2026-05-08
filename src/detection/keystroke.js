// ─────────────────────────────────────────────────────────────────────────────
// keystroke.js — Keystroke Entropy Analyser
// Module: src/detection/
// Owner:  DEV1
//
// Detects machine-like typing by analysing the variance of inter-keystroke
// intervals (IKI). Human typists have natural rhythm irregularities; auto-typers
// and macro injectors produce suspiciously uniform timing. When variance drops
// below ENTROPY_FLAG_MS the window is flagged.
// ─────────────────────────────────────────────────────────────────────────────

const iohook = require('iohook');
const {
  ENTROPY_FLAG_MS,
  KEYSTROKE_WINDOW_SIZE,
  EVENTS,
} = require('../../shared/constants');

// ─── State ──────────────────────────────────────────────────────────────────
let timestamps = [];
let mainWindow = null;

// Lazy import — avoids circular dependency at require-time.
// `bayesian.applySignal` is called when a keystroke window fires.
let _applySignal = null;

/**
 * Bind the BrowserWindow so we can send IPC messages to the renderer.
 * Called once during initialisation by `index.js`.
 * @param {Electron.BrowserWindow} win
 */
function setWindow(win) {
  mainWindow = win;
}

// ─── Math Helpers ───────────────────────────────────────────────────────────

/**
 * Compute the population variance of a numeric array.
 * Used to measure how "uniform" the inter-keystroke intervals are.
 *
 * @param {number[]} arr - Non-empty array of numbers.
 * @returns {number} Population variance.
 */
function computeVariance(arr) {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
}

// ─── Keystroke Analysis ─────────────────────────────────────────────────────

/**
 * Process the current timestamp buffer:
 *  1. Derive inter-keystroke intervals (IKI)
 *  2. Compute variance
 *  3. Flag if variance < ENTROPY_FLAG_MS
 *  4. Emit `signal:keystroke` to renderer
 *  5. Feed result into Bayesian engine
 *  6. Slide the window (drop oldest half)
 *
 * @param {number} now - Current timestamp (ms since epoch).
 */
function processWindow(now) {
  // Step 1 — compute inter-keystroke intervals
  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }

  // Step 2 — variance
  const variance = computeVariance(intervals);

  // Step 3 — flag decision
  const flagged = variance < ENTROPY_FLAG_MS;

  // Step 4 — emit to renderer UI
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(EVENTS.KEYSTROKE, {
      entropy: variance,
      flagged,
      ts: now,
    });
  }

  // Step 5 — feed into Bayesian engine
  if (!_applySignal) {
    // Lazy-load to avoid circular require at module init time
    _applySignal = require('./bayesian').applySignal;
  }
  _applySignal('keystroke', flagged);

  // Step 6 — sliding window: drop the oldest 10 entries to maintain continuity
  timestamps = timestamps.slice(10);
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Start the global keystroke listener via iohook.
 *
 * On every keydown:
 *  - Records the timestamp
 *  - Once KEYSTROKE_WINDOW_SIZE (20) keystrokes are buffered, triggers analysis
 *
 * The listener runs continuously; the window slides by dropping the oldest 10
 * entries after each analysis, so the next analysis fires after 10 more keys.
 */
function startKeystrokeListener() {
  iohook.on('keydown', (_event) => {
    const now = Date.now();
    timestamps.push(now);

    if (timestamps.length >= KEYSTROKE_WINDOW_SIZE) {
      processWindow(now);
    }
  });

  iohook.start();
  console.log('[DEV1:keystroke] Keystroke entropy listener active');
}

/**
 * Stop the keystroke listener and clear buffered data.
 * Useful for clean shutdown.
 */
function stopKeystrokeListener() {
  iohook.stop();
  timestamps = [];
  console.log('[DEV1:keystroke] Keystroke listener stopped');
}

module.exports = {
  startKeystrokeListener,
  stopKeystrokeListener,
  setWindow,
  // Exported for unit testing only:
  computeVariance,
};
