import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboardStats,
  fetchShipments,
  fetchActivities,
  fetchVehicles,
} from '../../redux/logisticsDashboardSlice';
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
  RefreshCw,
  MoreHorizontal,
  Navigation,
  Wifi,
  Circle,
  Activity,
} from 'lucide-react';

// ─── Shared ────────────────────────────────────────────────────────────────────

const card = 'bg-[#0f0f0f] border border-white/[0.07] rounded-xl';

// ─── Status badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    'In Transit': 'bg-green-500/10 text-green-400 border-green-500/20',
    Delivered:    'bg-white/[0.06] text-white/70 border-white/[0.08]',
    Pending:      'bg-white/[0.04] text-white/40 border-white/[0.06]',
    Delayed:      'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const dotColors = {
    'In Transit': 'bg-green-400',
    Delivered:    'bg-white/50',
    Pending:      'bg-white/20',
    Delayed:      'bg-red-400',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
        styles[status] ?? styles['Pending']
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[status] ?? dotColors['Pending']}`} />
      {status}
    </span>
  );
};

// ─── Mini sparkline ─────────────────────────────────────────────────────────────
const Sparkline = ({ data, green }) => (
  <div className="flex items-end gap-[2px] h-7">
    {data.map((v, i) => {
      const pct = (v / Math.max(...data)) * 100;
      return (
        <div
          key={i}
          className={`flex-1 rounded-sm ${green ? 'bg-green-500' : 'bg-white/20'}`}
          style={{ height: `${pct}%`, opacity: 0.5 + (i / data.length) * 0.5 }}
        />
      );
    })}
  </div>
);

// ─── Stat card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, delta, deltaUp, sparkData, green }) => (
  <div className={`${card} p-5 flex flex-col gap-4 cursor-default
    transition-all duration-200 hover:border-white/[0.12] hover:bg-[#111]`}>
    <div className="flex items-start justify-between">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          green ? 'bg-green-500/15' : 'bg-white/[0.06]'
        }`}
      >
        <Icon
          style={{ width: '16px', height: '16px' }}
          className={green ? 'text-green-400' : 'text-white/50'}
        />
      </div>

      {delta && (
        <div
          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
            deltaUp
              ? 'text-green-400 bg-green-500/10'
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
      <p className="text-xs text-white/35 mt-1 leading-none">{label}</p>
    </div>

    {sparkData && <Sparkline data={sparkData} green={green} />}
  </div>
);

// ─── Shipment row ────────────────────────────────────────────────────────────────
const ShipmentRow = ({ id, destination, driver, weight, status, eta }) => (
  <tr className="group border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-100">
    <td className="py-3 px-4">
      <span className="font-mono text-xs font-semibold text-green-400">{id}</span>
    </td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-white/20 shrink-0" />
        <span className="text-xs text-white/70">{destination}</span>
      </div>
    </td>
    <td className="py-3 px-4">
      <span className="text-xs text-white/40">{driver}</span>
    </td>
    <td className="py-3 px-4">
      <span className="text-xs text-white/40">{weight}</span>
    </td>
    <td className="py-3 px-4">
      <StatusBadge status={status} />
    </td>
    <td className="py-3 px-4">
      <span className="text-xs text-white/40">{eta}</span>
    </td>
    <td className="py-3 px-4">
      <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/[0.06] text-white/30 hover:text-white/70 transition-all">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </td>
  </tr>
);

// ─── Activity item ───────────────────────────────────────────────────────────────
const ActivityItem = ({ icon: Icon, green, text, time, isLast }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center shrink-0">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center
        ${green ? 'bg-green-500/15' : 'bg-white/[0.06]'}`}>
        <Icon style={{ width: '12px', height: '12px' }} className={green ? 'text-green-400' : 'text-white/40'} />
      </div>
      {!isLast && <div className="w-px flex-1 bg-white/[0.04] mt-1 min-h-[1rem]" />}
    </div>
    <div className="pb-3.5">
      <p className="text-xs text-white/70 leading-snug">{text}</p>
      <p className="text-[10px] text-white/25 mt-0.5">{time}</p>
    </div>
  </div>
);

