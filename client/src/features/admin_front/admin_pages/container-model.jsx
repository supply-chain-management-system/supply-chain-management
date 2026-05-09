import React, { useState } from 'react';
import { X, ArrowRight, Building2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api'; // your existing axios instance

const COLORS = [
  { hex: '#185FA5', label: 'Blue' },
  { hex: '#0F6E56', label: 'Teal' },
  { hex: '#993556', label: 'Pink' },
  { hex: '#993C1D', label: 'Coral' },
  { hex: '#534AB7', label: 'Purple' },
  { hex: '#5F5E5A', label: 'Gray' },
  { hex: '#3B6D11', label: 'Green' },
];

const CATEGORIES = [
  'Technology', 'Retail', 'Healthcare', 'Finance', 'Education',
  'Logistics', 'Food & Beverage', 'Real Estate', 'Marketing', 'Manufacturing',
];

const SIZES = [
  'Solo (1)', 'Small (2–10)', 'Medium (11–50)', 'Large (51–200)', 'Enterprise (200+)',
];

const CreateContainerModal = ({ onClose }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    category: 'Technology',
    size: 'Medium (11–50)',
    tagline: '',
    email: '',
    description: '',
    color: '#185FA5',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => {
    setError('');
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    setError('');

    try {
      // POST to FastAPI — returns the saved card with its `id`
      const { data } = await api.post('/business-cards/', {
        name:        form.name.trim(),
        category:    form.category,
        size:        form.size,
        tagline:     form.tagline.trim() || null,
        email:       form.email.trim(),
        description: form.description.trim() || null,
        color:       form.color,
      });

      // Navigate with the DB-saved card (includes id, created_at)
      navigate('/add/bussiness-card', { state: { cardData: data } });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to create business card. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">

        {/* Close */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Building2 size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Create a business container</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in details to generate your business card</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-3">

          <div className="col-span-2">
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
              Business name <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Horizon Ventures"
              className="w-full h-9 px-3 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Category</label>
            <select
              value={form.category}
              onChange={set('category')}
              className="w-full h-9 px-3 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition cursor-pointer"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Business size</label>
            <select
              value={form.size}
              onChange={set('size')}
              className="w-full h-9 px-3 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition cursor-pointer"
            >
              {SIZES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Tagline</label>
            <input
              value={form.tagline}
              onChange={set('tagline')}
              placeholder="One line about what you do"
              className="w-full h-9 px-3 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
              Contact email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="contact@yourbusiness.com"
              className="w-full h-9 px-3 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Brief description of your business..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-2">Card color</label>
            <div className="flex gap-2">
              {COLORS.map(({ hex, label }) => (
                <button
                  key={hex}
                  aria-label={label}
                  onClick={() => setForm((f) => ({ ...f, color: hex }))}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    background: hex,
                    border: form.color === hex ? '2.5px solid #111' : '2.5px solid transparent',
                    outline: form.color === hex ? '2px solid white' : 'none',
                    outlineOffset: '-4px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-9 px-4 text-sm text-gray-500 rounded-md border border-gray-200 hover:bg-gray-50 transition disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !form.name.trim() || !form.email.trim()}
            className="h-9 px-4 text-sm font-semibold text-white rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Saving...</>
            ) : (
              <>Create card <ArrowRight size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateContainerModal;