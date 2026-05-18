import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSuppliers,
  createSupplier,
  fetchSupplierAnalytics,
  removeSupplier,
  setView,
  setSelectedSupplier,
  setCurrentPage,
  toggleForm,
  updateForm,
  clearToast,
} from '../../../redux/supplierSlice';

import {
  Building2, Star, Clock, AlertTriangle, Plus, X,
  ChevronLeft, ChevronRight, ArrowLeft, Mail, Phone,
  Trash2, BarChart2, PackageSearch, ShieldCheck,
  TrendingUp, ShoppingCart, BadgeCheck, Search,
  Filter, MoreHorizontal, Download, Globe, MapPin,
  ExternalLink
} from 'lucide-react';

import SMAnalyticsPage from './SMAnalyticsPage';

/* ═══════════════════════════════════════════════
   CONSTANTS & THEME
═══════════════════════════════════════════════ */

const CATEGORIES = [
  'Electronics', 'Raw Material', 'Hydraulics', 'Plastics',
  'Chemicals', 'Packaging', 'Textiles', 'Machinery',
];

const RATING_THEME = (r) => {
  if (r >= 4.5) return { 
    bg: 'bg-emerald-500/10', 
    text: 'text-emerald-400', 
    label: 'Preferred Vendor', 
    border: 'border-emerald-500/20',
    icon: ShieldCheck
  };
  if (r >= 3.5) return { 
    bg: 'bg-blue-500/10', 
    text: 'text-blue-400', 
    label: 'Standard Vendor', 
    border: 'border-blue-500/20',
    icon: BadgeCheck
  };
  return { 
    bg: 'bg-red-500/10', 
    text: 'text-red-400', 
    label: 'Under Review', 
    border: 'border-red-500/20',
    icon: AlertTriangle
  };
};

