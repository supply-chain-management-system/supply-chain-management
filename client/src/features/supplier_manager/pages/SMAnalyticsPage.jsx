import { useEffect } from 'react';
import {
  Building2, Star, Clock, AlertTriangle, ArrowLeft, Mail, Phone,
  Trash2, BarChart2, ShieldCheck, TrendingUp, ShoppingCart,
  BadgeCheck, Sparkles, PackageSearch, Gem, ArrowRight,
  PieChart, Activity, Zap, MapPin, Download, Globe
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   THEME & UTILS
═══════════════════════════════════════════════ */

const RATING_THEME = (r) => {
  if (r >= 4.5) return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Preferred Partner' };
  if (r >= 3.5) return { color: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'Reliable Source' };
  return              { color: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Risk Detected'    };
};

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] overflow-hidden ${className}`}>
    {children}
  </div>
);

const KpiItem = ({ label, value, icon: Icon, color, delay }) => (
  <div 
    className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300 group animate-in zoom-in-95 duration-500"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${color}`}>
      <Icon size={20} />
    </div>
    <p className="text-2xl font-black text-white tabular-nums tracking-tighter leading-tight mb-1">{value || '—'}</p>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{label}</p>
  </div>
);

/* ═══════════════════════════════════════════════
   ANALYTICS PAGE
═══════════════════════════════════════════════ */

const SMAnalyticsPage = ({ supplier, analytics, loading, onBack, onRemove }) => {
  const theme = RATING_THEME(supplier.rating);

  const kpis = analytics ? [
    { label: 'Network Trust',    value: analytics.current_rating,         icon: Star,         color: 'text-amber-400'   , delay: 0   },
    { label: 'Lead Efficiency',  value: analytics.lead_time,              icon: Clock,        color: 'text-rose-400'    , delay: 100 },
    { label: 'Dispatch Speed',   value: analytics.on_time_delivery_rate,  icon: Zap,          color: 'text-emerald-400' , delay: 200 },
    { label: 'Open Channels',    value: analytics.active_purchase_orders, icon: ShoppingCart, color: 'text-blue-400'    , delay: 300 },
    { label: 'Defect Ratio',     value: analytics.defect_rate,            icon: Activity,     color: 'text-red-400'     , delay: 400 },
    { label: 'Reliability Index',value: analytics.reliability_status,      icon: ShieldCheck,  color: 'text-violet-400'  , delay: 500 },
  ] : [];

  return (
    <div className="space-y-10">
      
      {/* Top Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-6">
           <button 
             onClick={onBack}
             className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
           >
             <ArrowLeft size={20} />
           </button>
           <div>
             <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{supplier.name}</h1>
               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${theme.bg} ${theme.color} border border-white/5`}>
                 {theme.label}
               </span>
             </div>
             <p className="text-gray-500 font-bold flex items-center gap-2">
               <MapPin size={14} /> Global Vendor Node · <span className="text-white/40">{supplier.category}</span>
             </p>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/5 text-gray-300 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:text-white transition-all">
            <Download size={14} /> Export Node Data
          </button>
          <button 
            onClick={() => onRemove(supplier.id)}
            className="flex items-center gap-2 bg-red-600/10 text-red-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-600/10"
          >
            <Trash2 size={14} /> Erase Node
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Profile Summary Card */}
        <div className="xl:col-span-1 animate-in slide-in-from-left duration-700 delay-200">
          <GlassCard className="p-8 h-full bg-gradient-to-b from-white/[0.05] to-transparent">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_50px_rgba(225,29,72,0.3)] mx-auto">
                {supplier.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 right-1/2 translate-x-12 w-10 h-10 rounded-2xl bg-[#0f0a0a] border border-white/10 flex items-center justify-center text-amber-400 shadow-xl">
                <Star size={18} fill="currentColor" />
              </div>
            </div>

            <div className="text-center mb-10">
               <h3 className="text-xl font-black text-white mb-1">{supplier.name}</h3>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{supplier.category} Operations</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-rose-500">
                   <Mail size={18} />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Secure Channel</p>
                    <p className="text-sm font-bold text-white truncate">{supplier.contact_email}</p>
                 </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-rose-500">
                   <Phone size={18} />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Comms Line</p>
                    <p className="text-sm font-bold text-white">{supplier.phone || 'N/A'}</p>
                 </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-rose-500">
                   <Globe size={18} />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Jurisdiction</p>
                    <p className="text-sm font-bold text-white">Global Procurement</p>
                 </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">System Stability</span>
                 <span className="text-[10px] font-black text-emerald-400">OPTIMAL</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
               </div>
            </div>
          </GlassCard>
        </div>

        {/* Analytics KPIs and Charts */}
        <div className="xl:col-span-2 space-y-8 animate-in slide-in-from-right duration-700 delay-300">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)
            ) : (
              kpis.map((k, i) => <KpiItem key={i} {...k} />)
            )}
          </div>

          <GlassCard className="p-10 relative group">
             <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />
             
             <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                 <PieChart size={20} />
               </div>
               <div>
                 <h3 className="text-xl font-black text-white tracking-tight uppercase">Operational Intelligence</h3>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Real-time performance metrics</p>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                 <p className="text-sm font-bold text-gray-400 leading-relaxed mb-4">
                   The vendor exhibits <span className="text-white">exceptional synchronization</span> with current production schedules. 
                   Lead times have decreased by <span className="text-emerald-400">12%</span> over the last fiscal quarter.
                 </p>
                 <div className="flex items-center gap-4 text-xs font-bold text-white/60">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Target</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/20" /> Actual</div>
                 </div>
               </div>
               
               <div className="flex flex-col justify-center">
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <span className="text-xs font-bold text-gray-500">Service Reliability</span>
                    <span className="text-sm font-black text-white uppercase tabular-nums">98.2%</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <span className="text-xs font-bold text-gray-500">Fulfillment Delta</span>
                    <span className="text-sm font-black text-white uppercase tabular-nums">-0.4 Days</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs font-bold text-gray-500">Supply Continuity</span>
                    <span className="text-sm font-black text-white uppercase tabular-nums">Uninterrupted</span>
                  </div>
               </div>
             </div>
          </GlassCard>

          <div className="bg-red-950/20 border border-red-900/20 rounded-[32px] p-8 flex items-center gap-6 group hover:bg-red-900/30 transition-all duration-500">
             <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
               <Sparkles size={32} />
             </div>
             <div className="flex-1">
               <h4 className="text-lg font-black text-white tracking-tight uppercase mb-1">Korvex AI Recommendation</h4>
               <p className="text-sm font-bold text-red-200/60 leading-tight">
                 Based on historical lead times and quality scores, we recommend <span className="text-white">increasing raw material allocation</span> for this vendor.
               </p>
             </div>
             <ArrowRight className="text-red-500 group-hover:translate-x-2 transition-transform" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default SMAnalyticsPage;
