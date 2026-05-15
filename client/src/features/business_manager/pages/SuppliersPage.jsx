import { useEffect, useCallback } from 'react';
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
} from '../../../redux/supplierSlice'; // adjust path to match your store

import {
  Building2, Star, Clock, AlertTriangle, Plus, X,
  ChevronLeft, ChevronRight, ArrowLeft, Mail, Phone,
  Trash2, BarChart2, PackageSearch, ShieldCheck,
  TrendingUp, ShoppingCart, BadgeCheck,
} from 'lucide-react';

import SMAnalyticsPage from './SMAnalyticsPage';

/* ═══════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════ */

const CATEGORIES = [
  'Electronics', 'Raw Material', 'Hydraulics', 'Plastics',
  'Chemicals', 'Packaging', 'Textiles', 'Machinery',
];

// Banner color keyed by category
const CAT_COLOR = {
  'Electronics':  '#1D4ED8',   // royal blue
  'Raw Material': '#92400E',   // earthy brown
  'Hydraulics':   '#065F46',   // deep teal
  'Plastics':     '#6D28D9',   // violet
  'Chemicals':    '#B91C1C',   // crimson
  'Packaging':    '#0369A1',   // sky
  'Textiles':     '#BE185D',   // rose
  'Machinery':    '#374151',   // slate
};

const RATING_COLOR = (r) => {
  if (r >= 4.5) return { dot: 'bg-emerald-400', text: 'text-emerald-600', label: 'Preferred' };
  if (r >= 3.5) return { dot: 'bg-blue-400',    text: 'text-blue-600',    label: 'Active'    };
  return              { dot: 'bg-red-400',       text: 'text-red-600',     label: 'At Risk'   };
};

/* ═══════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
═══════════════════════════════════════════════ */

const MetaChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-100 px-3 py-2 min-w-0">
    <Icon size={12} className="text-gray-400 shrink-0" />
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-700 truncate">{value || '—'}</p>
    </div>
  </div>
);

const RatingStars = ({ rating }) => {
  const full  = Math.floor(rating);
  const frac  = rating - full;
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`text-[11px] ${i < full ? 'text-amber-400' : (i === full && frac >= 0.5 ? 'text-amber-300' : 'text-gray-200')}`}>★</span>
      ))}
      <span className="text-xs font-bold text-gray-700 ml-0.5">{rating?.toFixed(1)}</span>
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
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all
      ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {toast.msg}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SUPPLIER CARD
═══════════════════════════════════════════════ */

const SupplierCard = ({ supplier, onAnalytics, onRemove }) => {
  const bannerColor = CAT_COLOR[supplier.category] || '#374151';
  const initial     = supplier.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer group"
      onClick={() => onAnalytics(supplier)}
    >
      {/* Banner */}
      <div className="relative h-32 overflow-hidden" style={{ backgroundColor: bannerColor }}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />

        {/* Initial avatar */}
        <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <span className="text-white font-bold text-lg drop-shadow">{initial}</span>
        </div>

        {/* Category badge */}
        <div className="absolute top-4 right-4">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/90 text-gray-700">
            {supplier.category}
          </span>
        </div>

        {/* Name */}
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-white font-bold text-sm drop-shadow truncate">{supplier.name}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <StatusPill rating={supplier.rating} />
          <RatingStars rating={supplier.rating} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={Mail}  label="Contact"   value={supplier.contact_email} />
          <MetaChip icon={Clock} label="Lead Time" value={`${supplier.lead_time_days}d`} />
        </div>
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onAnalytics(supplier); }}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <BarChart2 size={12} /> Analytics
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(supplier.id); }}
            className="text-[11px] font-semibold text-red-400 hover:text-red-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════ */

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-32 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 bg-gray-100 rounded-xl" />
        <div className="h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   LIVE PREVIEW
═══════════════════════════════════════════════ */

