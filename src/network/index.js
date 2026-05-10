// ─────────────────────────────────────────────────────────────────────────────
// index.js — Network Monitor Module Entry Point
// Module: src/network/
// Owner:  DEV5
//
// Single public API: startNetworkScanner(mainWindow)
// Wires up the OS-level network scanner and relays detections to the renderer.
// ─────────────────────────────────────────────────────────────────────────────

const { NetworkScanner } = require('./scanner');
const { EVENTS } = require('../../shared/constants');

let scanner = null;

/**
 * Initialise and start the network monitor module.
 *
 * Call this once from `main.js` after the BrowserWindow is ready.
 * Listens for AI API connection detections and sends IPC events to the renderer.
 *
 * @param {Electron.BrowserWindow} mainWindow - The app's main BrowserWindow.
 */
function startNetworkScanner(mainWindow) {
  if (!mainWindow) {
    throw new Error('[DEV5] startNetworkScanner requires a valid BrowserWindow instance');
  }

  scanner = new NetworkScanner();

  scanner.on('ai-request-detected', (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(EVENTS.NETWORK, {
        flagged: true,
        domain: data.domain,
        ip: data.ip,
        ts: data.ts,
      });
    }
  });

  scanner.start();
  console.log('[DEV5] Network monitor module started');
}

/**
 * Gracefully shut down the network monitor.
 */
function stopNetworkScanner() {
  if (scanner) {
    scanner.stop();
    scanner.removeAllListeners();
    scanner = null;
  }
  console.log('[DEV5] Network monitor module stopped');
}

module.exports = {
  startNetworkScanner,
  stopNetworkScanner,
};
