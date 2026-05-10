/**
 * gaze-engine.ts — Production Gaze & Head Pose Detection
 * 
 * Uses MediaPipe FaceLandmarker with outputFacialTransformationMatrixes
 * to extract proper yaw/pitch/roll angles from the rotation matrix.
 * 
 * Detection signals:
 * 1. HEAD YAW — Extracted from the 4x4 facial transformation matrix.
 *    Accurately measures left/right head rotation in radians.
 * 2. HEAD PITCH — Up/down head tilt from the same matrix.
 * 3. IRIS POSITION — Fine-grained eye direction within the head frame.
 *    Used as a secondary signal when head is relatively still.
 * 
 * Smoothing: Uses a 3-frame moving average to reduce jitter.
 */

// ─── Thresholds ─────────────────────────────────────────────────────

// Head yaw: radians. ~0.25 rad ≈ 15°. Candidate looking sideways.
const YAW_THRESHOLD = 0.25;

// Head pitch: radians. ~0.25 rad ≈ 15°. Candidate looking up/down.
const PITCH_THRESHOLD = 0.25;

// Iris deviation from center (0.5). > 0.13 = eyes shifted sideways.
const IRIS_OFF_CENTER_THRESHOLD = 0.13;

// Minimum duration (ms) of off-screen before flagging
const OFF_SCREEN_DURATION_MS = 2000;

// Sampling interval (ms)
const SAMPLE_INTERVAL_MS = 250;

// Smoothing window size
const SMOOTH_WINDOW = 3;

// ─── State ──────────────────────────────────────────────────────────

interface GazeEngineState {
  running: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  offScreenStart: number | null;
  totalOffScreenMs: number;
  totalSamples: number;
  offScreenSamples: number;
  faceLandmarker: any | null;
  lastGazeRatio: number;
  debugLogCounter: number;
  // Smoothing buffers
  yawBuffer: number[];
  pitchBuffer: number[];
  irisBuffer: number[];
}

const state: GazeEngineState = {
  running: false,
  intervalId: null,
  offScreenStart: null,
  totalOffScreenMs: 0,
  totalSamples: 0,
  offScreenSamples: 0,
  faceLandmarker: null,
  lastGazeRatio: 0.5,
  debugLogCounter: 0,
  yawBuffer: [],
  pitchBuffer: [],
  irisBuffer: [],
};

let onSignalCallback: ((data: {
  offScreen: boolean;
  gazeRatio: number;
  durationMs: number;
  ts: number;
}) => void) | null = null;

// ─── Math Helpers ───────────────────────────────────────────────────

/** Moving average of the last N values */
function smoothAvg(buffer: number[], newVal: number, windowSize: number): number {
  buffer.push(newVal);
  if (buffer.length > windowSize) buffer.shift();
  return buffer.reduce((a, b) => a + b, 0) / buffer.length;
}

/**
 * Extract yaw and pitch from a MediaPipe 4x4 facial transformation matrix.
 * The matrix is returned as a flat Float32Array of 16 elements in column-major order.
 * 
 * Column-major layout:
 *   [ m0  m1  m2  m3 ]     col0: [0,1,2,3]
 *   [ m4  m5  m6  m7 ]     col1: [4,5,6,7]
 *   [ m8  m9  m10 m11]     col2: [8,9,10,11]
 *   [ m12 m13 m14 m15]     col3: [12,13,14,15]
 * 
 * But MediaPipe returns it as: [col0[0], col0[1], col0[2], col0[3], col1[0], ...]
 * 
 * Rotation elements in column-major:
 *   R00=m[0]  R01=m[4]  R02=m[8]
 *   R10=m[1]  R11=m[5]  R12=m[9]
 *   R20=m[2]  R21=m[6]  R22=m[10]
 * 
 * For YXZ rotation order (standard for head pose):
 *   pitch = asin(-R20)         = asin(-m[2])
 *   yaw   = atan2(R10, R00)    = atan2(m[1], m[0])
 *   roll  = atan2(R21, R22)    = atan2(m[6], m[10])
 */
function extractYawPitch(matrixData: Float32Array | number[]): { yaw: number; pitch: number } {
  if (!matrixData || matrixData.length < 16) {
    return { yaw: 0, pitch: 0 };
  }

  // Column-major: R20 = m[2], R10 = m[1], R00 = m[0]
  const R20 = matrixData[2];
  const R10 = matrixData[1];
  const R00 = matrixData[0];

  const pitch = Math.asin(Math.max(-1, Math.min(1, -R20)));
  const yaw = Math.atan2(R10, R00);

  return { yaw, pitch };
}

/** Iris-to-eye-width ratio for one eye */
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

  return Math.max(0, Math.min(1, (iris.x - outer.x) / eyeWidth));
}

// ─── Frame Analysis ─────────────────────────────────────────────────

