import { useEffect } from 'react';
import {
  Truck, Clock, Star, AlertCircle, TrendingUp, Route,
  ArrowLeft, Mail, Phone, Trash2, Sparkles, BarChart2,
  PackageCheck, Activity,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────
const ROUTE_COLOR = {
  'Local':        '#1D6FA4',
  'Regional':     '#1A7A4A',
  'Long Haul':    '#7C3AED',
  'Last Mile':    '#B45309',
  'Cross-Border': '#B91C1C',
};

const SHIFT_LABEL = {
  Day:   { bg: 'bg-amber-400/90',  text: 'text-amber-900'  },
  Night: { bg: 'bg-indigo-500/90', text: 'text-white'       },
  Swing: { bg: 'bg-purple-500/90', text: 'text-white'       },
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

const StatusDot = ({ pending }) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-2 h-2 rounded-full ring-2 ${pending ? 'bg-amber-400 ring-amber-400/30 animate-pulse' : 'bg-emerald-400 ring-emerald-400/30'}`} />
    <span className={`text-[10px] font-bold ${pending ? 'text-amber-500' : 'text-emerald-500'}`}>{pending ? 'Invite Pending' : 'Active'}</span>
  </div>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, icon: Icon, color, bgColor, delay }) => (
  <div
    className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`w-9 h-9 ${bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={16} className={color} />
    </div>
    <p className="text-2xl font-black text-slate-800 tabular-nums tracking-tight">{value ?? '—'}</p>
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
//  LOGISTICS MANAGER ANALYTICS PAGE
// ══════════════════════════════════════════════════════════════
const LMAnalyticsPage = ({ manager, analytics, loading, onBack, onRemove }) => {
  const bannerColor = ROUTE_COLOR[manager.route] || ROUTE_COLOR['Local'];
  const shiftStyle  = SHIFT_LABEL[manager.shift] || SHIFT_LABEL['Day'];

  const kpis = analytics ? [
    { label: 'Deliveries Managed',  value: analytics.total_deliveries_managed ?? '—',                                    icon: Truck,         color: 'text-blue-500',    bgColor: 'bg-blue-50'    },
    { label: 'On-Time Rate',        value: analytics.on_time_rate != null ? `${analytics.on_time_rate}%` : '—',           icon: Clock,         color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    { label: 'Fleet Utilization',   value: analytics.fleet_utilization != null ? `${analytics.fleet_utilization}%` : '—', icon: TrendingUp,    color: 'text-violet-500',  bgColor: 'bg-violet-50'  },
    { label: 'Pending Shipments',   value: analytics.pending_shipments ?? '—',                                            icon: AlertCircle,   color: 'text-amber-500',   bgColor: 'bg-amber-50'   },
    { label: 'Avg. Transit Days',   value: analytics.avg_transit_days != null ? `${analytics.avg_transit_days}d` : '—',   icon: Route,         color: 'text-slate-500',   bgColor: 'bg-slate-100'  },
    { label: 'Reliability Score',   value: analytics.reliability != null ? `${analytics.reliability}%` : '—',             icon: Star,          color: 'text-orange-500',  bgColor: 'bg-orange-50'  },
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

            {/* Avatar */}
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow-md ring-2 ring-white"
              style={{ backgroundColor: bannerColor }}
            >
              {manager.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <div className="min-w-0">
              <h2 className="font-black text-slate-800 truncate text-base tracking-tight">
                {manager.name}
              </h2>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {manager.route} Route · {manager.shift} Shift
                {manager.email && ` · ${manager.email}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${shiftStyle.bg} ${shiftStyle.text}`}>
              {manager.shift}
            </span>
            <StatusDot pending={!manager.is_active} />
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

            {/* Left: Manager card preview */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="relative h-36 overflow-hidden" style={{ backgroundColor: bannerColor }}>
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/[0.08]" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/[0.06]" />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent" />
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                  <span className="text-white font-bold text-xl">{manager.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm ${shiftStyle.bg} ${shiftStyle.text}`}>
                    {manager.shift}
                  </span>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/90 text-slate-700 shadow-sm">
                    {manager.route}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white font-bold drop-shadow-md">{manager.name}</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <StatusDot pending={!manager.is_active} />
                <div className="grid grid-cols-2 gap-2">
                  <MetaChip icon={Mail}  label="Email" value={manager.email} />
                  <MetaChip icon={Phone} label="Phone" value={manager.phone} />
                </div>
                <button onClick={() => onRemove(manager.id)}
                  className="w-full mt-2 text-xs font-semibold text-red-400 hover:text-red-600 flex items-center justify-center gap-1.5 py-2.5 border border-red-100 rounded-xl hover:bg-red-50 transition-all duration-200">
                  <Trash2 size={12} /> Remove Manager
                </button>
              </div>
            </div>

            {/* Right: Fleet Overview */}
            <div className="lg:col-span-2 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-7 text-white overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/[0.03]" />
              <div className="absolute bottom-6 -left-8 w-24 h-24 rounded-full bg-white/[0.02]" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={12} className="text-amber-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Fleet Performance Overview</p>
                </div>

                <div className="space-y-1">
                  {[
                    { icon: Truck,       label: 'Deliveries Managed',  value: analytics?.total_deliveries_managed ?? '—' },
                    { icon: Clock,       label: 'On-Time Rate',        value: analytics?.on_time_rate != null ? `${analytics.on_time_rate}%` : '—' },
                    { icon: TrendingUp,  label: 'Fleet Utilization',   value: analytics?.fleet_utilization != null ? `${analytics.fleet_utilization}%` : '—' },
                    { icon: AlertCircle, label: 'Pending Shipments',   value: analytics?.pending_shipments ?? '—' },
                    { icon: Route,       label: 'Avg Transit Days',    value: analytics?.avg_transit_days != null ? `${analytics.avg_transit_days}d` : '—' },
                    { icon: Star,        label: 'Reliability',         value: analytics?.reliability != null ? `${analytics.reliability}%` : '—' },
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
              Analytics are derived from the <span className="font-mono font-semibold text-slate-700">shipment_routes</span> and{' '}
              <span className="font-mono font-semibold text-slate-700">logistics_manager</span> tables.
              Fleet utilization and transit metrics update daily via the backend analytics endpoint.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LMAnalyticsPage;
