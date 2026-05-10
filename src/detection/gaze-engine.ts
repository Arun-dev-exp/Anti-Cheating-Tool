/**
 * gaze-engine.ts — Real Gaze Tracking via MediaPipe Face Mesh
 * 
 * Runs in the RENDERER (browser context). Uses MediaPipe Face Mesh to
 * detect eye landmarks and determine if the candidate is looking off-screen.
 * 
 * Sends IPC signals via window.sentinelBridge to main.js → Bayesian engine.
 * 
 * Key landmarks used:
 * - Left iris: indices 468-472
 * - Right iris: indices 473-477
 * - Left eye corners: 33 (outer), 133 (inner)
 * - Right eye corners: 362 (outer), 263 (inner)
 */

// Threshold: how far off-center the iris ratio must be to count as "off-screen"
const IRIS_OFF_CENTER_THRESHOLD = 0.35;
// How long (ms) the candidate must look away before flagging
const OFF_SCREEN_DURATION_MS = 3000;
// How often to sample (ms)
const SAMPLE_INTERVAL_MS = 200;

interface GazeEngineState {
  running: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  offScreenStart: number | null;
  totalOffScreenMs: number;
  totalSamples: number;
  offScreenSamples: number;
  faceMesh: any | null;
  lastGazeRatio: number;
}

const state: GazeEngineState = {
  running: false,
  intervalId: null,
  offScreenStart: null,
  totalOffScreenMs: 0,
  totalSamples: 0,
  offScreenSamples: 0,
  faceMesh: null,
  lastGazeRatio: 0.5,
};

let onSignalCallback: ((data: { offScreen: boolean; gazeRatio: number; durationMs: number; ts: number }) => void) | null = null;

/**
 * Calculate the iris-to-eye-width ratio for one eye.
 * Returns 0.0 (looking full left) to 1.0 (looking full right), ~0.5 = center.
 */
function getIrisRatio(
  landmarks: any[],
  irisCenter: number,
  eyeOuterCorner: number,
  eyeInnerCorner: number
): number {
  const iris = landmarks[irisCenter];
  const outer = landmarks[eyeOuterCorner];
  const inner = landmarks[eyeInnerCorner];

  if (!iris || !outer || !inner) return 0.5;

  const eyeWidth = Math.abs(inner.x - outer.x);
  if (eyeWidth < 0.001) return 0.5;

  const irisPosition = (iris.x - outer.x) / eyeWidth;
  return Math.max(0, Math.min(1, irisPosition));
}

/**
 * Analyze a single video frame for gaze direction.
 * Uses a canvas to grab frame data and run MediaPipe Face Mesh.
 */
async function analyzeFrame(video: HTMLVideoElement): Promise<{ offScreen: boolean; gazeRatio: number }> {
  if (!state.faceMesh || video.readyState < 2) {
    return { offScreen: false, gazeRatio: 0.5 };
  }

  try {
    const results = await state.faceMesh.detectForVideo(video, performance.now());

    if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
      // No face detected — this is a liveness issue, not gaze
      return { offScreen: false, gazeRatio: 0.5 };
    }

    const landmarks = results.faceLandmarks[0];

    // Calculate iris ratios for both eyes
    // Left eye: iris center = 468, outer corner = 33, inner corner = 133
    const leftRatio = getIrisRatio(landmarks, 468, 33, 133);
    // Right eye: iris center = 473, outer corner = 362, inner corner = 263
    const rightRatio = getIrisRatio(landmarks, 473, 362, 263);

    // Average of both eyes
    const avgRatio = (leftRatio + rightRatio) / 2;
    state.lastGazeRatio = avgRatio;

    // Off-center = deviation from 0.5
    const deviation = Math.abs(avgRatio - 0.5);
    const offScreen = deviation > IRIS_OFF_CENTER_THRESHOLD;

    return { offScreen, gazeRatio: avgRatio };
  } catch (err) {
    console.warn("[GazeEngine] Frame analysis error:", err);
    return { offScreen: false, gazeRatio: 0.5 };
  }
}

/**
 * Start the gaze tracking engine.
 * 
 * @param video - The HTMLVideoElement showing the camera feed
 * @param onSignal - Callback for each gaze signal (also sends via IPC if available)
 */
export async function startGazeEngine(
  video: HTMLVideoElement,
  onSignal?: (data: { offScreen: boolean; gazeRatio: number; durationMs: number; ts: number }) => void
): Promise<void> {
  if (state.running) return;

  onSignalCallback = onSignal ?? null;

  try {
    // Dynamic import to avoid SSR issues
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    state.faceMesh = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });

    console.log("[GazeEngine] MediaPipe Face Landmarker initialized");
  } catch (err) {
    console.error("[GazeEngine] Failed to init MediaPipe:", err);
    return;
  }

  state.running = true;
  state.offScreenStart = null;
  state.totalOffScreenMs = 0;
  state.totalSamples = 0;
  state.offScreenSamples = 0;

  state.intervalId = setInterval(async () => {
    if (!state.running) return;

    const { offScreen, gazeRatio } = await analyzeFrame(video);
    state.totalSamples++;

    const now = Date.now();

    if (offScreen) {
      state.offScreenSamples++;

      if (!state.offScreenStart) {
        state.offScreenStart = now;
      }

      const duration = now - state.offScreenStart;

      if (duration >= OFF_SCREEN_DURATION_MS) {
        state.totalOffScreenMs += SAMPLE_INTERVAL_MS;

        const signalData = { offScreen: true, gazeRatio, durationMs: duration, ts: now };

        // Send via IPC to Bayesian engine
        if (typeof window !== "undefined" && (window as any).sentinelBridge) {
          (window as any).sentinelBridge.send("signal:gaze", signalData);
        }

        onSignalCallback?.(signalData);
      }
    } else {
      if (state.offScreenStart) {
        // Was off-screen, now back — send recovery signal
        const signalData = { offScreen: false, gazeRatio, durationMs: 0, ts: now };

        if (typeof window !== "undefined" && (window as any).sentinelBridge) {
          (window as any).sentinelBridge.send("signal:gaze", signalData);
        }

        onSignalCallback?.(signalData);
      }
      state.offScreenStart = null;
    }
  }, SAMPLE_INTERVAL_MS);

  console.log("[GazeEngine] Started — sampling every", SAMPLE_INTERVAL_MS, "ms");
}

/**
 * Stop the gaze engine and clean up.
 */
export function stopGazeEngine(): void {
  state.running = false;

  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }

  if (state.faceMesh) {
    state.faceMesh.close();
    state.faceMesh = null;
  }

  onSignalCallback = null;
  console.log("[GazeEngine] Stopped. Total samples:", state.totalSamples, "Off-screen:", state.offScreenSamples);
}

/**
 * Get current gaze engine statistics.
 */
export function getGazeStats() {
  return {
    running: state.running,
    totalSamples: state.totalSamples,
    offScreenSamples: state.offScreenSamples,
    offScreenPercentage: state.totalSamples > 0
      ? Math.round((state.offScreenSamples / state.totalSamples) * 100)
      : 0,
    lastGazeRatio: state.lastGazeRatio,
  };
}
