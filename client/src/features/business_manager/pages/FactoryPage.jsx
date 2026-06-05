import { useEffect, useState, useCallback } from 'react';
import {
  Users, Mail, Trash2, Plus, X, Loader2,
  ChevronLeft, ChevronRight, RefreshCw, AlertCircle,
  CheckCircle2, Send, UserPlus, Building2, Moon, Sun,
  Shuffle, ChevronDown, ChevronUp, Grid, List, Edit2, Phone
} from 'lucide-react';

import api from '../../../api/api';
import FMAnalyticsPage from './FMAnalyticsPage';

// ─── API ──────────────────────────────────────────────────────────────────
const FM = '/business-manager/factory-managers';

const fetchGroups   = (page, size) => api.get(`${FM}/`, { params: { page, size } });
const fetchCount    = ()           => api.get(`${FM}/count`);
const postGroup     = (payload)    => api.post(`${FM}/`, payload);
const deleteGroup   = (id)         => api.delete(`${FM}/${id}`);
const updateGroup   = (id, payload) => api.put(`${FM}/${id}`, payload);
const sendInvite    = (business_id, email)  => api.post(`/company/auth/invite/send`, { business_id: Number(business_id) || 1, role: 'factory_manager', email });
const fetchMembers  = (id)         => api.get(`${FM}/${id}/members`);

// ─── Constants ────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 6;