const LivePreview = ({ form }) => {
  const bannerColor = CAT_COLOR[form.category] || '#374151';
  const initial     = form.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden w-full max-w-xs mx-auto">
      <div className="relative h-32 overflow-hidden" style={{ backgroundColor: bannerColor }}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-white font-bold text-lg">{initial}</span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/90 text-gray-700">
            {form.category || 'Category'}
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-white font-bold text-sm drop-shadow truncate">{form.name || 'Supplier Name'}</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[10px] font-bold text-amber-600">Pending Onboard</span>
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

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-gray-300";
const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5";

const CreateForm = ({ form, onUpdate, onSubmit, onClose, loading }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-gray-800">Onboard New Supplier</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Add a vendor to your procurement network</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left — fields */}
        <div className="p-6 space-y-4 border-r border-gray-100">
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
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
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
        <div className="p-6 bg-gray-50/50 flex flex-col items-center justify-center gap-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Live Preview</p>
          <LivePreview form={form} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <button onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={loading || !form.name || !form.contact_email}
          className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Plus size={14} />}
          {loading ? 'Onboarding…' : 'Onboard Supplier'}
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   ANALYTICS VIEW
═══════════════════════════════════════════════ */

const AnalyticsView = ({ supplier, analytics, loading, onBack, onRemove }) => {
  const bannerColor = CAT_COLOR[supplier.category] || '#374151';

  const kpis = analytics ? [
    { label: 'Current Rating',       value: analytics.current_rating,          icon: Star,         color: 'text-amber-500'   },
    { label: 'Lead Time',            value: analytics.lead_time,               icon: Clock,        color: 'text-slate-600'   },
    { label: 'On-Time Delivery',     value: analytics.on_time_delivery_rate,   icon: TrendingUp,   color: 'text-emerald-600' },
    { label: 'Active PO\'s',         value: analytics.active_purchase_orders,  icon: ShoppingCart, color: 'text-blue-600'    },
    { label: 'Defect Rate',          value: analytics.defect_rate,             icon: AlertTriangle,color: 'text-red-500'     },
    { label: 'Reliability',          value: analytics.reliability_status,      icon: BadgeCheck,   color: 'text-violet-600'  },
  ] : [];

  return (
    <div className="space-y-6">
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={16} /> Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="relative h-36 overflow-hidden" style={{ backgroundColor: bannerColor }}>
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />
            <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-xl">{supplier.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/90 text-gray-700">
                {supplier.category}
              </span>
            </div>
            <div className="absolute bottom-3 left-4 right-4">
              <p className="text-white font-bold drop-shadow truncate">{supplier.name}</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <StatusPill rating={supplier.rating} />
              <RatingStars rating={supplier.rating} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MetaChip icon={Mail}  label="Contact"   value={supplier.contact_email} />
              <MetaChip icon={Phone} label="Phone"     value={supplier.phone} />
            </div>
            <button onClick={() => onRemove(supplier.id)}
              className="w-full mt-2 text-xs font-semibold text-red-500 hover:text-red-700 flex items-center justify-center gap-1.5 py-2 border border-red-100 rounded-xl hover:bg-red-50 transition-colors">
              <Trash2 size={12} /> Remove Supplier
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                  <div className="h-4 w-4 bg-gray-200 rounded mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {kpis.map((k, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <k.icon size={18} className={`mb-3 ${k.color}`} />
                  <p className="text-xl font-bold text-gray-800 leading-tight">{k.value ?? '—'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{k.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
        <p className="text-xs text-slate-500 leading-relaxed">
          Procurement KPIs are sourced from the <span className="font-mono font-semibold text-slate-700">suppliers</span> table.
          On-time delivery and defect rate will auto-update once linked to <span className="font-mono font-semibold text-slate-700">PurchaseOrders</span> and <span className="font-mono font-semibold text-slate-700">InboundShipments</span>.
        </p>
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

  const handleSubmit = useCallback(() => {
    dispatch(createSupplier(form));
  }, [dispatch, form]);

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Supplier Directory</h1>
          <p className="text-slate-400 text-sm mt-1">
            {total > 0 ? `${total} vendor${total !== 1 ? 's' : ''} in your procurement network` : 'No suppliers onboarded yet'}
          </p>
        </div>
        <button
          onClick={() => dispatch(toggleForm())}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Onboard Supplier
        </button>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Vendors',    value: total,     icon: Building2,    color: 'text-blue-600'    },
          { label: 'Preferred',        value: preferred, icon: ShieldCheck,  color: 'text-emerald-600' },
          { label: 'Categories',       value: [...new Set(suppliers.map(s => s.category))].length || CATEGORIES.length,
                                                         icon: PackageSearch, color: 'text-violet-600'  },
          { label: 'At Risk',          value: atRisk,    icon: AlertTriangle, color: atRisk > 0 ? 'text-red-500' : 'text-slate-400' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border ${s.label === 'At Risk' && atRisk > 0 ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
            <s.icon size={18} className={`mb-3 ${s.color}`} />
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Building2 size={28} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-700 text-lg">No suppliers yet</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">
            Onboard your first vendor to start building your procurement network.
          </p>
          <button
            onClick={() => dispatch(toggleForm())}
            className="mt-5 flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <Plus size={14} /> Onboard First Supplier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map(s => (
            <SupplierCard
              key={s.id}
              supplier={s}
              onAnalytics={handleAnalytics}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-sm text-gray-500 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => dispatch(setCurrentPage(currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      )}

      {/* Create modal */}
      {isFormOpen && (
        <CreateForm
          form={form}
          onUpdate={(patch) => dispatch(updateForm(patch))}
          onSubmit={handleSubmit}
          onClose={() => dispatch(toggleForm())}
          loading={createLoading}
        />
      )}

      <Toast toast={toast} onClear={() => dispatch(clearToast())} />
    </div>
  );
};

export default SuppliersPage;