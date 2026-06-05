
import React, { useState, useEffect } from 'react';
import Layout from '../layout/dashboarslayout';
import AlertBanner from '../component/alert';
import { useNavigate } from 'react-router-dom';
import api from "../../../api/api";
import { 
  ClipboardList, 
  PlayCircle, 
  CheckCircle2, 
  Package,
  Plus,
  Cpu,
  Users,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Gauge,
  ArrowRight,
  Settings,
  Shield,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State variables for telemetry data
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [machines, setMachines] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const [prodRes, matRes, machRes, teamRes] = await Promise.all([
        api.get("production/factory/products"),
        api.get("/factory_material/materials/"),
        api.get("/factory_machine/machines/"),
        api.get("factory_team/factory/all_team")
      ]);

      setProducts(prodRes.data || []);
      setMaterials(matRes.data || []);
      setMachines(machRes.data || []);
      setTeams(teamRes.data || {});
      
      // Auto-select the first machine if available
      if (machRes.data && machRes.data.length > 0) {
        setSelectedMachine(machRes.data[0]);
      }
    } catch (err) {
      console.error("Error loading factory dashboard telemetry:", err);
      setError("Unable to sync telemetry from factory floor. Please verify connections.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper Stats Calculations
  const activeJobs = products.filter(p => p.status?.toLowerCase() === 'progress');
  const pendingJobs = products.filter(p => p.status?.toLowerCase() === 'pending');
  const completedJobs = products.filter(p => p.status?.toLowerCase() === 'completed');

  const totalMachines = machines.length;
  const availableMachines = machines.filter(m => m.status === 'available' || m.status === 'active' || m.status === 'in-use').length;
  const maintenanceMachines = machines.filter(m => m.status === 'maintenance').length;
  const inUseMachines = machines.filter(m => m.status === 'in-use').length;
  const machineAvailability = totalMachines > 0 ? Math.round((availableMachines / totalMachines) * 100) : 100;

  const lowStockMaterials = materials.filter(m => Number(m.current_stock) <= Number(m.low_stock_threshold));

  const totalOutput = products.reduce((acc, p) => acc + (p.output_qty || 0), 0);
  const totalTarget = products.reduce((acc, p) => acc + (p.target_qty || 0), 0);
  const productionCompletionRate = totalTarget > 0 ? Math.round((totalOutput / totalTarget) * 100) : 0;

  // Process data for the SVG Area Chart (use last 6 jobs)
  const chartJobs = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 6)
    .reverse();

  // Generate SVG path for area chart
  const generateChartPath = () => {
    if (chartJobs.length === 0) return { line: "", area: "", points: [] };
    const width = 500;
    const height = 150;
    const padding = 25;
    
    const maxQty = Math.max(...chartJobs.map(j => Math.max(j.target_qty || 1, j.output_qty || 1)), 100);
    const points = chartJobs.map((job, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(chartJobs.length - 1, 1);
      const y = height - padding - ((job.output_qty || 0) * (height - padding * 2)) / maxQty;
      return { x, y, job };
    });

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Smooth curve calculation
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    return { line: linePath, area: areaPath, points };
  };

  const { line: chartLinePath, area: chartAreaPath, points: chartPoints } = generateChartPath();

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
          </div>
          <p className="mt-4 font-semibold text-gray-600 dark:text-gray-400 animate-pulse">Syncing plant metrics...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-12">
        {/* Header Dashboard Control Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                Live Factory Feed
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(180deg, #94a3b8, #64748b)' }} />
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Factory Overview</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-4 text-sm">Real-time status of production line 04 — Sector B</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className={`p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 text-gray-600 dark:text-gray-300 transition-all ${refreshing ? 'cursor-not-allowed opacity-60' : 'hover:scale-105'}`}
              title="Refresh telemetry data"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button 
              onClick={() => navigate('/production')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-200 dark:shadow-none hover:opacity-95 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <Plus className="w-5 h-5" />
              New Job
            </button>
          </div>
        </div>

        {/* Global Connection / Data Errors */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button onClick={() => fetchDashboardData()} className="text-xs font-bold underline hover:text-red-800">Retry Sync</button>
          </div>
        )}

        {/* Active Material Alerts Banner */}
        <div className="space-y-2">
          {lowStockMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockMaterials.map((mat) => (
                <div 
                  key={mat.id} 
                  onClick={() => navigate('/factory_material')}
                  className="group flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-50 hover:shadow-sm transition-all animate-slide-up"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-all">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wide">{mat.name}</h4>
                      <p className="text-xs text-amber-700 font-medium">Stock levels critical: {mat.current_stock} {mat.unit}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">All Inventory Balances Healthy</p>
                <p className="text-xs text-emerald-600">No stock shortages detected across current raw materials list.</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Operations KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Lines */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all hover:translate-y-[-1px] group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Active Lines</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1.5">{activeJobs.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlayCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-gray-500">
              <span className="text-gray-400">{pendingJobs.length} jobs pending scheduling</span>
            </div>
          </div>

          {/* Card 2: Telemetry Machines availability */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all hover:translate-y-[-1px] group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Machine Readiness</p>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-500 mt-1.5">{machineAvailability}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gauge className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-gray-500">
              <span className="text-gray-400">{availableMachines} of {totalMachines} units online</span>
            </div>
          </div>

          {/* Card 3: Material shortages */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all hover:translate-y-[-1px] group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Stock Shortages</p>
                <p className={`text-3xl font-extrabold mt-1.5 ${lowStockMaterials.length > 0 ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>{lowStockMaterials.length}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${lowStockMaterials.length > 0 ? 'bg-amber-50 dark:bg-amber-950/45 text-amber-600 dark:text-amber-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-500'}`}>
                <Package className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-gray-500">
              <span className="text-gray-400">{materials.length} total resource items tracked</span>
            </div>
          </div>

          {/* Card 4: Total Completed Units */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all hover:translate-y-[-1px] group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Units Output Ratio</p>
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1.5">{productionCompletionRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-gray-500">
              <span className="text-gray-400">{totalOutput.toLocaleString()} / {totalTarget.toLocaleString()} units produced</span>
            </div>
          </div>
        </div>

        {/* Dashboard Panels Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column (Active Jobs & Analytics Chart) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* SVG Interactive Output Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Completed Output Telemetry</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tracking output quantities generated from latest production jobs</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Units Output</span>
                  </div>
                </div>
              </div>

              {chartJobs.length > 0 ? (
                <div className="relative">
                  <svg viewBox="0 0 500 150" className="w-full h-44 overflow-visible">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="25" y1="25" x2="475" y2="25" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-800" />
                    <line x1="25" y1="75" x2="475" y2="75" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-800" />
                    <line x1="25" y1="125" x2="475" y2="125" stroke="#f3f4f6" strokeWidth="1.5" className="dark:stroke-gray-800" />

                    {/* Area path */}
                    <path d={chartAreaPath} fill="url(#chartGrad)" />

                    {/* Stroke line */}
                    <path d={chartLinePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Data Points */}
                    {chartPoints.map((pt, i) => (
                      <g key={i}>
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r={hoveredDataPoint === i ? "6" : "4.5"} 
                          className="fill-blue-600 stroke-white stroke-2 cursor-pointer transition-all dark:stroke-gray-900"
                          onMouseEnter={() => setHoveredDataPoint(i)}
                          onMouseLeave={() => setHoveredDataPoint(null)}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Horizontal Labels */}
                  <div className="flex justify-between px-6 pt-2 border-t border-gray-100 dark:border-gray-800 mt-1">
                    {chartJobs.map((job, idx) => (
                      <div key={job.id} className="text-center w-16">
                        <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate" title={job.product_name}>{job.product_name}</p>
                        <p className="text-[9px] font-semibold text-gray-400">Qty: {job.output_qty}</p>
                      </div>
                    ))}
                  </div>

                  {/* Hover Tooltip Popup */}
                  {hoveredDataPoint !== null && (
                    <div 
                      className="absolute p-3 bg-gray-900 text-white rounded-xl shadow-xl text-xs space-y-1 z-20 pointer-events-none transition-all duration-150 animate-fade-in"
                      style={{
                        left: `${(hoveredDataPoint * (100 / (chartJobs.length - 1))) - (hoveredDataPoint === 0 ? 0 : hoveredDataPoint === chartJobs.length - 1 ? 26 : 13)}%`,
                        bottom: '90px'
                      }}
                    >
                      <p className="font-bold text-blue-300">{chartJobs[hoveredDataPoint].product_name}</p>
                      <p className="text-[10px] text-gray-300">Target: <span className="font-bold text-white">{chartJobs[hoveredDataPoint].target_qty}</span></p>
                      <p className="text-[10px] text-gray-300">Produced: <span className="font-bold text-emerald-400">{chartJobs[hoveredDataPoint].output_qty}</span></p>
                      <p className="text-[9px] text-gray-400">Line ID: #{chartJobs[hoveredDataPoint].id}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400 text-sm">No output logs recorded to plot.</div>
              )}
            </div>

            {/* Active Production Lines Panel */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Production Lines</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current active manufacturing jobs running on the floor</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                  {activeJobs.length} RUNNING
                </span>
              </div>

              {activeJobs.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl text-center text-gray-500 dark:text-gray-400 text-sm">
                  <PlayCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-800 dark:text-white">No active jobs running</p>
                  <p className="text-xs text-gray-400 mt-1">Configure lines and start pending jobs in the Production tab.</p>
                  <button 
                    onClick={() => navigate('/production')}
                    className="mt-4 px-4 py-2 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    Go to Production
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map((job) => {
                    const progress = job.target_qty > 0 ? Math.min(Math.round((job.output_qty / job.target_qty) * 100), 100) : 0;
                    return (
                      <div key={job.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900 transition-all bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{job.product_name}</h4>
                            <p className="text-xs text-gray-400 font-mono">Job ID: #{job.id} • Factory ID: #{job.factory_id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">
                              {job.output_qty} / {job.target_qty} Units
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              {progress}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Machines & Teams telemetry) */}
          <div className="space-y-6">
            
            {/* Live Machine Telemetry grid */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Industrial Equipment</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Live hardware status signals</p>
                </div>
                <Settings 
                  className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors"
                  onClick={() => navigate('/factory_machine')}
                />
              </div>

              {machines.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">No machine telemetry available.</p>
              ) : (
                <div className="space-y-3">
                  {machines.slice(0, 5).map((mach) => {
                    const isMaint = mach.status === 'maintenance';
                    const isAvailable = mach.status === 'available' || mach.status === 'active';
                    const isInUse = mach.status === 'in-use';

                    let indicatorColor = 'bg-gray-400';
                    let statusLabel = mach.status;
                    if (isMaint) {
                      indicatorColor = 'bg-red-500 animate-pulse';
                      statusLabel = 'Maintenance';
                    } else if (isAvailable) {
                      indicatorColor = 'bg-green-500';
                      statusLabel = 'Available';
                    } else if (isInUse) {
                      indicatorColor = 'bg-amber-500';
                      statusLabel = 'In Use';
                    }

                    return (
                      <div 
                        key={mach.id}
                        onClick={() => setSelectedMachine(mach)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedMachine?.id === mach.id ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${indicatorColor}`}></div>
                          <div>
                            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{mach.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">{mach.status || 'Active'}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">#{mach.id}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selected Machine Telemetry Panel */}
              {selectedMachine && (
                <div className="mt-5 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2.5 animate-slide-up">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Specs Cockpit</span>
                    <span className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer" onClick={() => navigate('/factory_machine')}>Full Details</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-gray-800 dark:text-white">{selectedMachine.name}</h5>
                    <p className="text-xs text-gray-500">Maint: {selectedMachine.last_maintenance_date || 'None scheduled'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-gray-400 text-[10px]">Readiness</p>
                      <p className="font-bold text-gray-800 dark:text-white mt-0.5">{selectedMachine.status === 'maintenance' ? 'Offline' : '100%'}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-gray-400 text-[10px]">Status</p>
                      <p className={`font-bold mt-0.5 uppercase ${selectedMachine.status === 'maintenance' ? 'text-red-500' : 'text-emerald-500'}`}>{selectedMachine.status || 'Active'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Allocated Operations Teams */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Teams Map</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Personnel allocation across active lines</p>
                </div>
                <Users 
                  className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors"
                  onClick={() => navigate('/factoryteam')}
                />
              </div>

              {Object.keys(teams).length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-sm">No team deployments.</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(teams).slice(0, 3).map(([prodId, members]) => {
                    const job = products.find(p => String(p.id) === String(prodId));
                    return (
                      <div key={prodId} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {job ? job.product_name : `Line ID: #${prodId}`}
                          </span>
                          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                            {members.length} members
                          </span>
                        </div>
                        <div className="flex -space-x-2 overflow-hidden py-1">
                          {members.map((member, mIdx) => (
                            <div 
                              key={member.id || mIdx}
                              title={`${member.name} (${member.role})`}
                              className="inline-block h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-gray-900 cursor-help"
                            >
                              {member.name ? member.name.substring(0, 2).toUpperCase() : 'W'}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      
      {/* Keyframes Animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { 
          from { opacity: 0; transform: translateY(16px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </Layout>
  );
};

export default Dashboard;