const SHIFT_META = {
  Day:   { banner: 'from-cyan-500/30 via-sky-500/20 to-blue-500/10',    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',   icon: <Sun size={11} />,     label: 'Day Shift'   },
  Night: { banner: 'from-blue-600/30 via-indigo-600/20 to-violet-500/10', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Moon size={11} />,    label: 'Night Shift' },
  Swing: { banner: 'from-teal-600/30 via-cyan-600/20 to-sky-500/10',      badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',   icon: <Shuffle size={11} />, label: 'Swing Shift' },
};

const DEPT_COLOR = {
  Assembly:          'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Quality Control': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Logistics:         'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

const EMPTY_FORM = {
  name: '', shift: 'Day', department: 'Assembly',
  factory_id: 1, business_id: 1,
  email: '', phone: '',
};

const errMsg = (err) => {
  const detail = err.response?.data?.detail;
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
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-sm font-semibold text-white border transition-all ${
      toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30' : 'bg-red-950/80 border-red-500/30'
    }`}>
      {toast.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-red-400" />}
      {toast.msg}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────
const SkeletonGroupCard = () => (
  <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden shadow-sm animate-pulse">
    <div className="h-28 bg-white/5" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-white/5 rounded-lg w-1/2" />
      <div className="space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="h-12 bg-white/5 rounded-xl" />
        ))}
      </div>
      <div className="h-9 bg-white/5 rounded-xl mt-2" />
    </div>
  </div>
);

// ─── Meta Chip ─────────────────────────────────────────────────────────────
const MetaChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2 bg-white/[0.02] rounded-xl px-3 py-2 border border-white/5 min-w-0">
    <Icon size={11} className="text-gray-500 mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <p className="text-[10px] text-gray-300 truncate font-semibold mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

// ─── Member Card ──────────────────────────────────────────────────────
const MemberCard = ({ member, onClick }) => (
  <button
    onClick={() => onClick(member)}
    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 transition-all duration-200 text-left group hover:shadow-sm"
  >
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0 group-hover:scale-105 transition-all duration-300 ring-2 ring-white/10 shadow-sm">
      {member.name?.charAt(0)?.toUpperCase() ?? '?'}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{member.name}</p>
      <p className="text-[10px] text-gray-500 truncate">{member.email}</p>
    </div>
    <div className="flex-shrink-0 flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ring-2 ${member.is_used ? 'bg-emerald-400 ring-emerald-400/30' : 'bg-amber-400 ring-amber-400/30 animate-pulse'}`} />
      <span className={`text-[9px] font-bold uppercase tracking-wider ${member.is_used ? 'text-emerald-400' : 'text-amber-400'}`}>
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
    <div className="flex gap-2 pt-3 border-t border-white/5">
      <div className="flex-1 relative">
        <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Invite by email…"
          className="w-full h-9 pl-8 pr-3 text-xs rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
        />
      </div>
      <button
        onClick={handleSend}
        disabled={loading || !email.trim()}
        className="h-9 px-3.5 flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-cyan-600/10"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        <span className="hidden sm:inline">{loading ? 'Sending…' : 'Invite'}</span>
      </button>
    </div>
  );
};

// ─── Group Card ───────────────────────────────────────────────────────────
const GroupCard = ({ group, onDelete, deleting, onMemberClick, showToast, onEdit }) => {
  const shift      = group.shift || 'Day';
  const shiftMeta  = SHIFT_META[shift] ?? SHIFT_META.Day;
  const deptCls    = DEPT_COLOR[group.department] ?? 'bg-white/5 text-gray-400 border-white/10';

  const [members, setMembers]           = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [expanded, setExpanded]         = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setMembersLoading(true);
      try {
        const { data } = await fetchMembers(group.id);
        if (!cancelled) setMembers(Array.isArray(data) ? data : data.members ?? []);
      } catch {
        // fail silently
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
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-cyan-900/10 hover:border-cyan-500/30 transition-all duration-300 flex flex-col group/card">
      {/* Banner */}
      <div className={`relative h-28 bg-gradient-to-br ${shiftMeta.banner} flex flex-col justify-end px-5 pb-4 flex-shrink-0 border-b border-white/5`}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/[0.02] pointer-events-none" />
        <div className="absolute top-3 right-14 w-12 h-12 rounded-full bg-white/[0.01] pointer-events-none" />

        {/* edit btn */}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(group); }}
          className="absolute top-3 right-12 w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-gray-400 hover:text-white transition-all duration-200 z-10"
          title="Edit group"
        >
          <Edit2 size={12} />
        </button>

        {/* delete btn */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(group.id); }}
          disabled={deleting}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-white transition-all duration-200 z-10"
          title="Remove group"
        >
          {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        </button>

        {/* initial avatar */}
        <div className="absolute top-3 left-5 w-9 h-9 bg-cyan-600/30 border border-cyan-500/40 rounded-xl flex items-center justify-center text-white font-black text-sm backdrop-blur-sm ring-1 ring-white/10">
          {group.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>

        {/* badges */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 ${shiftMeta.badge}`}>
            {shiftMeta.icon} {shift}
          </span>
          <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 ${deptCls}`}>
            {group.department}
          </span>
        </div>

        <h2 className="text-white font-black text-base leading-tight drop-shadow-md">{group.name}</h2>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-0 p-5 flex-1">
        {/* Contact info */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <MetaChip icon={Mail} label="Email" value={group.email} />
          <MetaChip icon={Phone} label="Phone" value={group.phone} />
        </div>

        {/* members header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={11} className="text-gray-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
              Team Members
            </span>
            {members.length > 0 && (
              <span className="text-[9px] font-black bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded-full border border-cyan-500/20">
                {members.length}
              </span>
            )}
          </div>
          {members.length > 0 && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {/* member list */}
        {membersLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-11 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-5 gap-2 bg-white/[0.01] rounded-xl border border-dashed border-white/10">
            <UserPlus size={18} className="text-gray-600" />
            <p className="text-[10px] text-gray-500 font-semibold text-center">
              No members yet<br />
              <span className="font-normal text-[9px]">Send an invite below</span>
            </p>
          </div>
        ) : expanded ? (
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
            {members.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                onClick={(m) => onMemberClick(m, group.id)}
              />
            ))}
          </div>
        ) : (
          <button
            onClick={() => setExpanded(true)}
            className="w-full py-2 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors"
          >
            Show {members.length} member{members.length !== 1 ? 's' : ''}
          </button>
        )}

        {/* invite input */}
        <div className="mt-3">
          <InviteInput
            businessId={group.business_id}
            onSuccess={handleInviteSuccess}
            onError={handleInviteError}
          />
        </div>

        {/* footer meta */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.12em] text-gray-600">
          <span className="flex items-center gap-1">
            <Building2 size={9} /> Factory #{group.factory_id}
          </span>
          <span className="text-gray-700">·</span>
          <span>Biz #{group.business_id}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Create Form ─────────────────────────────────────────────────────────
