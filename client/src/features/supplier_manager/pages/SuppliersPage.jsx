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
  updateSupplier,
} from '../../../redux/supplierSlice';

import {
  Building2, Star, Clock, AlertTriangle, Plus, X,
  ChevronLeft, ChevronRight, ArrowLeft, Mail, Phone,
  Trash2, BarChart2, PackageSearch, ShieldCheck,
  TrendingUp, ShoppingCart, BadgeCheck, Grid, List, Edit2
} from 'lucide-react';

import SMAnalyticsPage from './SMAnalyticsPage';

/* ═══════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════ */

const CATEGORIES = [
  'Electronics', 'Raw Material', 'Hydraulics', 'Plastics',
  'Chemicals', 'Packaging', 'Textiles', 'Machinery',
];

// Banner color keyed by category (mirrors ruby/rose accents)
const CAT_COLOR = {
  'Electronics':  'from-rose-600/30 to-rose-500/10',
  'Raw Material': 'from-red-750/30 to-red-600/10',
  'Hydraulics':   'from-rose-700/30 to-rose-600/10',
  'Plastics':     'from-red-800/30 to-red-600/10',
  'Chemicals':    'from-rose-900/30 to-rose-700/10',
  'Packaging':    'from-red-700/30 to-red-500/10',
  'Textiles':     'from-rose-800/30 to-rose-600/10',
  'Machinery':    'from-red-950/30 to-red-800/10',
};

const RATING_COLOR = (r) => {
  if (r >= 4.5) return { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Preferred' };
  if (r >= 3.5) return { dot: 'bg-rose-400',    text: 'text-rose-400',    label: 'Active'    };
  return              { dot: 'bg-red-500',       text: 'text-red-500',     label: 'At Risk'   };
};

/* ═══════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
═══════════════════════════════════════════════ */

const MetaChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 bg-white/[0.01] border border-white/5 rounded-xl px-3 py-2 min-w-0">
    <Icon size={12} className="text-gray-500 shrink-0" />
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <p className="text-xs font-semibold text-white truncate">{value || '—'}</p>
    </div>
  </div>
);

const RatingStars = ({ rating }) => {
  const full  = Math.floor(rating);
  const frac  = rating - full;
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`text-[11px] ${i < full ? 'text-amber-400' : (i === full && frac >= 0.5 ? 'text-amber-300' : 'text-gray-700')}`}>★</span>
      ))}
      <span className="text-xs font-bold text-white ml-0.5">{rating?.toFixed(1)}</span>
    </div>
  );
};

const StatusPill = ({ rating }) => {
  const { dot, text, label } = RATING_COLOR(rating ?? 0);
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className={`text-[10px] font-bold ${text}`}>{label}</span>
    </div>
  );
};

const Toast = ({ toast, onClear }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClear, 4000);
    return () => clearTimeout(t);
  }, [toast, onClear]);

  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold border transition-all
      ${toast.type === 'success' ? 'bg-[#1e1111] border-red-500/30 text-white' : 'bg-[#291111] border-rose-500/30 text-white'}`}>
      {toast.msg}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SUPPLIER CARD
═══════════════════════════════════════════════ */

const SupplierCard = ({ supplier, onAnalytics, onEdit, onRemove }) => {
  const bannerColor = CAT_COLOR[supplier.category] || 'from-rose-900/30 to-rose-700/10';
  const initial     = supplier.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div
      className="bg-white/[0.02] border border-white/[0.08] rounded-2xl shadow-sm hover:shadow-lg hover:border-red-500/30 transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col"
      onClick={() => onAnalytics(supplier)}
    >
      {/* Banner */}
      <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${bannerColor} border-b border-white/5 p-4 flex flex-col justify-end`}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/[0.01]" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/[0.01]" />

        {/* Initial avatar */}
        <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center">
          <span className="text-white font-bold text-lg drop-shadow">{initial}</span>
        </div>

        {/* Category badge */}
        <div className="absolute top-4 right-4">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/5 border border-white/10 text-gray-300">
            {supplier.category}
          </span>
        </div>

        {/* Name */}
        <div>
          <p className="text-white font-bold text-sm drop-shadow truncate">{supplier.name}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <StatusPill rating={supplier.rating} />
          <RatingStars rating={supplier.rating} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={Mail}  label="Contact"   value={supplier.contact_email} />
          <MetaChip icon={Clock} label="Lead Time" value={`${supplier.lead_time_days}d`} />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            onClick={(e) => { e.stopPropagation(); onAnalytics(supplier); }}
            className="text-[11px] font-semibold text-red-500 hover:text-red-400 flex items-center gap-1"
          >
            <BarChart2 size={12} /> Analytics
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(supplier); }}
              className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit Supplier"
            >
              <Edit2 size={12} /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(supplier.id); }}
              className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={12} /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════ */

