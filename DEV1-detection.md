# DEV1 — Detection Engine PRD
**Owner:** Developer 1  
**Module:** `src/detection/`  
**Branch:** `dev1/detection`

---

## Your Job in One Sentence
Build the keystroke entropy analyser and the Bayesian risk score engine — the brain of Sentinel Zero.

---

## Files You Own

```
src/detection/
├── keystroke.js    ← Keystroke listener + entropy calculator
├── bayesian.js     ← Risk score engine (combines all signals)
└── index.js        ← Entry point — exports startDetection()
```

**Do not create files outside this folder.**  
**Do not import from `src/gaze/` or `src/process/`.**

---

## Dependencies

```bash
npm install iohook   # Low-level keystroke listener (works in Electron main process)
```

Also read (never edit):
- `shared/constants.js`
- `shared/types.js`

---

## What to Build

### 1. `keystroke.js` — Keystroke Entropy Analyser

**Goal:** Detect when typing rhythm is too machine-like to be human.

**How it works:**
1. Listen for every keydown event globally using `iohook`
2. Record the timestamp of each keydown
3. Calculate inter-keystroke intervals (IKI): the time (ms) between consecutive keystrokes
4. After every `KEYSTROKE_WINDOW_SIZE` (20) keystrokes, compute the **variance** of the IKI array
5. If variance < `ENTROPY_FLAG_MS` (5ms), the typing is suspiciously uniform — flag it
6. Emit `signal:keystroke` via ipcMain

```js
// keystroke.js — skeleton

const { ipcMain } = require('electron');
const iohook = require('iohook');
const { ENTROPY_FLAG_MS, KEYSTROKE_WINDOW_SIZE, EVENTS } = require('../../shared/constants');

let timestamps = [];
let mainWindow = null;

function setWindow(win) {
  mainWindow = win;
}

function computeVariance(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
}

function startKeystrokeListener() {
  iohook.on('keydown', (event) => {
    const now = Date.now();
    timestamps.push(now);

    if (timestamps.length >= KEYSTROKE_WINDOW_SIZE) {
      const intervals = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i] - timestamps[i - 1]);
      }

      const variance = computeVariance(intervals);
      const flagged = variance < ENTROPY_FLAG_MS;

      // Emit to UI
      mainWindow.webContents.send(EVENTS.KEYSTROKE, {
        entropy: variance,
        flagged,
        ts: now
      });

      // Feed into Bayesian engine
      updateKeystrokeSignal(flagged);

      // Reset window (sliding window: drop oldest 10)
      timestamps = timestamps.slice(10);
    }
  });

  iohook.start();
}

module.exports = { startKeystrokeListener, setWindow };
```

---

### 2. `bayesian.js` — Risk Score Engine

**Goal:** Combine all incoming signals into a single Integrity Index score (0–100).

**How it works:**
- Maintains the current score, starting at 92
- When a signal arrives (from any module via internal call), apply a weighted penalty or recovery
- Requires **2+ signals flagged simultaneously** before a breach is called (reduces false positives)
- Emits `signal:score-update` on every change
- Emits `signal:breach` when score drops below `BREACH_THRESHOLD` (35)

**Score update logic:**

| Signal | Flagged Penalty | Recovery per tick |
|---|---|---|
| Keystroke entropy | −18 | +3 |
| Gaze off-screen | −15 | +2 |
| Suspicious process | −20 | +1 |
| Liveness fail | −25 | +2 |

```js
// bayesian.js — skeleton

const { ipcMain, ipcRenderer } = require('electron');
const {
  BREACH_THRESHOLD, AMBER_THRESHOLD,
  WEIGHT_KEYSTROKE, WEIGHT_GAZE, WEIGHT_PROCESS, WEIGHT_LIVENESS,
  EVENTS
} = require('../../shared/constants');

let score = 92;
let mainWindow = null;
let activeFlags = {
  keystroke: false,
  gaze: false,
  process: false,
  liveness: false
};

function setWindow(win) { mainWindow = win; }

function countActiveFlags() {
  return Object.values(activeFlags).filter(Boolean).length;
}

function getState(s) {
  if (s <= BREACH_THRESHOLD) return 'red';
  if (s <= AMBER_THRESHOLD) return 'amber';
  return 'green';
}

function applySignal(type, flagged) {
  const penalties = {
    keystroke: 18,
    gaze: 15,
    process: 20,
    liveness: 25
  };

  activeFlags[type] = flagged;

  // Only penalise if 2+ signals are active (Bayesian two-signal rule)
  if (flagged && countActiveFlags() >= 2) {
    score = Math.max(0, score - penalties[type]);
  } else if (!flagged) {
    // Gradual recovery
    score = Math.min(100, score + 2);
  }

  const state = getState(score);

  mainWindow.webContents.send(EVENTS.SCORE_UPDATE, { score, state });

  if (state === 'red') {
    mainWindow.webContents.send(EVENTS.BREACH, {
      reason: `${type} anomaly — score ${score}`,
      score,
      ts: Date.now()
    });
  }
}

module.exports = { applySignal, setWindow };
```

---

### 3. `index.js` — Module Entry Point

```js
// src/detection/index.js

const { startKeystrokeListener, setWindow: setKWindow } = require('./keystroke');
const { setWindow: setBWindow } = require('./bayesian');

function startDetection(mainWindow) {
  setKWindow(mainWindow);
  setBWindow(mainWindow);
  startKeystrokeListener();
  console.log('[DEV1] Detection module started');
}

module.exports = { startDetection };
```

---

## How Other Modules Feed You

DEV2 (gaze) and DEV3 (process) need to call `applySignal()` from `bayesian.js` when their signals fire.  

**BUT** — they cannot import `bayesian.js` directly (cross-module import = merge conflict risk).

**The agreed pattern:** DEV4 wires them in `main.js`:

```js
// main.js (DEV4 writes this — you don't touch it)
ipcMain.on(EVENTS.GAZE, (e, data) => {
  applySignal('gaze', data.offScreen);
});
ipcMain.on(EVENTS.PROCESS, (e, data) => {
  applySignal('process', data.flagged);
});
```

You just export `applySignal` and DEV4 connects it. No cross-imports.

---

## Acceptance Criteria

Before you hand off, these must all be true:

- [ ] `startDetection(mainWindow)` exported from `index.js`
- [ ] Keystroke variance computed correctly over a 20-keystroke window
- [ ] Score starts at 92, drops below 35 within ~8 seconds of auto-typer running
- [ ] `signal:keystroke` emitted with correct payload shape (see `shared/types.js`)
- [ ] `signal:score-update` emitted on every score change
- [ ] `signal:breach` emitted exactly once when score first crosses threshold
- [ ] Two-signal rule enforced: single signal alone does NOT trigger breach
- [ ] No imports from `src/gaze/` or `src/process/`

---

## Test It Yourself

Run a Python auto-typer in a text editor while your module is active:

```python
# test_autotyper.py
import pyautogui, time
while True:
    pyautogui.typewrite('function solve() { return 42; }', interval=0.05)
    time.sleep(1)
```

You should see: entropy variance < 5ms → `flagged: true` → score starts falling.

---

## What NOT to Build

- ❌ Any UI — that's DEV4
- ❌ Gaze detection — that's DEV2
- ❌ OS process scanning — that's DEV3
- ❌ Gemini API calls — that's DEV3
- ❌ Electron window creation — that's DEV4
