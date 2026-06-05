import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  TrendingUp,
  Activity,
  Truck,
  Package,
  Clock,
  Compass,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { fetchShipments, fetchVehicles } from '../../../redux/logisticsDashboardSlice';

const LogisticsAnalyticsPage = () => {
  const dispatch = useDispatch();
  const { shipments, vehicles } = useSelector((state) => state.logisticsDashboard);

  useEffect(() => {
    dispatch(fetchShipments());
    dispatch(fetchVehicles());
  }, [dispatch]);

  // Derived KPI metrics
  const activeFleet = vehicles.filter(v => v.status === 'Active').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'Maintenance').length;
  const deliverySuccessRate = shipments.length > 0
    ? ((shipments.filter(s => s.status === 'Delivered').length / shipments.length) * 100).toFixed(1)
    : "95.5";
  const totalFleetCapacity = vehicles.reduce((sum, v) => sum + Number(v.capacity_kg || 0), 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Analytics & Reports</h1>
          <p className="text-xs text-white/40 mt-0.5">Fleet operations metrics, stand dwell times, and delivery performance metrics</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'On-Time Delivery Rate', value: `${deliverySuccessRate}%`, icon: Activity, trend: '+0.8% from last week' },
          { label: 'Active Fleet Ratio', value: `${activeFleet}/${vehicles.length || 4}`, icon: Truck, trend: `${maintenanceCount} in maintenance` },
          { label: 'Avg Stand Dwell Time', value: '42 mins', icon: Clock, trend: '-6% dwell duration' },
          { label: 'Total Capacity Managed', value: `${totalFleetCapacity.toLocaleString()} kg`, icon: Package, trend: 'Optimal distribution' },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-5 flex flex-col justify-between hover:border-white/[0.1] transition-all">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-white/40">{card.label}</p>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  {card.trend}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Delivery trends bar chart (SVG) */}
        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-5 lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Daily Dispatch Volume</h2>
            <p className="text-[10px] text-white/30">Number of shipments dispatched over the last 7 days</p>
          </div>
          
          <div className="relative h-60 w-full bg-[#0c0c0c] border border-white/[0.04] rounded-lg p-4 flex items-end justify-between">
            {/* Custom SVG Bar Chart */}
            {[
              { day: 'Mon', count: 12, height: '40%' },
              { day: 'Tue', count: 18, height: '60%' },
              { day: 'Wed', count: 24, height: '80%' },
              { day: 'Thu', count: 15, height: '50%' },
              { day: 'Fri', count: 30, height: '100%' },
              { day: 'Sat', count: 8, height: '28%' },
              { day: 'Sun', count: 10, height: '35%' },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-emerald-400 transition-opacity bg-black/60 px-1 border border-white/[0.06] rounded font-mono">
                  {bar.count}
                </span>
                <div
                  className="w-8 sm:w-12 bg-emerald-500/20 group-hover:bg-emerald-500 rounded-t-md transition-all duration-300 relative overflow-hidden"
                  style={{ height: bar.height }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/40 to-transparent" />
                </div>
                <span className="text-[10px] text-white/35 font-medium">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Fuel level indicator / Emissions (SVG circular chart) */}
        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Stand Dwell Efficiency</h2>
            <p className="text-[10px] text-white/30">Ratio of stands dwell targets met</p>
          </div>

          <div className="my-6 flex justify-center relative">
            <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="#10b981"
                strokeWidth="10"
                strokeDasharray="402"
                strokeDashoffset="88" // 78% ratio
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-white">78%</p>
              <p className="text-[9px] uppercase tracking-wider text-white/35 mt-0.5">Target Met</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'On Time Departures', value: '82%', statusColor: 'bg-emerald-500' },
              { label: 'Loading Efficiency', value: '74%', statusColor: 'bg-emerald-400' },
            ].map((metric, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${metric.statusColor}`} />
                  <span className="text-white/60">{metric.label}</span>
                </div>
                <span className="font-bold text-white">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LogisticsAnalyticsPage;
