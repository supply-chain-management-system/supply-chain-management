import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Camera, CheckCircle, AlertCircle, RefreshCw, User, ChevronRight, Shield } from "lucide-react";

const STEPS = ["Position", "Capture", "Confirm"];

export default function FaceRegistration() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [step, setStep] = useState(0); // 0=position, 1=capture, 2=confirm
  const [captured, setCaptured] = useState(null); // base64 snapshot
  const [countdown, setCountdown] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);

  // ── Start camera ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      // Simulate face detection after 1.5s of camera being on
      setTimeout(() => setFaceDetected(true), 1500);
    } catch {
      setCameraError("Camera access denied. Please allow camera permissions and refresh.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [startCamera]);

  // ── Countdown & capture ───────────────────────────────────────────────────
  const startCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      captureFrame();
      setCountdown(null);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0);
    ctx.restore();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStep(1);
  };

  // ── Retake ────────────────────────────────────────────────────────────────
  const retake = () => {
    setCaptured(null);
    setStep(0);
    setFaceDetected(false);
    setUploadError("");
    setTimeout(() => startCamera(), 100);
  };

  // ── Submit to backend ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setUploading(true);
    setUploadError("");
    try {
      // Convert base64 to blob and send
      const blob = await (await fetch(captured)).blob();
      const formData = new FormData();
      formData.append("face_image", blob, "face.jpg");

      // Replace with your real API endpoint
      // await api.post("/register-face", formData);

      // Simulate API call
      await new Promise((r) => setTimeout(r, 1800));

      setStep(2);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

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
            "linear-gradient(rgba(0,200,140,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,140,0.04) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(0,200,140,0.07) 0%,transparent 70%)" }}
      />

      <div className="relative w-full max-w-md">
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

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold transition-all duration-300"
                style={
                  i < step
                    ? { background: "#00c88c", color: "#fff" }
                    : i === step
                    ? { background: "rgba(0,200,140,0.15)", border: "1px solid #00c88c", color: "#00c88c" }
                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }
                }
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className="text-[11px] font-medium uppercase tracking-widest"
                style={{ color: i === step ? "#00c88c" : "rgba(255,255,255,0.25)" }}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px mx-1" style={{ background: "rgba(255,255,255,0.1)" }} />
              )}
            </div>
          ))}
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
          {/* ── STEP 0: Position & capture ── */}
          {step === 0 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} className="text-[#00c88c]" />
                <h1 className="text-xl font-semibold text-white">Register your face</h1>
              </div>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
                We'll use facial recognition for secure future logins.
              </p>

              {cameraError ? (
                <div
                  className="flex flex-col items-center justify-center rounded-xl py-12 mb-4"
                  style={{ border: "1px solid rgba(255,90,90,0.3)", background: "rgba(255,60,60,0.05)" }}
                >
                  <AlertCircle size={32} className="text-red-400 mb-3" />
                  <p className="text-sm text-center text-red-400 max-w-xs">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="mt-4 flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                  >
                    <RefreshCw size={14} /> Try again
                  </button>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden mb-4" style={{ aspectRatio: "4/3" }}>
                  {/* Video mirror */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />

                  {/* Oval face guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="transition-all duration-500"
                      style={{
                        width: 180,
                        height: 230,
                        borderRadius: "50%",
                        border: `2px solid ${faceDetected ? "#00c88c" : "rgba(255,255,255,0.3)"}`,
                        boxShadow: faceDetected ? "0 0 0 2000px rgba(0,0,0,0.45)" : "0 0 0 2000px rgba(0,0,0,0.5)",
                      }}
                    />
                  </div>

                  {/* Face detected badge */}
                  {faceDetected && (
                    <div
                      className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ background: "rgba(0,200,140,0.15)", border: "1px solid rgba(0,200,140,0.4)", color: "#00c88c" }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00c88c] animate-pulse" />
                      Face detected
                    </div>
                  )}

                  {/* Countdown overlay */}
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span
                        className="text-7xl font-bold text-white"
                        style={{ textShadow: "0 0 30px rgba(0,200,140,0.8)" }}
                        key={countdown}
                      >
                        {countdown === 0 ? "📸" : countdown}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />

              {/* Tips */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  "Look straight ahead",
                  "Good lighting",
                  "Remove glasses",
                ].map((tip) => (
                  <div
                    key={tip}
                    className="text-center text-[11px] py-2 px-1 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
                  >
                    {tip}
                  </div>
                ))}
              </div>

              <button
                onClick={startCountdown}
                disabled={!faceDetected || countdown !== null || !!cameraError}
                className="w-full py-2.5 rounded-lg font-semibold text-[15px] text-white tracking-wide transition-all flex items-center justify-center gap-2
                  bg-gradient-to-r from-[#00c88c] to-[#00a06e]
                  hover:opacity-90 active:scale-[0.99]
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Camera size={17} />
                {countdown !== null ? `Capturing in ${countdown}…` : "Take Photo"}
              </button>

              <p className="text-center text-[12px] mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>
                You can skip this and set up face ID later in Settings
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full text-center text-[12px] mt-1 underline transition-colors"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Skip for now
              </button>
            </>
          )}

          {/* ── STEP 1: Confirm photo ── */}
          {step === 1 && captured && (
            <>
              <h1 className="text-xl font-semibold text-white mb-1">Confirm your photo</h1>
              <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Make sure your face is clearly visible.
              </p>

              <div className="relative rounded-xl overflow-hidden mb-5" style={{ aspectRatio: "4/3" }}>
                <img src={captured} alt="Captured face" className="w-full h-full object-cover" />
                {/* Oval overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    style={{
                      width: 180,
                      height: 230,
                      borderRadius: "50%",
                      border: "2px solid rgba(0,200,140,0.5)",
                      boxShadow: "0 0 0 2000px rgba(0,0,0,0.35)",
                    }}
                  />
                </div>
              </div>

              {uploadError && (
                <div
                  className="flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 mb-4"
                  style={{ background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,90,90,0.3)", color: "#ff8a8a" }}
                >
                  <AlertCircle size={14} />
                  {uploadError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={retake}
                  disabled={uploading}
                  className="flex-1 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all
                    disabled:opacity-40"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
                >
                  <RefreshCw size={14} /> Retake
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all
                    bg-gradient-to-r from-[#00c88c] to-[#00a06e]
                    hover:opacity-90 active:scale-[0.99]
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                        <path d="M14 8a6 6 0 00-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>Use this photo <ChevronRight size={15} /></>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Success ── */}
          {step === 2 && (
            <div className="flex flex-col items-center text-center py-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                style={{ background: "rgba(0,200,140,0.12)", border: "1px solid rgba(0,200,140,0.3)" }}
              >
                <CheckCircle size={36} className="text-[#00c88c]" />
              </div>
              <h1 className="text-xl font-semibold text-white mb-2">Face registered!</h1>
              <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
                Your face ID has been saved. You can now use it to log in securely.
              </p>

              {/* Thumbnail */}
              {captured && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-8" style={{ border: "2px solid rgba(0,200,140,0.4)" }}>
                  <img src={captured} alt="Registered face" className="w-full h-full object-cover" />
                  <div
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "#00c88c" }}
                  >
                    <CheckCircle size={12} color="#fff" />
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full py-2.5 rounded-lg font-semibold text-[15px] text-white tracking-wide transition-all
                  bg-gradient-to-r from-[#00c88c] to-[#00a06e]
                  hover:opacity-90 active:scale-[0.99]"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Security note */}
        <p className="text-center text-[11px] mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>
          🔒 Face data is encrypted and never shared with third parties
        </p>
      </div>
    </div>
  );
}