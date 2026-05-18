import { useEffect, useState } from 'react';
import {
  ChevronLeft, Zap, Package, Timer, CheckCircle2,
  ShieldAlert, Loader2, AlertCircle, BarChart2,
  TrendingUp, Clock, Activity, Sparkles,
} from 'lucide-react';

import api from '../../../api/api';

// ─── API ──────────────────────────────────────────────────────────────────
const FM = '/business-manager/factory-managers';

// Fetch analytics for a specific member (user)
// Adjust endpoint path to match your backend
const fetchMemberAnalytics = (memberId) =>
  api.get(`${FM}/${memberId}/analytics`);

// ─── Constants ────────────────────────────────────────────────────────────
const SHIFT_BANNER = {
  Day:   { gradient: 'from-amber-500 via-orange-400 to-yellow-300', accent: 'text-amber-500',   bg: 'bg-amber-500/10' },
  Night: { gradient: 'from-indigo-600 via-blue-500 to-cyan-400',    accent: 'text-indigo-500',  bg: 'bg-indigo-500/10' },
  Swing: { gradient: 'from-violet-600 via-purple-500 to-fuchsia-400', accent: 'text-violet-500', bg: 'bg-violet-500/10' },
};

const errMsg = (err) =>
  err.response?.data?.detail || err.message || 'Something went wrong.';

// ─── Status Dot ───────────────────────────────────────────────────────────
const StatusDot = ({ isUsed }) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isUsed ? 'text-emerald-400' : 'text-amber-400'}`}>
    <span className={`h-2 w-2 rounded-full ring-2 ${isUsed ? 'bg-emerald-400 ring-emerald-400/30' : 'bg-amber-400 ring-amber-400/30 animate-pulse'}`} />
    {isUsed ? 'Active' : 'Pending Invite'}
  </span>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, color, bgColor, subValue, subLabel, delay }) => (
  <div
    className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Subtle gradient accent on top */}
    <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

    <div className={`w-9 h-9 ${bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
      <span className={color}>{icon}</span>
    </div>
    <p className="text-2xl font-black text-slate-800 tabular-nums tracking-tight">{value ?? '—'}</p>
    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.15em] mt-1.5">{label}</p>
    {subValue !== undefined && (
      <p className="text-[10px] text-slate-300 mt-1.5">{subLabel}: <span className="font-bold text-slate-500">{subValue ?? '—'}</span></p>
    )}
  </div>
);

// ─── Efficiency Bar ───────────────────────────────────────────────────────
const EfficiencyBar = ({ score }) => {
  const pct = Math.min(Math.max(score ?? 0, 0), 100);
  const gradient =
    pct >= 80 ? 'from-emerald-400 to-teal-500' :
    pct >= 50 ? 'from-amber-400 to-orange-500' :
                'from-red-400 to-rose-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Efficiency Score</span>
        <span className="text-sm font-black text-white tabular-nums">{pct}%</span>
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
        <div className="w-12 h-12 rounded-xl bg-slate-200/80 flex-shrink-0" />
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
      <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 h-64" />
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
//  ANALYTICS PAGE COMPONENT
// ══════════════════════════════════════════════════════════════
/**
 * Props:
 *  - member   : { id, name, email, phone, shift, department, role, is_used, business_id }
 *  - groupId  : number (the parent group this member belongs to)
 *  - onBack   : () => void
 */
const FMAnalyticsPage = ({ member, groupId, onBack }) => {
  const [analytics, setAnalytics]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const shiftData = SHIFT_BANNER[member?.shift] ?? SHIFT_BANNER.Day;

  useEffect(() => {
    if (!member?.id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await fetchMemberAnalytics(member.id);
        if (!cancelled) setAnalytics(data);
      } catch (err) {
        if (!cancelled) setError(errMsg(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [member?.id]);

  const kpis = [
    {
      icon: <Zap size={16} />,
      label: 'Efficiency Score',
      value: analytics?.efficiency_score != null ? `${analytics.efficiency_score}%` : '—',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: <Package size={16} />,
      label: 'Batches Completed',
      value: analytics?.batches_completed ?? '—',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      subLabel: 'Total',
      subValue: analytics?.total_batches,
    },
    {
      icon: <Timer size={16} />,
      label: 'Avg Cycle Time',
      value: analytics?.avg_cycle_time ?? '—',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: <CheckCircle2 size={16} />,
      label: 'Reliability',
      value: analytics?.reliability ?? '—',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── TOP HEADER ─────────────────────────────────────────── */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Gradient strip */}
        <div className={`h-1.5 bg-gradient-to-r ${shiftData.gradient}`} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all duration-200 group"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back
            </button>

            <div className="w-px h-8 bg-slate-200/60" />

            {/* Avatar */}
            <div
              className={`h-11 w-11 rounded-xl bg-gradient-to-br ${shiftData.gradient} flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow-md ring-2 ring-white`}
            >
              {member?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>

            <div className="min-w-0">
              <h2 className="font-black text-slate-800 truncate text-base tracking-tight">
                {member?.name}
              </h2>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {member?.department} · {member?.shift} Shift
                {member?.email && ` · ${member.email}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {member?.role && (
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 bg-slate-100/80 px-3 py-1 rounded-full border border-slate-200/60">
                {member.role.replace('_', ' ')}
              </span>
            )}
            <StatusDot isUsed={member?.is_used} />
          </div>
        </div>
      </div>

      {/* ── LOADING / ERROR ────────────────────────────────────── */}
      {loading && <SkeletonAnalytics />}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center ring-4 ring-red-50">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700">Failed to load analytics</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchMemberAnalytics(member.id)
                .then(({ data }) => setAnalytics(data))
                .catch(err => setError(errMsg(err)))
                .finally(() => setLoading(false));
            }}
            className="text-xs font-bold text-white bg-slate-800 hover:bg-blue-600 px-5 py-2 rounded-xl transition-all duration-200 active:scale-95"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && analytics && (
        <>
          {/* ── KPI ROW ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} delay={i * 80} />)}
          </div>

          {/* ── MAIN PANELS ────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: efficiency deep-dive */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-7 text-white flex flex-col gap-6 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/[0.03] pointer-events-none" />
              <div className="absolute bottom-6 -left-8 w-24 h-24 rounded-full bg-white/[0.02] pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={12} className="text-amber-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                    Efficiency Score
                  </p>
                </div>
                <h3 className="text-5xl font-black tabular-nums tracking-tight">
                  {analytics?.efficiency_score ?? '—'}
                  {analytics?.efficiency_score != null && <span className="text-2xl text-slate-500 ml-0.5">%</span>}
                </h3>
              </div>

              <EfficiencyBar score={analytics?.efficiency_score} />

              <div className="space-y-1">
                {[
                  { icon: <Activity size={12} />,  label: 'Reliability',   value: analytics?.reliability ?? '—' },
                  { icon: <TrendingUp size={12} />, label: 'Registered',    value: analytics?.is_registered ? 'Yes' : 'No' },
                  { icon: <BarChart2 size={12} />,  label: 'Total Batches', value: analytics?.total_batches ?? '—' },
                  { icon: <Clock size={12} />,      label: 'Avg Cycle',     value: analytics?.avg_cycle_time ?? '—' },
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

            {/* Right: production feed + meta */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-7 shadow-sm">
              <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2.5 tracking-tight">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BarChart2 size={14} className="text-blue-500" />
                </div>
                Production Feed
              </h3>

              {/* If real batch data exists */}
              {analytics?.recent_batches?.length > 0 ? (
                <div className="space-y-2">
                  {analytics.recent_batches.map((batch, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 px-4 bg-slate-50/80 rounded-xl border border-slate-100 text-xs hover:bg-blue-50/50 hover:border-blue-100 transition-all duration-200"
                    >
                      <span className="font-bold text-slate-700">{batch.batch_id ?? `Batch #${i + 1}`}</span>
                      <span className="text-slate-400">{batch.completed_at ?? '—'}</span>
                      <span className="font-bold text-emerald-500 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">{batch.status ?? 'Done'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Package size={18} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-xs text-center max-w-xs">
                    Live production data for <span className="font-bold text-slate-500">{member?.name}</span> will populate once they begin logging batches.
                  </p>
                </div>
              )}

              {/* Meta grid */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                  <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5 mb-2 tracking-wider">
                    <Package size={10} /> Batches Done
                  </p>
                  <p className="text-2xl font-black text-slate-800 tabular-nums">
                    {analytics?.batches_completed ?? '—'}
                  </p>
                </div>

                <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-2.5 flex items-center gap-1.5 tracking-wider">
                    <ShieldAlert size={10} /> Status
                  </p>
                  <StatusDot isUsed={member?.is_used} />
                </div>

                <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 tracking-wider">Role</p>
                  <p className="text-sm font-bold text-slate-800 capitalize">
                    {member?.role?.replace('_', ' ') ?? '—'}
                  </p>
                </div>

                <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 tracking-wider">Business ID</p>
                  <p className="text-2xl font-black text-slate-800 tabular-nums">
                    #{member?.business_id ?? '—'}
                  </p>
                </div>

                {analytics?.quality_score != null && (
                  <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 tracking-wider">Quality Score</p>
                    <p className="text-2xl font-black text-slate-800 tabular-nums">
                      {analytics.quality_score}%
                    </p>
                  </div>
                )}

                {analytics?.incidents != null && (
                  <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 tracking-wider">Incidents</p>
                    <p className="text-2xl font-black text-slate-800 tabular-nums">
                      {analytics.incidents}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* If pending invite — no analytics yet */}
      {!loading && !error && !analytics && !member?.is_used && (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center ring-4 ring-amber-50/50">
            <Loader2 size={28} className="text-amber-400 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700">Invite Pending</p>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
              <span className="font-semibold text-slate-500">{member?.name}</span> hasn't accepted the invite yet.<br />
              Analytics will appear once they register.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FMAnalyticsPage;