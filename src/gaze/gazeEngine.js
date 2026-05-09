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

module.exports = { startGazeEngine, onResults };
