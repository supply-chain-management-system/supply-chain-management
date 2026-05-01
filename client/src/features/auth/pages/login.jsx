import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../../redux/authslice";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Zap } from "lucide-react";

export default function Login() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  /* ── Validation ─────────────────────────────────────────── */
  const validators = {
    email: (v) => {
      if (!v) return "Work email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address.";
      return null;
    },
    password: (v) => {
      if (!v) return "Password is required.";
      if (v.length < 8) return "Password must be at least 8 characters.";
      return null;
    },
  };

  const errors = {
    email: touched.email ? validators.email(form.email) : null,
    password: touched.password ? validators.password(form.password) : null,
  };

  const isFormValid = !validators.email(form.email) && !validators.password(form.password);

  const handleBlur = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isFormValid) return;
    dispatch(loginUser({ ...form, remember }));
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,140,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,140,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute -top-32 -right-20 w-96 h-96 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,200,140,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-2xl p-10"
        style={{
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#00c88c] to-[#00a06e]">
            <Zap size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white" style={{ fontFamily: "system-ui" }}>
            KORVEX
          </span>
          <span
            className="text-[10px] font-medium text-[#00c88c] uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: "rgba(0,200,140,0.12)", border: "1px solid rgba(0,200,140,0.25)" }}
          >
            Supply
          </span>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-1">Welcome back</h1>
        <p className="text-sm text-white/40 mb-7">Sign in to your supply chain dashboard</p>

        {/* Server error */}
        {error && (
          <div
            className="flex items-center gap-2.5 text-sm text-[#ff8a8a] rounded-lg px-4 py-2.5 mb-5"
            style={{ background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,90,90,0.3)" }}
          >
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-widest mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
              <input
                type="email"
                value={form.email}
                placeholder="you@company.com"
                autoComplete="email"
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={`w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all
                  ${errors.email
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-white/10 bg-white/5 focus:border-[#00c88c]/50 focus:bg-[#00c88c]/5"
                  } border`}
              />
            </div>
            {errors.email && (
              <p className="text-[11.5px] text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                className={`w-full pl-9 pr-10 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all
                  ${errors.password
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-white/10 bg-white/5 focus:border-[#00c88c]/50 focus:bg-[#00c88c]/5"
                  } border`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11.5px] text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.password}
              </p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-[13px] text-white/45 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-[#00c88c] w-3.5 h-3.5 cursor-pointer"
              />
              Remember me for 30 days
            </label>
            <a href="/forgot-password" className="text-[13px] text-[#00c88c]/80 hover:text-[#00c88c] transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-[15px] text-white tracking-wide transition-all
              bg-gradient-to-r from-[#00c88c] to-[#00a06e]
              hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <path d="M14 8a6 6 0 00-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        {/* SSO divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-[12px] text-white/25">or continue with</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        <button
          type="button"
          className="w-full py-2.5 rounded-lg text-[13.5px] text-white/55 hover:text-white/80 transition-all flex items-center justify-center gap-2"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" fill="rgba(255,255,255,0.4)" />
            <rect x="9" y="1" width="6" height="6" rx="1" fill="rgba(255,255,255,0.4)" />
            <rect x="1" y="9" width="6" height="6" rx="1" fill="rgba(255,255,255,0.4)" />
            <rect x="9" y="9" width="6" height="6" rx="1" fill="rgba(255,255,255,0.4)" />
          </svg>
          Sign in with SSO
        </button>

        <p className="text-center text-[12.5px] text-white/25 mt-5">
          New to Korvex?{" "}
          <a href="/request-access" className="text-[#00c88c]/70 hover:text-[#00c88c] transition-colors">
            Request access
          </a>
          {" · "}
          <a href="/support" className="text-[#00c88c]/70 hover:text-[#00c88c] transition-colors">
            Support
          </a>
        </p>
      </div>
    </div>
  );
}