# DEV2 — Gaze Engine & Liveness PRD (MediaPipe Edition)
**Owner:** Developer 2  
**Module:** `src/gaze/`  
**Branch:** `dev2/gaze`  
**Updated:** WebGazer replaced with Google MediaPipe Face Mesh

---

## Your Job in One Sentence
Use Google's MediaPipe to track iris position and head pose — flag when a candidate looks away from the screen for 3+ seconds, and validate that a real human is present every 10 seconds.

---

## Why MediaPipe, Not WebGazer

If a judge asks: *"What are you using for gaze detection?"*  
You say: *"Google's MediaPipe Face Mesh — 468 facial landmarks, iris tracking, runs entirely on-device."*

That answer wins rooms. WebGazer does not.

| | WebGazer | MediaPipe |
|---|---|---|
| Built by | Brown University | Google |
| Landmarks | ~6 eye points | 468 face points + iris |
| Accuracy | ~150px estimate | Precise iris centre |
| Maintained | Rarely | Actively |
| Production use | Academic projects | Google Meet, YouTube, Snapchat |

---

## Files You Own

```
src/gaze/
├── gazeEngine.js   ← MediaPipe wrapper + off-screen detection logic
├── liveness.js     ← Liveness validator (blink + micro-movement detection)
└── index.js        ← Entry point — exports startGaze()
```

**Do not create files outside this folder.**  
**Do not import from `src/detection/` or `src/process/`.**

---

## Dependencies

MediaPipe runs entirely in the **renderer process** (browser). No npm install needed — loaded via CDN script tags.

Tell DEV4 to add these to `index.html` in this exact order:

```html
<!-- MediaPipe Face Mesh -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"></script>
```

Also read (never edit):
- `shared/constants.js`
- `shared/types.js`

---

## How MediaPipe Face Mesh Works (Read This First)

MediaPipe gives you **468 landmark points** on the face every frame. Each point has `x`, `y`, `z` coordinates (normalised 0–1 relative to the video frame).

For gaze detection, you care about **4 specific landmark indices:**

```
Left iris centre:  landmark[468]
Right iris centre: landmark[473]
Left eye outer:    landmark[33]
Right eye outer:   landmark[263]
```

The logic is simple:
- Calculate how far the iris centre is from the centre of the eye socket
- If iris is shifted significantly LEFT, RIGHT, or UP — candidate is looking away
- If no face is detected at all — candidate has left the frame

