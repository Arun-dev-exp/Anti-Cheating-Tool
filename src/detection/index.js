// ─────────────────────────────────────────────────────────────────────────────
// index.js — Detection Module Entry Point
// Module: src/detection/
// Owner:  DEV1
//
// Single public API: startDetection(mainWindow)
// Wires up the keystroke entropy listener and the Bayesian risk score engine.
// ─────────────────────────────────────────────────────────────────────────────

const { startKeystrokeListener, stopKeystrokeListener, setWindow: setKWindow } = require('./keystroke');
const { applySignal, setWindow: setBWindow, reset: resetBayesian, getStatus } = require('./bayesian');

/**
 * Initialise and start the detection module.
 *
 * Call this once from `main.js` after the BrowserWindow is ready.
 * It binds the IPC target window and starts the keystroke entropy listener.
 *
 * @param {Electron.BrowserWindow} mainWindow - The app's main BrowserWindow.
 */
function startDetection(mainWindow) {
  if (!mainWindow) {
    throw new Error('[DEV1] startDetection requires a valid BrowserWindow instance');
  }

  // Bind the renderer window to both sub-modules
  setKWindow(mainWindow);
  setBWindow(mainWindow);

  // Fire up the keystroke entropy listener
  startKeystrokeListener();

  console.log('[DEV1] Detection module started — keystroke + bayesian engines online');
}

/**
 * Gracefully shut down the detection module.
 * Stops the keystroke listener and resets the Bayesian engine.
 */
function stopDetection() {
  stopKeystrokeListener();
  resetBayesian();
  console.log('[DEV1] Detection module stopped');
}

module.exports = {
  startDetection,
  stopDetection,
  // Re-exported so DEV4 can wire gaze/process signals in main.js
  applySignal,
  getStatus,
};
