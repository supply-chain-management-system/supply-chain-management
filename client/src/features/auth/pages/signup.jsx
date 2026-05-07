import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Zap, Check, X } from "lucide-react";
import api from "../../../api/api";

// ─── Password strength checker ───────────────────────────────────────────────
const getPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
};

const strengthConfig = [
  { label: "Weak",   color: "bg-red-500" },
  { label: "Weak",   color: "bg-red-500" },
  { label: "Fair",   color: "bg-amber-400" },
  { label: "Good",   color: "bg-yellow-300" },
  { label: "Strong", color: "bg-emerald-400" },
  { label: "Strong", color: "bg-emerald-400" },
];

// ─── Validators ──────────────────────────────────────────────────────────────
const validators = {
  name: (v) => {
    if (!v.trim()) return "Full name is required.";
    if (v.trim().length < 2) return "Name must be at least 2 characters.";
    if (!/^[a-zA-Z\s'-]+$/.test(v)) return "Name contains invalid characters.";
    return null;
  },
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
  confirmPassword: (v, password) => {
    if (!v) return "Please confirm your password.";
    if (v !== password) return "Passwords do not match.";
    return null;
  },
};

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirm, setShowConfirm]             = useState(false);
  const [touched, setTouched]                     = useState({});
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState("");
  const [success, setSuccess]                     = useState("");
  const [agreedToTerms, setAgreedToTerms]         = useState(false);

  const { checks: pwChecks, score: pwScore } = getPasswordStrength(form.password);
  const strength = strengthConfig[pwScore] || strengthConfig[0];

  const errors = {
    name:            touched.name            ? validators.name(form.name)                               : null,
    email:           touched.email           ? validators.email(form.email)                             : null,
    password:        touched.password        ? validators.password(form.password)                       : null,
    confirmPassword: touched.confirmPassword ? validators.confirmPassword(form.confirmPassword, form.password) : null,
  };

  const isFormValid =
    !validators.name(form.name) &&
    !validators.email(form.email) &&
    !validators.password(form.password) &&
    !validators.confirmPassword(form.confirmPassword, form.password) &&
    agreedToTerms;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleBlur = (field) => setTouched((t) => ({ ...t, [field]: true }));

  // ── API call unchanged ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (!isFormValid) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setSuccess(res.data.message || "Account created successfully!");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setTouched({});
      localStorage.setItem("email", form.email);

      setTimeout(() => navigate("/verify-email"), 2000);

    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "#0b0f1a" }}
    >
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
        className="absolute -bottom-32 -left-20 w-96 h-96 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,200,140,0.10) 0%, transparent 70%)" }}
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
          <span className="font-bold text-xl tracking-tight text-white">KORVEX</span>
          <span
            className="text-[10px] font-medium text-[#00c88c] uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: "rgba(0,200,140,0.12)", border: "1px solid rgba(0,200,140,0.25)" }}
          >
            Supply
          </span>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-1">Create your account</h1>
        <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.4)" }}>
          Join Korvex to manage your supply chain
        </p>

        {/* Global error */}
        {error && (
          <div
            className="flex items-center gap-2.5 text-sm rounded-lg px-4 py-2.5 mb-5"
            style={{
              background: "rgba(255,60,60,0.1)",
              border: "1px solid rgba(255,90,90,0.3)",
              color: "#ff8a8a",
            }}
          >
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Global success */}
        {success && (
          <div
            className="flex items-center gap-2.5 text-sm rounded-lg px-4 py-2.5 mb-5"
            style={{
              background: "rgba(0,200,140,0.1)",
              border: "1px solid rgba(0,200,140,0.3)",
              color: "#00c88c",
            }}
          >
            <CheckCircle size={15} className="shrink-0" />
            {success} Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Full Name */}
          <Field
            label="Full Name"
            icon={<User size={15} />}
            error={errors.name}
          >
            <input
              type="text"
              name="name"
              value={form.name}
              placeholder="Shadirvan Kumar"
              autoComplete="name"
              onChange={handleChange}
              onBlur={() => handleBlur("name")}
              className={inputClass(errors.name)}
              style={{ paddingLeft: "2.25rem", paddingRight: "1rem" }}
            />
          </Field>

          {/* Email */}
          <Field
            label="Work Email"
            icon={<Mail size={15} />}
            error={errors.email}
          >
            <input
              type="email"
              name="email"
              value={form.email}
              placeholder="you@company.com"
              autoComplete="email"
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              className={inputClass(errors.email)}
              style={{ paddingLeft: "2.25rem", paddingRight: "1rem" }}
            />
          </Field>

          {/* Password */}
          <Field
            label="Password"
            icon={<Lock size={15} />}
            error={errors.password}
            hint={
              form.password && (
                <div className="mt-2 space-y-2">
                  {/* Strength bars */}
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= pwScore ? strength.color : "bg-white/10"
                        }`}
                      />
                    ))}
                    <span className="text-[11px] ml-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {form.password ? strength.label : ""}
                    </span>
                  </div>

                  {/* Requirement checklist */}
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { key: "length",    label: "8+ characters" },
                      { key: "uppercase", label: "Uppercase letter" },
                      { key: "lowercase", label: "Lowercase letter" },
                      { key: "number",    label: "Number" },
                      { key: "special",   label: "Special character" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-1.5">
                        {pwChecks[key]
                          ? <Check size={11} className="text-emerald-400 shrink-0" />
                          : <X size={11} className="shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
                        }
                        <span
                          className="text-[11px]"
                          style={{ color: pwChecks[key] ? "rgba(52,211,153,0.9)" : "rgba(255,255,255,0.3)" }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          >
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              placeholder="Create a strong password"
              autoComplete="new-password"
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
              className={inputClass(errors.password)}
              style={{ paddingLeft: "2.25rem", paddingRight: "2.5rem" }}
            />
            <EyeToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          </Field>

          {/* Confirm Password */}
          <Field
            label="Confirm Password"
            icon={<Lock size={15} />}
            error={errors.confirmPassword}
          >
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              onChange={handleChange}
              onBlur={() => handleBlur("confirmPassword")}
              className={inputClass(errors.confirmPassword)}
              style={{ paddingLeft: "2.25rem", paddingRight: "2.5rem" }}
            />
            <EyeToggle show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
          </Field>

          {/* Terms */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 accent-[#00c88c] w-3.5 h-3.5 shrink-0 cursor-pointer"
            />
            <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              I agree to the{" "}
              <a href="/terms" className="text-[#00c88c]/80 hover:text-[#00c88c] transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-[#00c88c]/80 hover:text-[#00c88c] transition-colors">
                Privacy Policy
              </a>
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-2.5 rounded-lg font-semibold text-[15px] text-white tracking-wide transition-all
              bg-gradient-to-r from-[#00c88c] to-[#00a06e]
              hover:opacity-90 active:scale-[0.99]
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <path d="M14 8a6 6 0 00-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Creating account...
              </span>
            ) : "Create Account"}
          </button>
        </form>

        <p className="text-center text-[13px] mt-6" style={{ color: "rgba(255,255,255,0.3)" }}>
          Already have an account?{" "}
          <Link to="/login" className="text-[#00c88c]/80 hover:text-[#00c88c] transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function Field({ label, icon, error, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] font-medium uppercase tracking-widest mb-1.5"
        style={{ color: "rgba(255,255,255,0.5)" }}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "rgba(255,255,255,0.3)" }}>
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <p className="text-[11.5px] text-red-400 mt-1.5 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
      {!error && hint}
    </div>
  );
}

function EyeToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
      style={{ color: "rgba(255,255,255,0.3)" }}
      onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
      onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );
}

function inputClass(hasError) {
  return [
    "w-full py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all border",
    hasError
      ? "bg-red-500/5 border-red-500/50"
      : "bg-white/5 border-white/10 focus:border-[#00c88c]/50 focus:bg-[#00c88c]/5",
  ].join(" ");
}