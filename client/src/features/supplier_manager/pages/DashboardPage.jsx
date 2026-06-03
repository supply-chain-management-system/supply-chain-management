import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import KorvexCopilot from '../../KorvexCopilot';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  Cpu, 
  Globe, 
  Activity,
  ArrowRight,
  Gem,
  Box,
  ShoppingCart,
  Users,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-[32px] overflow-hidden ${className}`}>
    {children}
  </div>
);

const MetricCard = ({ label, value, trend, icon: Icon, color, delay }) => (
  <GlassCard className="p-8 animate-in zoom-in-95 duration-700" style={{ animationDelay: `${delay}ms` }}>
    <div className="flex justify-between items-start mb-6">
       <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${color} border border-white/5`}>
         <Icon size={28} />
       </div>
       <div className="flex flex-col items-end">
          <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.startsWith('+') ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {trend}
          </span>
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Vs Last Month</span>
       </div>
    </div>
    <p className="text-4xl font-black text-white tabular-nums tracking-tighter mb-2">{value}</p>
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{label}</p>
  </GlassCard>
);

const DashboardPage = () => {
  const { total: totalSuppliers } = useSelector(s => s.supplier);
  const { items: inventoryItems } = useSelector(s => s.inventory);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { orders } = useSelector(s => s.order);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      
      {/* Hero Welcome Section */}
      <div className="relative p-12 rounded-[40px] bg-gradient-to-br from-red-600/20 via-rose-900/10 to-transparent border border-white/5 overflow-hidden group">
         <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[150%] bg-red-600/10 rounded-full blur-[120px] group-hover:bg-red-600/20 transition-all duration-1000" />
         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
             <div className="max-w-2xl">
               <div className="flex items-center gap-3 mb-6">
                 <div className="px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/20 flex items-center gap-2">
                   <Zap size={12} fill="currentColor" /> System Operational
                 </div>
                 <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                   v4.2.0-Korvex
                 </div>
               </div>
               <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-6">
                 Korvex <span className="text-red-600">COMMAND</span><br/>CENTER
               </h1>
               <p className="text-xl font-bold text-gray-400 leading-relaxed max-w-lg">
                 Global Sourcing & Procurement Orchestration Layer. 
                 Optimizing <span className="text-white">strategic node performance</span> across the enterprise.
               </p>
            </div>

            <div className="flex flex-col gap-4">
               <GlassCard className="p-6 bg-white/[0.05] !border-red-500/20">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Real-time Intelligence</span>
                  </div>
                  <p className="text-sm font-bold text-white/80 leading-snug">
                    "AI suggests re-allocating 15% of raw material orders to Node #042 to optimize lead times by 2.4 days."
                  </p>
                  <button className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white transition-all group">
                    View Strategy <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </GlassCard>
            </div>
         </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <MetricCard label="Strategic Vendors" value={totalSuppliers || '24'} trend="+14%" icon={Users} color="text-red-500" delay={0} />
        <MetricCard label="Inventory Valuation" value="$1.2M" trend="+3.2%" icon={Box} color="text-rose-400" delay={100} />
        <MetricCard label="Fulfillment Rate" value="98.4%" trend="+0.5%" icon={ShieldCheck} color="text-emerald-400" delay={200} />
        <MetricCard label="Active Orders" value={orders.length || '12'} trend="-2%" icon={ShoppingCart} color="text-blue-400" delay={300} />
      </div>

      {/* Visual Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Resource Allocation Chart (Mock) */}
        <GlassCard className="lg:col-span-2 p-10 flex flex-col">
           <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Supply Chain Velocity</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global delivery performance index</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-white/5 text-[9px] font-black text-white uppercase border border-white/5 tracking-widest">7 Days</button>
                <button className="px-4 py-2 rounded-xl bg-red-600 text-[9px] font-black text-white uppercase border border-red-500 tracking-widest">30 Days</button>
              </div>
           </div>

           <div className="flex-1 flex items-end gap-3 h-48 pb-6 border-b border-white/5">
              {[40, 70, 45, 90, 65, 80, 100, 55, 75, 95].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                   <div 
                     className="w-full bg-gradient-to-t from-red-600/20 to-red-600 rounded-t-xl transition-all duration-1000 group-hover:brightness-125"
                     style={{ height: `${h}%` }}
                   />
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                     {h}% Cap
                   </div>
                </div>
              ))}
           </div>
           
           <div className="grid grid-cols-3 gap-6 pt-10">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-10 bg-red-600 rounded-full" />
                 <div>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Efficiency</p>
                    <p className="text-lg font-black text-white tabular-nums tracking-tighter">94.8%</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-10 bg-rose-500 rounded-full" />
                 <div>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Stability</p>
                    <p className="text-lg font-black text-white tabular-nums tracking-tighter">High</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-10 bg-white/20 rounded-full" />
                 <div>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Node Load</p>
                    <p className="text-lg font-black text-white tabular-nums tracking-tighter">Balanced</p>
                 </div>
              </div>
           </div>
        </GlassCard>

        {/* Global Activity Sidebar */}
        <div className="space-y-8">
           <GlassCard className="p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-black text-white uppercase tracking-tight">Active Nodes</h3>
                 <Globe size={18} className="text-gray-600" />
              </div>
              
              <div className="space-y-6 flex-1">
                 {[
                   { label: 'Asia-Pacific Core', status: 'Optimal', load: '74%', color: 'text-emerald-400' },
                   { label: 'Europe Cluster', status: 'Delayed', load: '92%', color: 'text-amber-400' },
                   { label: 'North America Node', status: 'Stable', load: '45%', color: 'text-blue-400' },
                   { label: 'ME Distribution', status: 'Active', load: '62%', color: 'text-rose-400' },
                 ].map((node, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div>
                         <p className="text-xs font-bold text-white group-hover:text-red-500 transition-colors">{node.label}</p>
                         <p className={`text-[9px] font-black uppercase tracking-widest ${node.color}`}>{node.status}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-white/40 tabular-nums">{node.load}</p>
                         <div className="h-1 w-12 bg-white/5 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-white/20 rounded-full" style={{ width: node.load }} />
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-10 pt-8 border-t border-white/5">
                 <button className="w-full py-4 bg-white/5 hover:bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl group">
                    Global System Audit <ArrowRight size={14} className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </GlassCard>
        </div>
      </div>
       {!isChatOpen && (
                       <button
                         onClick={() => setIsChatOpen(true)}
                         className="fixed bottom-6 right-6 z-[9998] w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                         style={{ background: "linear-gradient(135deg, #00c88c 0%, #00a06e 100%)" }}
                       >
                         <MessageSquare size={24} color="#ffffff" strokeWidth={2.5} />
                       </button>
                     )}
               
                     <KorvexCopilot 
                       isOpen={isChatOpen} 
                       onClose={() => setIsChatOpen(false)} 
                     />
    </div>
  );
};

export default DashboardPage;
