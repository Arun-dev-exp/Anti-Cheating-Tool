"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/components/ui/GradientButton";

const steps = [
  { instruction: "Slowly turn your head left", icon: "arrow_back", hint: "Turn left and hold for a moment", key: "left" },
  { instruction: "Slowly turn your head right", icon: "arrow_forward", hint: "Turn right and hold for a moment", key: "right" },
  { instruction: "Blink 2–3 times", icon: "visibility", hint: "Blink naturally at a normal pace", key: "blink" },
];

export default function LivenessPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [verified, setVerified] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stepsDone, setStepsDone] = useState<boolean[]>(new Array(3).fill(false));
  const [blinkCount, setBlinkCount] = useState(0);
  const [statusText, setStatusText] = useState("");

  // Timer
  useEffect(() => {
    if (verified) return;
    const t = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, [verified]);

  const fmt = useCallback(
    (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`,
    []
  );

  // Start camera
  useEffect(() => {
    let cancelled = false;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        setError("Camera access denied. Please grant permission and refresh.");
      }
    }
    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Load MediaPipe FaceLandmarker
  useEffect(() => {
    let cancelled = false;
    async function loadModel() {
      try {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const fileset = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false,
        });
        if (!cancelled) {
          landmarkerRef.current = landmarker;
          setModelReady(true);
        }
      } catch {
        setError("Failed to load face detection model. Check your internet connection.");
      }
    }
    loadModel();
    return () => { cancelled = true; };
  }, []);

  // Detection loop
  useEffect(() => {
    if (!cameraReady || !modelReady || verified) return;
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker) return;

    let localStep = currentStep;
    let localDone = [...stepsDone];
    let localBlinks = blinkCount;
    let holdFrames = 0;
    const HOLD_NEEDED = 10;
    let wasEyeClosed = false;

    function detect() {
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        const results = landmarker.detectForVideo(video, performance.now());
        const faces = results.faceLandmarks?.length ?? 0;
        setFaceDetected(faces === 1);

        if (faces === 1 && results.faceLandmarks[0]) {
          const landmarks = results.faceLandmarks[0];
          const conf = Math.min(100, Math.round((landmarks.length / 478) * 100));
          setConfidence(conf);

          // --- Head turn detection using nose tip vs face center ---
          // Nose tip = landmark 1, left cheek = 234, right cheek = 454
          const noseTip = landmarks[1];
          const leftCheek = landmarks[234];
          const rightCheek = landmarks[454];
          const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
          const faceCenter = (leftCheek.x + rightCheek.x) / 2;
          // How far nose is from center, normalized by face width
          // Positive = nose to right of center (user turned left in mirrored view)
          const noseOffset = faceWidth > 0 ? (noseTip.x - faceCenter) / faceWidth : 0;

          // --- Blink detection from blendshapes ---
          let eyesClosed = false;
          if (results.faceBlendshapes?.[0]) {
            const shapes = results.faceBlendshapes[0].categories;
            const leftBlink = shapes.find((s: any) => s.categoryName === "eyeBlinkLeft");
            const rightBlink = shapes.find((s: any) => s.categoryName === "eyeBlinkRight");
            if (leftBlink && rightBlink) {
              eyesClosed = leftBlink.score > 0.35 && rightBlink.score > 0.35;
            }
          }

          let stepPassed = false;

          switch (localStep) {
            case 0: // Turn left — in camera coords (mirrored), nose moves RIGHT of center
              if (noseOffset > 0.15) {
                holdFrames++;
                setStatusText("Hold... detecting left turn");
                if (holdFrames >= HOLD_NEEDED) stepPassed = true;
              } else {
                holdFrames = Math.max(0, holdFrames - 2);
                setStatusText("Turn your head to the left");
              }
              break;

            case 1: // Turn right — nose moves LEFT of center
              if (noseOffset < -0.15) {
                holdFrames++;
                setStatusText("Hold... detecting right turn");
                if (holdFrames >= HOLD_NEEDED) stepPassed = true;
              } else {
                holdFrames = Math.max(0, holdFrames - 2);
                setStatusText("Turn your head to the right");
              }
              break;

            case 2: // Blink 2-3 times
              if (eyesClosed && !wasEyeClosed) {
                // Rising edge: eyes just closed
                localBlinks++;
                setBlinkCount(localBlinks);
              }
              wasEyeClosed = eyesClosed;
              setStatusText(`Blinks detected: ${localBlinks}/2`);
              if (localBlinks >= 2) stepPassed = true;
              break;
          }

          if (stepPassed) {
            localDone[localStep] = true;
            setStepsDone([...localDone]);
            holdFrames = 0;

            if (localStep < 2) {
              localStep++;
              setCurrentStep(localStep);
              localBlinks = 0;
              setBlinkCount(0);
              wasEyeClosed = false;
              setStatusText("");
            } else {
              setVerified(true);
              setStatusText("All checks passed!");
              return;
            }
          }
        } else {
          setConfidence(0);
          holdFrames = 0;
          setStatusText("Position your face in the frame");
        }
      } catch {
        // Skip frame
      }

      rafRef.current = requestAnimationFrame(detect);
    }

    rafRef.current = requestAnimationFrame(detect);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cameraReady, modelReady, verified, currentStep]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const safeStep = steps[Math.min(currentStep, steps.length - 1)];
  const isLoading = !cameraReady || !modelReady;

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "radial-gradient(circle, #3B82F6 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", animation: "pulseGlow 6s infinite alternate" }} />

      <div className="relative z-10 w-full max-w-[600px]" style={{ animation: "scaleIn 0.5s ease forwards" }}>
        <div className="absolute -inset-1 rounded-[22px] opacity-30 blur-xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.08))" }} />

        <div className="relative bg-bg-panel/90 border border-border-subtle rounded-[20px] overflow-hidden"
          style={{ backdropFilter: "blur(20px)", boxShadow: "0 25px 80px rgba(0,0,0,0.4), 0 0 40px rgba(59,130,246,0.06)" }}>

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border-subtle bg-bg-surface/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-accent-blue">verified_user</span>
              <span className="font-mono text-[11px] text-text-secondary uppercase tracking-wider">Liveness Verification</span>
            </div>
            <div className="flex items-center gap-3">
              {cameraReady && (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-breach" style={{ animation: "dotPulse 1.5s infinite" }} />
                  <span className="text-[10px] text-text-secondary font-mono">REC</span>
                </div>
              )}
              <span className="text-[11px] text-text-mono font-mono">{fmt(elapsed)}</span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                <span className="material-symbols-outlined text-red-400" style={{ fontSize: "20px" }}>error</span>
                <span className="text-[13px] text-red-400">{error}</span>
              </div>
            )}

            {/* Camera Feed */}
            <div className="relative mx-auto mb-6 rounded-2xl overflow-hidden border border-border-subtle"
              style={{ aspectRatio: "4/3", maxWidth: "440px", boxShadow: "inset 0 0 60px rgba(0,0,0,0.3)" }}>

              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: "scaleX(-1)", display: cameraReady ? "block" : "none" }} muted playsInline autoPlay />

              {!cameraReady && !error && (
                <div className="absolute inset-0 bg-bg-base flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-text-secondary/30 animate-pulse" style={{ fontSize: "36px" }}>videocam</span>
                  <span className="text-[11px] text-text-secondary/40 font-mono">Initializing camera...</span>
                </div>
              )}

              {/* Face frame brackets */}
              {cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative" style={{ width: "55%", height: "70%" }}>
                    {["top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                      "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                      "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                      "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                    ].map((cls, i) => (
                      <div key={i} className={`absolute w-6 h-6 ${cls} transition-colors duration-500`}
                        style={{ borderColor: verified ? "#22C55E" : faceDetected ? "#3B82F6" : "#EF4444" }} />
                    ))}
                    {!verified && (
                      <div className="absolute left-2 right-2 h-0.5 rounded-full"
                        style={{ background: "linear-gradient(90deg, transparent, #3B82F6, transparent)", animation: "scanLine 2s ease-in-out infinite" }} />
                    )}
                  </div>
                </div>
              )}

              {/* Status overlay */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-bg-base/70 border border-border-subtle/50"
                style={{ backdropFilter: "blur(8px)" }}>
                {isLoading ? (
                  <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: "12px" }}>progress_activity</span>
                    Loading model...
                  </span>
                ) : (
                  <span className="text-[11px] font-mono flex items-center gap-1.5" style={{ color: faceDetected ? "#22C55E" : "#EF4444" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: faceDetected ? "#22C55E" : "#EF4444" }} />
                    {faceDetected ? `Face detected · ${confidence}%` : "No face detected"}
                  </span>
                )}
              </div>

              {/* Live status text */}
              {statusText && !verified && !isLoading && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-bg-base/80 border border-border-subtle/50"
                  style={{ backdropFilter: "blur(8px)" }}>
                  <span className="text-[11px] font-mono text-accent-cyan">{statusText}</span>
                </div>
              )}

              {/* Verified overlay */}
              {verified && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-base/40" style={{ animation: "fadeIn 0.5s ease" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(34,197,94,0.15)", border: "2px solid #22C55E", boxShadow: "0 0 30px rgba(34,197,94,0.2)" }}>
                    <span className="material-symbols-outlined text-[32px] text-status-secure">check</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step instruction */}
            <div className="text-center mb-6">
              {verified ? (
                <div style={{ animation: "revealUp 0.5s ease forwards" }}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[20px] text-status-secure">check_circle</span>
                    <span className="text-status-secure font-semibold text-[15px] uppercase tracking-wider">Identity Verified</span>
                  </div>
                  <p className="text-text-secondary text-[13px]">All liveness challenges passed successfully</p>
                </div>
              ) : isLoading ? (
                <div>
                  <p className="text-text-primary font-semibold text-[16px] mb-1">Initializing...</p>
                  <p className="text-text-secondary text-[12px]">Loading face detection model and camera</p>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                    <span className="material-symbols-outlined text-[22px] text-accent-blue">{safeStep.icon}</span>
                  </div>
                  <p className="text-text-primary font-semibold text-[16px] mb-1">{safeStep.instruction}</p>
                  <p className="text-text-secondary text-[12px]">{safeStep.hint}</p>
                </div>
              )}
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-1 mb-6">
              {steps.map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    stepsDone[i]
                      ? "border-status-secure bg-status-secure/10"
                      : i === currentStep && !verified
                      ? "border-accent-blue bg-accent-blue/10"
                      : "border-border-subtle bg-transparent"
                  }`}>
                    {stepsDone[i] ? (
                      <span className="material-symbols-outlined text-[14px] text-status-secure">check</span>
                    ) : (
                      <span className={`font-mono text-[11px] font-bold ${i === currentStep ? "text-accent-blue" : "text-text-secondary/50"}`}>{i + 1}</span>
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-8 h-0.5 mx-0.5 rounded-full transition-all duration-500"
                      style={{ backgroundColor: stepsDone[i] ? "#22C55E" : "rgba(26,26,62,0.8)" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Continue button */}
            {verified && (
              <div style={{ animation: "revealUp 0.5s ease forwards" }}>
                <GradientButton onClick={() => router.push("/waiting-room")}>
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    ENTER WAITING ROOM
                  </span>
                </GradientButton>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-6 py-2.5 border-t border-border-subtle bg-bg-surface/30">
            <div className="flex items-center gap-4 text-[10px] text-text-secondary/60 font-mono">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-status-secure">lock</span>
                E2E ENCRYPTED
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-accent-cyan">memory</span>
                ON-DEVICE
              </span>
            </div>
            <span className="text-[10px] text-text-secondary/40 font-mono">
              STEP {verified ? steps.length : currentStep + 1}/{steps.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
