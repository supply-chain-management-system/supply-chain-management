import { useState, useEffect, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";

import { loginUser } from "../../../redux/authslice";

import { Eye, EyeOff, Mail, Lock, AlertCircle, Zap, ArrowRight } from "lucide-react";

import { useNavigate } from "react-router-dom";





function FloatingInput({ id, label, type = "text", value, onChange, onBlur, error, icon: Icon, rightSlot }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className={`
          relative flex items-center rounded-xl border transition-all duration-200
          ${error
            ? "border-red-500/70 bg-red-500/5"
            : focused
            ? "border-emerald-500/60 bg-white/[0.06] shadow-[0_0_0_3px_rgba(0,200,140,0.08)]"
            : "border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14]"
          }
        `}
      >
        {/* Leading icon */}
        <div className={`pl-4 transition-colors duration-200 ${focused ? "text-emerald-400" : "text-white/25"}`}>
          <Icon size={16} strokeWidth={2} />
        </div>

        {/* Input */}
        <div className="relative flex-1 px-3 py-[18px]">
          <label
            htmlFor={id}
            className={`
              absolute left-0 pointer-events-none font-medium tracking-wide transition-all duration-200 select-none
              ${lifted ? "text-[10px] top-2 text-emerald-400/80" : "text-sm top-1/2 -translate-y-1/2 text-white/30"}
            `}
          >
            {label}
          </label>
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); onBlur(); }}
            className="w-full bg-transparent text-sm text-white outline-none mt-3 placeholder-transparent"
            autoComplete={type === "password" ? "current-password" : "email"}
          />
        </div>

        {/* Trailing slot */}
        {rightSlot && <div className="pr-3">{rightSlot}</div>}
      </div>

      {/* Error message */}
      <div className={`overflow-hidden transition-all duration-200 ${error ? "max-h-8 mt-1.5" : "max-h-0"}`}>
        <p className="flex items-center gap-1.5 text-[11px] text-red-400 px-1">
          <AlertCircle size={10} strokeWidth={2.5} />
          {error}
        </p>
      </div>
    </div>
  );
}

function SocialButton({ onClick, children, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl
        border border-white/[0.08] bg-white/[0.03]
        hover:bg-white/[0.07] hover:border-white/[0.16]
        active:scale-[0.98] transition-all duration-150
        text-sm font-medium text-white/70 hover:text-white
      "
    >
      {icon}
      <span className="tracking-wide">{children}</span>
    </button>
  );
}

/* ── Google SVG ───── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);


/* ── Main Component ───────────────────────────────────────── */
export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [mounted, setMounted] = useState(false);

const googleInitialized = useRef(false);

useEffect(() => {
  setMounted(true);

  if (googleInitialized.current) return; 
  googleInitialized.current = true;

  const initGoogle = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        use_fedcm_for_prompt: false,
      });
    }
  };

  if (window.google) {
    initGoogle();
  } else {
    window.addEventListener("load", initGoogle);
    return () => window.removeEventListener("load", initGoogle);
  }
}, []);

const handleGoogleResponse = () => {
  const client = window.google.accounts.oauth2.initCodeClient({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope: "openid email profile",
    ux_mode: "popup",
    callback: async (response) => {
      if (response.error) {
        console.error("Google OAuth error:", response.error);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code: response.code }),
        });
        const data = await res.json();
        console.log("Google login response:", data);
        if (res.ok && data.user.company_verified) {
          const role = data.user.role;
          if (role === "admin") {
            navigate("/admindashboard");
          } else if (role === "business_manager") {
            navigate("/business-manager/dashboard");
          } else if (role === "warehouse_manager") {
            navigate("/ware_dashboard");
          } else if (role === "factory_manager") {
            navigate("/factorydash");
          } else {
            navigate("/");
          }
        } else {
          navigate("/company-onboarding");
        }
      } catch (err) {
        console.error("Google login failed", err);
      }
    },
  });
  client.requestCode();
};

  /* ── Validation ───────────────────────────────── */
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

  const fieldErrors = {
    email: touched.email ? validators.email(form.email) : null,
    password: touched.password ? validators.password(form.password) : null,
  };

  const isFormValid = !validators.email(form.email) && !validators.password(form.password);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isFormValid) return;
    dispatch(loginUser({ ...form, remember, navigate }));
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center px-4 py-10 relative overflow-hidden">


      {/* ── Atmospheric background ─────────────── */}
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,140,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,140,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />
      {/* Top-right glow */}
      <div
        className="absolute -top-40 -right-24 w-[520px] h-[520px] pointer-events-none rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,200,140,0.10) 0%, transparent 65%)" }}
      />
      {/* Bottom-left glow */}
      <div
        className="absolute -bottom-40 -left-24 w-[400px] h-[400px] pointer-events-none rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,100,255,0.06) 0%, transparent 65%)" }}
      />
      {/* Center ambient */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(0,200,140,0.04) 0%, transparent 70%)" }}
      />

      {/* ── Card ──────────────────────────────────── */}
      <div
        className={`
          relative w-full max-w-[420px] rounded-2xl px-8 py-10
          transition-all duration-700
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-8 right-8 h-px rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }}
        />

        {/* ── Logo ──────── */}
        <div className="flex items-center gap-3 mb-9">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #00c88c 0%, #00906a 100%)",
              boxShadow: "0 4px 14px rgba(0,200,140,0.35)",
            }}
          >
            <Zap size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <span
            className="font-black text-[20px] tracking-[0.12em] text-white"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            KORVEX
          </span>
        </div>

        {/* ── Headings ──────── */}
        <div className="mb-7">
          <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">Welcome back</h1>
          <p className="text-sm text-white/35 tracking-wide">Sign in to your workspace</p>
        </div>

        {/* ── API error banner ──── */}
        {error && (
          <div className="flex items-start gap-2.5 mb-5 px-3.5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={15} strokeWidth={2} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Form ──────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>

          <FloatingInput
            id="email"
            label="Work email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={fieldErrors.email}
            icon={Mail}
          />

          <FloatingInput
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={fieldErrors.password}
            icon={Lock}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
              >
                {showPassword ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
              </button>
            }
          />

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => setRemember((r) => !r)}
                className={`
                  w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-150
                  ${remember
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-white/20 bg-white/[0.04] group-hover:border-white/35"
                  }
                `}
              >
                {remember && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors select-none">
                Remember me
              </span>
            </label>
            
              <a href="/forgot-password"
              className="text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors tracking-wide"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              group relative w-full py-3.5 rounded-xl mt-1 overflow-hidden
              font-semibold text-sm text-white tracking-wide
              transition-all duration-200 active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
            style={{
              background: "linear-gradient(135deg, #00c88c 0%, #00a374 100%)",
              boxShadow: "0 4px 20px rgba(0,200,140,0.30), 0 1px 0 rgba(255,255,255,0.15) inset",
            }}
          >
            {/* Hover shimmer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)" }}
            />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3"/>
                    <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/[0.07]" />
          <span className="text-[11px] text-white/25 tracking-widest uppercase">or continue with</span>
          <div className="flex-1 h-px bg-white/[0.07]" />
        </div>

        <SocialButton
          onClick={handleGoogleResponse}
          icon={<GoogleIcon />}
        >
          Google
        </SocialButton>

        
        <p className="mt-7 text-center text-xs text-white/25 tracking-wide">
          Don't have an account?{" "}
          <a href="/signup" className="text-emerald-400/80 hover:text-emerald-400 font-medium transition-colors">
            Create one free
          </a>
        </p>
      </div>
    </div>
  );
}