const CreateGroupForm = ({ onSubmit, onClose, loading, initialData, isEdit }) => {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const shift = SHIFT_META[form.shift] ?? SHIFT_META.Day;
  const deptCls = DEPT_COLOR[form.department] ?? 'bg-white/5 text-gray-400 border-white/10';

  const field = key => ({
    value: form[key] ?? '',
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const inputCls  = 'w-full h-9 px-3 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200';
  const selectCls = 'w-full h-9 px-3 text-sm rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200 cursor-pointer';
  const labelCls  = 'block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-1.5';

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <p className="text-sm font-black text-white tracking-tight">{isEdit ? 'Edit Factory Group Card' : 'Create Factory Group Card'}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {isEdit ? 'Update group card parameters and assignments' : 'Once created, use the card\'s invite field to add managers'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: form fields */}
        <div className="p-6 border-r border-white/5 space-y-4">
          <div>
            <label className={labelCls}>Group Name <span className="text-red-400">*</span></label>
            <input
              required type="text" placeholder="e.g. Night Assembly Team A"
              className={inputCls} {...field('name')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Work Email <span className="text-red-400">*</span></label>
              <input
                required type="email" placeholder="e.g. manager@factory.com"
                className={inputCls} {...field('email')}
              />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input
                type="text" placeholder="e.g. +1 (555) 0199"
                className={inputCls} {...field('phone')}
              />
            </div>
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
            disabled={loading || !form.name?.trim() || !form.email?.trim()}
            className="w-full h-10 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-md shadow-cyan-600/10"
          >
            {loading
              ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
              : <>{isEdit ? <Edit2 size={13} /> : <Plus size={13} />}{isEdit ? ' Save Changes' : ' Create Group Card'}</>}
          </button>
        </div>

        {/* Right: live card preview */}
        <div className="p-6 bg-white/[0.01] flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Card preview</p>
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
            <div className={`relative h-24 bg-gradient-to-br ${shift.banner} flex flex-col justify-end px-4 pb-3 border-b border-white/5`}>
              <div className="absolute top-2 left-4 w-7 h-7 bg-cyan-600/30 border border-cyan-500/45 rounded-xl flex items-center justify-center text-white font-black text-xs ring-1 ring-white/10">
                {form.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 ${shift.badge}`}>
                  {shift.icon} {form.shift}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 ${deptCls}`}>
                  {form.department}
                </span>
              </div>
              <h2 className="text-white font-black text-sm leading-tight drop-shadow-md">
                {form.name?.trim() || <span className="opacity-30 font-normal italic text-xs">Group name</span>}
              </h2>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <MetaChip icon={Mail} label="Email" value={form.email} />
                <MetaChip icon={Phone} label="Phone" value={form.phone} />
              </div>
              <div className="flex flex-col items-center justify-center py-4 gap-2 bg-white/[0.01] rounded-xl border border-dashed border-white/10">
                <UserPlus size={16} className="text-gray-600" />
                <p className="text-[10px] text-gray-500">No members yet</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 text-center">After creating, invite managers via email</p>
        </div>
      </div>
    </div>
  );
};

// ─── LIST VIEW TABLE ──────────────────────────────────────────────────────
const GroupsTable = ({ groups, onDelete, deletingIds, onMemberClick, showToast, onEdit }) => {
  const [membersMap, setMembersMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    groups.forEach(async (group) => {
      try {
        const { data } = await fetchMembers(group.id);
        const membersList = Array.isArray(data) ? data : data.members ?? [];
        if (!cancelled) {
          setMembersMap(prev => ({ ...prev, [group.id]: membersList }));
        }
      } catch {
        // fail silently
      }
    });
    return () => { cancelled = true; };
  }, [groups]);

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-white/[0.01] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Group Name</th>
              <th className="px-6 py-4">Shift</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Factory / Biz ID</th>
              <th className="px-6 py-4">Managers & Active Status</th>
              <th className="px-6 py-4 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {groups.map(group => {
              const shift = group.shift || 'Day';
              const shiftMeta = SHIFT_META[shift] ?? SHIFT_META.Day;
              const deptCls = DEPT_COLOR[group.department] ?? 'bg-white/5 text-gray-400 border-white/10';
              const members = membersMap[group.id] || [];

              return (
                <tr key={group.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-bold text-white">{group.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${shiftMeta.badge}`}>
                      {shiftMeta.icon} {shift}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${deptCls}`}>
                      {group.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    Factory #{group.factory_id} <span className="text-gray-600">/</span> Biz #{group.business_id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {members.length === 0 ? (
                        <span className="text-[10px] text-gray-500 italic">No managers yet</span>
                      ) : (
                        members.map(member => (
                          <button
                            key={member.id}
                            onClick={() => onMemberClick(member, group.id)}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/5 hover:border-cyan-500/30 text-[10px] font-semibold text-cyan-300 hover:text-white transition-all"
                            title="View Performance Analytics"
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${member.is_used ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-amber-400 animate-pulse'}`} />
                            {member.name}
                          </button>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit(group)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-gray-450 hover:text-white transition-all animate-none"
                      title="Edit Group"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => onDelete(group.id)}
                      disabled={deletingIds.has(group.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-white transition-all disabled:opacity-30"
                      title="Remove Group"
                    >
                      {deletingIds.has(group.id) ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
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
  const [editingGroup, setEditingGroup] = useState(null);
  const [creating, setCreating]     = useState(false);
  const [viewMode, setViewMode]     = useState('grid'); // 'grid' or 'list'

  const [deletingIds, setDeletingIds] = useState(new Set());
  const [toast, setToast]             = useState(null);

  const [analyticsTarget, setAnalyticsTarget] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

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

  const handleCreateOrUpdate = async (form) => {
    if (editingGroup) {
      setCreating(true);
      try {
        const { data: updated } = await updateGroup(editingGroup.id, {
          name:        form.name.trim(),
          shift:       form.shift,
          department:  form.department,
          factory_id:  Number(form.factory_id),
          business_id: Number(form.business_id),
          email:       form.email.trim(),
          phone:       form.phone?.trim() || null,
        });
        setGroups(prev => prev.map(g => g.id === updated.id ? updated : g));
        setIsFormOpen(false);
        setEditingGroup(null);
        showToast(`"${updated.name}" group updated!`);
      } catch (err) {
        showToast(errMsg(err), 'error');
      } finally {
        setCreating(false);
      }
    } else {
      setCreating(true);
      try {
        const { data: created } = await postGroup({
          name:        form.name.trim(),
          shift:       form.shift,
          department:  form.department,
          factory_id:  Number(form.factory_id),
          business_id: Number(form.business_id),
          email:       form.email.trim(),
          phone:       form.phone?.trim() || null,
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
    }
  };

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

  const handleMemberClick = (member, groupId) => {
    setAnalyticsTarget({ member, groupId });
  };

  if (analyticsTarget) {
    return (
      <FMAnalyticsPage
        member={analyticsTarget.member}
        groupId={analyticsTarget.groupId}
        onBack={() => setAnalyticsTarget(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Factory Control: Groups & Team
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">
            {total} Group{total !== 1 ? 's' : ''} active in sector
            {listError && (
              <span className="ml-2 text-red-400 text-xs font-semibold">· {listError}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
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
            onClick={() => loadGroups(currentPage)}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white transition-all duration-200 disabled:opacity-40"
            title="Refresh Registry"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => { setIsFormOpen(v => !v); setEditingGroup(null); }}
            className="group flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-cyan-600/10"
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
          onSubmit={handleCreateOrUpdate}
          onClose={() => { setIsFormOpen(false); setEditingGroup(null); }}
          loading={creating}
          initialData={editingGroup}
          isEdit={!!editingGroup}
        />
      )}

      {/* GROUP CONTENT */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonGroupCard key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center">
            <Building2 size={28} className="text-cyan-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">No factory groups yet</p>
            <p className="text-xs text-gray-500 mt-1.5">
              Create a group card first, then invite managers by email
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-cyan-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-cyan-500 transition-all duration-200 active:scale-95 shadow-md shadow-cyan-600/10"
          >
            <Plus size={14} /> Create First Group
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              onDelete={handleDelete}
              deleting={deletingIds.has(group.id)}
              onMemberClick={handleMemberClick}
              showToast={showToast}
              onEdit={(g) => { setEditingGroup(g); setIsFormOpen(true); }}
            />
          ))}
        </div>
      ) : (
        <GroupsTable
          groups={groups}
          onDelete={handleDelete}
          deletingIds={deletingIds}
          onMemberClick={handleMemberClick}
          showToast={showToast}
          onEdit={(g) => { setEditingGroup(g); setIsFormOpen(true); }}
        />
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6">
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => setPage(p => p - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 disabled:opacity-30 hover:border-cyan-500 hover:text-cyan-400 transition-all duration-200"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.12em]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages || loading}
            onClick={() => setPage(p => p + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 disabled:opacity-30 hover:border-cyan-500 hover:text-cyan-400 transition-all duration-200"
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