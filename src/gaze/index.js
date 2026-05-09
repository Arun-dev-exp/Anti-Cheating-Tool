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
