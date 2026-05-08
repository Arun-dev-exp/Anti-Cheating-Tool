const { GAZE_OFFSCREEN_THRESHOLD_MS, EVENTS } = require('../../shared/constants');

let offScreenStart = null;
let lastGazeState = false; // false = on-screen

function isOffScreen(x, y) {
  if (x === null || y === null) return true; // WebGazer returns null when no face detected
  return x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight;
}

function emitGaze(offScreen, durationMs = 0) {
  // window.sentinelBridge is exposed by DEV4's preload.js
  if (window.sentinelBridge) {
    window.sentinelBridge.send(EVENTS.GAZE, {
      offScreen,
      durationMs,
      ts: Date.now()
    });
  }
}

function startGazeEngine() {
  if (typeof webgazer !== 'undefined') {
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
  } else {
    console.warn('[DEV2] WebGazer is not loaded. Ensure the script is included in index.html.');
  }
}

module.exports = { startGazeEngine };
