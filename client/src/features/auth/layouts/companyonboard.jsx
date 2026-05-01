import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Users, BarChart3, Check, AlertCircle, Zap } from "lucide-react";
import api from "../../../api/api";
import { setCompany } from "../../../redux/authslice";

// ─── Step config ─────────────────────────────────────────────────────────────
const STEPS = ["Workspace", "Company", "Details", "Review"];

const INDUSTRIES = [
  "Manufacturing", "Retail & E-commerce", "Logistics & Transport",
  "Food & Beverage", "Pharmaceutical", "Automotive", "Electronics", "Other",
];

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–1000", "1000+"];

const COUNTRIES = [
  "India", "United States", "United Kingdom", "UAE", "Singapore",
  "Germany", "Australia", "Canada", "Other",
];

const MODES = [
  {
    value: "personal",
    label: "Personal",
    desc: "Solo tracking & management",
    icon: <path d="M8 7a3 3 0 100-6 3 3 0 000 6zM2 20c0-3.5 2.5-6 6-6s6 2.5 6 6" stroke="#00c88c" strokeWidth="1.5" strokeLinecap="round"/>,
    color: "rgba(0,200,140,0.12)",
  },
  {
    value: "team",
    label: "Team",
    desc: "Small to mid-size teams",
    icon: <><circle cx="5" cy="5" r="2.5" stroke="#378add" strokeWidth="1.5"/><circle cx="11" cy="5" r="2.5" stroke="#378add" strokeWidth="1.5"/><path d="M1 14c0-2.5 1.8-4 4-4M15 14c0-2.5-1.8-4-4-4M5 14c0-2.2 1.2-4 3-4s3 1.8 3 4" stroke="#378add" strokeWidth="1.5" strokeLinecap="round"/></>,
    color: "rgba(55,138,221,0.12)",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    desc: "Large org, full features",
    icon: <><rect x="2" y="8" width="4" height="6" rx="1" stroke="#d85a30" strokeWidth="1.5"/><rect x="6" y="4" width="4" height="10" rx="1" stroke="#d85a30" strokeWidth="1.5"/><rect x="10" y="2" width="4" height="12" rx="1" stroke="#d85a30" strokeWidth="1.5"/></>,
    color: "rgba(216,90,48,0.12)",
  },
];

// ─── Shared input styles ──────────────────────────────────────────────────────
const inputCls = (err) =>
  `w-full py-2.5 px-3 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all border ${
    err
      ? "bg-red-500/5 border-red-500/40"
      : "bg-white/5 border-white/10 focus:border-[#00c88c]/50 focus:bg-[#00c88c]/5"
  }`;

const selectCls =
  "w-full py-2.5 px-3 rounded-lg text-sm text-white outline-none transition-all border bg-white/5 border-white/10 focus:border-[#00c88c]/50 appearance-none cursor-pointer";

