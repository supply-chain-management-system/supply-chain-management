import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../api/api";

export default function OTPVerification() {
  const [email, setEmail] = useState("");
  const [editEmail, setEditEmail] = useState(""); // separate draft state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [timer, setTimer] = useState(0);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Load email from localStorage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
      setEditEmail(storedEmail);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // ── Email editing ──────────────────────────────────────────
  const startEditing = () => {
    setEditEmail(email);
    setIsEditingEmail(true);
    setMessage({ text: "", type: "" });
  };

  const cancelEditing = () => {
    setEditEmail(email);
    setIsEditingEmail(false);
  };

  const saveEmailChange = () => {
    const trimmed = editEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" });
      return;
    }
    localStorage.setItem("email", trimmed);
    setEmail(trimmed);
    setIsEditingEmail(false);
    // Reset OTP fields and timer so user starts fresh
    setOtp(["", "", "", "", "", ""]);
    setTimer(0);
    setMessage({ text: "Email updated. Please request a new OTP.", type: "info" });
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  // ── OTP box logic ──────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    // Allow only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    const nextEmpty = pasted.length < 6 ? pasted.length : 5;
    inputRefs.current[nextEmpty]?.focus();
  };

  const otpString = otp.join("");
  const isOtpComplete = otpString.length === 6;

  // ── API calls ──────────────────────────────────────────────
  const verifyOTP = async () => {
    if (!isOtpComplete) return;
    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      const response = await api.post("/verify-otp", { email, otp: otpString });

      setVerified(true);
      setMessage({
        text: response.data.message || "OTP Verified Successfully",
        type: "success",
      });
      localStorage.removeItem("email");

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage({
        text: error.response?.data?.detail || "Verification failed. Please try again.",
        type: "error",
      });
      // Clear OTP on failure so user can retry cleanly
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (timer > 0) return;
    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      const response = await api.post("/resend-otp", { email });

      setMessage({
        text: response.data.message || "New OTP sent to your email.",
        type: "success",
      });
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (error) {
      setMessage({
        text: error.response?.data?.detail || "Failed to resend OTP. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format timer as mm:ss when >= 60
  const formatTimer = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : `${s}s`);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400" />

          <div className="p-8 sm:p-10">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 mb-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify your email</h1>
              <p className="text-slate-500 text-sm mt-1.5">
                Enter the 6-digit code we sent to your inbox
              </p>
            </div>

            {/* ── Email section ── */}
            <div className="mb-7">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Email Address
              </label>

              {isEditingEmail ? (
                <div className="space-y-2">
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEmailChange(); if (e.key === "Escape") cancelEditing(); }}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-400 ring-4 ring-blue-50 outline-none text-slate-800 text-sm font-medium transition-all"
                    placeholder="you@example.com"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEmailChange}
                      className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
                    >
                      Save & Update
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex-1 py-2 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span className="flex-1 text-sm text-slate-600 font-medium truncate">{email}</span>
                  <button
                    onClick={startEditing}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all shrink-0"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* ── OTP boxes ── */}
            <div className="mb-8">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Verification Code
              </label>
              <div className="flex gap-2 sm:gap-3 justify-between" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={loading || verified}
                    className={`
                      w-full aspect-square max-w-[52px] text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                      ${digit ? "border-slate-900 bg-slate-900 text-white shadow-md scale-105" : "border-slate-200 bg-white text-slate-900"}
                      ${verified ? "border-emerald-500 bg-emerald-500 text-white" : ""}
                      focus:border-blue-500 focus:ring-4 focus:ring-blue-50
                      disabled:cursor-not-allowed
                    `}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2 text-right">
                {otp.filter(Boolean).length}/6 digits entered
              </p>
            </div>

            {/* ── Status message ── */}
            {message.text && (
              <div
                className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2.5 ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : message.type === "info"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <span className="shrink-0 mt-0.5">
                  {message.type === "success" ? "✅" : message.type === "info" ? "ℹ️" : "❌"}
                </span>
                {message.text}
              </div>
            )}

            {/* ── Action buttons ── */}
            <div className="space-y-3">
              <button
                onClick={verifyOTP}
                disabled={loading || !isOtpComplete || verified || isEditingEmail}
                className="
                  w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]
                  bg-slate-900 text-white hover:bg-slate-700
                  disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
                  shadow-lg shadow-slate-200
                "
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </span>
                ) : verified ? (
                  "✓ Verified — Redirecting..."
                ) : (
                  "Verify & Continue →"
                )}
              </button>

              <button
                onClick={resendOTP}
                disabled={loading || timer > 0 || verified || isEditingEmail}
                className="
                  w-full py-3.5 rounded-xl border-2 font-semibold text-sm transition-all active:scale-[0.98]
                  border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50
                  disabled:border-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed
                "
              >
                {timer > 0
                  ? `Resend available in ${formatTimer(timer)}`
                  : "Resend Code"}
              </button>
            </div>

            {/* ── Divider ── */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-widest font-medium">or</span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-slate-600">
                Already verified?{" "}
                <Link to="/login" className="font-bold text-slate-900 hover:underline underline-offset-2">
                  Log in
                </Link>
              </p>
              <p className="text-xs text-slate-400">
                Wrong account?{" "}
                <Link to="/signup" className="underline hover:text-slate-600 transition-colors">
                  Sign up again
                </Link>
              </p>
            </div>

          </div>
        </div>

       
        <p className="text-center text-xs text-slate-400 mt-4">
          Didn't receive an email? Check your spam folder.
        </p>
      </div>
    </div>
  );
}