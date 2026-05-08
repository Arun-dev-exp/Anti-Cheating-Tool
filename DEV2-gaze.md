# DEV2 — Gaze Engine & Liveness PRD
**Owner:** Developer 2  
**Module:** `src/gaze/`  
**Branch:** `dev2/gaze`

---

## Your Job in One Sentence
Build the gaze detection engine (flags sustained off-screen fixation) and the liveness validator (confirms a real human is behind the camera).

---

## Files You Own

```
src/gaze/
├── gazeEngine.js   ← WebGazer wrapper + off-screen detection logic
├── liveness.js     ← Liveness / deepfake validator
└── index.js        ← Entry point — exports startGaze()
```

**Do not create files outside this folder.**  
**Do not import from `src/detection/` or `src/process/`.**

---

## Dependencies

WebGazer runs in the **renderer process** (the browser window), not the main Electron process. Load it via a script tag in `index.html`.

DEV4 will add this to `index.html` — coordinate with them:

```html
<script src="https://webgazer.cs.brown.edu/webgazer.js"></script>
```

Also read (never edit):
- `shared/constants.js`
- `shared/types.js`

---

## What to Build

### 1. `gazeEngine.js` — WebGazer Wrapper

**Goal:** Detect when a candidate's eyes leave the screen for more than 3 seconds.

**Key constraint:** WebGazer is inaccurate. Do NOT try to detect *where* on-screen they're looking. Only detect *whether* they're looking at the screen at all. Off-screen for 3+ seconds (`GAZE_OFFSCREEN_THRESHOLD_MS`) is your trigger.

**How it works:**
1. Initialise WebGazer with `showPredictionPoints: false` (no UI dots)
2. On each gaze prediction callback, check if `x` and `y` are within the screen bounds
3. If gaze is off-screen, start a timer
4. If gaze returns before 3 seconds, reset the timer — no flag
5. If gaze stays off-screen for 3+ seconds, emit `signal:gaze` with `offScreen: true`
6. When gaze returns, emit `signal:gaze` with `offScreen: false` (allows score recovery)

```js
// gazeEngine.js — skeleton (runs in renderer process)

const { GAZE_OFFSCREEN_THRESHOLD_MS, EVENTS } = require('../../shared/constants');

let offScreenStart = null;
let lastGazeState = false; // false = on-screen

function isOffScreen(x, y) {
  if (x === null || y === null) return true; // WebGazer returns null when no face detected
  return x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight;
}

function emitGaze(offScreen, durationMs = 0) {
  // window.sentinelBridge is exposed by DEV4's preload.js
  window.sentinelBridge.send(EVENTS.GAZE, {
    offScreen,
    durationMs,
    ts: Date.now()
  });
}

function startGazeEngine() {
  webgazer
    .setGazeListener((data, elapsedTime) => {
      if (!data) {
        // No face detected — treat as off-screen
        if (!offScreenStart) offScreenStart = Date.now();
        return;
      }

      const { x, y } = data;
      const currentlyOff = isOffScreen(x, y);

      if (currentlyOff) {
        if (!offScreenStart) {
          offScreenStart = Date.now();
        } else {
          const duration = Date.now() - offScreenStart;
          if (duration >= GAZE_OFFSCREEN_THRESHOLD_MS && !lastGazeState) {
            lastGazeState = true;
            emitGaze(true, duration);
          }
        }
      } else {
        if (lastGazeState) {
          lastGazeState = false;
          emitGaze(false, 0);
        }
        offScreenStart = null;
      }
    })
    .saveDataAcrossSessions(false)  // Privacy: no data persisted
    .begin();

  // Hide WebGazer's built-in video preview box
  webgazer.showVideoPreview(false).showPredictionPoints(false);
}

module.exports = { startGazeEngine };
```

---

### 2. `liveness.js` — Liveness Validator

**Goal:** Confirm a real human is behind the camera every 10 seconds. Catch static photos, deepfake video loops, and empty seats.

**How it works:**
- Every `LIVENESS_CHECK_INTERVAL_MS` (10 seconds), grab a frame from the webcam
- Analyse the frame for micro-movements using pixel diff between two frames 150ms apart
- If the frame is too static (diff below threshold), liveness confidence drops
- Emit `signal:liveness` with the result

> **Important:** This is a lightweight heuristic, not ML. For a hackathon, pixel diff is enough to catch a static photo or a frozen stream.

