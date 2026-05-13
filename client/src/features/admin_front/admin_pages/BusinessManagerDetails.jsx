import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Mail,
  Package,
  UserCheck,
  Users,
  WalletCards,
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
    title: 'Finance',
    value: '$0',
    detail: 'Finance model pending',
    icon: WalletCards,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
];

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

    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
      manager.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
    }`}>
      {manager.is_active ? 'Active' : 'Inactive'}
    </span>
  </div>
);

const BusinessManagerDetails = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [card, setCard] = useState(state?.card || null);
  const [loading, setLoading] = useState(!state?.card);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setLoading(true);
        setError('');

        const cardRes = await api.get(`/business-cards/${cardId}`);
        let nextCard = cardRes.data;

        try {
          const managersRes = await api.get(`/business-cards/managers/by-business/${cardId}`);
          nextCard = {
            ...nextCard,
            managers: managersRes.data,
          };
        } catch {
          nextCard = {
            ...nextCard,
            managers: nextCard.managers || state?.card?.managers || [],
          };
        }

        setCard(nextCard);
      } catch (err) {
        setError(err?.response?.data?.detail || 'Failed to load business details.');
      } finally {
        setLoading(false);
      }
    };

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
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/65">Managers</p>
              <p className="text-2xl font-bold">{managers.length}</p>
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
          const Icon = section.icon;
          return (
            <div key={section.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${section.color}`}>
                <Icon size={18} />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">{section.title}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{section.value}</p>
              <p className="mt-1 text-xs text-gray-400">{section.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Business Managers</h2>
            <p className="text-xs text-gray-400">People connected to business ID {card.id}</p>
          </div>
          <CheckCircle2 size={18} className="text-emerald-500" />
        </div>

        {managers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-400">
            No registered managers yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {managers.map((manager) => (
              <ManagerRow key={manager.id} manager={manager} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BusinessManagerDetails;
