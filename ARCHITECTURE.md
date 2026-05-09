# ARCHITECTURE.md — Sentinel Zero
**Read this before writing a single line of code.**  
This file defines the contract every developer must follow. If something isn't in your PRD, don't build it. If you need to share data, use the IPC events below — never import another dev's module directly.

---

## Folder Structure

```
sentinel-zero/
├── main.js                   # Electron entry point (DEV4 owns this)
├── preload.js                # Electron preload bridge (DEV4 owns this)
├── package.json
│
├── src/
│   ├── detection/            # DEV1 owns everything in here
│   │   ├── keystroke.js      # Keystroke entropy analyser
│   │   ├── bayesian.js       # Risk score engine
│   │   └── index.js          # Detection module entry — exports startDetection()
│   │
│   ├── gaze/                 # DEV2 owns everything in here
│   │   ├── gazeEngine.js     # WebGazer wrapper + off-screen detection
│   │   ├── liveness.js       # Liveness / deepfake validator
│   │   └── index.js          # Gaze module entry — exports startGaze()
│   │
│   ├── process/              # DEV3 owns everything in here
│   │   ├── scanner.js        # OS process scanner (30s interval)
│   │   ├── gemini.js         # Gemini API client
│   │   └── index.js          # Process module entry — exports startScanner()
│   │
│   └── ui/                   # DEV4 owns everything in here
│       ├── renderer.js       # Main renderer logic
│       ├── gauge.js          # Animated Integrity Index gauge
│       ├── eventLog.js       # Live event log component
│       └── index.html        # App shell (DEV4 owns this)
│
├── shared/
│   ├── constants.js          # 🔒 SHARED — thresholds, state labels, event names
│   └── types.js              # 🔒 SHARED — JSDoc typedefs used by all devs
│
└── assets/
    └── styles.css            # DEV4 owns this
```

---

## Ownership Rules

| Module | Owner | Entry point | Touches |
|--------|-------|-------------|---------|
| Detection | DEV1 | `src/detection/index.js` | `src/detection/` only |
| Gaze | DEV2 | `src/gaze/index.js` | `src/gaze/` only |
| Process Scanner | DEV3 | `src/process/index.js` | `src/process/` only |
| UI + Electron shell | DEV4 | `main.js`, `src/ui/` | `src/ui/`, `main.js`, `preload.js` |
| Shared constants/types | ALL READ, NO ONE EDITS WITHOUT GROUP AGREEMENT | `shared/` | — |

**Never import across module boundaries.**  
DEV1 must not import from `src/gaze/`. DEV2 must not import from `src/detection/`. All cross-module communication goes through IPC events.

---

## IPC Event Contract

All events flow through Electron's `ipcMain` / `ipcRenderer`. DEV4's `preload.js` exposes a `window.sentinelBridge` object to the renderer.

### Events: Detection → UI (DEV1 emits, DEV4 listens)

| Event Name | Payload | Description |
|---|---|---|
| `signal:keystroke` | `{ entropy: number, flagged: boolean, ts: number }` | Fired on each keystroke batch analysis |
| `signal:score-update` | `{ score: number, state: 'green'|'amber'|'red' }` | Fired whenever Bayesian score changes |
| `signal:breach` | `{ reason: string, score: number, ts: number }` | Fired when score drops below BREACH_THRESHOLD |

### Events: Gaze → UI (DEV2 emits, DEV4 listens)

| Event Name | Payload | Description |
|---|---|---|
| `signal:gaze` | `{ offScreen: boolean, durationMs: number, ts: number }` | Fired when gaze state changes |
| `signal:liveness` | `{ live: boolean, confidence: number, ts: number }` | Fired every 10s liveness check |

### Events: Process Scanner → UI (DEV3 emits, DEV4 listens)

| Event Name | Payload | Description |
|---|---|---|
| `signal:process` | `{ flagged: boolean, processName: string, category: string, ts: number }` | Fired when a suspicious process is detected |

### Events: UI → All Modules (DEV4 emits, everyone listens)

| Event Name | Payload | Description |
|---|---|---|
| `session:start` | `{ candidateName: string, sessionId: string }` | Fired when candidate consents and session begins |
| `session:end` | `{ sessionId: string }` | Fired when session terminates |

---

## Shared Constants (`shared/constants.js`)

