import React from 'react';
import {
  Truck,
  Package,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Circle,
  RefreshCw,
  MoreHorizontal,
  Navigation,
  Fuel,
  Thermometer,
  Wifi,
} from 'lucide-react';

// ─── Shared helpers ────────────────────────────────────────────────────────────

const glass =
  'bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] rounded-2xl';

const StatusBadge = ({ status }) => {
  const map = {
    'In Transit': {
      dot: 'bg-blue-400',
      text: 'text-blue-400',
      bg: 'bg-blue-500/[0.12]',
      border: 'border-blue-500/20',
    },
    Pending: {
      dot: 'bg-amber-400',
      text: 'text-amber-400',
      bg: 'bg-amber-500/[0.12]',
      border: 'border-amber-500/20',
    },
    Delivered: {
      dot: 'bg-emerald-400',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/[0.12]',
      border: 'border-emerald-500/20',
    },
    Delayed: {
      dot: 'bg-red-400',
      text: 'text-red-400',
      bg: 'bg-red-500/[0.12]',
      border: 'border-red-500/20',
    },
  };
  const s = map[status] ?? map['Pending'];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

// ─── Mini sparkline bars ────────────────────────────────────────────────────────
const Sparkline = ({ data, color }) => (
  <div className="flex items-end gap-[3px] h-8">
    {data.map((v, i) => (
      <div
        key={i}
        className={`w-1.5 rounded-sm ${color} opacity-60`}
        style={{ height: `${(v / Math.max(...data)) * 100}%` }}
      />
    ))}
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, delta, deltaUp, sparkData, color, glowColor }) => (
  <div
    className={`${glass} p-5 flex flex-col gap-4 cursor-pointer
      transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]
      hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]`}
  >
    <div className="flex items-start justify-between">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
        style={{ background: glowColor, boxShadow: `0 0 20px ${glowColor}55` }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>

      {delta !== undefined && (
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg ${
            deltaUp
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-red-400 bg-red-500/10'
          }`}
        >
          {deltaUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {delta}
        </div>
      )}
    </div>

    <div>
      <p className="text-2xl font-bold text-white tracking-tight leading-none">{value}</p>
      <p className="text-xs text-slate-500 mt-1 leading-none">{label}</p>
    </div>

    {sparkData && <Sparkline data={sparkData} color={color} />}
  </div>
);

// ─── Shipment row ───────────────────────────────────────────────────────────────
const ShipmentRow = ({ id, destination, status, eta, driver, weight }) => (
  <tr className="group border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-150">
    <td className="py-3.5 px-4">
      <span className="font-mono text-sm font-semibold text-blue-400">{id}</span>
    </td>
    <td className="py-3.5 px-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-sm text-slate-200">{destination}</span>
      </div>
    </td>
    <td className="py-3.5 px-4">
      <span className="text-xs text-slate-500">{driver}</span>
    </td>
    <td className="py-3.5 px-4">
      <span className="text-xs text-slate-400">{weight}</span>
    </td>
    <td className="py-3.5 px-4">
      <StatusBadge status={status} />
    </td>
    <td className="py-3.5 px-4">
      <span className="text-xs text-slate-400">{eta}</span>
    </td>
    <td className="py-3.5 px-4">
      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </td>
  </tr>
);

// ─── Activity item ──────────────────────────────────────────────────────────────
const ActivityItem = ({ icon: Icon, color, text, time, isLast }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      {!isLast && <div className="w-px flex-1 bg-white/[0.05] mt-1 mb-1 min-h-[1.5rem]" />}
    </div>
    <div className="pb-4">
      <p className="text-sm text-slate-300 leading-snug">{text}</p>
      <p className="text-xs text-slate-600 mt-0.5">{time}</p>
    </div>
  </div>
);

// ─── Vehicle tile ───────────────────────────────────────────────────────────────
const VehicleTile = ({ id, route, fuel, status }) => {
  const statusMap = {
    Active: 'text-emerald-400 bg-emerald-500/10',
    Idle: 'text-amber-400 bg-amber-500/10',
    Maintenance: 'text-red-400 bg-red-500/10',
  };
  return (
    <div className={`${glass} p-4 hover:border-white/[0.12] transition-all duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-white">{id}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusMap[status]}`}>
          {status}
        </span>
      </div>
      <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
        <Navigation className="w-3 h-3" /> {route}
      </p>
      <div className="flex items-center gap-2">
        <Fuel className="w-3 h-3 text-slate-600" />
        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              fuel > 60 ? 'bg-emerald-500' : fuel > 30 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${fuel}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-500">{fuel}%</span>
      </div>
    </div>
  );
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
const LogisticsDashboard = () => {
  const stats = [
    {
      icon: Truck,
      label: 'Active Vehicles',
      value: '42',
      delta: '+3 today',
      deltaUp: true,
      sparkData: [30, 45, 38, 50, 42, 60, 55, 70, 65, 42],
      color: 'bg-blue-500',
      glowColor: 'rgba(59,130,246,0.8)',
    },
    {
      icon: Package,
      label: 'Deliveries Today',
      value: '128',
      delta: '+12%',
      deltaUp: true,
      sparkData: [80, 95, 88, 110, 105, 120, 115, 128, 122, 128],
      color: 'bg-emerald-500',
      glowColor: 'rgba(16,185,129,0.8)',
    },
    {
      icon: Clock,
      label: 'Pending Shipments',
      value: '15',
      delta: '-2 cleared',
      deltaUp: true,
      sparkData: [20, 22, 18, 25, 17, 20, 16, 18, 17, 15],
      color: 'bg-amber-500',
      glowColor: 'rgba(245,158,11,0.8)',
    },
    {
      icon: AlertTriangle,
      label: 'Critical Alerts',
      value: '3',
      delta: '+1',
      deltaUp: false,
      sparkData: [1, 2, 1, 3, 2, 4, 2, 3, 4, 3],
      color: 'bg-red-500',
      glowColor: 'rgba(239,68,68,0.8)',
    },
  ];

  const shipments = [
    { id: '#SHP-1001', destination: 'New York, NY', driver: 'James K.', weight: '2.4 t', status: 'In Transit', eta: 'Today, 2:30 PM' },
    { id: '#SHP-1002', destination: 'Los Angeles, CA', driver: 'Maria S.', weight: '1.8 t', status: 'Pending', eta: 'Tomorrow, 10:00 AM' },
    { id: '#SHP-1003', destination: 'Chicago, IL', driver: 'Tom R.', weight: '3.1 t', status: 'Delivered', eta: 'Today, 9:15 AM' },
    { id: '#SHP-1004', destination: 'Houston, TX', driver: 'Sara L.', weight: '0.9 t', status: 'In Transit', eta: 'Today, 4:45 PM' },
    { id: '#SHP-1005', destination: 'Phoenix, AZ', driver: 'Mark D.', weight: '2.0 t', status: 'Delayed', eta: 'Tomorrow, 3:00 PM' },
  ];

  const activities = [
    { icon: CheckCircle2, color: 'bg-emerald-600', text: 'SHP-1003 delivered to Chicago, IL', time: '9:15 AM' },
    { icon: Truck, color: 'bg-blue-600', text: 'SHP-1001 departed Nashville depot', time: '8:42 AM' },
    { icon: AlertTriangle, color: 'bg-red-600', text: 'SHP-1005 delayed — traffic on I-10', time: '8:10 AM' },
    { icon: RefreshCw, color: 'bg-amber-600', text: 'Route #R-07 recalculated', time: '7:55 AM' },
    { icon: Circle, color: 'bg-slate-600', text: 'SHP-1002 queued for departure', time: '7:30 AM' },
  ];

  const vehicles = [
    { id: 'TRK-001', route: 'Nashville → New York', fuel: 72, status: 'Active' },
    { id: 'TRK-004', route: 'Dallas → Houston', fuel: 45, status: 'Active' },
    { id: 'TRK-007', route: 'Depot — Standby', fuel: 88, status: 'Idle' },
    { id: 'TRK-012', route: 'Service Centre', fuel: 20, status: 'Maintenance' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">

      {/* ── Page heading ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Sunday, 18 May 2026 · Last updated <span className="text-slate-400">just now</span>
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white
                     transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Row 2: Shipments table + Activity feed ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

        {/* Shipments table */}
        <div className={`${glass} overflow-hidden`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-sm font-semibold text-white">Recent Shipments</h2>
              <p className="text-xs text-slate-500 mt-0.5">Showing last 5 shipments</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {['Shipment ID', 'Destination', 'Driver', 'Weight', 'Status', 'ETA', ''].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => <ShipmentRow key={s.id} {...s} />)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feed */}
        <div className={`${glass} flex flex-col`}>
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Live Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time events</p>
          </div>
          <div className="flex-1 px-5 pt-5 overflow-y-auto">
            {activities.map((a, i) => (
              <ActivityItem key={i} {...a} isLast={i === activities.length - 1} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Fleet overview + Tracking panel ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">

        {/* Fleet grid */}
        <div className={`${glass} overflow-hidden`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-sm font-semibold text-white">Fleet Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live vehicle status</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Manage fleet <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {vehicles.map(v => <VehicleTile key={v.id} {...v} />)}
          </div>
        </div>

        {/* Tracking map placeholder */}
        <div className={`${glass} flex flex-col overflow-hidden`}>
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Live Tracking</h2>
                <p className="text-xs text-slate-500 mt-0.5">42 vehicles on road</p>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                <Wifi className="w-3 h-3" /> LIVE
              </span>
            </div>
          </div>

          {/* Map area */}
          <div className="flex-1 relative m-4 rounded-xl overflow-hidden min-h-[240px]"
               style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.05) 50%, rgba(0,0,0,0.3) 100%)' }}>
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Pulse dots for vehicles */}
            {[
              { left: '25%', top: '35%' },
              { left: '60%', top: '55%' },
              { left: '42%', top: '20%' },
              { left: '75%', top: '40%' },
            ].map((pos, i) => (
              <div key={i} className="absolute" style={pos}>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border-2 border-white/30" />
                </span>
              </div>
            ))}

            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 gap-1 pointer-events-none">
              <MapPin className="w-5 h-5 text-slate-600" />
              <p className="text-xs text-slate-600">Interactive map integration</p>
            </div>
          </div>

          {/* Temperature & telemetry strip */}
          <div className="px-4 pb-4 grid grid-cols-3 gap-2">
            {[
              { icon: Thermometer, label: 'Avg Temp', value: '22°C', color: 'text-orange-400' },
              { icon: Fuel, label: 'Avg Fuel', value: '64%', color: 'text-blue-400' },
              { icon: Navigation, label: 'On Route', value: '38 / 42', color: 'text-emerald-400' },
            ].map(({ icon: I, label, value, color }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                <I className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                <p className="text-[11px] font-bold text-white leading-none">{value}</p>
                <p className="text-[9px] text-slate-600 mt-0.5 leading-none">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default LogisticsDashboard;