You are NOT mapping gaze to screen coordinates (that's hard). You are only answering: **"Is this person looking at the screen or not?"** That's easy and reliable.

---

## What to Build

### 1. `gazeEngine.js` — MediaPipe Gaze Detector

```js
// gazeEngine.js — runs in renderer process

const { GAZE_OFFSCREEN_THRESHOLD_MS, EVENTS } = require('../../shared/constants');

// MediaPipe landmark indices
const LANDMARKS = {
  LEFT_IRIS:       468,
  RIGHT_IRIS:      473,
  LEFT_EYE_LEFT:   33,
  LEFT_EYE_RIGHT:  133,
  RIGHT_EYE_LEFT:  362,
  RIGHT_EYE_RIGHT: 263,
  NOSE_TIP:        1,
  CHIN:            152,
  LEFT_TEMPLE:     234,
  RIGHT_TEMPLE:    454,
};

// How far the iris can shift from eye centre before flagging (0.0–1.0 normalised)
const IRIS_DEVIATION_THRESHOLD = 0.18;

// Head rotation threshold (normalised units)
const HEAD_TURN_THRESHOLD = 0.15;

let offScreenStart = null;
let lastFlagState = false;
let faceMesh = null;
let camera = null;

// ─── Core gaze logic ──────────────────────────────────────────────────────────

function getPoint(landmarks, index) {
  return landmarks[index];
}

function irisDeviationScore(landmarks) {
  // Left eye: how far is iris from centre of eye socket?
  const leftEyeLeft  = getPoint(landmarks, LANDMARKS.LEFT_EYE_LEFT);
  const leftEyeRight = getPoint(landmarks, LANDMARKS.LEFT_EYE_RIGHT);
  const leftIris     = getPoint(landmarks, LANDMARKS.LEFT_IRIS);

  const leftEyeCentreX = (leftEyeLeft.x + leftEyeRight.x) / 2;
  const leftDeviation  = Math.abs(leftIris.x - leftEyeCentreX);

  // Right eye
  const rightEyeLeft  = getPoint(landmarks, LANDMARKS.RIGHT_EYE_LEFT);
  const rightEyeRight = getPoint(landmarks, LANDMARKS.RIGHT_EYE_RIGHT);
  const rightIris     = getPoint(landmarks, LANDMARKS.RIGHT_IRIS);

  const rightEyeCentreX = (rightEyeLeft.x + rightEyeRight.x) / 2;
  const rightDeviation  = Math.abs(rightIris.x - rightEyeCentreX);

  return (leftDeviation + rightDeviation) / 2;
}

function isHeadTurnedAway(landmarks) {
  // If nose tip is significantly off-centre between temples, head is turned
  const noseTip     = getPoint(landmarks, LANDMARKS.NOSE_TIP);
  const leftTemple  = getPoint(landmarks, LANDMARKS.LEFT_TEMPLE);
  const rightTemple = getPoint(landmarks, LANDMARKS.RIGHT_TEMPLE);

  const faceCentreX = (leftTemple.x + rightTemple.x) / 2;
  const offset = Math.abs(noseTip.x - faceCentreX);

  return offset > HEAD_TURN_THRESHOLD;
}

function isLookingAway(landmarks) {
  // Flag if EITHER the head is turned OR iris is deviated significantly
  const deviation = irisDeviationScore(landmarks);
  const headTurned = isHeadTurnedAway(landmarks);
  return deviation > IRIS_DEVIATION_THRESHOLD || headTurned;
}

// ─── Emit helper ──────────────────────────────────────────────────────────────

function emitGaze(offScreen, durationMs = 0) {
  window.sentinelBridge.send(EVENTS.GAZE, {
    offScreen,
    durationMs,
    ts: Date.now()
  });
}

// ─── MediaPipe result handler ─────────────────────────────────────────────────

function onResults(results) {
  // No face detected = off screen
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    handleOffScreen();
    return;
  }

  const landmarks = results.multiFaceLandmarks[0];
  const lookingAway = isLookingAway(landmarks);

  if (lookingAway) {
    handleOffScreen();
  } else {
    handleOnScreen();
  }
}

function handleOffScreen() {
  if (!offScreenStart) {
    offScreenStart = Date.now();
  } else {
    const duration = Date.now() - offScreenStart;
    if (duration >= GAZE_OFFSCREEN_THRESHOLD_MS && !lastFlagState) {
      lastFlagState = true;
      emitGaze(true, duration);
    }
  }
}

function handleOnScreen() {
  if (lastFlagState) {
    lastFlagState = false;
    emitGaze(false, 0);
  }
  offScreenStart = null;
}

// ─── Initialise MediaPipe ─────────────────────────────────────────────────────

function startGazeEngine(videoElement) {
  faceMesh = new FaceMesh({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,   // Enables iris landmarks (468, 473)
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.onResults(onResults);

  // MediaPipe Camera utility — handles frame capture loop automatically
  camera = new Camera(videoElement, {
    onFrame: async () => {
      await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });

  camera.start();
  console.log('[DEV2] MediaPipe gaze engine started');
}

module.exports = { startGazeEngine };
```

---

### 2. `liveness.js` — Liveness Validator

**Goal:** Confirm a real human is present every 10 seconds. Catch frozen video feeds, static photos, and empty seats.

**How it works:**
Now that you have MediaPipe running, liveness becomes easier and more accurate. Instead of raw pixel diff, use **landmark movement** — if the 468 face points aren't moving at all between frames, it's not a live person.

```js
// liveness.js — runs in renderer process

const { LIVENESS_CHECK_INTERVAL_MS, EVENTS } = require('../../shared/constants');

// Store last landmark snapshot for comparison
let lastLandmarkSnapshot = null;
let livenessInterval = null;

// Minimum total landmark movement to confirm liveness
// (sum of distances across all 468 points)
const MOVEMENT_THRESHOLD = 2.5;

function snapshotLandmarks(landmarks) {
  // Snapshot just 20 key points (faster comparison, still accurate)
  const keyPoints = [1, 33, 61, 133, 152, 234, 263, 291, 362, 389,
                     454, 468, 473, 10, 152, 195, 197, 4, 94, 370];
  return keyPoints.map(i => ({ x: landmarks[i].x, y: landmarks[i].y }));
}

function landmarkMovement(snapA, snapB) {
  let totalMovement = 0;
  for (let i = 0; i < snapA.length; i++) {
    const dx = snapA[i].x - snapB[i].x;
    const dy = snapA[i].y - snapB[i].y;
    totalMovement += Math.sqrt(dx * dx + dy * dy);
  }
  return totalMovement;
}

// Called by gazeEngine with current landmarks every frame
function updateLandmarkSnapshot(landmarks) {
  lastLandmarkSnapshot = snapshotLandmarks(landmarks);
}

function checkLiveness(currentLandmarks) {
  if (!currentLandmarks) {
    // No face = definitely not live
    window.sentinelBridge.send(EVENTS.LIVENESS, {
      live: false,
      confidence: 0,
      ts: Date.now()
    });
    return;
  }

  if (!lastLandmarkSnapshot) {
    // First check — just store snapshot, can't compare yet
    lastLandmarkSnapshot = snapshotLandmarks(currentLandmarks);
    return;
  }

  const current = snapshotLandmarks(currentLandmarks);
  const movement = landmarkMovement(lastLandmarkSnapshot, current);

  const live = movement > MOVEMENT_THRESHOLD;
  const confidence = Math.min(1.0, movement / (MOVEMENT_THRESHOLD * 3));

  window.sentinelBridge.send(EVENTS.LIVENESS, {
    live,
    confidence: parseFloat(confidence.toFixed(2)),
    ts: Date.now()
  });

  // Update snapshot for next comparison
  lastLandmarkSnapshot = current;
}

function startLivenessCheck(getCurrentLandmarks) {
  livenessInterval = setInterval(() => {
    const landmarks = getCurrentLandmarks();
    checkLiveness(landmarks);
  }, LIVENESS_CHECK_INTERVAL_MS);
}

module.exports = { startLivenessCheck, updateLandmarkSnapshot };
```

---

### 3. `index.js` — Module Entry Point

Wire gaze engine and liveness together. Notice liveness now feeds off MediaPipe landmarks directly — no separate webcam capture needed.

```js
// src/gaze/index.js

const { startGazeEngine } = require('./gazeEngine');
const { startLivenessCheck, updateLandmarkSnapshot } = require('./liveness');

// Store the latest landmarks so liveness can access them
let latestLandmarks = null;

function startGaze(videoElement) {
  // Patch gazeEngine to also update liveness snapshots
  // We monkey-patch onResults to share landmarks with liveness module
  const { FaceMesh, Camera } = window; // MediaPipe globals from CDN

  const faceMesh = new FaceMesh({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  // Import core logic from gazeEngine
  const { onResults: gazeOnResults } = require('./gazeEngine');

  faceMesh.onResults((results) => {
    // Update liveness landmark snapshot
    if (results.multiFaceLandmarks?.[0]) {
      latestLandmarks = results.multiFaceLandmarks[0];
      updateLandmarkSnapshot(latestLandmarks);
    } else {
      latestLandmarks = null;
    }

    // Run gaze logic
    gazeOnResults(results);
  });

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });

  camera.start();

  // Start liveness checks — passes current landmark getter
  startLivenessCheck(() => latestLandmarks);

  console.log('[DEV2] Gaze + liveness module started (MediaPipe)');
}

module.exports = { startGaze };
```

---

## What You Can Now Tell Judges

**Q: How does your gaze tracking work?**

> "We use Google's MediaPipe Face Mesh — it maps 468 facial landmarks in real time, including precise iris position. We track both iris deviation from the eye centre and head pose simultaneously. If either signal shows the candidate looking away for over 3 seconds, the integrity score drops. Everything runs on-device, nothing leaves the machine."

That answer is bulletproof with any judge.

---

## Acceptance Criteria

- [ ] `startGaze(videoElement)` exported from `index.js`
- [ ] MediaPipe initialises without errors in Electron renderer
- [ ] Gaze flag NOT triggered by a normal 1-second glance away
- [ ] Gaze flag triggered after 3+ sustained seconds looking away
- [ ] `signal:gaze` emitted with correct payload
- [ ] `signal:liveness` emitted every 10 seconds
- [ ] Liveness returns `live: false` when video is paused or a static image is shown
- [ ] No WebGazer references anywhere in this module
- [ ] No imports from `src/detection/` or `src/process/`

---

## Test It Yourself

**Gaze test:**
1. Sit in front of webcam, look at screen normally → no flag for 3 seconds
2. Turn head to look at a second screen or away → flag fires after 3s
3. Look back → recovery signal fires

**Liveness test:**
1. Hold a printed photo in front of webcam → `live: false` within 10s
2. Cover webcam → `live: false` immediately
3. Move normally → `live: true`

---

## Privacy Notes (For Judge Q&A)

- MediaPipe processes all video **locally in the browser** using WebAssembly
- No video frames or landmark data are sent to any server
- Google's servers are only used to load the library files on first load — after that, everything is local
- Zero data stored between sessions

---

## What NOT to Build

- ❌ WebGazer — do not use it at all
- ❌ Score calculation — DEV1's Bayesian engine
- ❌ Keystroke detection — DEV1
- ❌ OS process scanning — DEV3
- ❌ UI gauge or event log — DEV4
- ❌ Mapping gaze to exact screen coordinates — unnecessary, unreliable, out of scope