const SkeletonCard = () => (
  <div className="bg-white/[0.02] border border-white/10 shadow-sm overflow-hidden animate-pulse rounded-2xl">
    <div className="h-32 bg-white/5" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-3 bg-white/5 rounded-full w-1/4" />
        <div className="h-3 bg-white/5 rounded-full w-1/3" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 bg-white/5 rounded-xl" />
        <div className="h-10 bg-white/5 rounded-xl" />
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   LIVE PREVIEW
═══════════════════════════════════════════════ */

const LivePreview = ({ form }) => {
  const bannerColor = CAT_COLOR[form.category] || 'from-rose-900/30 to-rose-700/10';
  const initial     = form.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="bg-white/[0.02] rounded-2xl border border-white/10 shadow-md overflow-hidden w-full max-w-xs mx-auto">
      <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${bannerColor} border-b border-white/5 p-4 flex flex-col justify-end`}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/[0.01]" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/[0.01]" />
        <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-red-600/35 border border-red-500/40 flex items-center justify-center">
          <span className="text-white font-bold text-lg">{initial}</span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/5 border border-white/10 text-gray-300">
            {form.category || 'Category'}
          </span>
        </div>
        <div>
          <p className="text-white font-bold text-sm drop-shadow truncate">{form.name || 'Supplier Name'}</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[10px] font-bold text-amber-400">Onboarding Pending</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={Mail}  label="Contact"   value={form.contact_email || 'email@co.com'} />
          <MetaChip icon={Clock} label="Lead Time" value={form.lead_time_days ? `${form.lead_time_days}d` : '14d'} />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   CREATE FORM MODAL
═══════════════════════════════════════════════ */

const inputCls = "w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 bg-white/5 text-white placeholder:text-gray-600";
const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

const CreateForm = ({ form, onUpdate, onSubmit, onClose, loading, isEdit }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
    <div className="bg-[#140b0b]/95 border border-white/15 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <h2 className="font-bold text-white">{isEdit ? 'Edit Supplier' : 'Onboard New Supplier'}</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">{isEdit ? 'Modify details of the supplier in the registry' : 'Directly onboard a vendor into the registry'}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left — fields */}
        <div className="p-6 space-y-4 border-r border-white/5">
          <div>
            <label className={labelCls}>Company Name</label>
            <input className={inputCls} placeholder="Apex MetalWorks Inc." value={form.name}
              onChange={e => onUpdate({ name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input className={inputCls} type="email" placeholder="vendor@company.com" value={form.contact_email}
              onChange={e => onUpdate({ contact_email: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} placeholder="+91 98765 43210" value={form.phone}
              onChange={e => onUpdate({ phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={form.category}
                onChange={e => onUpdate({ category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} className="bg-[#140b0b]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Lead Time (days)</label>
              <input className={inputCls} type="number" min="1" placeholder="14" value={form.lead_time_days}
                onChange={e => onUpdate({ lead_time_days: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Right — live preview */}
        <div className="p-6 bg-white/[0.01] flex flex-col items-center justify-center gap-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Live Preview</p>
          <LivePreview form={form} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
        <button onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-white transition-colors">
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={loading || !form.name || !form.contact_email}
          className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-md shadow-red-600/10"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Plus size={14} />}
          {loading ? (isEdit ? 'Saving…' : 'Onboarding…') : (isEdit ? 'Save Changes' : 'Onboard Supplier')}
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   LIST VIEW TABLE
═══════════════════════════════════════════════ */
const SuppliersTable = ({ suppliers, onRowClick, onEdit, onRemove }) => {
  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-white/[0.01] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Supplier Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Lead Time</th>
              <th className="px-6 py-4">Rating & Status</th>
              <th className="px-6 py-4">Contact info</th>
              <th className="px-6 py-4 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {suppliers.map(s => {
              return (
                <tr
                  key={s.id}
                  onClick={() => onRowClick(s)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-red-600/30 border border-red-500/40 flex items-center justify-center text-white text-xs font-bold">
                      {s.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {s.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold bg-white/5 border border-white/10 text-gray-300">
                      {s.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {s.lead_time_days} days
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <StatusPill rating={s.rating} />
                      <RatingStars rating={s.rating} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Mail size={10} className="text-gray-500" />
                        {s.contact_email}
                      </div>
                      {s.phone && (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Phone size={10} className="text-gray-500" />
                          {s.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onRowClick(s); }}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/20 text-red-400 hover:text-white transition-all"
                      title="Analytics"
                    >
                      <BarChart2 size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(s); }}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/20 text-slate-400 hover:text-white transition-all"
                      title="Edit Supplier"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(s.id); }}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                      title="Remove Supplier"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */

const PAGE_SIZE = 9;

const SuppliersPage = () => {
  const dispatch = useDispatch();
  const {
    suppliers, total, currentPage,
    form, isFormOpen,
    selectedSupplier, analytics,
    view, loading, createLoading, analyticsLoading,
    toast,
  } = useSelector(s => s.supplier);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    dispatch(fetchSuppliers({ page: 1, size: PAGE_SIZE }));
  }, [dispatch]);

  useEffect(() => {
    if (view === 'roster') {
      dispatch(fetchSuppliers({ page: currentPage, size: PAGE_SIZE }));
    }
  }, [currentPage, view, dispatch]);

  const handleAnalytics = useCallback((supplier) => {
    dispatch(setSelectedSupplier(supplier));
    dispatch(fetchSupplierAnalytics(supplier.id));
  }, [dispatch]);

  const handleRemove = useCallback((id) => {
    if (window.confirm('Remove this supplier from the registry?')) {
      dispatch(removeSupplier(id));
    }
  }, [dispatch]);

  const handleEdit = useCallback((supplier) => {
    dispatch(updateForm({
      name: supplier.name,
      category: supplier.category,
      contact_email: supplier.contact_email,
      phone: supplier.phone || '',
      lead_time_days: supplier.lead_time_days,
    }));
    setEditingSupplierId(supplier.id);
    dispatch(toggleForm());
  }, [dispatch]);

  const handleSubmit = useCallback(() => {
    if (editingSupplierId) {
      dispatch(updateSupplier({ supplierId: editingSupplierId, formData: form }));
      setEditingSupplierId(null);
    } else {
      dispatch(createSupplier(form));
    }
  }, [dispatch, form, editingSupplierId]);

  /* — Analytics view — */
  if (view === 'analytics' && selectedSupplier) {
    return (
      <div className="space-y-6">
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

  /* — Roster view — */
  const atRisk     = suppliers.filter(s => s.rating < 3.5).length;
  const preferred  = suppliers.filter(s => s.rating >= 4.5).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-red-600 rounded-full" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Supplier Directory</h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">
            {total > 0 ? `${total} vendor${total !== 1 ? 's' : ''} in enterprise network` : 'No suppliers onboarded yet'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Toggle View mode */}
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-400 hover:text-white'}`}
              title="Grid Cards"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-400 hover:text-white'}`}
              title="Tabular List"
            >
              <List size={15} />
            </button>
          </div>

          <button
            onClick={() => dispatch(toggleForm())}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-red-500 transition-colors shadow-md shadow-red-600/10"
          >
            <Plus size={16} /> Onboard Supplier
          </button>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Vendors',    value: total,     icon: Building2,    color: 'text-rose-500'    },
          { label: 'Preferred',        value: preferred, icon: ShieldCheck,  color: 'text-emerald-400' },
          { label: 'Categories',       value: [...new Set(suppliers.map(s => s.category))].length || CATEGORIES.length,
                                                         icon: PackageSearch, color: 'text-rose-400'  },
          { label: 'At Risk',          value: atRisk,    icon: AlertTriangle, color: atRisk > 0 ? 'text-red-500' : 'text-gray-500' },
        ].map((s, i) => (
          <div key={i} className={`bg-white/[0.02] rounded-2xl p-5 border ${s.label === 'At Risk' && atRisk > 0 ? 'border-red-500/20 bg-red-500/[0.02]' : 'border-white/[0.08]'}`}>
            <s.icon size={18} className={`mb-3 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Grid or List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <Building2 size={28} className="text-red-400" />
          </div>
          <h3 className="font-bold text-white text-lg">No suppliers onboarded yet</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-xs">
            Onboard your first supplier using the button in the top right.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map(s => (
            <SupplierCard
              key={s.id}
              supplier={s}
              onAnalytics={handleAnalytics}
              onEdit={handleEdit}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <SuppliersTable
          suppliers={suppliers}
          onRowClick={handleAnalytics}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
            disabled={currentPage <= 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 disabled:opacity-30 hover:border-red-500 hover:text-red-400 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => dispatch(setCurrentPage(currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 disabled:opacity-30 hover:border-red-500 hover:text-red-400 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create form modal */}
      {isFormOpen && (
        <CreateForm
          form={form}
          onUpdate={(patch) => dispatch(updateForm(patch))}
          onSubmit={handleSubmit}
          onClose={() => { dispatch(resetForm()); setEditingSupplierId(null); }}
          loading={createLoading}
          isEdit={!!editingSupplierId}
        />
      )}

      <Toast toast={toast} onClear={() => dispatch(clearToast())} />
    </div>
  );
};

export default SuppliersPage;
