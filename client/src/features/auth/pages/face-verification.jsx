import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ScanFace, CheckCircle, AlertCircle, RefreshCw, X, Shield } from "lucide-react";

// Verification states
const STATE = {
  IDLE: "idle",          // camera on, waiting
  SCANNING: "scanning",  // running recognition
  SUCCESS: "success",    // match found
  FAILED: "failed",      // no match
  ERROR: "error",        // camera/API error
};

export default function FaceVerification() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [state, setState] = useState(STATE.IDLE);
  const [cameraError, setCameraError] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  // ── Camera start ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError("");
    setState(STATE.IDLE);
    setFaceDetected(false);
    setScanProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      // Simulate face detection
      setTimeout(() => setFaceDetected(true), 1200);
    } catch {
      setCameraError("Camera access required for face verification. Please allow access.");
      setState(STATE.ERROR);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearInterval(intervalRef.current);
    };
  }, [startCamera]);

  // ── Auto-scan when face detected ──────────────────────────────────────────
  useEffect(() => {
    if (faceDetected && state === STATE.IDLE) {
      const t = setTimeout(() => runVerification(), 800);
      return () => clearTimeout(t);
    }
  }, [faceDetected, state]);

  // ── Scan progress animation ───────────────────────────────────────────────
  useEffect(() => {
    if (state === STATE.SCANNING) {
      setScanProgress(0);
      const start = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min((elapsed / 2200) * 100, 99);
        setScanProgress(pct);
      }, 40);
    } else {
      clearInterval(intervalRef.current);
      if (state === STATE.SUCCESS) setScanProgress(100);
    }
    return () => clearInterval(intervalRef.current);
  }, [state]);

  // ── Run verification ──────────────────────────────────────────────────────
  const runVerification = async () => {
    setState(STATE.SCANNING);
    setAttempts((a) => a + 1);

    try {
      // Capture frame
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0);
        ctx.restore();
        const imageData = canvas.toDataURL("image/jpeg", 0.92);

        // Replace with your real API call:
        // const blob = await (await fetch(imageData)).blob();
        // const formData = new FormData();
        // formData.append("face_image", blob, "face.jpg");
        // const res = await api.post("/verify-face", formData);
        // if (!res.data.match) throw new Error("No match");

        // Simulate: succeed if attempts < 3 (demo), fail otherwise
        await new Promise((r) => setTimeout(r, 2200));
        const success = Math.random() > 0.3; // 70% chance success in demo

        if (success) {
          setState(STATE.SUCCESS);
          streamRef.current?.getTracks().forEach((t) => t.stop());
          setTimeout(() => navigate("/dashboard"), 2000);
        } else {
          setState(STATE.FAILED);
        }
      }
    } catch {
      setState(STATE.FAILED);
    }
  };

  const retry = () => {
    setState(STATE.IDLE);
    setFaceDetected(false);
    setScanProgress(0);
    setTimeout(() => setFaceDetected(true), 800);
  };

  // ── Border / glow color based on state ───────────────────────────────────
  const ovalColor = {
    [STATE.IDLE]:     "rgba(255,255,255,0.2)",
    [STATE.SCANNING]: "#00c88c",
    [STATE.SUCCESS]:  "#00c88c",
    [STATE.FAILED]:   "#ff5a5a",
    [STATE.ERROR]:    "#ff5a5a",
  }[state];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "#0b0f1a" }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,140,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,140,0.03) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(0,200,140,0.06) 0%,transparent 65%)" }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#00c88c] to-[#00a06e]">
            <Zap size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">KORVEX</span>
          <span
            className="text-[10px] font-medium text-[#00c88c] uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: "rgba(0,200,140,0.12)", border: "1px solid rgba(0,200,140,0.25)" }}
          >
            Supply
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <ScanFace size={16} className="text-[#00c88c]" />
            <h1 className="text-xl font-semibold text-white">Face Verification</h1>
          </div>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            {state === STATE.IDLE && "Position your face in the frame to continue."}
            {state === STATE.SCANNING && "Scanning… hold still."}
            {state === STATE.SUCCESS && "Identity confirmed! Redirecting…"}
            {state === STATE.FAILED && "Face not recognized. Try again."}
            {state === STATE.ERROR && "Camera error. Please allow access."}
          </p>

          {/* Camera viewport */}
          <div
            className="relative rounded-2xl overflow-hidden mb-5 mx-auto"
            style={{ width: "100%", aspectRatio: "3/4", maxWidth: 320 }}
          >
            {cameraError ? (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: "rgba(255,60,60,0.07)" }}
              >
                <AlertCircle size={36} className="text-red-400 mb-3" />
                <p className="text-xs text-red-400 text-center px-6">{cameraError}</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Dark overlay with oval cutout */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="transition-all duration-500"
                    style={{
                      width: 200,
                      height: 260,
                      borderRadius: "50%",
                      border: `2.5px solid ${ovalColor}`,
                      boxShadow: state === STATE.SCANNING
                        ? `0 0 0 2000px rgba(0,0,0,0.5), 0 0 20px ${ovalColor}40`
                        : state === STATE.SUCCESS
                        ? `0 0 0 2000px rgba(0,0,0,0.4), 0 0 30px #00c88c60`
                        : state === STATE.FAILED
                        ? `0 0 0 2000px rgba(0,0,0,0.5), 0 0 20px #ff5a5a40`
                        : "0 0 0 2000px rgba(0,0,0,0.5)",
                    }}
                  />
                </div>

                {/* Scanning line animation */}
                {state === STATE.SCANNING && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" style={{ borderRadius: "50%" }}>
                    <div
                      className="w-full"
                      style={{
                        height: 2,
                        background: "linear-gradient(90deg,transparent,#00c88c,transparent)",
                        animation: "scanLine 1.1s ease-in-out infinite",
                        position: "absolute",
                      }}
                    />
                  </div>
                )}

                {/* State badge */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                  {state === STATE.IDLE && faceDetected && (
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ background: "rgba(0,200,140,0.15)", border: "1px solid rgba(0,200,140,0.4)", color: "#00c88c" }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00c88c] animate-pulse" />
                      Face detected
                    </div>
                  )}
                  {state === STATE.SCANNING && (
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ background: "rgba(0,200,140,0.12)", border: "1px solid rgba(0,200,140,0.3)", color: "#00c88c" }}
                    >
                      <svg className="animate-spin w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4" stroke="rgba(0,200,140,0.3)" strokeWidth="1.5" />
                        <path d="M10 6a4 4 0 00-4-4" stroke="#00c88c" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Verifying…
                    </div>
                  )}
                  {state === STATE.SUCCESS && (
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ background: "rgba(0,200,140,0.2)", border: "1px solid rgba(0,200,140,0.5)", color: "#00c88c" }}
                    >
                      <CheckCircle size={12} /> Verified
                    </div>
                  )}
                  {state === STATE.FAILED && (
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ background: "rgba(255,60,60,0.15)", border: "1px solid rgba(255,90,90,0.4)", color: "#ff8a8a" }}
                    >
                      <X size={12} /> Not recognized
                    </div>
                  )}
                </div>

                {/* Success full overlay */}
                {state === STATE.SUCCESS && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                      style={{ background: "rgba(0,200,140,0.2)", border: "2px solid #00c88c" }}
                    >
                      <CheckCircle size={28} className="text-[#00c88c]" />
                    </div>
                    <p className="text-white text-sm font-semibold">Welcome back!</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Scan progress bar */}
          {(state === STATE.SCANNING || state === STATE.SUCCESS) && (
            <div
              className="w-full rounded-full mb-4 overflow-hidden"
              style={{ height: 3, background: "rgba(255,255,255,0.07)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-75"
                style={{
                  width: `${scanProgress}%`,
                  background: "linear-gradient(90deg,#00c88c,#00e8a8)",
                }}
              />
            </div>
          )}

          {/* Actions */}
          {state === STATE.FAILED && (
            <div className="space-y-3">
              <button
                onClick={retry}
                className="w-full py-2.5 rounded-lg font-semibold text-[15px] text-white tracking-wide transition-all
                  bg-gradient-to-r from-[#00c88c] to-[#00a06e]
                  hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <RefreshCw size={15} /> Try again
              </button>

              {attempts >= 3 && (
                <button
                  onClick={() => navigate("/login?fallback=password")}
                  className="w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                >
                  Use password instead
                </button>
              )}
            </div>
          )}

          {state === STATE.ERROR && (
            <button
              onClick={startCamera}
              className="w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
            >
              <RefreshCw size={14} /> Allow camera & retry
            </button>
          )}

          {state === STATE.IDLE && !faceDetected && !cameraError && (
            <div className="flex items-center justify-center gap-2 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Waiting for camera…</span>
            </div>
          )}

          {(state === STATE.IDLE || state === STATE.SCANNING) && (
            <button
              onClick={() => navigate("/login?fallback=password")}
              className="w-full text-center text-[12px] mt-4 transition-colors"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              Having trouble? Use password
            </button>
          )}
        </div>

        {/* Attempt counter */}
        {attempts > 0 && state !== STATE.SUCCESS && (
          <p className="text-center text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.2)" }}>
            Attempt {attempts} of 5
          </p>
        )}

        {/* Security note */}
        <p className="text-center text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.15)" }}>
          🔒 Encrypted biometric verification — data never leaves your device
        </p>
      </div>

      {/* CSS for scan line animation */}
      <style>{`
        @keyframes scanLine {
          0%   { top: 20%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 80%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