// ─── Vehicle tile ────────────────────────────────────────────────────────────────
const VehicleTile = ({ id, stop_warehouse_name, capacity_kg, vehicle_type, status }) => {
  const statusCls = {
    Active:      'text-green-400 bg-green-500/10',
    Idle:        'text-white/50 bg-white/[0.06]',
    Maintenance: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className={`${card} p-4 hover:border-white/[0.11] transition-all duration-150`}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-white/30" />
          <span className="text-xs font-semibold text-white">{id}</span>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusCls[status]}`}>
          {status}
        </span>
      </div>
      <p className="text-[10px] text-white/30 flex items-center gap-1 mb-3 truncate">
        <MapPin className="w-3 h-3 shrink-0" /> {stop_warehouse_name}
      </p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] text-white/35 flex items-center gap-1 truncate">
          <Package className="w-3 h-3 shrink-0" /> {Number(capacity_kg || 0).toLocaleString()} kg
        </span>
        <span className="text-[9px] text-white/30 truncate">{vehicle_type}</span>
      </div>
    </div>
  );
};

// ─── KPI row ─────────────────────────────────────────────────────────────────────
const KpiChip = ({ icon: Icon, label, value }) => (
  <div className="flex-1 flex flex-col items-center gap-1 py-3 border-r border-white/[0.05] last:border-r-0">
    <Icon className="w-4 h-4 text-green-400" />
    <p className="text-sm font-bold text-white tabular-nums">{value}</p>
    <p className="text-[9px] text-white/25 uppercase tracking-wide">{label}</p>
  </div>
);

// ─── Main ────────────────────────────────────────────────────────────────────────
const LogisticsDashboard = () => {
  const dispatch = useDispatch();
  const { stats, shipments, activities, vehicles, loading } = useSelector(
    (state) => state.logisticsDashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchShipments());
    dispatch(fetchActivities());
    dispatch(fetchVehicles());
  }, [dispatch]);

  const defaultStats = [
    {
      icon: Truck,
      label: 'Active Vehicles',
      value: '-',
      delta: 'Loading...',
      deltaUp: true,
      sparkData: [10, 10, 10],
      green: true,
    },
    {
      icon: Package,
      label: 'Deliveries Today',
      value: '-',
      delta: 'Loading...',
      deltaUp: true,
      sparkData: [10, 10, 10],
      green: false,
    },
    {
      icon: Clock,
      label: 'Pending Shipments',
      value: '-',
      delta: 'Loading...',
      deltaUp: true,
      sparkData: [10, 10, 10],
      green: false,
    },
    {
      icon: AlertTriangle,
      label: 'Critical Alerts',
      value: '-',
      delta: 'Loading...',
      deltaUp: false,
      sparkData: [10, 10, 10],
      green: false,
    },
  ];

  const displayStats = stats && stats.length === 4 ? stats.map((s, idx) => ({
    ...s,
    icon: [Truck, Package, Clock, AlertTriangle][idx]
  })) : defaultStats;

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'CheckCircle2': return CheckCircle2;
      case 'Truck': return Truck;
      case 'AlertTriangle': return AlertTriangle;
      case 'RefreshCw': return RefreshCw;
      case 'Circle': default: return Circle;
    }
  };

  const displayActivities = activities.map(a => ({
    ...a,
    icon: getIcon(a.icon)
  }));

  const handleRefresh = () => {
    dispatch(fetchDashboardStats());
    dispatch(fetchShipments());
    dispatch(fetchActivities());
    dispatch(fetchVehicles());
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">

      {/* ── Heading ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-white/30 mt-0.5">
            Real-time Logistics Control Tower
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400
                     text-xs font-semibold text-black transition-all duration-150 hover:-translate-y-0.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${Object.values(loading).some(v => v) ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {displayStats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── KPI strip ── */}
      <div className={`${card} flex divide-x divide-white/[0.05]`}>
        <KpiChip icon={Activity}     label="On-Time Rate"  value="94.2%" />
        <KpiChip icon={Truck}        label="Fleet Util."   value="78%"   />
        <KpiChip icon={Package}      label="Avg Delivery"  value="1.4 d" />
        <KpiChip icon={Navigation}   label="km Driven"     value="12.4k" />
      </div>

      {/* ── Row: Shipments + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">

        {/* Shipments table */}
        <div className={`${card} overflow-hidden`}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
            <div>
              <h2 className="text-sm font-semibold text-white">Recent Shipments</h2>
              <p className="text-[10px] text-white/30 mt-0.5">Last 5 active shipments</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-medium text-green-400 hover:text-green-300 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {['ID', 'Destination', 'Driver', 'Weight', 'Status', 'ETA', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[9px] font-semibold text-white/25 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => <ShipmentRow key={s.id} {...s} />)}
              </tbody>
            </table>
            {shipments.length === 0 && !loading.shipments && (
               <div className="p-6 text-center text-xs text-white/30">No shipments found</div>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className={`${card} flex flex-col`}>
          <div className="px-4 py-3.5 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Live Activity</h2>
            <p className="text-[10px] text-white/30 mt-0.5">Real-time events</p>
          </div>
          <div className="flex-1 px-4 pt-4 space-y-0">
            {displayActivities.map((a, i) => (
              <ActivityItem key={i} {...a} isLast={i === displayActivities.length - 1} />
            ))}
            {displayActivities.length === 0 && !loading.activities && (
              <div className="text-center text-xs text-white/30 pt-4">No recent activity</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row: Fleet + Tracking ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">

        {/* Fleet grid */}
        <div className={`${card} overflow-hidden`}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
            <div>
              <h2 className="text-sm font-semibold text-white">Fleet Overview</h2>
              <p className="text-[10px] text-white/30 mt-0.5">Live vehicle status</p>
            </div>
            <button
              onClick={() => window.location.href = '/logistics_fleet'}
              className="flex items-center gap-1 text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {vehicles.map(v => <VehicleTile key={v.id} {...v} />)}
            {vehicles.length === 0 && !loading.vehicles && (
               <div className="col-span-2 p-6 text-center text-xs text-white/30">No vehicles tracked</div>
            )}
          </div>
        </div>

        {/* Tracking panel */}
        <div className={`${card} flex flex-col overflow-hidden`}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
            <div>
              <h2 className="text-sm font-semibold text-white">Stand Overview</h2>
              <p className="text-[10px] text-white/30 mt-0.5">{vehicles.length} vehicles assigned to warehouse stands</p>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
              <Wifi className="w-2.5 h-2.5" /> LIVE
            </span>
          </div>

          {/* Map area */}
          <div
            className="mx-4 mt-4 rounded-lg overflow-hidden relative flex-1 min-h-[200px] bg-[#0a0a0a] border border-white/[0.05]"
          >
            {/* Grid SVG */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="mapgrid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 28 0 L 0 0 0 28" fill="none" stroke="white" strokeWidth="0.3" strokeOpacity="0.08"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mapgrid)" />
            </svg>

            {/* Stand connection lines */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <line x1="20%" y1="70%" x2="65%" y2="30%" stroke="#4ade80" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 3"/>
              <line x1="65%" y1="30%" x2="85%" y2="55%" stroke="#4ade80" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="4 3"/>
              <line x1="30%" y1="40%" x2="60%" y2="65%" stroke="white" strokeWidth="1" strokeOpacity="0.08" strokeDasharray="4 3"/>
            </svg>

            {/* Vehicle pings */}
            {[
              { left: '22%', top: '68%' },
              { left: '63%', top: '28%' },
              { left: '42%', top: '45%' },
              { left: '83%', top: '53%' },
            ].map((pos, i) => (
              <div key={i} className="absolute" style={pos}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" style={{ animationDelay: `${i * 0.4}s` }} />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400 border border-black" />
                </span>
              </div>
            ))}

            {/* Label */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
              <span className="text-[9px] text-white/20">Map integration placeholder</span>
            </div>
          </div>

          {/* Telemetry row */}
          <div className="grid grid-cols-3 gap-2 p-4">
            {[
              { icon: Package,    label: 'Capacity', value: `${vehicles.reduce((sum, v) => sum + Number(v.capacity_kg || 0), 0).toLocaleString()} kg` },
              { icon: Navigation, label: 'Active',   value: `${vehicles.filter(v => v.status === 'Active').length}/${vehicles.length || 1}` },
              { icon: Activity,   label: 'Stands',   value: new Set(vehicles.map(v => v.stop_warehouse_name).filter(Boolean)).size },
            ].map(({ icon: I, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-lg">
                <I className="w-3.5 h-3.5 text-green-400" />
                <p className="text-xs font-bold text-white leading-none tabular-nums">{value}</p>
                <p className="text-[9px] text-white/25 leading-none">{label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LogisticsDashboard;
