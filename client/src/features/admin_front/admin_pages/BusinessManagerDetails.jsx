import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Factory,
  Loader2,
  Mail,
  Package,
  Plus,
  Send,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
  Warehouse,
} from 'lucide-react';

import api from '../../../api/api';

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not available';

const mockSections = [
  {
    title: 'Factory',
    value: '0',
    detail: 'Production models pending',
    icon: Package,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
  },
  {
    title: 'Warehouses',
    value: '0',
    detail: 'Warehouse models pending',
    icon: Building2,
    color: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    title: 'Supply',
    value: '0',
    detail: 'Supply managers pending',
    icon: Package,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
];

const ROLE_INVITES = [
  {
    role: 'business_manager',
    title: 'Business Manager',
    description: 'Invite another person to manage this business',
    placeholder: 'businessmanager@example.com',
    icon: Users,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
];

const MANAGER_CARDS = [
  {
    role: 'factory_manager',
    title: 'Factory Managers',
    description: 'Invite a manager for factory operations',
    placeholder: 'factorymanager@example.com',
    icon: Factory,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    accent: '#D97706',
  },
  {
    role: 'warehouse_manager',
    title: 'Warehouse Managers',
    description: 'Invite a manager for warehouse operations',
    placeholder: 'warehousemanager@example.com',
    icon: Warehouse,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    accent: '#059669',
  },
  {
    role: 'logistics_manager',
    title: 'Logistics Managers',
    description: 'Invite a manager for dispatch and delivery flow',
    placeholder: 'logisticsmanager@example.com',
    icon: Truck,
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    accent: '#EA580C',
  },
  {
    role: 'co_manager',
    title: 'Co Managers',
    description: 'Invite a co-manager for shared business operations',
    placeholder: 'comanager@example.com',
    icon: ShieldCheck,
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    accent: '#7C3AED',
  },
  {
    role: 'supply_manager',
    title: 'Supply Managers',
    description: 'Invite a manager for suppliers and procurement',
    placeholder: 'supplymanager@example.com',
    icon: Package,
    color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    accent: '#0891B2',
  },
];

const ROLE_CONFIG = Object.fromEntries(MANAGER_CARDS.map((config) => [config.role, config]));

const ROLE_DEPARTMENTS = {
  factory_manager: ['Assembly', 'Quality Control', 'Production', 'Packaging'],
  warehouse_manager: ['General Storage', 'Cold Storage', 'Inbound', 'Outbound'],
  logistics_manager: ['Local', 'Regional', 'Long Haul', 'Last Mile'],
  co_manager: ['Operations', 'Finance', 'Compliance', 'General'],
  supply_manager: ['Procurement', 'Raw Material', 'Packaging', 'Vendor Relations'],
};

const CARD_COLORS = ['#D97706', '#059669', '#EA580C', '#7C3AED', '#0891B2', '#185FA5'];

const ROLE_LABELS = {
  business_manager: 'Business Manager',
  factory_manager: 'Factory Manager',
  warehouse_manager: 'Warehouse Manager',
  logistics_manager: 'Logistics Manager',
  co_manager: 'Co Manager',
  supply_manager: 'Supply Manager',
};

const errMsg = (err) => {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => `${item.loc?.at(-1) || 'field'}: ${item.msg}`).join(', ');
  }
  return detail || err?.message || 'Something went wrong.';
};

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
    <div className="flex items-center gap-2 text-gray-400">
      <Icon size={14} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <p className="mt-2 text-sm font-semibold text-gray-800">{value}</p>
  </div>
);