/* ═══════════════════════════════════════════════
   MICRO COMPONENTS
═══════════════════════════════════════════════ */

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-3xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "red" }) => (
  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 ${
    color === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-300'
  }`}>
    {children}
  </span>
);

const Toast = ({ toast, onClear }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClear, 4000);
    return () => clearTimeout(t);
  }, [toast, onClear]);

  if (!toast) return null;
  return (
    <div className={`fixed bottom-10 right-10 z-[100] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-right duration-500
      ${toast.type === 'success' ? 'bg-emerald-600/90 text-white' : 'bg-red-600/90 text-white'}`}>
      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
        {toast.type === 'success' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
      </div>
      <p className="text-sm font-bold">{toast.msg}</p>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SUPPLIER CARD (REDESIGN)
═══════════════════════════════════════════════ */

const SupplierCard = ({ supplier, onAnalytics, onRemove }) => {
  const theme = RATING_THEME(supplier.rating);
  const initials = supplier.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <div 
      className="group relative h-full transition-all duration-500"
      onClick={() => onAnalytics(supplier)}
    >
      <GlassCard className="h-full hover:border-red-500/40 hover:bg-white/[0.05] transition-all duration-500 cursor-pointer">
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                <span className="text-xl font-black text-white tracking-tighter">{initials}</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg ${theme.bg} ${theme.border} border flex items-center justify-center shadow-lg`}>
                <theme.icon size={12} className={theme.text} />
              </div>
            </div>
            <div className="flex gap-2">
               <button className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                 <ExternalLink size={14} />
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); onRemove(supplier.id); }}
                 className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
               >
                 <Trash2 size={14} />
               </button>
            </div>
          </div>

          {/* Body */}
          <div className="mb-6 flex-1">
            <h3 className="text-lg font-black text-white tracking-tight leading-tight mb-1 group-hover:text-red-400 transition-colors">
              {supplier.name}
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <Badge color="white">{supplier.category}</Badge>
              <div className="flex items-center gap-1 ml-auto">
                <Star size={10} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-black text-white">{supplier.rating?.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <Mail size={14} />
                </div>
                <span className="text-xs font-bold truncate">{supplier.contact_email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <Clock size={14} />
                </div>
                <span className="text-xs font-bold">{supplier.lead_time_days} Days Average Lead Time</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Status</span>
              <span className={`text-[11px] font-bold ${theme.text}`}>{theme.label}</span>
            </div>
            <button 
              className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all shadow-lg"
            >
              Analyze <TrendingUp size={12} />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   CREATE FORM (REDESIGN)
═══════════════════════════════════════════════ */

const CreateForm = ({ form, onUpdate, onSubmit, onClose, loading }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
    
    <div className="relative w-full max-w-4xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
      <GlassCard className="!border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-1 md:grid-cols-5 min-h-[500px]">
          {/* Left Panel */}
          <div className="md:col-span-2 bg-gradient-to-br from-red-600 to-rose-700 p-10 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-white/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
               <Gem className="mb-6 opacity-40" size={48} />
               <h2 className="text-4xl font-black tracking-tighter leading-tight mb-4">Strategic Onboarding</h2>
               <p className="text-white/70 font-bold leading-relaxed">
                 Add a high-performance vendor to your Korvex Supply Chain network. 
                 Complete the parameters to begin procurement orchestration.
               </p>
            </div>
            <div className="relative z-10 flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                 <ShieldCheck size={24} />
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Security</p>
                 <p className="text-sm font-bold leading-none">Enterprise Registry</p>
               </div>
            </div>
          </div>

          {/* Right Panel (Form) */}
          <div className="md:col-span-3 p-10 bg-[#0a0505]">
             <div className="flex justify-between items-center mb-8">
               <Badge color="white">New Vendor Entry</Badge>
               <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                 <X size={20} />
               </button>
             </div>

             <div className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Company Legal Name</label>
                   <input 
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
                     placeholder="e.g. Korvex Core Components"
                     value={form.name}
                     onChange={e => onUpdate({ name: e.target.value })}
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Lead Time (Days)</label>
                   <input 
                     type="number"
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
                     placeholder="14"
                     value={form.lead_time_days}
                     onChange={e => onUpdate({ lead_time_days: e.target.value })}
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Primary Contact Email</label>
                 <input 
                   type="email"
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
                   placeholder="procurement@vendor.com"
                   value={form.contact_email}
                   onChange={e => onUpdate({ contact_email: e.target.value })}
                 />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Industry Category</label>
                   <select 
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm outline-none focus:border-red-500/50 focus:bg-white/10 transition-all appearance-none"
                     value={form.category}
                     onChange={e => onUpdate({ category: e.target.value })}
                   >
                     {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1a1111]">{c}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Phone System</label>
                   <input 
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
                     placeholder="+1 (555) Korvex-01"
                     value={form.phone}
                     onChange={e => onUpdate({ phone: e.target.value })}
                   />
                 </div>
               </div>
             </div>

             <div className="mt-12 flex justify-end gap-4">
               <button 
                 onClick={onClose}
                 className="px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
               >
                 Abort
               </button>
               <button 
                 onClick={onSubmit}
                 disabled={loading || !form.name || !form.contact_email}
                 className="bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
               >
                 {loading ? 'Processing Registry...' : 'Authorize Onboarding'}
               </button>
             </div>
          </div>
        </div>
      </GlassCard>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN PAGE (REDESIGN)
═══════════════════════════════════════════════ */

const SuppliersPage = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    suppliers, total, currentPage,
    form, isFormOpen,
    selectedSupplier, analytics,
    view, loading, createLoading, analyticsLoading,
    toast,
  } = useSelector(s => s.supplier);

  const PAGE_SIZE = 8;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    dispatch(fetchSuppliers({ page: 1, size: PAGE_SIZE }));
  }, [dispatch]);

  const handleAnalytics = useCallback((supplier) => {
    dispatch(setSelectedSupplier(supplier));
    dispatch(fetchSupplierAnalytics(supplier.id));
  }, [dispatch]);

  const handleRemove = useCallback((id) => {
    if (window.confirm('Erase this vendor from the Korvex Registry?')) {
      dispatch(removeSupplier(id));
    }
  }, [dispatch]);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'analytics' && selectedSupplier) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-700">
        <SMAnalyticsPage
          supplier={selectedSupplier}
          analytics={analytics}
          loading={analyticsLoading}
          onBack={() => dispatch(setView('roster'))}
          onRemove={handleRemove}
        />
        <Toast toast={toast} onClear={() => dispatch(clearToast())} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="animate-in slide-in-from-left duration-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-red-600 rounded-full" />
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Supplier Registry</h1>
          </div>
          <p className="text-gray-500 font-bold ml-5">
            Managing <span className="text-red-500">{total}</span> strategic vendors in the global procurement network.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 animate-in slide-in-from-right duration-700">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={18} />
            <input 
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 text-sm text-white outline-none focus:border-red-500/50 focus:bg-white/10 transition-all w-full sm:w-64"
              placeholder="Search registry..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3.5 rounded-2xl bg-white/5 text-gray-400 hover:text-white border border-white/10 transition-all">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => dispatch(toggleForm())}
            className="flex items-center gap-3 bg-red-600 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:bg-red-500 hover:scale-105 transition-all"
          >
            <Plus size={18} /> Onboard Vendor
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-1000">
        {[
          { label: 'Network Assets', value: total, icon: Building2, color: 'text-red-500', trend: '+2 this month' },
          { label: 'Preferred Partners', value: suppliers.filter(s => s.rating >= 4.5).length, icon: ShieldCheck, color: 'text-emerald-400', trend: 'High Reliability' },
          { label: 'Active Domains', value: [...new Set(suppliers.map(s => s.category))].length || 8, icon: Globe, color: 'text-blue-400', trend: 'Global Reach' },
          { label: 'Critical Risks', value: suppliers.filter(s => s.rating < 3.5).length, icon: AlertTriangle, color: 'text-amber-400', trend: 'Requires Attention' },
        ].map((k, i) => (
          <GlassCard key={i} className="p-6 group hover:-translate-y-1 transition-transform duration-500">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                <k.icon size={20} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${k.color}`}>{k.trend}</span>
            </div>
            <p className="text-3xl font-black text-white tabular-nums tracking-tighter mb-1">{k.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{k.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Grid Container */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <GlassCard key={i} className="h-64 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
              <PackageSearch size={40} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-2">No Records Detected</h3>
            <p className="text-gray-500 font-bold max-w-sm mx-auto">
              The search query did not yield any results from the Korvex registry.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-5 duration-700">
            {filteredSuppliers.map(s => (
              <SupplierCard 
                key={s.id} 
                supplier={s} 
                onAnalytics={handleAnalytics}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Strip */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-10 border-t border-white/5">
           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
             Showing Page {currentPage} of {totalPages} · Global Registry
           </p>
           <div className="flex gap-2">
             <button 
               onClick={() => dispatch(setCurrentPage(currentPage - 1))}
               disabled={currentPage <= 1}
               className="p-3 rounded-xl bg-white/5 text-gray-500 hover:text-white border border-white/5 disabled:opacity-20 transition-all"
             >
               <ChevronLeft size={20} />
             </button>
             <button 
               onClick={() => dispatch(setCurrentPage(currentPage + 1))}
               disabled={currentPage >= totalPages}
               className="p-3 rounded-xl bg-white/5 text-gray-500 hover:text-white border border-white/5 disabled:opacity-20 transition-all"
             >
               <ChevronRight size={20} />
             </button>
           </div>
        </div>
      )}

      {/* Modal */}
      {isFormOpen && (
        <CreateForm
          form={form}
          onUpdate={(patch) => dispatch(updateForm(patch))}
          onSubmit={() => {
             dispatch(createSupplier(form));
          }}
          onClose={() => dispatch(toggleForm())}
          loading={createLoading}
        />
      )}

      <Toast toast={toast} onClear={() => dispatch(clearToast())} />
    </div>
  );
};

export default SuppliersPage;
