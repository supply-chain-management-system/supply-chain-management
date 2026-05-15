import { useEffect, useState, useCallback } from 'react';
import {
  Users, Mail, Trash2, Plus, X, Loader2,
  ChevronLeft, ChevronRight, RefreshCw, AlertCircle,
  CheckCircle2, Send, UserPlus, Building2, Moon, Sun,
  Shuffle, ChevronDown, ChevronUp,
} from 'lucide-react';

import api from '../../../api/api';
import FMAnalyticsPage from './FMAnalyticsPage';

// ─── API ──────────────────────────────────────────────────────────────────
const FM = '/business-manager/factory-managers';

const fetchGroups   = (page, size) => api.get(`${FM}/`, { params: { page, size } });
const fetchCount    = ()           => api.get(`${FM}/count`);
const postGroup     = (payload)    => api.post(`${FM}/`, payload);
const deleteGroup   = (id)         => api.delete(`${FM}/${id}`);
const sendInvite    = (business_id, email)  => api.post(`/company/auth/invite/send`, { business_id: Number(business_id) || 1, role: 'factory_manager', email });
const fetchMembers  = (id)         => api.get(`${FM}/${id}/members`);

// ─── Constants ────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 6;

const SHIFT_META = {
  Day:   { banner: 'from-amber-500 via-orange-400 to-yellow-300',      badge: 'bg-orange-50 text-orange-600 border-orange-200',   icon: <Sun size={11} />,     label: 'Day Shift'   },
  Night: { banner: 'from-indigo-600 via-blue-500 to-cyan-400',         badge: 'bg-indigo-50 text-indigo-600 border-indigo-200',   icon: <Moon size={11} />,    label: 'Night Shift' },
  Swing: { banner: 'from-violet-600 via-purple-500 to-fuchsia-400',    badge: 'bg-purple-50 text-purple-600 border-purple-200',   icon: <Shuffle size={11} />, label: 'Swing Shift' },
};

const DEPT_COLOR = {
  Assembly:          'bg-blue-50   text-blue-700   border-blue-200',
  'Quality Control': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Logistics:         'bg-amber-50  text-amber-700  border-amber-200',
};

const EMPTY_FORM = {
  name: '', shift: 'Day', department: 'Assembly',
  factory_id: 1, business_id: 1,
};


const errMsg = (err) => {
  const detail = err.response?.data?.detail;
  // If it's a FastAPI validation array, turn it into a string
  if (Array.isArray(detail)) {
    return detail.map(e => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', ');
  }
  return detail || err.message || 'Something went wrong.';
};


// ─── Toast ────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/10 backdrop-blur-md text-sm font-semibold text-white transition-all ${
      toast.type === 'success' ? 'bg-emerald-600/95' : 'bg-red-500/95'
    }`}>
      {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {toast.msg}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────
const SkeletonGroupCard = () => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm animate-pulse">
    <div className="h-28 bg-gradient-to-br from-slate-200/80 to-slate-100/80" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
      <div className="space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="h-12 bg-slate-50/80 rounded-xl" />
        ))}
      </div>
      <div className="h-9 bg-slate-100/80 rounded-xl mt-2" />
    </div>
  </div>
);

// ─── Member Sub-Card ──────────────────────────────────────────────────────
const MemberCard = ({ member, onClick }) => (
  <button
    onClick={() => onClick(member)}
    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-blue-50/80 border border-slate-100 hover:border-blue-200 transition-all duration-200 text-left group hover:shadow-sm"
  >
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0 group-hover:from-blue-600 group-hover:to-blue-400 transition-all duration-300 ring-2 ring-white shadow-sm">
      {member.name?.charAt(0)?.toUpperCase() ?? '?'}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
      <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
    </div>
    <div className="flex-shrink-0 flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ring-2 ${member.is_used ? 'bg-emerald-400 ring-emerald-400/30' : 'bg-amber-400 ring-amber-400/30 animate-pulse'}`} />
      <span className={`text-[9px] font-bold uppercase tracking-wider ${member.is_used ? 'text-emerald-600' : 'text-amber-500'}`}>
        {member.is_used ? 'Active' : 'Pending'}
      </span>
    </div>
  </button>
);