```js
// shared/constants.js — DO NOT EDIT without group agreement

module.exports = {
  // Risk score thresholds
  BREACH_THRESHOLD: 35,        // Score below this = RED breach
  AMBER_THRESHOLD: 65,         // Score below this = AMBER warning
  GREEN_MIN: 66,               // Score at or above this = GREEN safe

  // Keystroke
  ENTROPY_FLAG_MS: 5,          // Variance below this (ms) = flagged
  KEYSTROKE_WINDOW_SIZE: 20,   // Number of keystrokes per analysis batch

  // Gaze
  GAZE_OFFSCREEN_THRESHOLD_MS: 3000,  // 3 seconds off-screen = flag

  // Process scanner
  PROCESS_SCAN_INTERVAL_MS: 30000,   // Scan every 30 seconds

  // Liveness
  LIVENESS_CHECK_INTERVAL_MS: 10000, // Check every 10 seconds

  // Bayesian — signal weights (must sum to 1.0)
  WEIGHT_KEYSTROKE: 0.40,
  WEIGHT_GAZE: 0.35,
  WEIGHT_PROCESS: 0.15,
  WEIGHT_LIVENESS: 0.10,

  // IPC event names — import these instead of hardcoding strings
  EVENTS: {
    KEYSTROKE:     'signal:keystroke',
    SCORE_UPDATE:  'signal:score-update',
    BREACH:        'signal:breach',
    GAZE:          'signal:gaze',
    LIVENESS:      'signal:liveness',
    PROCESS:       'signal:process',
    SESSION_START: 'session:start',
    SESSION_END:   'session:end',
  }
};
```

---

## Shared Types (`shared/types.js`)

```js
// shared/types.js — JSDoc typedefs for autocomplete and consistency

/**
 * @typedef {Object} KeystrokeSignal
 * @property {number} entropy - Inter-keystroke variance in ms
 * @property {boolean} flagged - True if entropy < ENTROPY_FLAG_MS
 * @property {number} ts - Unix timestamp
 */

/**
 * @typedef {Object} ScoreUpdate
 * @property {number} score - 0–100 Integrity Index
 * @property {'green'|'amber'|'red'} state - Current risk state
 */

/**
 * @typedef {Object} BreachEvent
 * @property {string} reason - Human-readable breach reason
 * @property {number} score - Score at time of breach
 * @property {number} ts - Unix timestamp
 */

/**
 * @typedef {Object} GazeSignal
 * @property {boolean} offScreen - Whether gaze is off-screen
 * @property {number} durationMs - How long gaze has been off-screen
 * @property {number} ts - Unix timestamp
 */

/**
 * @typedef {Object} LivenessSignal
 * @property {boolean} live - True = real human detected
 * @property {number} confidence - 0.0–1.0
 * @property {number} ts - Unix timestamp
 */

/**
 * @typedef {Object} ProcessSignal
 * @property {boolean} flagged - True if a suspicious process was found
 * @property {string} processName - Name of the flagged process
 * @property {string} category - Gemini-classified category
 * @property {number} ts - Unix timestamp
 */
```

---

## Startup Sequence

DEV4 controls startup. The order is:

```
1. Electron launches main.js
2. main.js creates BrowserWindow + loads index.html
3. Candidate sees consent screen (DEV4 UI)
4. Candidate clicks "Begin Session"
5. main.js fires session:start to all modules
6. DEV1 startDetection() begins listening for keystrokes
7. DEV2 startGaze() initialises WebGazer
8. DEV3 startScanner() starts the 30s interval
9. UI starts receiving signal:* events and updating the gauge
```

---

## Git Workflow — Zero Merge Conflicts

- Each dev works on their own branch: `dev1/detection`, `dev2/gaze`, `dev3/process`, `dev4/ui`
- PRs only touch files within your module boundary
- `shared/constants.js` and `shared/types.js` changes require a group message before committing
- `main.js` and `preload.js` are owned by DEV4 — no one else commits to these files
- Merge order on demo day: DEV1 → DEV2 → DEV3 → DEV4 (UI last, resolves any visual conflicts)

---

## Demo Day Checklist

- [ ] All 4 `index.js` module entry points export their start function
- [ ] `session:start` wires up all modules correctly in `main.js`
- [ ] Score gauge animates smoothly from 91 → 28 in the cheater demo flow
- [ ] `INTEGRITY BREACH DETECTED` state is visually unmistakable (red, full screen flash)
- [ ] Backup screen recording saved to USB before going on stage
- [ ] No `console.error` visible in DevTools during demo
