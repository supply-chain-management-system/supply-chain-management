import { useEffect } from 'react';
import {
  Building2, Star, Clock, AlertTriangle, ArrowLeft, Mail, Phone,
  Trash2, BarChart2, ShieldCheck, TrendingUp, ShoppingCart,
  BadgeCheck, Sparkles, PackageSearch,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────
const CAT_COLOR = {
  'Electronics':  '#1D4ED8',
  'Raw Material': '#92400E',
  'Hydraulics':   '#065F46',
  'Plastics':     '#6D28D9',
  'Chemicals':    '#B91C1C',
  'Packaging':    '#0369A1',
  'Textiles':     '#BE185D',
  'Machinery':    '#374151',
};

const RATING_COLOR = (r) => {
  if (r >= 4.5) return { dot: 'bg-emerald-400 ring-emerald-400/30', text: 'text-emerald-500', label: 'Preferred' };
  if (r >= 3.5) return { dot: 'bg-blue-400 ring-blue-400/30',       text: 'text-blue-500',    label: 'Active'    };
  return              { dot: 'bg-red-400 ring-red-400/30',           text: 'text-red-500',     label: 'At Risk'   };
};

// ─── Micro Components ─────────────────────────────────────────────────────
const MetaChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5 bg-slate-50/80 rounded-xl border border-slate-100 px-3 py-2.5 min-w-0 hover:border-slate-200 transition-colors">
    <Icon size={12} className="text-slate-400 shrink-0" />
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="text-xs font-semibold text-slate-700 truncate">{value || '—'}</p>
    </div>
  </div>
);

const RatingStars = ({ rating }) => {
  const full = Math.floor(rating);
  const frac = rating - full;
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`text-[11px] ${i < full ? 'text-amber-400' : (i === full && frac >= 0.5 ? 'text-amber-300' : 'text-slate-200')}`}>★</span>
      ))}
      <span className="text-xs font-bold text-slate-700 ml-0.5">{rating?.toFixed(1)}</span>
    </div>
  );
};

const StatusPill = ({ rating }) => {
  const { dot, text, label } = RATING_COLOR(rating ?? 0);
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ring-2 ${dot}`} />
      <span className={`text-[10px] font-bold ${text}`}>{label}</span>
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, icon: Icon, color, bgColor, delay }) => (
  <div
    className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`w-9 h-9 ${bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={16} className={color} />
    </div>
    <p className="text-xl font-black text-slate-800 tabular-nums tracking-tight leading-tight">{value ?? '—'}</p>
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mt-1.5">{label}</p>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────
const SkeletonAnalytics = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200/80" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200/80 rounded-lg w-1/3" />
          <div className="h-3 bg-slate-100/80 rounded-lg w-1/2" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 h-32" />
      ))}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
//  SUPPLIER ANALYTICS PAGE
// ══════════════════════════════════════════════════════════════
const SMAnalyticsPage = ({ supplier, analytics, loading, onBack, onRemove }) => {
  const bannerColor = CAT_COLOR[supplier.category] || '#374151';

  const kpis = analytics ? [
    { label: 'Current Rating',       value: analytics.current_rating,         icon: Star,          color: 'text-amber-500',   bgColor: 'bg-amber-50'   },
    { label: 'Lead Time',            value: analytics.lead_time,              icon: Clock,         color: 'text-slate-500',   bgColor: 'bg-slate-100'  },
    { label: 'On-Time Delivery',     value: analytics.on_time_delivery_rate,  icon: TrendingUp,    color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    { label: "Active PO's",          value: analytics.active_purchase_orders, icon: ShoppingCart,   color: 'text-blue-500',    bgColor: 'bg-blue-50'    },
    { label: 'Defect Rate',          value: analytics.defect_rate,            icon: AlertTriangle, color: 'text-red-500',     bgColor: 'bg-red-50'     },
    { label: 'Reliability',          value: analytics.reliability_status,     icon: BadgeCheck,    color: 'text-violet-500',  bgColor: 'bg-violet-50'  },
  ] : [];

  return (
    <div className="space-y-6">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="h-1.5 rounded-t-2xl" style={{ background: `linear-gradient(to right, ${bannerColor}, ${bannerColor}88)` }} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all duration-200 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back
            </button>

            <div className="w-px h-8 bg-slate-200/60" />

            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow-md ring-2 ring-white"
              style={{ backgroundColor: bannerColor }}
            >
              {supplier.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <div className="min-w-0">
              <h2 className="font-black text-slate-800 truncate text-base tracking-tight">
                {supplier.name}
              </h2>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {supplier.category} · {supplier.contact_email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
              {supplier.category}
            </span>
            <StatusPill rating={supplier.rating} />
          </div>
        </div>
      </div>

      {/* ── LOADING ────────────────────────────────────────── */}
      {loading && <SkeletonAnalytics />}

      {/* ── ANALYTICS CONTENT ──────────────────────────────── */}
      {!loading && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {kpis.map((k, i) => <KpiCard key={i} {...k} delay={i * 80} />)}
          </div>

          {/* Detail panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Supplier card preview */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="relative h-36 overflow-hidden" style={{ backgroundColor: bannerColor }}>
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/[0.08]" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/[0.06]" />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent" />
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                  <span className="text-white font-bold text-xl">{supplier.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/90 text-slate-700 shadow-sm">
                    {supplier.category}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white font-bold drop-shadow-md truncate">{supplier.name}</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <StatusPill rating={supplier.rating} />
                  <RatingStars rating={supplier.rating} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <MetaChip icon={Mail}  label="Contact" value={supplier.contact_email} />
                  <MetaChip icon={Phone} label="Phone"   value={supplier.phone} />
                </div>
                <button onClick={() => onRemove(supplier.id)}
                  className="w-full mt-2 text-xs font-semibold text-red-400 hover:text-red-600 flex items-center justify-center gap-1.5 py-2.5 border border-red-100 rounded-xl hover:bg-red-50 transition-all duration-200">
                  <Trash2 size={12} /> Remove Supplier
                </button>
              </div>
            </div>

            {/* Right: Procurement Overview */}
            <div className="lg:col-span-2 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-7 text-white overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/[0.03]" />
              <div className="absolute bottom-6 -left-8 w-24 h-24 rounded-full bg-white/[0.02]" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={12} className="text-amber-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Procurement Performance</p>
                </div>

                <div className="space-y-1">
                  {[
                    { icon: Star,          label: 'Current Rating',       value: analytics?.current_rating ?? '—' },
                    { icon: Clock,         label: 'Lead Time',            value: analytics?.lead_time ?? '—' },
                    { icon: TrendingUp,    label: 'On-Time Delivery',     value: analytics?.on_time_delivery_rate ?? '—' },
                    { icon: ShoppingCart,   label: "Active PO's",          value: analytics?.active_purchase_orders ?? '—' },
                    { icon: AlertTriangle, label: 'Defect Rate',          value: analytics?.defect_rate ?? '—' },
                    { icon: BadgeCheck,    label: 'Reliability Status',   value: analytics?.reliability_status ?? '—' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/[0.05] transition-colors duration-200">
                      <span className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                        <item.icon size={12} /> {item.label}
                      </span>
                      <span className="text-sm font-black text-slate-200 tabular-nums">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5">
            <p className="text-xs text-slate-500 leading-relaxed">
              Procurement KPIs are sourced from the <span className="font-mono font-semibold text-slate-700">suppliers</span> table.
              On-time delivery and defect rate will auto-update once linked to <span className="font-mono font-semibold text-slate-700">PurchaseOrders</span> and <span className="font-mono font-semibold text-slate-700">InboundShipments</span>.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SMAnalyticsPage;
