import {
  ChevronLeft, Package, Warehouse, Truck, CheckCircle2,
  ShieldCheck, Sparkles, Activity,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────
const ZONE_COLOR = {
  'Dry Goods':      { banner: '#B45309', badge: 'bg-amber-50  text-amber-700  border-amber-200'  },
  'Cold Storage':   { banner: '#0369A1', badge: 'bg-sky-50    text-sky-700    border-sky-200'    },
  'Inbound':        { banner: '#15803D', badge: 'bg-green-50  text-green-700  border-green-200'  },
  'Outbound':       { banner: '#7C3AED', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  'Hazmat':         { banner: '#B91C1C', badge: 'bg-red-50    text-red-700    border-red-200'    },
  'General Storage':{ banner: '#475569', badge: 'bg-slate-50  text-slate-700  border-slate-200'  },
};

const SHIFT_BADGE = {
  Day:   'bg-orange-50 text-orange-600 border-orange-200',
  Night: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Swing: 'bg-purple-50 text-purple-600 border-purple-200',
};

// ─── Micro Components ─────────────────────────────────────────────────────
const StatusDot = ({ isUsed }) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isUsed ? 'text-emerald-400' : 'text-amber-400'}`}>
    <span className={`h-2 w-2 rounded-full ring-2 ${isUsed ? 'bg-emerald-400 ring-emerald-400/30' : 'bg-amber-400 ring-amber-400/30 animate-pulse'}`} />
    {isUsed ? 'Active' : 'Invite Sent'}
  </span>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, icon, color, bgColor, delay }) => (
  <div
    className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`w-9 h-9 ${bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
      <span className={color}>{icon}</span>
    </div>
    <p className="text-2xl font-black text-slate-800 tabular-nums tracking-tight">{value ?? '—'}</p>
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mt-1.5">{label}</p>
  </div>
);

// ─── Efficiency Bar ───────────────────────────────────────────────────────
const UtilizationBar = ({ value }) => {
  const numVal = typeof value === 'string' ? parseInt(value) : (value ?? 0);
  const pct = Math.min(Math.max(numVal, 0), 100);
  const gradient =
    pct >= 80 ? 'from-emerald-400 to-teal-500' :
    pct >= 50 ? 'from-amber-400 to-orange-500' :
                'from-red-400 to-rose-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Space Utilization</span>
        <span className="text-sm font-black text-white tabular-nums">{value ?? '—'}</span>
      </div>
      <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out shadow-sm`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 h-32" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-slate-200/50 rounded-2xl h-64" />
      <div className="lg:col-span-2 bg-white/70 rounded-2xl border border-slate-200/60 h-64" />
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
//  WAREHOUSE MANAGER ANALYTICS PAGE
// ══════════════════════════════════════════════════════════════
const WMAnalyticsPage = ({ manager, analytics, loading, onBack, dispatch, setView }) => {
  const zone     = manager.department || 'General Storage';
  const shift    = manager.shift || 'Day';
  const zoneMeta = ZONE_COLOR[zone]  ?? ZONE_COLOR['General Storage'];
  const shiftCls = SHIFT_BADGE[shift] ?? SHIFT_BADGE.Day;

  const kpis = [
    { label: 'Stock Managed',      value: analytics?.total_stock_managed ?? '—',  icon: <Package size={16} />,     color: 'text-blue-500',    bgColor: 'bg-blue-50'    },
    { label: 'Space Utilization',  value: analytics?.space_utilization ?? '—',    icon: <Warehouse size={16} />,   color: 'text-amber-500',   bgColor: 'bg-amber-50'   },
    { label: 'Inv. Accuracy',      value: analytics?.inventory_accuracy ?? '—',   icon: <CheckCircle2 size={16} />,color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    { label: 'Pending Shipments',  value: analytics?.pending_shipments ?? '—',    icon: <Truck size={16} />,       color: 'text-violet-500',  bgColor: 'bg-violet-50'  },
  ];

  return (
    <div className="space-y-6">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="h-1.5 rounded-t-2xl" style={{ background: `linear-gradient(to right, ${zoneMeta.banner}, ${zoneMeta.banner}88)` }} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all duration-200 group"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back
            </button>

            <div className="w-px h-8 bg-slate-200/60" />

            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow-md ring-2 ring-white"
              style={{ backgroundColor: zoneMeta.banner }}
            >
              {manager.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>

            <div className="min-w-0">
              <h2 className="font-black text-slate-800 truncate text-base tracking-tight">
                Performance Report: {manager.name}
              </h2>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {zone} Zone · {shift} Shift
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-[9px] font-bold uppercase tracking-[0.12em] border rounded-full px-2.5 py-0.5 ${zoneMeta.badge}`}>
              {zone}
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-[0.12em] border rounded-full px-2.5 py-0.5 ${shiftCls}`}>
              {shift} Shift
            </span>
            <StatusDot isUsed={manager.is_used} />
          </div>
        </div>
      </div>

      {/* ── LOADING ────────────────────────────────────────── */}
      {loading && <SkeletonAnalytics />}

      {/* ── ANALYTICS CONTENT ──────────────────────────────── */}
      {!loading && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} delay={i * 80} />)}
          </div>

          {/* Main panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: utilization gauge */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-7 text-white flex flex-col gap-6 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/[0.03] pointer-events-none" />
              <div className="absolute bottom-6 -left-8 w-24 h-24 rounded-full bg-white/[0.02] pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={12} className="text-amber-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                    Space Utilization
                  </p>
                </div>
                <h3 className="text-5xl font-black tabular-nums tracking-tight">
                  {analytics?.space_utilization ?? '—'}
                </h3>
              </div>

              <UtilizationBar value={analytics?.space_utilization} />

              <div className="space-y-1">
                {[
                  { icon: <Activity size={12} />,     label: 'Reliability',       value: analytics?.reliability ?? '—' },
                  { icon: <CheckCircle2 size={12} />,  label: 'Inv. Accuracy',     value: analytics?.inventory_accuracy ?? '—' },
                  { icon: <Package size={12} />,       label: 'Total Stock',       value: analytics?.total_stock_managed ?? '—' },
                  { icon: <Truck size={12} />,         label: 'Pending Shipments', value: analytics?.pending_shipments ?? '—' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/[0.05] transition-colors duration-200">
                    <span className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                      {item.icon} {item.label}
                    </span>
                    <span className="text-sm font-black text-slate-200 tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: zone inventory report */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-7 shadow-sm">
              <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2.5 tracking-tight">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Warehouse size={14} className="text-blue-500" />
                </div>
                Zone Inventory Report
              </h3>

              <p className="text-slate-400 text-sm mb-6">
                Live zone data for <span className="font-semibold text-slate-600">{manager.name}</span> in{' '}
                <span className="font-semibold text-slate-600">{zone}</span> is connected
                to Inventory_ware and Rack tables.
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                  <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5 mb-2 tracking-wider">
                    <Package size={11} /> Total Stock
                  </p>
                  <p className="text-2xl font-black text-slate-800 tabular-nums">
                    {analytics?.total_stock_managed ?? '—'}
                  </p>
                </div>

                <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                  <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5 mb-2 tracking-wider">
                    <Truck size={11} /> Pending
                  </p>
                  <p className="text-2xl font-black text-slate-800 tabular-nums">
                    {analytics?.pending_shipments ?? '—'}
                  </p>
                </div>

                <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                  <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5 mb-2 tracking-wider">
                    <ShieldCheck size={11} /> Status
                  </p>
                  <div className="mt-1">
                    <StatusDot isUsed={manager.is_used} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WMAnalyticsPage;
