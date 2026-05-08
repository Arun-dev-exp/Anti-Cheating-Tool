// shared/types.js — Sentinel Zero Payload Type Definitions
// This file documents the expected IPC payload shapes for all signals.
// Used as reference for both the main process and renderer process.
// DO NOT modify without team agreement.

/**
 * @typedef {Object} KeystrokePayload
 * @property {number} entropy    - The computed variance of inter-keystroke intervals (ms²)
 * @property {boolean} flagged   - True if entropy < ENTROPY_FLAG_MS (suspiciously uniform)
 * @property {number} ts         - Timestamp of the last keystroke in the window (ms since epoch)
 */

/**
 * @typedef {Object} GazePayload
 * @property {boolean} offScreen - True if user gaze is detected outside the exam window
 * @property {number} ts         - Timestamp of the gaze sample (ms since epoch)
 */

/**
 * @typedef {Object} ProcessPayload
 * @property {boolean} flagged   - True if a suspicious/blacklisted process was detected
 * @property {string} name       - Name of the flagged process (e.g., "TeamViewer.exe")
 * @property {number} ts         - Timestamp of the detection (ms since epoch)
 */

/**
 * @typedef {Object} LivenessPayload
 * @property {boolean} failed    - True if liveness check failed (face not detected, etc.)
 * @property {number} ts         - Timestamp of the check (ms since epoch)
 */

/**
 * @typedef {Object} ScoreUpdatePayload
 * @property {number} score      - Current integrity index (0-100)
 * @property {'green'|'amber'|'red'} state - Current risk state
 */

/**
 * @typedef {Object} BreachPayload
 * @property {string} reason     - Human-readable breach reason
 * @property {number} score      - Score at breach time
 * @property {number} ts         - Timestamp of the breach event (ms since epoch)
 */

module.exports = {
  // Type definitions are JSDoc-only; this export is a no-op placeholder.
  // Import this file for documentation purposes.
};
