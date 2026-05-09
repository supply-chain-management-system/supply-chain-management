import React, { useEffect, useState } from 'react';
import {
  Plus, Building2, Users, Calendar,
  Send, CheckCircle2, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import CreateContainerModal from './container-model';

/* ── date formatter ─────────────────────────────────────── */
const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── category badge colour map ───────────────────────────── */
const CAT_COLOR = {
  Technology:        'bg-blue-50   text-blue-600   border-blue-200',
  Retail:            'bg-amber-50  text-amber-600  border-amber-200',
  Healthcare:        'bg-green-50  text-green-600  border-green-200',
  Finance:           'bg-indigo-50 text-indigo-600 border-indigo-200',
  Education:         'bg-purple-50 text-purple-600 border-purple-200',
  Logistics:         'bg-orange-50 text-orange-600 border-orange-200',
  'Food & Beverage': 'bg-rose-50   text-rose-600   border-rose-200',
  'Real Estate':     'bg-teal-50   text-teal-600   border-teal-200',
  Marketing:         'bg-pink-50   text-pink-600   border-pink-200',
  Manufacturing:     'bg-slate-50  text-slate-600  border-slate-200',
};

/* ══════════════════════════════════════════════════════════
   Invite row — email input + send invite link button
═══════════════════════════════════════════════════════════ */
const InviteRow = ({ cardId }) => {
  const [email,   setEmail]   = useState('');
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [err,     setErr]     = useState('');

  const handleSend = async () => {
    if (!email.trim()) return;
    setSending(true);
    setErr('');
    try {
      await api.post(`/business-cards/${cardId}/invite`, { email: email.trim() });
      setSent(true);
      setEmail('');
      setTimeout(() => setSent(false), 3500);
    } catch (e) {
      setErr(e?.response?.data?.detail || 'Failed to send invite.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-4 border-t border-gray-100">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
        Invite a manager
      </p>

      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErr(''); setSent(false); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="manager@example.com"
          className="flex-1 h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
        />
        <button
          onClick={handleSend}
          disabled={sending || !email.trim()}
          className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
        >
          {sending ? <Loader2 size={13} className="animate-spin" />
           : sent   ? <CheckCircle2 size={13} />
           :           <Send size={13} />}
          {sending ? 'Sending…' : sent ? 'Sent!' : 'Send Invite'}
        </button>
      </div>

      {err && (
        <p className="text-[11px] text-red-500 mt-1.5">{err}</p>
      )}
      {sent && (
        <p className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
          <CheckCircle2 size={11} /> Invite link sent successfully!
        </p>
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
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300">{label}</p>
      <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">{value}</p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   Single business card
═══════════════════════════════════════════════════════════ */
const BizCard = ({ card }) => {
  const catCls = CAT_COLOR[card.category] ?? 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">

      {/* ── coloured banner ── */}
      <div
        className="relative h-32 flex flex-col justify-end px-5 pb-4 flex-shrink-0"
        style={{ background: card.color ?? '#185FA5' }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-3 right-12 w-12 h-12 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        {/* category badge */}
        <span className={`self-start text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 mb-2 bg-white/90 ${catCls}`}>
          {card.category}
        </span>

        {/* business name */}
        <h2 className="text-white font-bold text-xl leading-tight drop-shadow">
          {card.name}
        </h2>

        {/* tagline */}
        {card.tagline && (
          <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{card.tagline}</p>
        )}
      </div>

      {/* ── body ── */}
      <div className="flex flex-col gap-3 p-5 flex-1">

        {/* description */}
        {card.description && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 border-b border-gray-100 pb-3">
            {card.description}
          </p>
        )}

        {/* meta chips */}
        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={<Users size={12} />}    label="Size"    value={card.size} />
          <MetaChip icon={<Calendar size={12} />} label="Created" value={fmt(card.created_at)} />
        </div>

        {/* invite section — pushed to bottom */}
        <div className="mt-auto">
          <InviteRow cardId={card.id} />
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════ */
const ManagerGrid = () => {
  const [cards,     setCards]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchCards(); }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/business-cards/');
      setCards(res.data);
    } catch (err) {
      console.error('Failed to fetch business cards:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-64 min-h-screen bg-[#F7F8FA] p-8">

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
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Business Cards</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {cards.length} card{cards.length !== 1 ? 's' : ''} · invite managers to each container
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
          <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Loading cards…</p>
        </div>

      ) : cards.length === 0 ? (

        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Building2 size={28} className="text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">No business cards yet</p>
            <p className="text-xs text-gray-400 mt-1">Create one to start inviting managers</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition"
          >
            <Plus size={14} /> New Card
          </button>
        </div>

      ) : (

        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {cards.map((card) => (
            <BizCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerGrid;