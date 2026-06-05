import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWarehouseManagers,
  createWarehouseManager,
  fetchManagerAnalytics,
  removeWarehouseManager,
  setView,
  setSelectedManager,
  setCurrentPage,
  toggleForm,
  updateForm,
  clearToast,
  updateWarehouseManager,
} from '../../../redux/warehouseManagerSlice';
import {
  Users, Mail, Phone, Trash2, Plus, X, ArrowRight,
  Loader2, ChevronLeft, ChevronRight, Grid, List,
  Package, Warehouse, Truck, CheckCircle2, BarChart3, ShieldCheck, Edit2,
  Send, UserPlus, ChevronUp, ChevronDown
} from 'lucide-react';

import api from '../../../api/api';

const ITEMS_PER_PAGE = 9;

/* ── zone colour map (banner + badge) ────────────────────── */
const ZONE_COLOR = {
  'Dry Goods':     { banner: 'from-amber-600/30 to-amber-500/10',     badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20'  },
  'Cold Storage':  { banner: 'from-sky-600/30 to-sky-500/10',         badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20'    },
  'Inbound':       { banner: 'from-green-600/30 to-green-500/10',     badge: 'bg-green-500/10 text-green-400 border-green-500/20'  },
  'Outbound':      { banner: 'from-violet-600/30 to-violet-500/10',   badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  'Hazmat':        { banner: 'from-red-600/30 to-red-500/10',         badge: 'bg-red-500/10 text-red-400 border-red-500/20'    },
  'General Storage':{ banner: 'from-slate-600/30 to-slate-500/10',   badge: 'bg-white/5 text-gray-400 border-white/10' },
};

const SHIFT_BADGE = {
  Day:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Night: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Swing: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

const ZONES  = Object.keys(ZONE_COLOR);
const SHIFTS = ['Day', 'Night', 'Swing'];

/* ══════════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════════ */
const MetaChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2 bg-white/[0.01] rounded-xl px-3 py-2.5 border border-white/5">
    <span className="text-gray-500 mt-0.5 flex-shrink-0"><Icon size={12} /></span>
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600">{label}</p>
      <p className="text-xs font-semibold text-white truncate mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

const StatusDot = ({ isUsed }) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase ${isUsed ? 'text-emerald-400' : 'text-amber-400'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${isUsed ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400 animate-pulse'}`} />
    {isUsed ? 'Active' : 'Invite Sent'}
  </span>
);

const SkeletonCard = () => (
  <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-32 bg-white/5" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-white/5 rounded w-2/3" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 bg-white/5 rounded-xl" />
        <div className="h-10 bg-white/5 rounded-xl" />
      </div>
    </div>
  </div>
);


const ManagerCard = ({ wm, isSelected, onCardClick, onEdit, onRemove }) => {
  const zone      = wm.department || 'General Storage';
  const shift     = wm.shift || 'Day';
  const zoneMeta  = ZONE_COLOR[zone]  ?? ZONE_COLOR['General Storage'];
  const shiftCls  = SHIFT_BADGE[shift] ?? SHIFT_BADGE.Day;

  const [members, setMembers]           = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [expanded, setExpanded]         = useState(true);
  const [inviteEmail, setInviteEmail]   = useState('');
  const [inviting, setInviting]         = useState(false);
  const [inviteMsg, setInviteMsg]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadMembers = async () => {
      setMembersLoading(true);
      try {
        const res = await api.get(`/business-manager/warehouse-managers/${wm.id}/members`);
        if (!cancelled) setMembers(Array.isArray(res.data) ? res.data : []);
      } catch {
        // fail silently
      } finally {
        if (!cancelled) setMembersLoading(false);
      }
    };
    loadMembers();
    return () => { cancelled = true; };
  }, [wm.id]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.post(`/business-manager/warehouse-managers/${wm.id}/invite`, { email: inviteEmail.trim() });
      setInviteMsg({ type: 'success', text: `Invite sent to ${inviteEmail.trim()}` });
      setInviteEmail('');
      // Reload members
      const res = await api.get(`/business-manager/warehouse-managers/${wm.id}/members`);
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setInviteMsg({ type: 'error', text: detail || 'Failed to send invite.' });
    } finally {
      setInviting(false);
      setTimeout(() => setInviteMsg(null), 4000);
    }
  };

  return (
    <div
      className={`bg-white/[0.02] border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-cyan-500/30 transition-all duration-200 flex flex-col ${
        isSelected ? 'border-cyan-500 ring-2 ring-cyan-500/10' : 'border-white/[0.08]'
      }`}
    >
      {/* coloured banner */}
      <div
        className={`relative h-32 flex flex-col justify-end px-5 pb-4 flex-shrink-0 bg-gradient-to-br ${zoneMeta.banner} border-b border-white/5`}
        onClick={() => onCardClick(wm)}
        style={{ cursor: 'pointer' }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/[0.02] pointer-events-none" />
        <div className="absolute top-3 right-14 w-12 h-12 rounded-full bg-white/[0.01] pointer-events-none" />

        {/* edit / remove */}
        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(e, wm); }}
            className="text-gray-500 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5"
            title="Edit"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(e, wm.id); }}
            className="text-gray-500 hover:text-red-400 transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-red-500/20"
            title="Remove"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* avatar */}
        <div className="absolute top-3 left-5 w-8 h-8 bg-cyan-600/30 border border-cyan-500/40 rounded-xl flex items-center justify-center text-white font-black text-sm">
          {wm.name.charAt(0).toUpperCase()}
        </div>

        {/* badges */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${zoneMeta.badge}`}>
            {zone}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${shiftCls}`}>
            {shift} Shift
          </span>
        </div>

        <h2 className="text-white font-bold text-lg leading-tight drop-shadow">{wm.name}</h2>
      </div>

      {/* body */}
      <div className="flex flex-col gap-0 p-5 flex-1">
        {/* Status + contact */}
        <div className="pb-3 border-b border-white/5">
          <StatusDot isUsed={wm.is_used} />
        </div>
        <div className="pt-3 grid grid-cols-2 gap-2">
          <MetaChip icon={Mail}  label="Email" value={wm.email} />
          <MetaChip icon={Phone} label="Phone" value={wm.phone} />
        </div>

        {/* Members section */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users size={11} className="text-gray-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">Team Members</span>
              {members.length > 0 && (
                <span className="text-[9px] font-black bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded-full border border-cyan-500/20">
                  {members.length}
                </span>
              )}
            </div>
            {members.length > 0 && (
              <button onClick={() => setExpanded(v => !v)} className="text-gray-500 hover:text-white transition-colors">
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {membersLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-11 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 gap-2 bg-white/[0.01] rounded-xl border border-dashed border-white/10">
              <UserPlus size={16} className="text-gray-600" />
              <p className="text-[10px] text-gray-500 font-semibold text-center">No members yet<br /><span className="font-normal text-[9px]">Send an invite below</span></p>
            </div>
          ) : expanded ? (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {member.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{member.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{member.email}</p>
                  </div>
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${member.is_used ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                </div>
              ))}
            </div>
          ) : (
            <button onClick={() => setExpanded(true)} className="w-full py-2 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors">
              Show {members.length} member{members.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Invite input */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="email"
                value={inviteEmail}
                onChange={e => { setInviteEmail(e.target.value); setInviteMsg(null); }}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                placeholder="Invite by email…"
                className="w-full h-9 pl-8 pr-3 text-xs rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="h-9 px-3.5 flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-600/10"
            >
              {inviting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              <span className="hidden sm:inline">{inviting ? 'Sending…' : 'Invite'}</span>
            </button>
          </div>
          {inviteMsg && (
            <div className={`mt-2 text-[10px] font-semibold px-2 py-1 rounded-lg ${
              inviteMsg.type === 'success' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
            }`}>
              {inviteMsg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════════════════════
   Create form
═══════════════════════════════════════════════════════════ */
const CreateForm = ({ form, inviteLoading, onSubmit, onClose, dispatch, isEdit }) => {
  const zone     = form.zone  || 'Dry Goods';
  const shift    = form.shift || 'Day';
  const zoneMeta = ZONE_COLOR[zone]  ?? ZONE_COLOR['General Storage'];
  const shiftCls = SHIFT_BADGE[shift] ?? SHIFT_BADGE.Day;

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg">

      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <p className="text-sm font-bold text-white">{isEdit ? 'Edit Warehouse Manager' : 'New Warehouse Manager'}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{isEdit ? 'Modify manager card details and settings' : 'Card is created instantly & invite email is sent'}</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition"
        >
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* ── LEFT: fields ── */}
        <div className="p-6 border-r border-white/5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Fill in details</p>
          <form onSubmit={onSubmit} id="create-whm-form" className="space-y-3">

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                required type="text" placeholder="e.g. Ravi Sharma"
                className="w-full h-9 px-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition"
                value={form.name}
                onChange={e => dispatch(updateForm({ name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Work Email <span className="text-red-400">*</span>
              </label>
              <input
                required type="email" placeholder="ravi@warehouse.com"
                className="w-full h-9 px-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition"
                value={form.email}
                onChange={e => dispatch(updateForm({ email: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Phone Number</label>
              <input
                type="text" placeholder="+91 98000 00000"
                className="w-full h-9 px-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition"
                value={form.phone}
                onChange={e => dispatch(updateForm({ phone: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Shift</label>
                <select
                  className="w-full h-9 px-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition cursor-pointer"
                  value={form.shift}
                  onChange={e => dispatch(updateForm({ shift: e.target.value }))}
                >
                  {SHIFTS.map(s => <option key={s} className="bg-[#0f172a]">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Zone</label>
                <select
                  className="w-full h-9 px-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition cursor-pointer"
                  value={form.zone}
                  onChange={e => dispatch(updateForm({ zone: e.target.value }))}
                >
                  {ZONES.map(z => <option key={z} className="bg-[#0f172a]">{z}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Warehouse ID</label>
              <input
                type="number" min="1" placeholder="1"
                className="w-full h-9 px-3 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition"
                value={form.warehouse_id}
                onChange={e => dispatch(updateForm({ warehouse_id: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <button
              type="submit"
              form="create-whm-form"
              disabled={inviteLoading || !form.name?.trim() || !form.email?.trim()}
              className="w-full h-10 mt-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-md shadow-cyan-600/10"
            >
              {inviteLoading
                ? <><Loader2 size={13} className="animate-spin" /> saving…</>
                : <><ArrowRight size={13} /> {isEdit ? 'Save Changes' : 'Create Card & Send Invite'}</>}
            </button>
          </form>
        </div>

        {/* ── RIGHT: live preview ── */}
        <div className="p-6 bg-white/[0.01] flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live preview</p>

          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
            <div
              className={`relative h-28 flex flex-col justify-end px-4 pb-3 bg-gradient-to-br ${zoneMeta.banner} border-b border-white/5`}
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/[0.02] pointer-events-none" />
              <div className="absolute top-2 right-10 w-8 h-8 rounded-full bg-white/[0.01] pointer-events-none" />

              <div className="absolute top-3 left-4 w-7 h-7 bg-cyan-600/30 border border-cyan-500/40 rounded-lg flex items-center justify-center text-white font-black text-sm">
                {form.name?.charAt(0)?.toUpperCase() || '?'}
              </div>

              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 ${zoneMeta.badge}`}>
                  {zone}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 ${shiftCls}`}>
                  {shift} Shift
                </span>
              </div>
              <h2 className="text-white font-bold text-base leading-tight drop-shadow">
                {form.name?.trim() || <span className="opacity-30 font-normal italic">Manager name</span>}
              </h2>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <MetaChip icon={Mail}  label="Email" value={form.email || '—'} />
                <MetaChip icon={Phone} label="Phone" value={form.phone || '—'} />
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Invite Sent
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 text-center">Preview updates as you type</p>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   LIST VIEW TABLE
═══════════════════════════════════════════════════════════ */
const ManagersTable = ({ managers, selectedId, onRowClick, onEdit, onRemove }) => {
  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-white/[0.01] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Manager Name</th>
              <th className="px-6 py-4">Zone (Department)</th>
              <th className="px-6 py-4">Shift</th>
              <th className="px-6 py-4">Contact Info</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {managers.map(wm => {
              const zone = wm.department || 'General Storage';
              const shift = wm.shift || 'Day';
              const zoneMeta = ZONE_COLOR[zone] ?? ZONE_COLOR['General Storage'];
              const shiftCls = SHIFT_BADGE[shift] ?? SHIFT_BADGE.Day;

              return (
                <tr
                  key={wm.id}
                  onClick={() => onRowClick(wm)}
                  className={`hover:bg-white/[0.02] cursor-pointer transition-colors group ${
                    selectedId === wm.id ? 'bg-cyan-500/5' : ''
                  }`}
                >
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-white text-xs font-bold">
                      {wm.name.charAt(0).toUpperCase()}
                    </div>
                    {wm.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${zoneMeta.badge}`}>
                      {zone}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${shiftCls}`}>
                      {shift}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Mail size={10} className="text-gray-500" />
                        {wm.email}
                      </div>
                      {wm.phone && (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Phone size={10} className="text-gray-500" />
                          {wm.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusDot isUsed={wm.is_used} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => onEdit(e, wm)}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/20 text-slate-400 hover:text-white transition-all"
                        title="Edit Manager"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => onRemove(e, wm.id)}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                        title="Remove Manager"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
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

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
const WarehouseManagerPage = () => {
  const dispatch = useDispatch();
  const {
    managers, total, currentPage,
    form, isFormOpen,
    selectedManager, analytics,
    view, loading, inviteLoading, analyticsLoading,
    toast,
  } = useSelector(state => state.warehouseManager);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [editingManagerId, setEditingManagerId] = useState(null);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  useEffect(() => {
    dispatch(fetchWarehouseManagers({ page: currentPage, size: ITEMS_PER_PAGE }));
  }, [currentPage, dispatch]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dispatch(clearToast()), 3500);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  const handleCardClick = (wm) => {
    dispatch(setSelectedManager(wm));
    dispatch(fetchManagerAnalytics(wm.id));
  };

  const handleEdit = (e, wm) => {
    e.stopPropagation();
    dispatch(updateForm({
      name: wm.name,
      email: wm.email,
      phone: wm.phone || '',
      shift: wm.shift,
      zone: wm.department || 'General Storage',
      warehouse_id: wm.warehouse_id || 1,
    }));
    setEditingManagerId(wm.id);
    dispatch(toggleForm());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingManagerId) {
      dispatch(updateWarehouseManager({ managerId: editingManagerId, formData: form }));
      setEditingManagerId(null);
    } else {
      dispatch(createWarehouseManager(form));
    }
  };

  const handleRemove = (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Remove this manager?')) return;
    dispatch(removeWarehouseManager(id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Warehouse Control: Team & Performance
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">
            {total} Warehouse Manager{total !== 1 ? 's' : ''} · Central Hub — Kochi (WH-01)
          </p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
          <button
            onClick={() => dispatch(setView('roster'))}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              view === 'roster' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-600/10' : 'text-gray-400 hover:text-white'
            }`}
          >
            TEAM ROSTER
          </button>
          <button
            onClick={() => { if (selectedManager) dispatch(setView('analytics')); }}
            disabled={!selectedManager}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              view === 'analytics' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-600/10' : 'text-gray-500 hover:text-white'
            } ${!selectedManager ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            ANALYTICS
          </button>
        </div>
      </div>

      {/* ══ ROSTER VIEW ══ */}
      {view === 'roster' && (
        <div className="space-y-6">

          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">
              Manager Directory
            </h2>
            <div className="flex items-center gap-3">
              {/* Grid / List toggle */}
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
                onClick={() => dispatch(toggleForm())}
                className="group flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-xl transition-all duration-150 shadow-md shadow-cyan-600/10"
              >
                <span className="w-5 h-5 bg-white/15 rounded-md flex items-center justify-center group-hover:rotate-90 transition-transform duration-200">
                  {isFormOpen ? <X size={12} /> : <Plus size={12} />}
                </span>
                {isFormOpen ? 'Close' : 'Add Warehouse Manager'}
              </button>
            </div>
          </div>

          {isFormOpen && (
            <CreateForm
              form={form}
              inviteLoading={inviteLoading}
              onSubmit={handleSubmit}
              onClose={() => { dispatch(toggleForm()); setEditingManagerId(null); }}
              dispatch={dispatch}
              isEdit={!!editingManagerId}
            />
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : managers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center">
                <Warehouse size={28} className="text-cyan-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">No warehouse managers yet</p>
                <p className="text-xs text-gray-500 mt-1">Click "Add Warehouse Manager" to create the first card</p>
              </div>
              <button
                onClick={() => dispatch(toggleForm())}
                className="flex items-center gap-2 bg-cyan-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-cyan-500 transition shadow-md shadow-cyan-600/10"
              >
                <Plus size={14} /> Add Warehouse Manager
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {managers.map(wm => (
                <ManagerCard
                  key={wm.id}
                  wm={wm}
                  isSelected={selectedManager?.id === wm.id}
                  onCardClick={handleCardClick}
                  onEdit={handleEdit}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          ) : (
            <ManagersTable
              managers={managers}
              selectedId={selectedManager?.id}
              onRowClick={handleCardClick}
              onEdit={handleEdit}
              onRemove={handleRemove}
            />
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 disabled:opacity-30 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 disabled:opacity-30 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══ ANALYTICS VIEW ══ */}
      {view === 'analytics' && selectedManager && (
        <WMAnalyticsPage
          manager={selectedManager}
          analytics={analytics}
          loading={analyticsLoading}
          onBack={() => dispatch(setView('roster'))}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white border transition-all ${
          toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30' : 'bg-red-950/80 border-red-500/30'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default WarehouseManagerPage;