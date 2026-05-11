import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MailCheck,
} from "lucide-react";
import api from "../../../api/api";
// ─── Password strength helper ────────────────────────────────────────────────
function getStrength(password) {
  if (!password) return { score: 0, label: "", labelColor: "", barColor: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map = [
    { label: "",       labelColor: "",                  barColor: "" },
    { label: "Weak",   labelColor: "text-red-500",      barColor: "bg-red-500" },
    { label: "Fair",   labelColor: "text-amber-500",    barColor: "bg-amber-400" },
    { label: "Good",   labelColor: "text-lime-600",     barColor: "bg-lime-500" },
    { label: "Strong", labelColor: "text-emerald-600",  barColor: "bg-emerald-500" },
  ];

  return { score, ...map[score] };
}

// ─── Field wrapper ───────────────────────────────────────────────────────────
function Field({ label, id, error, Icon, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon
          size={15}
          className="absolute left-3 text-slate-400 pointer-events-none z-10"
        />
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[12px] text-red-600 mt-0.5">
          <AlertCircle size={12} className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Password input with show/hide ───────────────────────────────────────────
function PasswordInput({ id, name, placeholder, value, onChange, hasError, autoComplete }) {
  const [show, setShow] = useState(false);
  const base =
    "w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50 " +
    "placeholder-slate-300 text-slate-800 outline-none transition-all duration-150 " +
    "focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ";
  const borderClass = hasError
    ? "border-red-400 ring-2 ring-red-400/10"
    : "border-slate-200 hover:border-slate-300";

  return (
    <>
      <input
        id={id}
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={base + borderClass}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function InviteRegisterPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim())
      errors.name = "Full name is required";
    if (!form.email.trim())
      errors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Enter a valid email address";
    if (!form.password)
      errors.password = "Password is required";
    else if (form.password.length < 8)
      errors.password = "Must be at least 8 characters";
    if (!form.confirmPassword)
      errors.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/company/auth/invite/register/${token}/`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Registration failed");
      }
      navigate(`/verify-email`);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 &&
    form.password !== form.confirmPassword &&
    !fieldErrors.confirmPassword;

  const inputBase =
    "w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50 " +
    "placeholder-slate-300 text-slate-800 outline-none transition-all duration-150 " +
    "focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-[430px] rounded-2xl overflow-hidden shadow-xl shadow-slate-200/80 border border-slate-200/60 bg-white">

        {/* ── Header ── */}
        <div className="bg-[#0c447c] px-8 pt-8 pb-7">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-5">
            <MailCheck size={12} className="text-blue-300" />
            <span className="text-[11px] font-semibold tracking-widest text-blue-300 uppercase">
              Invitation
            </span>
          </div>
          <h1 className="text-2xl font-light text-white leading-snug mb-1.5">
            Complete your{" "}
            <span className="font-semibold">registration</span>
          </h1>
          <p className="text-sm text-blue-300/80 font-light">
            You've been invited to join the company workspace
          </p>
        </div>

        {/* ── Body ── */}
        <div className="px-8 py-7">

          {/* API error banner */}
          {apiError && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 leading-snug">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* Full name */}
            <Field label="Full name" id="name" error={fieldErrors.name} Icon={User}>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Jane Smith"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                className={
                  inputBase +
                  (fieldErrors.name
                    ? "border-red-400 ring-2 ring-red-400/10"
                    : "border-slate-200 hover:border-slate-300")
                }
              />
            </Field>

            {/* Email */}
            <Field label="Email address" id="email" error={fieldErrors.email} Icon={Mail}>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="jane@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                className={
                  inputBase +
                  (fieldErrors.email
                    ? "border-red-400 ring-2 ring-red-400/10"
                    : "border-slate-200 hover:border-slate-300")
                }
              />
            </Field>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none z-10" />
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  hasError={!!fieldErrors.password}
                  autoComplete="new-password"
                />
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="mt-1.5">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.barColor : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[11.5px] font-semibold ${strength.labelColor}`}>
                    {strength.label}
                  </span>
                </div>
              )}

              {fieldErrors.password && (
                <p className="flex items-center gap-1 text-[12px] text-red-600 mt-0.5">
                  <AlertCircle size={12} className="flex-shrink-0" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="confirmPassword"
                className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase"
              >
                Confirm password
              </label>
              <div className="relative flex items-center">
                <ShieldCheck size={15} className="absolute left-3 text-slate-400 pointer-events-none z-10" />
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  hasError={!!fieldErrors.confirmPassword}
                  autoComplete="new-password"
                />
              </div>

              {/* Live match feedback */}
              {passwordsMatch && (
                <p className="flex items-center gap-1 text-[12px] text-emerald-600 mt-0.5">
                  <CheckCircle2 size={12} className="flex-shrink-0" />
                  Passwords match
                </p>
              )}
              {passwordsMismatch && (
                <p className="flex items-center gap-1 text-[12px] text-red-500 mt-0.5">
                  <XCircle size={12} className="flex-shrink-0" />
                  Passwords do not match
                </p>
              )}
              {fieldErrors.confirmPassword && (
                <p className="flex items-center gap-1 text-[12px] text-red-600 mt-0.5">
                  <AlertCircle size={12} className="flex-shrink-0" />
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-6
                bg-[#185fa5] hover:bg-[#0c447c] active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed
                text-white text-sm font-semibold rounded-xl
                transition-all duration-150 shadow-sm shadow-blue-900/20"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Register &amp; continue
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 mt-5 pt-5 border-t border-slate-100">
            <ShieldCheck size={13} className="text-slate-400" />
            <span className="text-xs text-slate-400">Your data is encrypted and secure</span>
          </div>
        </div>

      </div>
    </div>
  );
}