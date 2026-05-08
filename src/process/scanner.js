// scanner.js — OS process list collector (cross-platform)

const psList = require('ps-list');
const { categoriseProcesses } = require('./gemini');
const { PROCESS_SCAN_INTERVAL_MS, EVENTS } = require('../../shared/constants');

let mainWindow = null;

function setWindow(win) {
  mainWindow = win;
}

async function runScan() {
  try {
    const processes = await psList();
    const names = processes.map(p => p.name).filter(Boolean);

    const result = await categoriseProcesses(names);

    if (result) {
      mainWindow.webContents.send(EVENTS.PROCESS, {
        flagged: result.flagged,
        processName: result.processName || '',
        category: result.category || 'unknown',
        ts: Date.now()
      });
    }
  } catch (err) {
    // Scan failure = silent fail. Don't crash the session.
    console.warn('[DEV3] Process scan failed silently:', err.message);
  }
}

function startScanner() {
  // Run once immediately on session start, then every 30s
  runScan();
  setInterval(runScan, PROCESS_SCAN_INTERVAL_MS);
  console.log('[DEV3] Process scanner started');
}

module.exports = { startScanner, setWindow };
