/**
 * liveness-engine.ts — Real Face Presence Detection
 * 
 * Runs in the RENDERER (browser context). Uses MediaPipe Face Landmarker
 * to verify that a face is present and visible in the camera feed.
 * 
 * Checks every LIVENESS_CHECK_INTERVAL_MS (10s). If no face is detected
 * for consecutive checks, sends a liveness flag to the Bayesian engine.
 * 
 * Shares the same FaceLandmarker instance via the gaze engine when possible,
 * but can initialize its own if needed.
 */

const LIVENESS_CHECK_INTERVAL_MS = 10000; // Check every 10 seconds
const CONSECUTIVE_MISS_THRESHOLD = 2; // Flag after 2 consecutive misses (20s)

interface LivenessState {
  running: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  consecutiveMisses: number;
  totalChecks: number;
  totalPresent: number;
  faceLandmarker: any | null;
  ownsLandmarker: boolean; // Whether we created our own instance
}

const state: LivenessState = {
  running: false,
  intervalId: null,
  consecutiveMisses: 0,
  totalChecks: 0,
  totalPresent: 0,
  faceLandmarker: null,
  ownsLandmarker: false,
};

let onSignalCallback: ((data: { live: boolean; confidence: number; faceCount: number; ts: number }) => void) | null = null;

/**
 * Detect faces in the current video frame.
 */
async function detectFace(video: HTMLVideoElement): Promise<{ faceCount: number; confidence: number }> {
  if (!state.faceLandmarker || video.readyState < 2) {
    return { faceCount: 0, confidence: 0 };
  }

  try {
    // detectForVideo is synchronous — use a unique timestamp to avoid conflicts
    const results = state.faceLandmarker.detectForVideo(video, performance.now());

    const faceCount = results.faceLandmarks?.length ?? 0;

    // Confidence: based on number of detected landmarks (478 per face)
    let confidence = 0;
    if (faceCount > 0 && results.faceLandmarks[0]) {
      const landmarkCount = results.faceLandmarks[0].length;
      confidence = Math.min(100, Math.round((landmarkCount / 478) * 100));
    }

    console.log(`[LivenessEngine] Check: ${faceCount} face(s), confidence: ${confidence}%`);
    return { faceCount, confidence };
  } catch (err) {
    console.warn("[LivenessEngine] Detection error:", err);
    return { faceCount: 0, confidence: 0 };
  }
}

/**
 * Start the liveness detection engine.
 * 
 * @param video - The HTMLVideoElement showing the camera feed
 * @param sharedLandmarker - Optional shared FaceLandmarker from gaze engine (avoids double-init)
 * @param onSignal - Callback for each liveness check result
 */
export async function startLivenessEngine(
  video: HTMLVideoElement,
  sharedLandmarker?: any,
  onSignal?: (data: { live: boolean; confidence: number; faceCount: number; ts: number }) => void
): Promise<void> {
  if (state.running) return;

  onSignalCallback = onSignal ?? null;

  if (sharedLandmarker) {
    state.faceLandmarker = sharedLandmarker;
    state.ownsLandmarker = false;
    console.log("[LivenessEngine] Using shared FaceLandmarker from gaze engine");
  } else {
    // Initialize our own
    try {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      state.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 2, // Detect up to 2 faces (flag if multiple)
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      state.ownsLandmarker = true;
      console.log("[LivenessEngine] Own FaceLandmarker initialized");
    } catch (err) {
      console.error("[LivenessEngine] Failed to init MediaPipe:", err);
      return;
    }
  }

  state.running = true;
  state.consecutiveMisses = 0;
  state.totalChecks = 0;
  state.totalPresent = 0;

  // Run first check immediately
  await runCheck(video);

  state.intervalId = setInterval(() => runCheck(video), LIVENESS_CHECK_INTERVAL_MS);

  console.log("[LivenessEngine] Started — checking every", LIVENESS_CHECK_INTERVAL_MS, "ms");
}

async function runCheck(video: HTMLVideoElement) {
  if (!state.running) return;

  const { faceCount, confidence } = await detectFace(video);
  state.totalChecks++;

  const now = Date.now();
  const live = faceCount === 1; // Exactly one face = valid

  if (live) {
    state.totalPresent++;
    state.consecutiveMisses = 0;
  } else {
    state.consecutiveMisses++;
  }

  const shouldFlag = !live && state.consecutiveMisses >= CONSECUTIVE_MISS_THRESHOLD;

  const signalData = {
    live: !shouldFlag, // Only flag after consecutive misses
    confidence,
    faceCount,
    ts: now,
  };

  // Send via IPC to Bayesian engine
  if (typeof window !== "undefined" && (window as any).sentinelBridge) {
    (window as any).sentinelBridge.send("signal:liveness", signalData);
  }

  onSignalCallback?.(signalData);

  if (shouldFlag) {
    console.warn(
      `[LivenessEngine] ⚠ Face ${faceCount === 0 ? "NOT detected" : "MULTIPLE faces"} — ${state.consecutiveMisses} consecutive misses`
    );
  }
}

/**
 * Stop the liveness engine and clean up.
 */
export function stopLivenessEngine(): void {
  state.running = false;

  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }

  if (state.ownsLandmarker && state.faceLandmarker) {
    state.faceLandmarker.close();
  }
  state.faceLandmarker = null;

  onSignalCallback = null;
  console.log("[LivenessEngine] Stopped. Checks:", state.totalChecks, "Present:", state.totalPresent);
}

/**
 * Get current liveness statistics.
 */
export function getLivenessStats() {
  return {
    running: state.running,
    totalChecks: state.totalChecks,
    totalPresent: state.totalPresent,
    presencePercentage: state.totalChecks > 0
      ? Math.round((state.totalPresent / state.totalChecks) * 100)
      : 100,
    consecutiveMisses: state.consecutiveMisses,
  };
}
