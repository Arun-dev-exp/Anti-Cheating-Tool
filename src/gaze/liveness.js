const { LIVENESS_CHECK_INTERVAL_MS, EVENTS } = require('../../shared/constants');

let videoElement = null;
const PIXEL_DIFF_THRESHOLD = 1500; // Minimum pixel diff to confirm liveness
let livenessInterval = null;

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

  if (window.sentinelBridge) {
    window.sentinelBridge.send(EVENTS.LIVENESS, {
      live,
      confidence: parseFloat(confidence.toFixed(2)),
      ts: Date.now()
    });
  }
}

function startLivenessCheck() {
  if (!livenessInterval) {
    livenessInterval = setInterval(checkLiveness, LIVENESS_CHECK_INTERVAL_MS);
  }
}

module.exports = { startLivenessCheck, setupVideo };