const ManagerRow = ({ manager }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
      {manager.name?.charAt(0)?.toUpperCase() || '?'}
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-gray-800 truncate">{manager.name}</p>
        {manager.is_verified && <UserCheck size={14} className="text-emerald-500 flex-shrink-0" />}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Mail size={12} />
        <span className="truncate">{manager.email}</span>
      </div>
    </div>

    <div className="flex flex-col items-end gap-1">
      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
        {ROLE_LABELS[manager.role] || manager.role || 'Manager'}
      </span>
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
        manager.is_pending
          ? 'bg-amber-50 text-amber-600'
          : manager.is_active
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-gray-100 text-gray-500'
      }`}>
        {manager.is_pending ? 'Invite Sent' : manager.is_active ? 'Active' : 'Inactive'}
      </span>
    </div>
  </div>
);

const InviteRoleRow = ({ cardId, config, onSent, compact = false }) => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);
  const Icon = config.icon;

  const handleSend = async () => {
    if (!email.trim()) return;

    try {
      setSending(true);
      setMessage(null);

      await api.post('/company/auth/invite/send', {
        business_id: Number(cardId),
        role: config.role,
        email: email.trim(),
      });

      setMessage({ type: 'success', text: `${config.title} invite sent to ${email.trim()}` });
      setEmail('');
      onSent?.();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={compact ? '' : 'rounded-xl border border-gray-100 bg-white p-4 shadow-sm'}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${config.color}`}>
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">{config.title}</p>
            <p className="text-[11px] text-gray-400">{config.description}</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">
          {config.role}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setMessage(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={config.placeholder}
          className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          onClick={handleSend}
          disabled={sending || !email.trim()}
          className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          <span className="hidden sm:inline">{sending ? 'Sending...' : 'Invite'}</span>
        </button>
      </div>

      {message && (
        <div className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
          message.type === 'success'
            ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
            : 'border-red-100 bg-red-50 text-red-500'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          {message.text}
        </div>
      )}
    </div>
  );
};

