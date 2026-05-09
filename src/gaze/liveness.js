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
