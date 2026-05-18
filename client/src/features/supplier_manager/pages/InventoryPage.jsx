import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory } from '../../../redux/inventorySlice';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  ArrowUpRight, 
  History, 
  Filter,
  Search,
  Box,
  Layers,
  Thermometer,
  MoreVertical
} from 'lucide-react';

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] overflow-hidden ${className}`}>
    {children}
  </div>
);

const InventoryPage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.inventory);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  const stats = [
    { label: 'Total Stock Value', value: '$42,500', icon: Box, color: 'text-red-500' },
    { label: 'Active Categories', value: '8', icon: Layers, color: 'text-rose-400' },
    { label: 'Low Stock Alerts', value: items.filter(i => i.quantity <= i.min_threshold).length, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Optimal Items', value: items.filter(i => i.quantity > i.min_threshold).length, icon: Package, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Resource Inventory</h1>
           <p className="text-gray-500 font-bold ml-1">Real-time raw material monitoring and threshold management.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500" size={18} />
             <input 
               className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 text-sm text-white outline-none focus:border-red-500/50 focus:bg-white/10 transition-all w-64"
               placeholder="Search materials..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
           <button className="bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-2">
             <Plus size={18} /> Add Resource
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <GlassCard key={i} className="p-6 group hover:-translate-y-1 transition-all duration-500">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${s.color} group-hover:scale-110 transition-transform`}>
              <s.icon size={22} />
            </div>
            <p className="text-3xl font-black text-white tabular-nums tracking-tighter mb-1">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Inventory Table/List */}
      <GlassCard>
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-red-600 rounded-full" />
             <h2 className="text-xl font-black text-white uppercase tracking-tight">Material Registry</h2>
           </div>
           <div className="flex gap-2">
             <button className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5 transition-all"><Filter size={18} /></button>
             <button className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5 transition-all"><History size={18} /></button>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead className="bg-white/[0.01] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
               <tr>
                 <th className="px-8 py-5">Material Description</th>
                 <th className="px-8 py-5">Classification</th>
                 <th className="px-8 py-5">Current Stock</th>
                 <th className="px-8 py-5">Health Status</th>
                 <th className="px-8 py-5 text-right">Operations</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {loading ? (
                 [...Array(5)].map((_, i) => (
                   <tr key={i} className="animate-pulse">
                     <td colSpan="5" className="px-8 py-6"><div className="h-4 bg-white/5 rounded w-full" /></td>
                   </tr>
                 ))
               ) : items.length === 0 ? (
                 <tr>
                   <td colSpan="5" className="px-8 py-20 text-center text-gray-500 italic">No material data detected in this sector.</td>
                 </tr>
               ) : items.map((item) => (
                 <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                   <td className="px-8 py-6">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/20 to-rose-600/10 flex items-center justify-center text-red-500 border border-red-500/20">
                         <Box size={18} />
                       </div>
                       <span className="text-sm font-bold text-white">{item.material_name}</span>
                     </div>
                   </td>
                   <td className="px-8 py-6">
                     <span className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/5">
                       {item.category}
                     </span>
                   </td>
                   <td className="px-8 py-6">
                     <p className="text-sm font-black text-white tabular-nums">
                       {item.quantity} <span className="text-gray-500 font-bold ml-1 uppercase text-[10px]">{item.unit}</span>
                     </p>
                   </td>
                   <td className="px-8 py-6">
                      {item.quantity <= item.min_threshold ? (
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                          <AlertTriangle size={14} /> Critical Threshold
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Optimal
                        </div>
                      )}
                   </td>
                   <td className="px-8 py-6 text-right">
                      <button className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <MoreVertical size={16} />
                      </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default InventoryPage;
