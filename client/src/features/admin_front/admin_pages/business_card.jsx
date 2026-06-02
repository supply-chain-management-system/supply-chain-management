import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Building2, Users, Tag, FileText, UserPlus } from 'lucide-react';

const BusinessCardPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const card = state?.cardData;

  if (!card) {
    return (
      <div className="ml-64 min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">No card data found. <button onClick={() => navigate(-1)} className="text-blue-600 underline">Go back</button></p>
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-gray-50 p-8">

      {/* Header */}
      <header className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Business card</h1>
          <p className="text-xs text-gray-400 mt-0.5">Review your card and invite managers to this container</p>
        </div>
      </header>

      <div className="max-w-3xl">

        {/* Card + meta row */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Visual business card */}
          <div
            className="relative rounded-2xl p-6 text-white overflow-hidden flex-shrink-0 w-full lg:w-72"
            style={{ background: card.color, minHeight: '180px' }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full bg-white/7 pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-full" style={{ minHeight: '148px' }}>
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-white/20 rounded px-2 py-0.5 mb-3">
                  {card.category}
                </span>
                <h2 className="text-xl font-bold leading-tight">{card.name}</h2>
                {card.tagline && (
                  <p className="text-xs text-white/75 mt-1">{card.tagline}</p>
                )}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[11px] text-white/70">{card.email}</span>
                <span className="text-[10px] bg-white/20 rounded px-2 py-0.5 font-medium">{card.size}</span>
              </div>
            </div>
          </div>

          {/* Meta details */}
          <div className="flex-1 bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {[
              { icon: Building2, label: 'Category', value: card.category },
              { icon: Users, label: 'Business size', value: card.size },
              { icon: Mail, label: 'Contact email', value: card.email },
              ...(card.tagline ? [{ icon: Tag, label: 'Tagline', value: card.tagline }] : []),
              ...(card.description ? [{ icon: FileText, label: 'Description', value: card.description }] : []),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 px-4 py-3">
                <Icon size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite section */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-gray-800">Ready to bring in your team?</p>
            <p className="text-xs text-gray-400 mt-1">
              Add managers to <span className="font-medium text-gray-600">{card.name}</span> and start collaborating.
            </p>
          </div>
          <button
            onClick={() => navigate('/managers', { state: { cardData: card } })}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shadow-sm"
          >
            <UserPlus size={15} />
            Invite a manager
          </button>
        </div>

      </div>
    </div>
  );
};

export default BusinessCardPage;