import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Building2,
  Users,
  Calendar,
  Send,
  CheckCircle2,
  Loader2,
  Mail,
  UserCheck
} from 'lucide-react';

import api from '../../../api/api';
import CreateContainerModal from './container-model';

/* ── date formatter ─────────────────────────────────────── */
const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

/* ── category badge colour map ───────────────────────────── */
const CAT_COLOR = {
  Technology: 'bg-blue-50 text-blue-600 border-blue-200',
  Retail: 'bg-amber-50 text-amber-600 border-amber-200',
  Healthcare: 'bg-green-50 text-green-600 border-green-200',
  Finance: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Education: 'bg-purple-50 text-purple-600 border-purple-200',
  Logistics: 'bg-orange-50 text-orange-600 border-orange-200',
  'Food & Beverage': 'bg-rose-50 text-rose-600 border-rose-200',
  'Real Estate': 'bg-teal-50 text-teal-600 border-teal-200',
  Marketing: 'bg-pink-50 text-pink-600 border-pink-200',
  Manufacturing: 'bg-slate-50 text-slate-600 border-slate-200',
};

/* ══════════════════════════════════════════════════════════
   Invite row
═══════════════════════════════════════════════════════════ */
const InviteRow = ({ card, onInviteSent }) => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  const handleSend = async () => {
    if (!email.trim()) return;

    try {
      setSending(true);
      setErr('');
      setSent(false);

      await api.post('/company/auth/invite/send/', {
        email: email.trim(),
        role: 'business_manager',
        business_id: card.id,
      });

      setSent(true);
      setEmail('');
      onInviteSent?.();

      setTimeout(() => {
        setSent(false);
      }, 3500);

    } catch (e) {

      setErr(
        e?.response?.data?.detail ||
        'Failed to send invite.'
      );

    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-4 border-t border-gray-100">

      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Invite Business Manager
          </p>

          <p className="text-[11px] text-gray-400 mt-0.5">
            Invite a manager to manage this business
          </p>
        </div>

        <div className="
          px-2.5 py-1
          rounded-full
          bg-blue-50
          border border-blue-100
          text-[10px]
          font-bold
          uppercase
          tracking-wide
          text-blue-600
        ">
          Business Manager
        </div>
      </div>

      <div className="flex gap-2">

        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErr('');
            setSent(false);
          }}
          onKeyDown={(e) =>
            e.key === 'Enter' && handleSend()
          }
          placeholder="businessmanager@example.com"
          className="
            flex-1 h-10 px-3
            rounded-xl
            border border-gray-200
            bg-gray-50
            text-sm text-gray-800
            placeholder-gray-400
            focus:outline-none
            focus:ring-2
            focus:ring-blue-100
            focus:border-blue-400
            transition
          "
        />

        <button
          onClick={handleSend}
          disabled={sending || !email.trim()}
          className="
            h-10 px-4
            rounded-xl
            bg-blue-600 hover:bg-blue-700
            disabled:opacity-40
            disabled:cursor-not-allowed
            text-white
            flex items-center gap-2
            text-sm font-semibold
            transition-all
            active:scale-[0.98]
            whitespace-nowrap
          "
        >
          {sending ? (
            <>
              <Loader2
                size={14}
                className="animate-spin"
              />
              Sending...
            </>
          ) : sent ? (
            <>
              <CheckCircle2 size={14} />
              Sent
            </>
          ) : (
            <>
              <Send size={14} />
              Invite
            </>
          )}
        </button>
      </div>

      {err && (
        <div className="
          mt-2
          text-xs text-red-500
          bg-red-50
          border border-red-100
          rounded-xl
          px-3 py-2
        ">
          {err}
        </div>
      )}

      {sent && (
        <div className="
          mt-2
          text-xs text-emerald-600
          bg-emerald-50
          border border-emerald-100
          rounded-xl
          px-3 py-2
          flex items-center gap-2
        ">
          <CheckCircle2 size={13} />
          Business manager invitation sent
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   Meta chip
═══════════════════════════════════════════════════════════ */
const MetaChip = ({ icon, label, value }) => (
  <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
    <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>

    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300">
        {label}
      </p>

      <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">
        {value}
      </p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   Single business card
═══════════════════════════════════════════════════════════ */
const ManagerList = ({ managers = [] }) => (
  <div className="border-t border-gray-100 pt-3">
    <div className="flex items-center justify-between mb-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Managers
      </p>

      <span className="text-[10px] font-bold text-gray-400">
        {managers.length}
      </span>
    </div>

    {managers.length === 0 ? (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-400">
        No registered managers yet
      </div>
    ) : (
      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
        {managers.map((manager) => (
          <div
            key={manager.id}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
          >
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {manager.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {manager.name}
                </p>

                {manager.is_verified && (
                  <UserCheck size={13} className="text-emerald-500 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
                <Mail size={11} className="flex-shrink-0" />
                <span className="truncate">{manager.email}</span>
              </div>
            </div>

            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              manager.is_active
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {manager.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const BizCard = ({ card, onInviteSent }) => {
  const navigate = useNavigate();
  const catCls =
    CAT_COLOR[card.category] ??
    'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <div
      onClick={() => navigate(`/managers/${card.id}`, { state: { card } })}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer"
    >

      {/* ── coloured banner ── */}
      <div
        className="relative h-32 flex flex-col justify-end px-5 pb-4 flex-shrink-0"
        style={{ background: card.color ?? '#185FA5' }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

        <div className="absolute top-3 right-12 w-12 h-12 rounded-full bg-white/10 pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        <span className={`self-start text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 mb-2 bg-white/90 ${catCls}`}>
          {card.category}
        </span>

        <h2 className="text-white font-bold text-xl leading-tight drop-shadow">
          {card.name}
        </h2>

        {card.tagline && (
          <p className="text-white/70 text-xs mt-0.5 line-clamp-1">
            {card.tagline}
          </p>
        )}
      </div>

      {/* ── body ── */}
      <div className="flex flex-col gap-3 p-5 flex-1">

        {card.description && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 border-b border-gray-100 pb-3">
            {card.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <MetaChip
            icon={<Users size={12} />}
            label="Size"
            value={card.size}
          />

          <MetaChip
            icon={<Calendar size={12} />}
            label="Created"
            value={fmt(card.created_at)}
          />
        </div>

        <ManagerList managers={card.managers} />

        <div
          className="mt-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <InviteRow card={card} onInviteSent={onInviteSent} />
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════ */
const ManagerGrid = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {

      setLoading(true);

      const res = await api.get('/business-cards/');
      const cardsWithManagers = await Promise.all(
        res.data.map(async (card) => {
          if (card.managers?.length) {
            return card;
          }

          try {
            const managersRes = await api.get(`/business-cards/managers/by-business/${card.id}`);
            return {
              ...card,
              managers: managersRes.data,
            };
          } catch (managerErr) {
            console.error(
              `Failed to fetch managers for business card ${card.id}:`,
              managerErr
            );

            return {
              ...card,
              managers: card.managers || [],
            };
          }
        })
      );

      setCards(cardsWithManagers);

    } catch (err) {

      console.error(
        'Failed to fetch business cards:',
        err
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-8">

      {showModal && (
        <CreateContainerModal
          onClose={() => setShowModal(false)}
          onCreated={fetchCards}
        />
      )}

      {/* ── Header ── */}
      <header className="mb-8 flex justify-between items-center">

        <div className="flex items-center gap-4">

          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
            <Building2
              size={20}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Business Cards
            </h1>

            <p className="text-xs text-gray-400 mt-0.5">
              {cards.length} card
              {cards.length !== 1 ? 's' : ''}
              {' '}· invite managers to each container
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all duration-150"
        >
          <span className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center group-hover:rotate-90 transition-transform duration-200">
            <Plus size={13} />
          </span>

          New Card
        </button>
      </header>

      {/* ── Loading ── */}
      {loading ? (

        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />

          <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
            Loading cards…
          </p>
        </div>

      ) : cards.length === 0 ? (

        <div className="flex flex-col items-center justify-center py-28 gap-4">

          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Building2
              size={28}
              className="text-blue-400"
            />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              No business cards yet
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Create one to start inviting managers
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition"
          >
            <Plus size={14} />
            New Card
          </button>
        </div>

      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {cards.map((card) => (
            <BizCard
              key={card.id}
              card={card}
              onInviteSent={fetchCards}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerGrid;