function analyzeFrame(video: HTMLVideoElement): { offScreen: boolean; gazeRatio: number } {
  if (!state.faceLandmarker || video.readyState < 2) {
    return { offScreen: false, gazeRatio: 0.5 };
  }

  try {
    const now = performance.now();
    const results = state.faceLandmarker.detectForVideo(video, now);

    if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
      // No face — not a gaze issue, liveness handles this
      return { offScreen: false, gazeRatio: 0.5 };
    }

    const landmarks = results.faceLandmarks[0];

    // ── Signal 1: Head Pose from Transformation Matrix ──
    let rawYaw = 0;
    let rawPitch = 0;
    let hasMatrix = false;

    if (results.facialTransformationMatrixes &&
        results.facialTransformationMatrixes.length > 0) {
      const matData = results.facialTransformationMatrixes[0].data ?? results.facialTransformationMatrixes[0];
      const angles = extractYawPitch(matData);
      rawYaw = angles.yaw;
      rawPitch = angles.pitch;
      hasMatrix = true;
    }

    // Smooth the values
    const smoothYaw = smoothAvg(state.yawBuffer, Math.abs(rawYaw), SMOOTH_WINDOW);
    const smoothPitch = smoothAvg(state.pitchBuffer, Math.abs(rawPitch), SMOOTH_WINDOW);

    const headOff = smoothYaw > YAW_THRESHOLD || smoothPitch > PITCH_THRESHOLD;

    // ── Signal 2: Iris Position (fallback/secondary) ──
    let irisDeviation = 0;
    let irisOff = false;
    if (landmarks.length > 473) {
      const leftRatio = getIrisRatio(landmarks, 468, 33, 133);
      const rightRatio = getIrisRatio(landmarks, 473, 362, 263);
      const avgRatio = (leftRatio + rightRatio) / 2;
      state.lastGazeRatio = avgRatio;
      irisDeviation = smoothAvg(state.irisBuffer, Math.abs(avgRatio - 0.5), SMOOTH_WINDOW);
      irisOff = irisDeviation > IRIS_OFF_CENTER_THRESHOLD;
    }

    // ── Combined Decision ──
    // Primary: head pose (reliable). Secondary: iris (fine-grained).
    const offScreen = hasMatrix ? (headOff || irisOff) : irisOff;

    // Debug log every ~1s
    state.debugLogCounter++;
    if (state.debugLogCounter % 4 === 0) {
      console.log(
        `[GazeEngine] yaw=${rawYaw.toFixed(3)}rad(${(rawYaw * 180 / Math.PI).toFixed(1)}°) ` +
        `pitch=${rawPitch.toFixed(3)}rad(${(rawPitch * 180 / Math.PI).toFixed(1)}°) ` +
        `iris=${irisDeviation.toFixed(3)} | ` +
        `matrix=${hasMatrix} offScreen=${offScreen}`
      );
    }

    return { offScreen, gazeRatio: state.lastGazeRatio };
  } catch (err) {
    console.warn("[GazeEngine] Frame analysis error:", err);
    return { offScreen: false, gazeRatio: 0.5 };
  }
}

// ─── Engine Lifecycle ───────────────────────────────────────────────

export async function startGazeEngine(
  video: HTMLVideoElement,
  onSignal?: (data: { offScreen: boolean; gazeRatio: number; durationMs: number; ts: number }) => void
): Promise<void> {
  if (state.running) {
    console.log("[GazeEngine] Already running, skipping duplicate start");
    return;
  }

  onSignalCallback = onSignal ?? null;

  try {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    state.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: false,
      // THIS is the key — gives us the 4x4 rotation matrix for head pose
      outputFacialTransformationMatrixes: true,
    });

    console.log("[GazeEngine] ✓ MediaPipe Face Landmarker initialized (matrix mode)");
  } catch (err) {
    console.error("[GazeEngine] ✗ Failed to init MediaPipe:", err);
    return;
  }

  state.running = true;
  state.offScreenStart = null;
  state.totalOffScreenMs = 0;
  state.totalSamples = 0;
  state.offScreenSamples = 0;
  state.debugLogCounter = 0;
  state.yawBuffer = [];
  state.pitchBuffer = [];
  state.irisBuffer = [];

  state.intervalId = setInterval(() => {
    if (!state.running) return;

    const { offScreen, gazeRatio } = analyzeFrame(video);
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

        if (typeof window !== "undefined" && (window as any).sentinelBridge) {
          (window as any).sentinelBridge.send("signal:gaze", signalData);
        }

        onSignalCallback?.(signalData);
      }
    } else {
      if (state.offScreenStart) {
        const signalData = { offScreen: false, gazeRatio, durationMs: 0, ts: now };

        if (typeof window !== "undefined" && (window as any).sentinelBridge) {
          (window as any).sentinelBridge.send("signal:gaze", signalData);
        }

        onSignalCallback?.(signalData);
      }
      state.offScreenStart = null;
    }
  }, SAMPLE_INTERVAL_MS);

  console.log("[GazeEngine] ✓ Started — sampling every", SAMPLE_INTERVAL_MS, "ms");
}

export function stopGazeEngine(): void {
  state.running = false;

  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }

  if (state.faceLandmarker) {
    try { state.faceLandmarker.close(); } catch {}
    state.faceLandmarker = null;
  }

  onSignalCallback = null;
  console.log(
    "[GazeEngine] Stopped. Samples:", state.totalSamples,
    "Off-screen:", state.offScreenSamples
  );
}

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
