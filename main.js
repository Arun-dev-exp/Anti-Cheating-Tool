const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { EVENTS, NETWORK_BLOCKLIST } = require('./shared/constants');

// Backend Modules (DEV1, DEV3 & DEV5)
const { startDetection, stopDetection, applySignal } = require('./src/detection/index');
const { startProcessScanner } = require('./src/process/index');
const { startNetworkScanner, stopNetworkScanner } = require('./src/network/index');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load directly into the candidate Join Session screen.
  // The landing page (/) is the interviewer marketing site — not for candidates.
  mainWindow.loadURL('http://localhost:3000/join');

  // Wire up process scanner events to the Bayesian engine via monkey patching
  // Since DEV3's scanner sends directly to webContents, we intercept it here to apply the signal.
  const originalSend = mainWindow.webContents.send;
  mainWindow.webContents.send = function(channel, ...args) {
    if (channel === EVENTS.PROCESS) {
      const payload = args[0];
      applySignal('process', payload.flagged);
    }
    originalSend.apply(this, [channel, ...args]);
  };

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // ── Layer 1: Electron Session Request Interceptor ──────────────────────
  // Intercepts all HTTP requests from the renderer and blocks any request
  // whose hostname matches the AI API blocklist. This catches browser-level
  // fetch/XHR calls before they even leave the process.
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    try {
      const url = new URL(details.url);
      const matchedDomain = NETWORK_BLOCKLIST.find(d => url.hostname === d || url.hostname.endsWith('.' + d));
      if (matchedDomain) {
        console.warn(`[DEV5:interceptor] Blocked request to ${matchedDomain}`);
        // Emit signal AND cancel request
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send(EVENTS.NETWORK, {
            flagged: true,
            domain: matchedDomain,
            ip: null,
            ts: Date.now(),
          });
        }
        applySignal('network', true);
        callback({ cancel: true });
        return;
      }
    } catch (e) {
      // Invalid URL — ignore silently
    }
    callback({ cancel: false });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ─── IPC Handlers ────────────────────────────────────────────────────────────

let sessionActive = false;
let endDebounceTimer = null;

// When UI fires session:start (DEV4 -> All modules)
ipcMain.on(EVENTS.SESSION_START, (event, data) => {
  // Cancel any pending session:end (React Strict Mode sends start→end→start)
  if (endDebounceTimer) {
    clearTimeout(endDebounceTimer);
    endDebounceTimer = null;
  }

  if (sessionActive) {
    console.log('[DEV4:main] Session already active — ignoring duplicate start');
    return;
  }

  sessionActive = true;
  console.log('[DEV4:main] Session started:', data);

  // DEV1: Start Keystroke Entropy listener & Bayesian engine
  startDetection(mainWindow);

  // DEV3: Start OS Process Scanner
  startProcessScanner(mainWindow);

  // DEV5: Start Network Monitor
  startNetworkScanner(mainWindow);

  // Relay session:start back to renderer so Next.js components can start DEV2 (MediaPipe)
  mainWindow.webContents.send(EVENTS.SESSION_START, data);
});

// When UI fires session:end — debounced to survive React Strict Mode
ipcMain.on(EVENTS.SESSION_END, (event, data) => {
  // Debounce: wait 500ms before actually stopping.
  // If session:start fires again within that window, we cancel the stop.
  if (endDebounceTimer) clearTimeout(endDebounceTimer);

  endDebounceTimer = setTimeout(() => {
    if (!sessionActive) return;
    console.log('[DEV4:main] Session ended:', data);
    sessionActive = false;
    stopDetection();
    stopNetworkScanner();
    endDebounceTimer = null;
  }, 500);
});

// Gaze Signal (Renderer DEV2 -> Main DEV1 Bayesian Engine)
ipcMain.on(EVENTS.GAZE, (event, data) => {
  // data: { offScreen: boolean, durationMs: number, ts: number }
  applySignal('gaze', data.offScreen);
});

// Liveness Signal (Renderer DEV2 -> Main DEV1 Bayesian Engine)
ipcMain.on(EVENTS.LIVENESS, (event, data) => {
  // data: { live: boolean, confidence: number, ts: number }
  // applySignal penalises when flagged = true, so live=false means flagged=true
  applySignal('liveness', !data.live);
});

// Network Signal (DEV5 OS-level scanner -> Main DEV1 Bayesian Engine)
ipcMain.on(EVENTS.NETWORK, (event, data) => {
  // data: { flagged: boolean, domain: string | null, ip: string | null, ts: number }
  applySignal('network', data.flagged);
});
