import { useEffect, useState, useCallback } from 'react';
import {
  Users, Mail, Phone, Trash2, Plus, X, ArrowRight,
  Loader2, ChevronLeft, ChevronRight,
  ShieldCheck, Globe, Star, Clock, AlertTriangle,
  TrendingUp, ShoppingCart, BadgeCheck, CheckCircle2,
  RefreshCw, Award, Activity, Grid, List
} from 'lucide-react';
import api from '../../../api/api';

const ITEMS_PER_PAGE = 9;

/* ── Category Theme Colors ── */
const CAT_COLORS = {
  'Electronics':  { banner: 'from-blue-600/30 to-blue-500/10',     badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'Raw Material': { banner: 'from-amber-700/30 to-amber-600/10',    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'Hydraulics':   { banner: 'from-emerald-700/30 to-emerald-600/10',badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'Plastics':     { banner: 'from-purple-700/30 to-purple-600/10',  badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'Chemicals':    { banner: 'from-rose-700/30 to-red-600/10',       badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  'Packaging':    { banner: 'from-sky-700/30 to-sky-600/10',       badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  'Textiles':     { banner: 'from-pink-700/30 to-pink-600/10',      badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  'Machinery':    { banner: 'from-slate-700/30 to-slate-600/10',    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const REGION_BADGES = {
  Domestic:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  International: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Asia-Pacific':'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Europe:        'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Americas:      'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const CATEGORIES = Object.keys(CAT_COLORS);
const REGIONS    = Object.keys(REGION_BADGES);

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  category: 'Electronics',
  region: 'Domestic',
  department: 'Procurement',
};

/* ── Helpers ── */
const MetaChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2 bg-white/[0.01] border border-white/5 rounded-xl px-3 py-2.5">
    <Icon size={12} className="text-gray-500 mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

const StatusDot = ({ isUsed }) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${isUsed ? 'text-emerald-400' : 'text-amber-400'}`}>
    <span className={`h-2 w-2 rounded-full ${isUsed ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse'}`} />
    {isUsed ? 'Active' : 'Invite Sent'}
  </span>
);

const SkeletonCard = () => (
  <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-sm animate-pulse h-[280px]">
    <div className="h-28 bg-white/5" />
    <div className="p-5 space-y-4">
      <div className="h-4 bg-white/5 rounded w-2/3" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 bg-white/5 rounded-xl" />
        <div className="h-10 bg-white/5 rounded-xl" />
      </div>
    </div>
  </div>
);

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-sm font-semibold text-white transition-all duration-300 border border-white/10 ${
      toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30' : 'bg-rose-950/80 border-rose-500/30'
    }`}>
      {toast.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-red-400" />}
      {toast.msg}
    </div>
  );
};

/* ── Manager Card Component ── */
const ManagerCard = ({ sm, isSelected, onCardClick, onRemove }) => {
  const catTheme = CAT_COLORS[sm.category] || CAT_COLORS.Electronics;
  const regionCls = REGION_BADGES[sm.region] || REGION_BADGES.Domestic;

  return (
    <div
      onClick={() => onCardClick(sm)}
      className={`bg-white/[0.02] border rounded-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col cursor-pointer ${
        isSelected ? 'border-cyan-500/50 ring-2 ring-cyan-500/10 bg-white/[0.04]' : 'border-white/5'
      }`}
    >
      {/* coloured banner */}
      <div className={`relative h-28 bg-gradient-to-br ${catTheme.banner} flex flex-col justify-end px-5 pb-4 shrink-0`}>
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-3 right-12 w-10 h-10 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* remove btn */}
        <button
          onClick={(e) => onRemove(e, sm.id)}
          className="absolute top-3 right-3 text-white/40 hover:text-red-400 hover:scale-110 transition-all z-10 p-1"
          title="Remove Manager Card"
        >
          <Trash2 size={14} />
        </button>

        {/* avatar */}
        <div className="absolute top-3 left-5 w-8 h-8 bg-cyan-600/30 border border-cyan-500/40 rounded-xl flex items-center justify-center text-white font-black text-sm">
          {sm.name?.charAt(0).toUpperCase()}
        </div>

        {/* badges */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <span className={`text-[9px] font-black uppercase tracking-widest border rounded-full px-2 py-0.5 bg-slate-950/80 shadow-sm ${catTheme.badge}`}>
            {sm.category}
          </span>
          <span className={`text-[9px] font-black uppercase tracking-widest border rounded-full px-2 py-0.5 bg-slate-950/80 shadow-sm ${regionCls}`}>
            {sm.region}
          </span>
        </div>

        <h2 className="text-white font-black text-base leading-tight drop-shadow-md truncate">{sm.name}</h2>
      </div>

      {/* body */}
      <div className="flex flex-col gap-3 p-5 flex-1 bg-slate-950/20">
        <div className="pb-3 border-b border-white/5 flex items-center justify-between">
          <StatusDot isUsed={sm.is_active || sm.is_used} />
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{sm.department}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={Mail}  label="Email" value={sm.email} />
          <MetaChip icon={Phone} label="Phone" value={sm.phone} />
        </div>
      </div>
    </div>
  );
};

/* ── Create Form Component ── */
const CreateForm = ({ form, loading, onSubmit, onClose, setForm }) => {
  const catTheme = CAT_COLORS[form.category] || CAT_COLORS.Electronics;
  const regionCls = REGION_BADGES[form.region] || REGION_BADGES.Domestic;

  return (
    <div className="bg-[#0b1329]/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
        <div>
          <p className="text-sm font-black text-white uppercase tracking-wider">New Supplier Manager Card</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Card will be created & registry email invite dispatched instantly</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
        >
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* fields form */}
        <div className="p-6 border-r border-white/5 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Provide Details</p>
          <form onSubmit={onSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                required type="text" placeholder="e.g. Liam Johnson"
                className="w-full h-10 px-3.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Work Email <span className="text-red-400">*</span>
              </label>
              <input
                required type="email" placeholder="liam@korvex.com"
                className="w-full h-10 px-3.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Phone Number</label>
              <input
                type="text" placeholder="+1 555 0199"
                className="w-full h-10 px-3.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Category Scope</label>
                <select
                  className="w-full h-10 px-3 text-sm rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition cursor-pointer"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0b1329]">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Geographic Region</label>
                <select
                  className="w-full h-10 px-3 text-sm rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition cursor-pointer"
                  value={form.region}
                  onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                >
                  {REGIONS.map(r => <option key={r} value={r} className="bg-[#0b1329]">{r}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.name?.trim() || !form.email?.trim()}
              className="w-full h-11 mt-2 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.2)] transition active:scale-95 cursor-pointer"
            >
              {loading ? (
                <><Loader2 size={13} className="animate-spin" /> Provisioning Card…</>
              ) : (
                <><ArrowRight size={13} /> Onboard Supply Manager</>
              )}
            </button>
          </form>
        </div>

        {/* live card preview */}
        <div className="p-6 bg-white/[0.01] flex flex-col gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Card Design Preview</p>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className={`relative h-28 bg-gradient-to-br ${catTheme.banner} flex flex-col justify-end px-4 pb-3`}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute top-2 right-10 w-8 h-8 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

              <div className="absolute top-3 left-4 w-7 h-7 bg-cyan-600/30 border border-cyan-500/40 rounded-xl flex items-center justify-center text-white font-black text-sm">
                {form.name?.charAt(0).toUpperCase() || '?'}
              </div>

              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className={`text-[9px] font-black uppercase tracking-widest border rounded-full px-2 py-0.5 bg-slate-950/80 shadow-sm ${catTheme.badge}`}>
                  {form.category}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-widest border rounded-full px-2 py-0.5 bg-slate-950/80 shadow-sm ${regionCls}`}>
                  {form.region}
                </span>
              </div>
              <h2 className="text-white font-bold text-base leading-tight drop-shadow">
                {form.name?.trim() || <span className="opacity-40 font-normal italic">Liam Johnson</span>}
              </h2>
            </div>

            <div className="p-4 space-y-3 bg-slate-950/20">
              <div className="grid grid-cols-2 gap-2">
                <MetaChip icon={Mail}  label="Email" value={form.email || '—'} />
                <MetaChip icon={Phone} label="Phone" value={form.phone || '—'} />
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Invite Pending
                </span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 text-center">Interactive UI design updates instantly as you type</p>
        </div>
      </div>
    </div>
  );
};

/* ── Analytics View Component ── */
const SMAnalyticsView = ({ manager, analytics, loading, onBack }) => {
  const catTheme = CAT_COLORS[manager.category] || CAT_COLORS.Electronics;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className={`h-1.5 bg-gradient-to-r ${catTheme.banner}`} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-lg transition"
            >
              Back
            </button>
            <div className="w-px h-8 bg-white/5" />
            <div className="w-10 h-10 bg-cyan-600/30 border border-cyan-500/40 rounded-xl flex items-center justify-center font-black text-white text-sm">
              {manager.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-black text-white text-base tracking-tight leading-none">{manager.name}</h2>
              <p className="text-xs text-gray-500 mt-1.5">{manager.category} Scope · {manager.region} Region</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black border rounded-full px-2.5 py-0.5 uppercase tracking-widest ${catTheme.badge}`}>
              {manager.category}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
            <Award className="text-cyan-400 mb-3" size={24} />
            <p className="text-3xl font-black text-white tabular-nums">{analytics?.total_suppliers_managed ?? 0}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Suppliers Managed</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
            <Activity className="text-emerald-400 mb-3" size={24} />
            <p className="text-3xl font-black text-white tabular-nums">{analytics?.average_supplier_rating ?? '0.00'}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Average Supplier Rating</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
            <Activity className="text-blue-400 mb-3" size={24} />
            <p className="text-3xl font-black text-white uppercase tracking-widest">{analytics?.reliability ?? 'N/A'}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Reliability Index</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── LIST VIEW TABLE ── */
const ManagersTable = ({ managers, selectedId, onRowClick, onRemove }) => {
  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-white/[0.01] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Manager Name</th>
              <th className="px-6 py-4">Category Scope</th>
              <th className="px-6 py-4">Region</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Contact Info</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {managers.map(sm => {
              const catTheme = CAT_COLORS[sm.category] || CAT_COLORS.Electronics;
              const regionCls = REGION_BADGES[sm.region] || REGION_BADGES.Domestic;

              return (
                <tr
                  key={sm.id}
                  onClick={() => onRowClick(sm)}
                  className={`hover:bg-white/[0.02] cursor-pointer transition-colors group ${
                    selectedId === sm.id ? 'bg-cyan-500/5' : ''
                  }`}
                >
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-white text-xs font-bold">
                      {sm.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {sm.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest border rounded-full px-2.5 py-0.5 bg-slate-950/80 shadow-sm ${catTheme.badge}`}>
                      {sm.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest border rounded-full px-2.5 py-0.5 bg-slate-950/80 shadow-sm ${regionCls}`}>
                      {sm.region}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    {sm.department}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Mail size={10} className="text-gray-500" />
                        {sm.email}
                      </div>
                      {sm.phone && (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Phone size={10} className="text-gray-500" />
                          {sm.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusDot isUsed={sm.is_active || sm.is_used} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => onRemove(e, sm.id)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                      title="Remove Manager"
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

/* ── Main Control Tower Component ── */
const SupplyManagerPage = () => {
  const [managers, setManagers] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [view, setView] = useState('roster'); // 'roster' | 'analytics'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedManager, setSelectedManager] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const loadManagers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/business-manager/supply-managers/', { params: { page, size: ITEMS_PER_PAGE } }),
        api.get('/business-manager/supply-managers/count'),
      ]);
      setManagers(listRes.data);
      setTotal(countRes.data.total ?? 0);
    } catch (err) {
      setToast({ type: 'error', msg: err?.response?.data?.detail || 'Failed to fetch supply managers.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManagers(currentPage);
  }, [currentPage, loadManagers]);

  const handleCardClick = async (sm) => {
    setSelectedManager(sm);
    setView('analytics');
    setAnalyticsLoading(true);
    try {
      const res = await api.get(`/business-manager/supply-managers/${sm.id}/analytics`);
      setAnalytics(res.data);
    } catch {
      setToast({ type: 'error', msg: 'Failed to retrieve analytics.' });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      // 1. Create card record
      const cardRes = await api.post('/business-manager/supply-managers/', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || null,
        category: form.category,
        region: form.region,
        department: form.department,
      });

      // 2. Dispatched invite email
      await api.post('/company/auth/invite/send', {
        business_id: 1,
        role: 'supply_manager',
        email: form.email.trim(),
      });

      setManagers(prev => [cardRes.data, ...prev]);
      setTotal(prev => prev + 1);
      setIsFormOpen(false);
      setForm(EMPTY_FORM);
      setToast({ type: 'success', msg: 'Supply Manager onboarded successfully!' });
    } catch (err) {
      setToast({ type: 'error', msg: err?.response?.data?.detail || 'Failed to create manager card.' });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this Supply Manager card? This cannot be undone.')) return;
    try {
      await api.delete(`/business-manager/supply-managers/${id}`);
      setManagers(prev => prev.filter(sm => sm.id !== id));
      setTotal(prev => prev - 1);
      setToast({ type: 'success', msg: 'Manager card deleted.' });
      if (selectedManager?.id === id) {
        setSelectedManager(null);
        setAnalytics(null);
        setView('roster');
      }
    } catch (err) {
      setToast({ type: 'error', msg: err?.response?.data?.detail || 'Failed to remove manager card.' });
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">
              Supply Manager Registry
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">
            {total} Active Supply Manager Card{total !== 1 ? 's' : ''} in registry
          </p>
        </div>

        {view === 'roster' && (
          <div className="flex items-center gap-3">
            {/* Toggle View mode */}
            <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-600/20' : 'text-gray-400 hover:text-white'}`}
                title="Grid Cards"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-600/20' : 'text-gray-400 hover:text-white'}`}
                title="Tabular List"
              >
                <List size={15} />
              </button>
            </div>

            <button
              onClick={() => setIsFormOpen(v => !v)}
              className="group flex items-center gap-2.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition duration-150 shadow-md shadow-cyan-600/10 cursor-pointer"
            >
              <Plus size={14} className="group-hover:rotate-90 transition-transform duration-200" />
              {isFormOpen ? 'Close Panel' : 'Add Supply Manager'}
            </button>
          </div>
        )}
      </div>

      {/* Form Area */}
      {isFormOpen && view === 'roster' && (
        <CreateForm
          form={form}
          loading={createLoading}
          onSubmit={handleSubmit}
          onClose={() => setIsFormOpen(false)}
          setForm={setForm}
        />
      )}

      {/* Views */}
      {view === 'analytics' && selectedManager ? (
        <SMAnalyticsView
          manager={selectedManager}
          analytics={analytics}
          loading={analyticsLoading}
          onBack={() => { setView('roster'); setSelectedManager(null); }}
        />
      ) : (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : managers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 gap-6 border border-dashed border-white/5 rounded-3xl bg-white/[0.005]">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                <Users size={28} className="text-cyan-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-white uppercase tracking-wider">No managers in registry</p>
                <p className="text-xs text-gray-500 mt-2 font-bold">Onboard your first manager using the action button above.</p>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managers.map(sm => (
                <ManagerCard
                  key={sm.id}
                  sm={sm}
                  isSelected={selectedManager?.id === sm.id}
                  onCardClick={handleCardClick}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          ) : (
            <ManagersTable
              managers={managers}
              selectedId={selectedManager?.id}
              onRowClick={handleCardClick}
              onRemove={handleRemove}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setPage(p => p - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 disabled:opacity-30 hover:border-cyan-500 hover:text-white transition duration-200"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => setPage(p => p + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 disabled:opacity-30 hover:border-cyan-500 hover:text-white transition duration-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default SupplyManagerPage;