// ─── Invite Input ─────────────────────────────────────────────────────────
const InviteInput = ({ businessId, onSuccess, onError }) => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await sendInvite(businessId, email.trim());
      onSuccess(`Invite sent to ${email.trim()}`);
      setEmail('');
    } catch (err) {
      onError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 pt-3 border-t border-slate-100">
      <div className="flex-1 relative">
        <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Invite by email…"
          className="w-full h-9 pl-8 pr-3 text-xs rounded-xl border border-slate-200/60 bg-slate-50/80 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100/80 transition-all duration-200"
        />
      </div>
      <button
        onClick={handleSend}
        disabled={loading || !email.trim()}
        className="h-9 px-3.5 flex items-center gap-1.5 bg-slate-800 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        <span className="hidden sm:inline">{loading ? 'Sending…' : 'Invite'}</span>
      </button>
    </div>
  );
};

// ─── Group Card ───────────────────────────────────────────────────────────
const GroupCard = ({ group, onDelete, deleting, onMemberClick, showToast }) => {
  const shift      = group.shift || 'Day';
  const shiftMeta  = SHIFT_META[shift] ?? SHIFT_META.Day;
  const deptCls    = DEPT_COLOR[group.department] ?? 'bg-gray-50 text-gray-600 border-gray-200';

  const [members, setMembers]           = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [expanded, setExpanded]         = useState(true);

  // Load members when card mounts
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setMembersLoading(true);
      try {
        const { data } = await fetchMembers(group.id);
        if (!cancelled) setMembers(Array.isArray(data) ? data : data.members ?? []);
      } catch {
        // silently fail — members section just stays empty
      } finally {
        if (!cancelled) setMembersLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [group.id]);

  const handleInviteSuccess = (msg) => showToast(msg, 'success');
  const handleInviteError   = (msg) => showToast(msg, 'error');

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 flex flex-col group/card">
      {/* Banner */}
      <div className={`relative h-28 bg-gradient-to-br ${shiftMeta.banner} flex flex-col justify-end px-5 pb-4 flex-shrink-0`}>
        {/* decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/[0.08] pointer-events-none" />
        <div className="absolute top-3 right-14 w-12 h-12 rounded-full bg-white/[0.06] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        {/* delete btn */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(group.id); }}
          disabled={deleting}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/80 text-white/60 hover:text-white backdrop-blur-sm transition-all duration-200 z-10"
          title="Remove group"
        >
          {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        </button>

        {/* initial avatar */}
        <div className="absolute top-3 left-5 w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-sm backdrop-blur-sm ring-1 ring-white/20">
          {group.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>

        {/* badges */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 bg-white/95 shadow-sm ${shiftMeta.badge}`}>
            {shiftMeta.icon} {shift}
          </span>
          <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 bg-white/95 shadow-sm ${deptCls}`}>
            {group.department}
          </span>
        </div>

        <h2 className="text-white font-black text-base leading-tight drop-shadow-md">{group.name}</h2>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-0 p-5 flex-1">
        {/* members header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={11} className="text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Team Members
            </span>
            {members.length > 0 && (
              <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100">
                {members.length}
              </span>
            )}
          </div>
          {members.length > 0 && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-gray-300 hover:text-gray-600 transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {/* member list */}
        {membersLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-11 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-5 gap-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <UserPlus size={18} className="text-slate-300" />
            <p className="text-[10px] text-slate-400 font-semibold text-center">
              No members yet<br />
              <span className="font-normal">Send an invite below</span>
            </p>
          </div>
        ) : expanded ? (
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
            {members.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                onClick={onMemberClick}
              />
            ))}
          </div>
        ) : (
          <button
            onClick={() => setExpanded(true)}
            className="w-full py-2 text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest transition-colors"
          >
            Show {members.length} member{members.length !== 1 ? 's' : ''}
          </button>
        )}

        {/* invite input — always visible at bottom */}
        <div className="mt-3">
          <InviteInput
            businessId={group.business_id}
            onSuccess={handleInviteSuccess}
            onError={handleInviteError}
          />
        </div>

        {/* footer meta */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-300">
          <span className="flex items-center gap-1">
            <Building2 size={9} /> Factory #{group.factory_id}
          </span>
          <span className="text-slate-200">·</span>
          <span>Biz #{group.business_id}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Create Form (inline slide-down) ─────────────────────────────────────
const CreateGroupForm = ({ onSubmit, onClose, loading }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const shift = SHIFT_META[form.shift] ?? SHIFT_META.Day;
  const deptCls = DEPT_COLOR[form.department] ?? 'bg-gray-50 text-gray-600 border-gray-200';

  const field = key => ({
    value: form[key] ?? '',
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const inputCls  = 'w-full h-9 px-3 text-sm rounded-xl border border-slate-200/60 bg-slate-50/80 text-slate-800 placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100/80 transition-all duration-200';
  const selectCls = 'w-full h-9 px-3 text-sm rounded-xl border border-slate-200/60 bg-slate-50/80 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100/80 transition-all duration-200 cursor-pointer';
  const labelCls  = 'block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5';

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <p className="text-sm font-black text-slate-800 tracking-tight">Create Factory Group Card</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Once created, use the card's invite field to add managers
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
        >
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: form fields */}
        <div className="p-6 border-r border-slate-100 space-y-4">
          <div>
            <label className={labelCls}>Group Name <span className="text-red-400">*</span></label>
            <input
              required type="text" placeholder="e.g. Night Assembly Team A"
              className={inputCls} {...field('name')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Shift</label>
              <select className={selectCls} {...field('shift')}>
                <option>Day</option>
                <option>Night</option>
                <option>Swing</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Department</label>
              <select className={selectCls} {...field('department')}>
                <option>Assembly</option>
                <option>Quality Control</option>
                <option>Logistics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Factory ID</label>
              <input type="number" min="1" className={inputCls} {...field('factory_id')} />
            </div>
            <div>
              <label className={labelCls}>Business ID</label>
              <input type="number" min="1" className={inputCls} {...field('business_id')} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSubmit(form)}
            disabled={loading || !form.name?.trim()}
            className="w-full h-10 flex items-center justify-center gap-2 bg-slate-800 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
          >
            {loading
              ? <><Loader2 size={13} className="animate-spin" /> Creating…</>
              : <><Plus size={13} /> Create Group Card</>}
          </button>
        </div>

        {/* Right: live card preview */}
        <div className="p-6 bg-slate-50/60 flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Card preview</p>
          <div className="bg-white/90 border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
            <div className={`relative h-24 bg-gradient-to-br ${shift.banner} flex flex-col justify-end px-4 pb-3`}>
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/[0.08] pointer-events-none" />
              <div className="absolute top-2 left-4 w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-xs ring-1 ring-white/20">
                {form.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 bg-white/95 shadow-sm ${shift.badge}`}>
                  {shift.icon} {form.shift}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 bg-white/95 shadow-sm ${deptCls}`}>
                  {form.department}
                </span>
              </div>
              <h2 className="text-white font-black text-sm leading-tight drop-shadow-md">
                {form.name?.trim() || <span className="opacity-40 font-normal italic text-xs">Group name</span>}
              </h2>
            </div>
            <div className="p-4">
              <div className="flex flex-col items-center justify-center py-4 gap-2 bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
                <UserPlus size={16} className="text-slate-300" />
                <p className="text-[10px] text-slate-400">No members yet</p>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="flex-1 h-7 bg-slate-100/80 rounded-lg" />
                <div className="w-16 h-7 bg-slate-200/80 rounded-lg" />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center">After creating, invite managers via email</p>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════
const FactoryPage = () => {
  const [groups, setGroups]         = useState([]);
  const [total, setTotal]           = useState(0);
  const [currentPage, setPage]      = useState(1);
  const [loading, setLoading]       = useState(false);
  const [listError, setListError]   = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [creating, setCreating]     = useState(false);

  const [deletingIds, setDeletingIds] = useState(new Set());
  const [toast, setToast]             = useState(null);

  // Analytics navigation
  const [analyticsTarget, setAnalyticsTarget] = useState(null); // { member, groupId }

  const showToast = (msg, type = 'success') => setToast({ msg, type });
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // ── FETCH ─────────────────────────────────────────────────
  const loadGroups = useCallback(async (page = 1) => {
    setLoading(true);
    setListError(null);
    try {
      const [listRes, countRes] = await Promise.all([
        fetchGroups(page, ITEMS_PER_PAGE),
        fetchCount(),
      ]);
      setGroups(listRes.data);
      setTotal(countRes.data.total ?? 0);
    } catch (err) {
      const msg = errMsg(err);
      setListError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGroups(currentPage); }, [currentPage, loadGroups]);

  // ── CREATE GROUP ──────────────────────────────────────────
  const handleCreate = async (form) => {
    setCreating(true);
    try {
      const { data: created } = await postGroup({
        name:        form.name.trim(),
        shift:       form.shift,
        department:  form.department,
        factory_id:  Number(form.factory_id),
        business_id: Number(form.business_id),
        email:       "group@placeholder.com" // Dummy email for the group card
    });
      setGroups(prev => [created, ...prev]);
      setTotal(prev => prev + 1);
      setIsFormOpen(false);
      showToast(`"${created.name}" group created!`);
    } catch (err) {
      showToast(errMsg(err), 'error');
    } finally {
      setCreating(false);
    }
  };

  // ── DELETE GROUP ──────────────────────────────────────────
  const handleDelete = async (groupId) => {
    if (!window.confirm('Remove this group card? This cannot be undone.')) return;
    setDeletingIds(prev => new Set(prev).add(groupId));
    try {
      await deleteGroup(groupId);
      setGroups(prev => prev.filter(g => g.id !== groupId));
      setTotal(prev => prev - 1);
      showToast('Group removed.');
    } catch (err) {
      showToast(errMsg(err), 'error');
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });
    }
  };

  // ── MEMBER CLICK → ANALYTICS ──────────────────────────────
  const handleMemberClick = (member, groupId) => {
    setAnalyticsTarget({ member, groupId });
  };

  // ── ANALYTICS VIEW ────────────────────────────────────────
  if (analyticsTarget) {
    return (
      <FMAnalyticsPage
        member={analyticsTarget.member}
        groupId={analyticsTarget.groupId}
        onBack={() => setAnalyticsTarget(null)}
      />
    );
  }

  // ── MAIN RENDER ───────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Factory Control: Groups & Team
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {total} Group{total !== 1 ? 's' : ''}
            {listError && (
              <span className="ml-2 text-red-400 text-xs font-semibold">· {listError}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadGroups(currentPage)}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all duration-200 disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => { setIsFormOpen(v => !v); }}
            className="group flex items-center gap-2 bg-slate-800 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
          >
            <span className="w-5 h-5 bg-white/15 rounded-md flex items-center justify-center group-hover:rotate-90 transition-transform duration-200">
              {isFormOpen ? <X size={12} /> : <Plus size={12} />}
            </span>
            {isFormOpen ? 'Close' : 'Add Factory Manager'}
          </button>
        </div>
      </div>

      {/* CREATE FORM */}
      {isFormOpen && (
        <CreateGroupForm
          onSubmit={handleCreate}
          onClose={() => setIsFormOpen(false)}
          loading={creating}
        />
      )}

      {/* GROUP GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonGroupCard key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center ring-4 ring-blue-50/50">
            <Building2 size={28} className="text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700">No factory groups yet</p>
            <p className="text-xs text-slate-400 mt-1.5">
              Create a group card first, then invite managers by email
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 active:scale-95 shadow-sm"
          >
            <Plus size={14} /> Create First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              onDelete={handleDelete}
              deleting={deletingIds.has(group.id)}
              onMemberClick={(member) => handleMemberClick(member, group.id)}
              showToast={showToast}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6">
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => setPage(p => p - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm text-slate-500 disabled:opacity-30 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition-all duration-200"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages || loading}
            onClick={() => setPage(p => p + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm text-slate-500 disabled:opacity-30 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition-all duration-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default FactoryPage;