export default function CompanyOnboarding() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { user }  = useSelector((s) => s.auth);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // Step 0
    is_mode: "",
    // Step 1
    name: "",
    industry: "",
    company_size: "",
    website: "",
    // Step 2
    registration_number: "",
    address: "",
    country: "",
    phone: "",
  });

  const [touched, setTouched] = useState({});

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setError("");
  };

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

  // ── Per-step validation ───────────────────────────────────────────────────
  const stepValid = [
    form.is_mode !== "",
    form.name.trim() && form.industry && form.company_size,
    form.country !== "",
    true, // review step always valid
  ];

  const next = () => { if (stepValid[step]) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  // ── API submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        name:                form.name.trim(),
        industry:            form.industry,
        is_mode:             form.is_mode,
        company_size:        form.company_size,
        website:             form.website.trim() || null,
        registration_number: form.registration_number.trim() || null,
        address:             form.address.trim() || null,
        country:             form.country,
        phone:               form.phone.trim() || null,
      };

      const res = await api.post("/company/setup", payload);

      // Update Redux so layout knows company exists
      dispatch(setCompany(res.data.company));

      navigate("/business-manager/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "#0b0f1a" }}
    >
      {/* Grid bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,140,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,140,0.04) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute -top-24 -right-16 w-80 h-80 pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(0,200,140,0.1) 0%,transparent 70%)" }}
      />

      <div
        className="relative w-full max-w-lg rounded-2xl p-10"
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
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{
                  background: i < step ? "rgba(0,200,140,0.5)" : i === step ? "#00c88c" : "rgba(255,255,255,0.1)",
                }}
              />
              {i === STEPS.length - 1 && (
                <span className="text-[11px] whitespace-nowrap" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {step + 1} / {STEPS.length}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Mode ─────────────────────────────────────────────── */}
        {step === 0 && (
          <>
            <h1 className="text-2xl font-semibold text-white mb-2">
              Hi {user?.name?.split(" ")[0]} 👋 How will you use Korvex?
            </h1>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              This helps us configure the right workspace for you.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => set("is_mode", m.value)}
                  className="rounded-xl p-4 text-center transition-all"
                  style={{
                    background: form.is_mode === m.value ? "rgba(0,200,140,0.08)" : "rgba(255,255,255,0.04)",
                    border: form.is_mode === m.value
                      ? "1px solid rgba(0,200,140,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                    style={{ background: m.color }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">{m.icon}</svg>
                  </div>
                  <div className="text-[13px] font-medium text-white mb-1">{m.label}</div>
                  <div className="text-[11px] leading-tight" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {m.desc}
                  </div>
                </button>
              ))}
            </div>
            <NavButtons onNext={next} nextDisabled={!stepValid[0]} isFirst />
          </>
        )}

        {/* ── Step 1: Company basics ───────────────────────────────────── */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-semibold text-white mb-2">Tell us about your company</h1>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              Basic details to set up your supply chain workspace.
            </p>

            <Label text="Company name *" />
            <input
              className={inputCls(touched.name && !form.name.trim())}
              placeholder="e.g. Korvex Logistics Pvt Ltd"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => touch("name")}
            />
            {touched.name && !form.name.trim() && <ErrMsg text="Company name is required." />}

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <Label text="Industry *" />
                <select className={selectCls} value={form.industry}
                  onChange={(e) => set("industry", e.target.value)} onBlur={() => touch("industry")}
                  style={{ color: form.industry ? "#fff" : "rgba(255,255,255,0.25)" }}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <Label text="Company size *" />
                <select className={selectCls} value={form.company_size}
                  onChange={(e) => set("company_size", e.target.value)}
                  style={{ color: form.company_size ? "#fff" : "rgba(255,255,255,0.25)" }}>
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((s) => <option key={s}>{s} employees</option>)}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <Label text="Website" optional />
              <input
                className={inputCls(false)}
                placeholder="https://yourcompany.com"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
              />
            </div>

            <NavButtons onBack={back} onNext={next} nextDisabled={!stepValid[1]} />
          </>
        )}

        {/* ── Step 2: Registration details ─────────────────────────────── */}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-semibold text-white mb-2">Registration details</h1>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              Used for verification. You can update this later from settings.
            </p>

            <Label text="Registration number" optional />
            <input
              className={inputCls(false)}
              placeholder="e.g. U72200KL2023PTC123456"
              value={form.registration_number}
              onChange={(e) => set("registration_number", e.target.value)}
            />

            <div className="mt-3">
              <Label text="Registered address" optional />
              <input
                className={inputCls(false)}
                placeholder="Street, City, State, Country"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <Label text="Country *" />
                <select className={selectCls} value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  style={{ color: form.country ? "#fff" : "rgba(255,255,255,0.25)" }}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                {touched.country && !form.country && <ErrMsg text="Country is required." />}
              </div>
              <div>
                <Label text="Phone" optional />
                <input
                  className={inputCls(false)}
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>

            <NavButtons onBack={back} onNext={next} nextLabel="Review & Submit" nextDisabled={!stepValid[2]} />
          </>
        )}

        {/* ── Step 3: Review ───────────────────────────────────────────── */}
        {step === 3 && (
          <>
            <h1 className="text-2xl font-semibold text-white mb-2">Review your details</h1>
            <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
              Everything look correct? You can go back to edit anything.
            </p>

            {error && (
              <div className="flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 mb-4"
                style={{ background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,90,90,0.3)", color: "#ff8a8a" }}>
                <AlertCircle size={14} className="shrink-0" /> {error}
              </div>
            )}

            <div className="rounded-xl p-4 mb-4 space-y-2"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                ["Mode",        form.is_mode],
                ["Company",     form.name],
                ["Industry",    form.industry],
                ["Size",        form.company_size],
                ["Country",     form.country],
                ["Reg. No.",    form.registration_number || "—"],
                ["Address",     form.address || "—"],
                ["Website",     form.website || "—"],
                ["Phone",       form.phone || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center text-sm py-1.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>{k}</span>
                  <span className="text-white font-medium capitalize">{v}</span>
                </div>
              ))}
            </div>

            {/* Verification notice */}
            <div className="rounded-lg px-4 py-3 text-[12.5px] mb-5"
              style={{ background: "rgba(0,200,140,0.06)", border: "1px solid rgba(0,200,140,0.15)", color: "rgba(0,200,140,0.8)" }}>
              Your company will be reviewed by the Korvex team. You can start using the platform immediately while verification is in progress.
            </div>

            <NavButtons
              onBack={back}
              onNext={handleSubmit}
              nextLabel={loading ? "Creating workspace..." : "Create Workspace"}
              nextDisabled={loading}
              loading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Label({ text, optional }) {
  return (
    <label className="block text-[11px] font-medium uppercase tracking-widest mb-1.5"
      style={{ color: "rgba(255,255,255,0.5)" }}>
      {text}{" "}
      {optional && <span className="normal-case tracking-normal text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>(optional)</span>}
    </label>
  );
}

function ErrMsg({ text }) {
  return (
    <p className="text-[11.5px] text-red-400 mt-1 flex items-center gap-1">
      <AlertCircle size={11} /> {text}
    </p>
  );
}

function NavButtons({ onBack, onNext, nextLabel = "Continue", nextDisabled, isFirst, loading }) {
  return (
    <div className={`flex gap-3 mt-6 ${isFirst ? "" : ""}`}>
      {!isFirst && (
        <button type="button" onClick={onBack}
          className="flex-1 py-2.5 rounded-lg text-sm transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
          Back
        </button>
      )}
      <button type="button" onClick={onNext} disabled={nextDisabled}
        className={`py-2.5 rounded-lg font-semibold text-[14px] text-white transition-all
          bg-gradient-to-r from-[#00c88c] to-[#00a06e]
          hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed
          ${isFirst ? "w-full" : "flex-[2]"}`}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
              <path d="M14 8a6 6 0 00-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {nextLabel}
          </span>
        ) : nextLabel}
      </button>
    </div>
  );
}