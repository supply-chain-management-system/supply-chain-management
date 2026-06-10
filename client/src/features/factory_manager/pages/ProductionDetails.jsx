import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../../api/api';
import AlertBanner from '../component/alert';
import {
  ArrowLeft,
  Calendar,
  User,
  Cpu,
  Layers,
  Activity,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings,
  AlertCircle,
  FileText
} from 'lucide-react';

const ProductionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const tenantId = user?.schema_name || "t_yack_09bd7";

  const [detail, setDetail] = useState(null);
  const [eltHistory, setEltHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eltLoading, setEltLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetailData();
  }, [id]);

  const fetchDetailData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/production/factory/products/${id}`);
      setDetail(response.data);
      
      // Fetch historical ELT analytics from ClickHouse using product name
      if (response.data?.production?.product_name) {
        fetchEltHistory(response.data.production.product_name);
      }
    } catch (err) {
      console.error("Error loading production details:", err);
      setError("Failed to load production run details. It may have been deleted.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEltHistory = async (productName) => {
    setEltLoading(true);
    try {
      const response = await api.get(`elt/elt_production/production/${tenantId}/history/${productName}`);
      setEltHistory(response.data || []);
    } catch (err) {
      console.error("Error loading ClickHouse ELT analytics history:", err);
    } finally {
      setEltLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <svg className="animate-spin h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-slate-500 font-medium">Retrieving production data & dependencies...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <AlertBanner message={error || "Production job not found."} type="error" />
        <button
          onClick={() => navigate('/factorydash')}
          className="mt-6 flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { production, team, machinery, materials } = detail;
  const targetQty = production.target_qty || 1;
  const outputQty = production.output_qty || 0;
  const progressPercent = Math.min(100, Math.round((outputQty / targetQty) * 100));

  // Determine Badge Colors
  const statusColors = 
    production.status?.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
    production.status?.toLowerCase() === 'progress' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-800';

  const priorityColors = 
    production.priority?.toLowerCase() === 'high' ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/30' :
    production.priority?.toLowerCase() === 'medium' ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30' :
    'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800/50 dark:border-slate-800';

  // SVG Chart Calculations for ClickHouse ELT History
  const svgWidth = 500;
  const svgHeight = 150;
  const paddingX = 40;
  const paddingY = 20;

  const points = eltHistory.map((h, index) => {
    const x = paddingX + (index * (svgWidth - 2 * paddingX)) / Math.max(1, eltHistory.length - 1);
    const efficiency = Math.min(100, Math.max(0, parseFloat(h.efficiency) || 0));
    const y = svgHeight - paddingY - (efficiency * (svgHeight - 2 * paddingY)) / 100;
    return { x, y, eff: efficiency, date: h.created_at };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  return (
    <div className="space-y-8 p-1">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/factorydash')}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {production.product_name}
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold border rounded-full capitalize ${statusColors}`}>
                {production.status || 'pending'}
              </span>
              <span className={`px-2 py-0.5 text-xs font-semibold border rounded capitalize ${priorityColors}`}>
                {production.priority || 'medium'} Priority
              </span>
            </div>
            <p className="text-slate-400 text-xs font-mono mt-1">Job Reference: #{String(production.id).padStart(4, '0')}</p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Summary and Materials */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Production Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              Operational Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Target Output</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{production.target_qty} units</p>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Actual Yield</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{production.output_qty || 0} units</p>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Scrapped Waste</p>
                <p className="text-2xl font-black text-red-500 mt-1">{production.scrap_qty || 0} units</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Production Pipeline Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-400 dark:to-slate-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Creation and Notes */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Scheduled Date
                </p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {production.created_at ? new Date(production.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Production Notes
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                  {production.notes || 'No description notes provided for this run.'}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Machinery Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-slate-500" />
              Assigned Machinery
            </h3>
            {machinery.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50">
                <p className="text-sm text-slate-500">No machinery assigned to this production job yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {machinery.map((a) => (
                  <div key={a.id} className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-400">{a.machine.machine_code || 'MC-XXXX'}</span>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{a.machine.name}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        a.machine.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {a.machine.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block">Location</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{a.machine.location || 'Bay 1'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Efficiency Rating</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{a.machine.efficiency}%</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block">Assignment Notes</span>
                        <span className="italic">{a.notes || 'None'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consumed Materials Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-slate-500" />
              Consumed Raw Materials
            </h3>
            {materials.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50">
                <p className="text-sm text-slate-500">No material dispatch records linked to this production.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 pl-2">Material Name</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3 text-center">Quantity</th>
                      <th className="pb-3 text-right pr-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                    {materials.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-3 pl-2 font-semibold text-slate-800 dark:text-slate-200">{m.material.name}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            m.transaction_type === 'PRODUCTION_DISPATCH' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600'
                          }`}>
                            {m.transaction_type}
                          </span>
                        </td>
                        <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">
                          {m.quantity} {m.material.unit}
                        </td>
                        <td className="py-3 text-right pr-2 text-xs text-slate-400">
                          {m.timestamp ? new Date(m.timestamp).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Workforce Team and ClickHouse Analytics */}
        <div className="space-y-8">
          
          {/* Workforce Team Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-500" />
              Production Team
            </h3>
            {team.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50">
                <p className="text-sm text-slate-500">No worker team assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {team.map((t) => (
                  <div key={t.id} className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.worker.name}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                        {t.role || t.worker.role || 'Worker'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Email: <span className="text-slate-600 dark:text-slate-300">{t.worker.email || 'N/A'}</span></p>
                      <p>Phone: <span className="text-slate-600 dark:text-slate-300">{t.worker.phone || 'N/A'}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ClickHouse Historical Analytics Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-500" />
                ELT Analytics Trend
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                ClickHouse
              </span>
            </div>

            {eltLoading ? (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : eltHistory.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50">
                <p className="text-xs text-slate-500">No historical logs compiled by ClickHouse for this product line.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* SVG Trend Chart */}
                <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Efficiency Trend (Latest Runs)</p>
                  <div className="relative">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-32 overflow-visible">
                      <defs>
                        <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#64748b" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid Lines */}
                      <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1" />
                      <line x1={paddingX} y1={svgHeight/2} x2={svgWidth - paddingX} y2={svgHeight/2} stroke="#f1f5f9" strokeWidth="1" />
                      <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#e2e8f0" strokeWidth="1.5" />
                      
                      {/* Area & Line */}
                      {points.length > 1 && (
                        <>
                          <path d={areaPath} fill="url(#effGrad)" />
                          <path d={linePath} fill="none" stroke="#64748b" strokeWidth="2.5" />
                        </>
                      )}

                      {/* Circles for points */}
                      {points.map((pt, i) => (
                        <circle 
                          key={i} 
                          cx={pt.x} 
                          cy={pt.y} 
                          r="4" 
                          fill="#475569" 
                          className="hover:scale-150 transition-all cursor-pointer"
                        />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Runs list */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historical Runs</p>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
                    {eltHistory.map((run, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            Yield: {run.output_qty} / {run.target_qty} units
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {run.created_at ? new Date(run.created_at).toLocaleDateString() : 'Unknown Date'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {parseFloat(run.efficiency || 0).toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-400 block">Efficiency</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductionDetails;
