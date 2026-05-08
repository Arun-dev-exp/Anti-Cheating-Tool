const { startGazeEngine } = require('./gazeEngine');
const { startLivenessCheck, setupVideo } = require('./liveness');

function startGaze(videoElement) {
  setupVideo(videoElement);
  startGazeEngine();
  startLivenessCheck();
  console.log('[DEV2] Gaze + liveness module started');
}

module.exports = { startGaze };