```js
// liveness.js — skeleton (runs in renderer process)

const { LIVENESS_CHECK_INTERVAL_MS, EVENTS } = require('../../shared/constants');

let videoElement = null;
const PIXEL_DIFF_THRESHOLD = 1500; // Minimum pixel diff to confirm liveness

function setupVideo(videoEl) {
  videoElement = videoEl;
}

function captureFrame(canvas, video) {
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

function pixelDiff(frameA, frameB) {
  let diff = 0;
  for (let i = 0; i < frameA.length; i += 4) {
    diff += Math.abs(frameA[i] - frameB[i]);       // R
    diff += Math.abs(frameA[i+1] - frameB[i+1]);   // G
    diff += Math.abs(frameA[i+2] - frameB[i+2]);   // B
  }
  return diff;
}

async function checkLiveness() {
  if (!videoElement) return;

  const canvas = document.createElement('canvas');
  canvas.width = 160;   // Small = fast
  canvas.height = 120;

  const frameA = captureFrame(canvas, videoElement);

  await new Promise(res => setTimeout(res, 150)); // Wait 150ms

  const frameB = captureFrame(canvas, videoElement);
  const diff = pixelDiff(frameA, frameB);

  const live = diff > PIXEL_DIFF_THRESHOLD;
  const confidence = Math.min(1.0, diff / (PIXEL_DIFF_THRESHOLD * 3));

  window.sentinelBridge.send(EVENTS.LIVENESS, {
    live,
    confidence: parseFloat(confidence.toFixed(2)),
    ts: Date.now()
  });
}

function startLivenessCheck() {
  setInterval(checkLiveness, LIVENESS_CHECK_INTERVAL_MS);
}

module.exports = { startLivenessCheck, setupVideo };
```

---

### 3. `index.js` — Module Entry Point

```js
// src/gaze/index.js

const { startGazeEngine } = require('./gazeEngine');
const { startLivenessCheck, setupVideo } = require('./liveness');

function startGaze(videoElement) {
  setupVideo(videoElement);
  startGazeEngine();
  startLivenessCheck();
  console.log('[DEV2] Gaze + liveness module started');
}

module.exports = { startGaze };
```

---

## How DEV4 Wires You In

DEV4 calls your entry point from the renderer after the session starts:

```js
// DEV4 does this in renderer.js — you don't write this
import { startGaze } from '../gaze/index.js';

document.addEventListener('session:start', () => {
  const video = document.getElementById('webcam-feed');
  startGaze(video);
});
```

DEV4 also adds the `<video id="webcam-feed">` element in `index.html`. Coordinate with them on the element ID — use `webcam-feed` exactly.

---

## Acceptance Criteria

Before you hand off, these must all be true:

- [ ] `startGaze(videoElement)` exported from `index.js`
- [ ] Gaze off-screen flag NOT triggered by a single 1-second glance away
- [ ] Gaze off-screen flag triggered after 3+ seconds of sustained off-screen gaze
- [ ] `signal:gaze` emitted with correct payload (see `shared/types.js`)
- [ ] `signal:liveness` emitted every 10 seconds
- [ ] Liveness check correctly returns `live: false` when video is paused or a static image
- [ ] `saveDataAcrossSessions(false)` — WebGazer must not store any data
- [ ] No imports from `src/detection/` or `src/process/`

---

## Test It Yourself

**Gaze test:**
1. Start a session
2. Look at the screen normally for 5 seconds (no flag expected)
3. Look away for 4 seconds (flag expected: `offScreen: true`)
4. Look back (recovery expected: `offScreen: false`)

**Liveness test:**
1. Cover your webcam with your hand (static) — `live: false` expected within 10 seconds
2. Uncover — `live: true` expected on next check

---

## Privacy Notes (Know This for Judge Q&A)

- WebGazer processes video locally in the browser — no video data leaves the device
- `saveDataAcrossSessions(false)` is set — nothing persisted to localStorage
- The liveness canvas is created, used, and discarded — never stored

---

## What NOT to Build

- ❌ Any score calculation — that's DEV1's Bayesian engine
- ❌ Keystroke detection — that's DEV1
- ❌ OS process scanning — that's DEV3
- ❌ The UI gauge or event log — that's DEV4
- ❌ Electron main process code — that's DEV4
- ❌ Complex ML gaze zone detection — out of scope for hackathon