const CardInviteRow = ({ card, onSent }) => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSend = async () => {
    if (!email.trim()) return;

    try {
      setSending(true);
      setMessage(null);

      await api.post('/company/auth/invite/send', {
        email: email.trim(),
        role: card.role,
        business_id: Number(card.business_id || card.business_card_id),
        manager_card_id: Number(card.id),
        manager_card_name: card.name,
      });

      setMessage({ type: 'success', text: `Invite sent to ${email.trim()}` });
      setEmail('');
      onSent?.();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setMessage(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="manager@example.com"
          className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          onClick={handleSend}
          disabled={sending || !email.trim()}
          className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          <span className="hidden sm:inline">{sending ? 'Sending...' : 'Invite'}</span>
        </button>
      </div>

      {message && (
        <div className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
          message.type === 'success'
            ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
            : 'border-red-100 bg-red-50 text-red-500'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          {message.text}
        </div>
      )}
    </div>
  );
};

const ManagerRoleCard = ({ card, onSent }) => {
  const config = ROLE_CONFIG[card.role] || MANAGER_CARDS[0];
  const Icon = config.icon;
  const members = card.members || [];
  const activeCount = members.filter((member) => member.is_used).length;
  const pendingCount = members.filter((member) => !member.is_used).length;
  const memberLimit = Number(card.member_limit) || null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="px-5 py-5 text-white" style={{ background: card.color || config.accent }}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Icon size={18} />
            </div>
            <h3 className="text-lg font-bold">{card.name}</h3>
            <p className="mt-1 text-xs text-white/75">
              {ROLE_LABELS[card.role] || card.role}
              {card.location ? ` · ${card.location}` : ''}
            </p>
          </div>
          <div className="rounded-xl bg-white/15 px-3 py-2 text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/65">Managers</p>
            <p className="text-2xl font-bold">{members.length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {card.description && (
          <p className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-xs leading-5 text-gray-500">
            {card.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Active</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{activeCount}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Invited</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Shift</p>
            <p className="mt-1 truncate text-sm font-bold text-gray-900">{card.shift || 'Any'}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Limit</p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {memberLimit ? `${members.length}/${memberLimit}` : 'Open'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {card.department && (
            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
              {card.department}
            </span>
          )}
          {card.target_id && (
            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
              Unit #{card.target_id}
            </span>
          )}
        </div>

        {members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center text-xs text-gray-400">
            No managers in this card yet
          </div>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {members.map((member) => (
              <ManagerRow
                key={member.id}
                manager={{
                  id: member.id,
                  name: member.name,
                  email: member.email,
                  role: card.role,
                  is_pending: !member.is_used,
                  is_active: member.is_used,
                }}
              />
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Invite Members</p>
              <p className="text-[11px] text-gray-400">Send invites inside this card</p>
            </div>
            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">
              {card.role}
            </span>
          </div>
          <CardInviteRow card={card} onSent={onSent} />
        </div>
      </div>
    </div>
  );
};

const CreateManagerCardForm = ({ businessCard, onCreated }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    role: 'factory_manager',
    location: '',
    shift: 'Day',
    department: 'Assembly',
    target_id: '',
    member_limit: '',
    description: '',
    color: '#D97706',
  });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null);

  const updateForm = (patch) => setForm((value) => ({ ...value, ...patch }));

  const handleCreate = async () => {
    if (!form.name.trim()) return;

    try {
      setCreating(true);
      setMessage(null);

      await api.post('/business-manager/team/cards', {
        name: form.name.trim(),
        role: form.role,
        business_id: Number(businessCard.id),
        business_card_id: Number(businessCard.id),
        business_name: businessCard.name,
        location: form.location.trim() || null,
        shift: form.shift,
        department: form.department,
        target_id: form.target_id ? Number(form.target_id) : null,
        member_limit: form.member_limit ? Number(form.member_limit) : null,
        description: form.description.trim() || null,
        color: form.color,
      });

      setForm({
        name: '',
        role: 'factory_manager',
        location: '',
        shift: 'Day',
        department: 'Assembly',
        target_id: '',
        member_limit: '',
        description: '',
        color: '#D97706',
      });
      setOpen(false);
      onCreated?.();
    } catch (err) {
      setMessage({ type: 'error', text: errMsg(err) });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manager Cards</h2>
          <p className="text-xs text-gray-400">Create cards first, then invite members inside each card</p>
        </div>
        <button
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
        >
          <Plus size={15} />
          {open ? 'Close' : 'Create Card'}
        </button>
      </div>

      {open && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateForm({ name: e.target.value })}
              placeholder="Card name, e.g. Factory Shift Team A"
              className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <select
              value={form.role}
              onChange={(e) => {
                const role = e.target.value;
                const config = ROLE_CONFIG[role];
                updateForm({
                  role,
                  department: ROLE_DEPARTMENTS[role]?.[0] || '',
                  color: config?.accent || '#185FA5',
                });
              }}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {MANAGER_CARDS.map((config) => (
                <option key={config.role} value={config.role}>
                  {ROLE_LABELS[config.role]}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateForm({ location: e.target.value })}
              placeholder="Location / branch / site"
              className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-4">
            <select
              value={form.shift}
              onChange={(e) => updateForm({ shift: e.target.value })}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option>Day</option>
              <option>Night</option>
              <option>Swing</option>
              <option>Any</option>
            </select>
            <select
              value={form.department}
              onChange={(e) => updateForm({ department: e.target.value })}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {(ROLE_DEPARTMENTS[form.role] || ['General']).map((department) => (
                <option key={department}>{department}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={form.target_id}
              onChange={(e) => updateForm({ target_id: e.target.value })}
              placeholder="Unit ID"
              className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              type="number"
              min="1"
              value={form.member_limit}
              onChange={(e) => updateForm({ member_limit: e.target.value })}
              placeholder="Member limit"
              className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
            <textarea
              value={form.description}
              onChange={(e) => updateForm({ description: e.target.value })}
              placeholder="Card description or responsibility notes"
              rows={3}
              className="resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3">
              {CARD_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateForm({ color })}
                  className={`h-7 w-7 rounded-full border-2 ${form.color === color ? 'border-gray-900' : 'border-white'}`}
                  style={{ background: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={creating || !form.name.trim()}
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] lg:w-auto"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Create
          </button>
        </div>
      )}

      {message && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-500">
          <AlertCircle size={13} />
          {message.text}
        </div>
      )}
    </div>
  );
};

const BusinessManagerDetails = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [card, setCard] = useState(state?.card || null);
  const [managerCards, setManagerCards] = useState([]);
  const [loading, setLoading] = useState(!state?.card);
  const [error, setError] = useState('');

  const fetchCard = async () => {
      try {
        setLoading(true);
        setError('');

        const cardRes = await api.get(`/business-cards/${cardId}`);
        let nextCard = cardRes.data;

        try {
          const [managersRes, teamRes] = await Promise.all([
            api.get(`/business-cards/managers/by-business/${cardId}`),
            api.get(`/business-cards/managers/by-business/${cardId}/team`),
          ]);
          nextCard = {
            ...nextCard,
            managers: managersRes.data,
            team: teamRes.data,
          };
        } catch {
          nextCard = {
            ...nextCard,
            managers: nextCard.managers || state?.card?.managers || [],
            team: nextCard.team || state?.card?.team || nextCard.managers || state?.card?.managers || [],
          };
        }

        setCard(nextCard);

        try {
          const cardsRes = await api.get('/business-manager/team/cards', {
            params: { business_card_id: Number(cardId) },
          });
          setManagerCards(cardsRes.data || []);
        } catch {
          setManagerCards([]);
        }
      } catch (err) {
        setError(err?.response?.data?.detail || 'Failed to load business details.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCard();
  }, [cardId, state?.card?.managers]);

  if (loading) {
    return (
      <div className="ml-64 min-h-screen bg-[#F7F8FA] p-8 flex items-center justify-center">
        <div className="h-9 w-9 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="ml-64 min-h-screen bg-[#F7F8FA] p-8">
        <button onClick={() => navigate('/managers')} className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-600">
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error || 'Business card not found.'}
        </div>
      </div>
    );
  }

  const managers = card.managers || [];
  const team = card.team || managers;
  const countsByRole = team.reduce((acc, manager) => {
    acc[manager.role] = (acc[manager.role] || 0) + 1;
    return acc;
  }, {});
  const cardMemberCount = managerCards.reduce((total, managerCard) => total + (managerCard.members?.length || 0), 0);

  return (
    <div className="ml-64 min-h-screen bg-[#F7F8FA] p-8">
      <button
        onClick={() => navigate('/managers')}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition"
      >
        <ArrowLeft size={16} />
        Back to cards
      </button>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="px-7 py-8 text-white" style={{ background: card.color || '#185FA5' }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">
                {card.category}
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">{card.name}</h1>
              {card.tagline && <p className="mt-2 text-sm text-white/75">{card.tagline}</p>}
            </div>

            <div className="rounded-xl bg-white/15 px-4 py-3 text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/65">Total Managers</p>
              <p className="text-2xl font-bold">{team.length + cardMemberCount}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
          <InfoTile icon={Users} label="Company size" value={card.size} />
          <InfoTile icon={Mail} label="Business email" value={card.email} />
          <InfoTile icon={Calendar} label="Created" value={fmt(card.created_at)} />
        </div>

        {card.description && (
          <div className="border-t border-gray-100 px-6 py-5">
            <p className="text-sm leading-6 text-gray-500">{card.description}</p>
          </div>
        )}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {mockSections.map((section) => {
          const value = section.title === 'Factory'
            ? countsByRole.factory_manager || 0
            : section.title === 'Warehouses'
              ? countsByRole.warehouse_manager || 0
              : countsByRole.supply_manager || 0;
          const Icon = section.icon;
          return (
            <div key={section.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${section.color}`}>
                <Icon size={18} />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">{section.title}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
              <p className="mt-1 text-xs text-gray-400">
                {section.title === 'Factory'
                  ? 'Factory managers under this business'
                  : section.title === 'Warehouses'
                    ? 'Warehouse managers under this business'
                    : 'Supply managers under this business'}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Invite Business Manager</h2>
          <p className="text-xs text-gray-400">Business managers can be invited directly to business ID {card.id}</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {ROLE_INVITES.map((config) => (
            <InviteRoleRow
              key={config.role}
              cardId={card.id}
              config={config}
              onSent={fetchCard}
            />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <CreateManagerCardForm businessCard={card} onCreated={fetchCard} />

        {managerCards.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-700">No manager cards created yet</p>
            <p className="mt-1 text-xs text-gray-400">Create a factory, warehouse, logistics, co-manager, or supply card to start inviting members.</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            {managerCards.map((managerCard) => (
              <ManagerRoleCard
                key={managerCard.id}
                card={managerCard}
                onSent={fetchCard}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Managers Under This Business</h2>
            <p className="text-xs text-gray-400">
              {team.length} total: {countsByRole.business_manager || 0} business, {countsByRole.factory_manager || 0} factory, {countsByRole.warehouse_manager || 0} warehouse, {countsByRole.logistics_manager || 0} logistics, {countsByRole.co_manager || 0} co, {countsByRole.supply_manager || 0} supply
            </p>
          </div>
          <CheckCircle2 size={18} className="text-emerald-500" />
        </div>

        {team.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-400">
            No registered managers yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {team.map((manager) => (
              <ManagerRow key={manager.id} manager={manager} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BusinessManagerDetails;
