import { useState } from "react";
import { useNavigate } from "react-router-dom";
const NAV_LINKS = ["Solutions", "Platform", "Industries", "Pricing", "Resources"];

const STATS = [
  { value: "99.8%", label: "Uptime Reliability" },
  { value: "3.2x", label: "Faster Fulfillment" },
  { value: "40%", label: "Cost Reduction" },
  { value: "150+", label: "Countries Supported" },
];

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <rect x="3" y="3" width="22" height="22" rx="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M9 14h10M14 9v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Inventory Intelligence",
    desc: "Real-time stock tracking across all warehouses with predictive restocking alerts and automated reorder workflows.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M14 8v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Order Lifecycle Management",
    desc: "End-to-end order visibility from purchase to delivery. Automate approvals, track exceptions, and resolve delays instantly.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <path d="M4 20l7-7 4 4 9-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Demand Forecasting",
    desc: "AI-powered forecasting engine that analyzes historical trends, seasonality, and market signals to prevent over/under-stocking.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <path d="M5 14c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M5 14h6l2 3 2-6 2 3h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Supplier Network",
    desc: "Centralized supplier portal for RFQ management, contract tracking, performance scoring, and compliance monitoring.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <path d="M4 8h20M4 14h14M4 20h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Logistics & Routing",
    desc: "Optimize shipment routes across carriers, automate freight booking, and reduce last-mile delivery costs with smart routing.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <rect x="4" y="4" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="16" y="4" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="4" y="16" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="16" y="16" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    title: "Analytics Dashboard",
    desc: "Executive-grade reporting with drill-down capabilities. KPIs, SLAs, and financial metrics — all in one control center.",
  },
];

const INDUSTRIES = [
  { name: "Manufacturing", icon: "🏭" },
  { name: "Retail & E-Commerce", icon: "🛒" },
  { name: "Pharmaceuticals", icon: "💊" },
  { name: "Food & Beverage", icon: "🥤" },
  { name: "Automotive", icon: "🚗" },
  { name: "Aerospace", icon: "✈️" },
];

const TESTIMONIALS = [
  {
    quote: "Korvex cut our procurement cycle from 12 days to under 3. The supplier visibility alone justified the investment in month one.",
    name: "Priya Nair",
    role: "VP Supply Chain, Neltex Industries",
    avatar: "PN",
  },
  {
    quote: "We manage 6 distribution centers across Southeast Asia. Korvex gave us the single-pane-of-glass we'd been looking for for years.",
    name: "James Whitfield",
    role: "COO, Meridian Logistics",
    avatar: "JW",
  },
  {
    quote: "The forecasting engine reduced our overstock by 38% in the first quarter. The ROI was immediate and measurable.",
    name: "Aisha Kamara",
    role: "Head of Operations, VivaTrade",
    avatar: "AK",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "$299",
    period: "/mo",
    desc: "For growing businesses getting supply chain visibility.",
    features: ["Up to 3 warehouses", "500 SKUs", "Order management", "Basic reporting", "Email support"],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Business",
    price: "$899",
    period: "/mo",
    desc: "Full-scale operations for mid-market companies.",
    features: ["Unlimited warehouses", "50,000 SKUs", "Demand forecasting", "Supplier portal", "Advanced analytics", "Priority support"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "Tailored for global supply chains at scale.",
    features: ["Unlimited everything", "Custom integrations", "Dedicated CSM", "SLA guarantees", "On-premise option", "24/7 support"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function KorvexLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-[#0A0C10] text-[#E8EAF0] font-sans min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif; }
        .glow-border { box-shadow: 0 0 0 1px rgba(56,189,248,0.15), inset 0 0 0 1px rgba(56,189,248,0.05); }
        .card-hover { transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s; }
        .card-hover:hover { box-shadow: 0 0 0 1px rgba(56,189,248,0.35); transform: translateY(-2px); }
        .tag-pill { background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.18); }
        .grid-bg {
          background-image: 
            linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0A0C10]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <path d="M3 9l6-6 6 6-6 6-6-6z" fill="white"/>
              </svg>
            </div>
            <span className="font-display font-800 text-xl tracking-tight text-white">KORVEX</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l} href="#" className="text-sm text-[#8A9BB0] hover:text-white transition-colors">{l}</a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button onClick={()=>navigate("/request-demo")} className="hidden md:block text-sm text-[#8A9BB0] hover:text-white transition-colors px-3 py-1.5">
              Request Demo
            </button>
            <button onClick={()=>navigate("/login")} className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
              Login
            </button>
            {/* Mobile menu */}
            <button className="md:hidden p-2 text-[#8A9BB0]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] px-6 py-4 flex flex-col gap-4 bg-[#0A0C10]">
            {NAV_LINKS.map((l) => (
              <a key={l} href="#" className="text-sm text-[#8A9BB0] hover:text-white transition-colors">{l}</a>
            ))}
            <button className="bg-sky-500 text-white text-sm font-medium px-5 py-2 rounded-lg w-full">Login</button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden grid-bg">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-sky-500/[0.06] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 tag-pill rounded-full px-4 py-1.5 text-xs text-sky-400 font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block"></span>
              Now with AI-Powered Demand Forecasting
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6">
              Supply Chain,<br />
              <span className="text-sky-400">Unified.</span><br />
              Optimized.
            </h1>

            <p className="text-lg text-[#6B7F96] max-w-xl leading-relaxed mb-10">
              Korvex brings your entire supply chain onto one intelligent platform — from supplier onboarding to last-mile delivery. Reduce costs, eliminate delays, and gain full operational visibility.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-sky-500 hover:bg-sky-400 text-white font-medium px-8 py-3.5 rounded-lg transition-colors text-sm">
                Start Free Trial
              </button>
              <button className="border border-white/10 hover:border-white/20 text-white font-medium px-8 py-3.5 rounded-lg transition-colors text-sm flex items-center gap-2 justify-center">
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
                </svg>
                Watch Product Tour
              </button>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="mt-16 rounded-2xl border border-white/[0.08] bg-[#0E1117] overflow-hidden glow-border">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-[#0C0E14]">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              <div className="flex-1 mx-4">
                <div className="bg-[#161922] rounded-md px-4 py-1.5 text-xs text-[#3A4A5C] w-64">
                  app.korvex.io/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard body */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-[#4A5F74] mb-1">Operations Overview</p>
                  <p className="font-display text-lg font-semibold text-white">May 2026</p>
                </div>
                <div className="flex gap-2">
                  {["1W","1M","3M","1Y"].map(t => (
                    <button key={t} className={`text-xs px-3 py-1.5 rounded-md ${t==="1M" ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "text-[#4A5F74] hover:text-white"}`}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Active Orders", value: "2,847", delta: "+12%", up: true },
                  { label: "On-Time Delivery", value: "96.4%", delta: "+1.2%", up: true },
                  { label: "Inventory Value", value: "$4.2M", delta: "-3%", up: false },
                  { label: "Pending Shipments", value: "134", delta: "+8", up: false },
                ].map((s) => (
                  <div key={s.label} className="bg-[#0C0E14] rounded-xl p-4 border border-white/[0.05]">
                    <p className="text-xs text-[#4A5F74] mb-2">{s.label}</p>
                    <p className="font-display text-xl font-bold text-white">{s.value}</p>
                    <p className={`text-xs mt-1 font-medium ${s.up ? "text-emerald-400" : "text-rose-400"}`}>{s.delta} vs last month</p>
                  </div>
                ))}
              </div>

              {/* Bar chart mockup */}
              <div className="bg-[#0C0E14] rounded-xl p-5 border border-white/[0.05]">
                <div className="flex items-end justify-between h-24 gap-2">
                  {[60,80,55,90,70,85,95,75,88,65,78,92].map((h,i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <div
                        className={`rounded-sm ${i===11 ? "bg-sky-500" : "bg-[#1E2A38]"}`}
                        style={{height: `${h}%`}}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map(m => (
                    <span key={m} className="text-[10px] text-[#2A3A4A] flex-1 text-center">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-white/[0.06] bg-[#0C0E14]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl font-bold text-sky-400">{s.value}</p>
              <p className="text-sm text-[#5A7080] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6" id="solutions">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <div className="tag-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-sky-400 font-medium mb-4">
              Core Platform
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Everything your supply chain needs
            </h2>
            <p className="text-[#6B7F96] max-w-xl text-base leading-relaxed">
              A modular, deeply integrated platform that grows with your operations — from single-site to global enterprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#0C0E14] border border-white/[0.07] rounded-2xl p-6 card-hover">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5">
                  {f.icon}
                </div>
                <h3 className="font-display text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#5A7080] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-[#0C0E14] border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 text-center">
            <div className="tag-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-sky-400 font-medium mb-4">
              How It Works
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Up and running in days, not months</h2>
            <p className="text-[#6B7F96] max-w-lg mx-auto text-base">
              Korvex's onboarding is designed for operations teams, not IT departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

            {[
              { step: "01", title: "Connect Your Data", desc: "Integrate ERP, WMS, or spreadsheets via 200+ pre-built connectors in minutes." },
              { step: "02", title: "Map Your Workflows", desc: "Configure approval flows, reorder rules, and alert thresholds to match your processes." },
              { step: "03", title: "Onboard Suppliers", desc: "Invite suppliers to the portal — they get visibility, you get compliance and performance data." },
              { step: "04", title: "Go Live", desc: "Start managing orders, monitoring inventory, and optimizing shipments from day one." },
            ].map((s) => (
              <div key={s.step} className="relative text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-[#0A0C10] border border-sky-500/25 flex items-center justify-center mx-auto mb-5 relative z-10">
                  <span className="font-display text-sky-400 font-bold text-lg">{s.step}</span>
                </div>
                <h3 className="font-display font-semibold text-white mb-2 text-sm">{s.title}</h3>
                <p className="text-xs text-[#5A7080] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="tag-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-sky-400 font-medium mb-4">
              Industries
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Built for your sector</h2>
            <p className="text-[#6B7F96] max-w-xl text-base">
              Industry-specific modules, compliance templates, and pre-built KPI dashboards for six verticals.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {INDUSTRIES.map((ind) => (
              <div key={ind.name} className="bg-[#0C0E14] border border-white/[0.07] rounded-xl p-5 text-center card-hover cursor-pointer">
                <div className="text-3xl mb-3">{ind.icon}</div>
                <p className="text-xs font-medium text-[#8A9BB0]">{ind.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6 bg-[#0C0E14] border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 text-center">
            <div className="tag-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-sky-400 font-medium mb-4">
              Customer Stories
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Trusted by operations leaders</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-[#0A0C10] border border-white/[0.07] rounded-2xl p-7 card-hover flex flex-col gap-5">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" fill="#38BDF8" viewBox="0 0 16 16">
                      <path d="M8 1l1.85 3.75L14 5.5l-3 2.92.71 4.08L8 10.25l-3.71 2.25L5 8.42 2 5.5l4.15-.75L8 1z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[#8A9BB0] leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-sky-400">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-[#4A5F74]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-6" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 text-center">
            <div className="tag-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-sky-400 font-medium mb-4">
              Pricing
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-[#6B7F96] text-base">All plans include a 14-day free trial. No credit card required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl p-8 border flex flex-col ${
                  p.highlight
                    ? "bg-sky-500/10 border-sky-500/40 ring-1 ring-sky-500/30"
                    : "bg-[#0C0E14] border-white/[0.07]"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-sky-500 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                <div className="mb-6">
                  <p className="font-display text-sm font-semibold text-[#8A9BB0] mb-2 uppercase tracking-wider">{p.name}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="font-display text-4xl font-bold text-white">{p.price}</span>
                    <span className="text-[#5A7080] mb-1">{p.period}</span>
                  </div>
                  <p className="text-sm text-[#5A7080]">{p.desc}</p>
                </div>

                <ul className="flex-1 space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#8A9BB0]">
                      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                        <path d="M3 8l3.5 3.5 6.5-7" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
                    p.highlight
                      ? "bg-sky-500 hover:bg-sky-400 text-white"
                      : "border border-white/10 hover:border-white/20 text-white"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section className="py-20 px-6 border-t border-white/[0.06] bg-[#0C0E14]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-[#4A5F74] mb-8 uppercase tracking-widest font-medium">Integrates with your existing stack</p>
          <div className="flex flex-wrap justify-center gap-4 items-center">
            {["SAP", "Oracle ERP", "NetSuite", "Salesforce", "Shopify", "QuickBooks", "Stripe", "FedEx API", "DHL Connect", "Amazon MCF"].map((name) => (
              <div key={name} className="bg-[#0A0C10] border border-white/[0.06] rounded-lg px-5 py-2.5 text-sm text-[#4A5F74]">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/[0.07] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
            Ready to transform your supply chain?
          </h2>
          <p className="text-[#6B7F96] text-base mb-10 max-w-lg mx-auto">
            Join thousands of operations teams who use Korvex to reduce costs, increase speed, and eliminate surprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-sky-500 hover:bg-sky-400 text-white font-medium px-10 py-3.5 rounded-lg transition-colors text-sm">
              Start Free Trial
            </button>
            <button className="border border-white/10 hover:border-white/20 text-white font-medium px-10 py-3.5 rounded-lg transition-colors text-sm">
              Schedule a Demo
            </button>
          </div>
          <p className="text-xs text-[#3A4A5C] mt-5">No credit card required · 14-day free trial · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] bg-[#0A0C10] px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path d="M2 8l6-6 6 6-6 6-6-6z" fill="white"/>
                  </svg>
                </div>
                <span className="font-display font-bold text-white text-lg tracking-tight">KORVEX</span>
              </div>
              <p className="text-sm text-[#4A5F74] max-w-xs leading-relaxed">
                The intelligent supply chain platform for modern operations teams.
              </p>
            </div>

            {[
              { heading: "Product", links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
              { heading: "Legal", links: ["Privacy", "Terms", "Security", "GDPR"] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="text-xs font-semibold text-white uppercase tracking-widest mb-4">{col.heading}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-sm text-[#4A5F74] hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-[#2A3A4A]">© 2026 Korvex Technologies. All rights reserved.</p>
            <p className="text-xs text-[#2A3A4A]">Built for the world's most demanding supply chains.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}