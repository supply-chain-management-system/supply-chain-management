import { useState } from 'react';
import apiClient from '../../../api/api';

const MOCK_REQUESTS = [
  {
    id: 'REQ-1001',
    type: 'Purchase Order',
    submittedBy: 'Priya K.',
    role: 'Supplier',
    description: 'PO #3301 — 200x Industrial Bearing Set (SKU-A92)',
    amount: '$4,800',
    submittedAt: '2 hours ago',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'REQ-1002',
    type: 'Stock Adjustment',
    submittedBy: 'Sarah J.',
    role: 'Warehouse',
    description: 'Write-off: 12x Hydraulic Pump (SKU-B14) — Damaged in transit',
    amount: null,
    submittedAt: '3 hours ago',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'REQ-1003',
    type: 'Purchase Order',
    submittedBy: 'Rajan M.',
    role: 'Factory',
    description: 'PO #3302 — 500x Steel Shaft 40mm (SKU-D33)',
    amount: '$2,250',
    submittedAt: '5 hours ago',
    status: 'pending',
    priority: 'low',
  },
  {
    id: 'REQ-1004',
    type: 'Stock Adjustment',
    submittedBy: 'Mike T.',
    role: 'Factory',
    description: 'Batch correction: +80 units Control Board v2 (SKU-C77) — Reconciliation',
    amount: null,
    submittedAt: '6 hours ago',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'REQ-1005',
    type: 'Transfer Request',
    submittedBy: 'Auto-System',
    role: 'Logistics',
    description: 'Transfer 150x Conveyor Belt Module (SKU-E50): WH-01 → WH-03',
    amount: null,
    submittedAt: '8 hours ago',
    status: 'approved',
    priority: 'low',
  },
  {
    id: 'REQ-1006',
    type: 'Purchase Order',
    submittedBy: 'Deepa R.',
    role: 'Warehouse',
    description: 'PO #3300 — Emergency reorder: 100x Hydraulic Pump Unit (SKU-B14)',
    amount: '$9,600',
    submittedAt: '1 day ago',
    status: 'rejected',
    priority: 'high',
  },
];

const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

const TYPE_ICONS = {
  'Purchase Order': '🧾',
  'Stock Adjustment': '⚖️',
  'Transfer Request': '↔️',
};

const RequestsPage = () => {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      // Replace with real endpoint
      await apiClient.post(`/business-manager/requests/${id}/${action}`);
      setRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r)
      );
      showToast(`Request ${id} ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, action === 'approve' ? 'success' : 'error');
    } catch (err) {
      // Optimistic update even if API fails (for team preview purposes)
      setRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r)
      );
      showToast(`${action === 'approve' ? 'Approved' : 'Rejected'}: ${id}`, action === 'approve' ? 'success' : 'info');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requests.filter(r => filter === 'all' ? true : r.status === filter);

  const counts = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Request Approvals</h1>
        <p className="text-slate-400 text-sm mt-1">Review and action team-submitted requests</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-amber-600">{counts.pending}</p>
          <p className="text-xs text-amber-500 font-semibold mt-1">Pending</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-emerald-600">{counts.approved}</p>
          <p className="text-xs text-emerald-500 font-semibold mt-1">Approved</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-red-600">{counts.rejected}</p>
          <p className="text-xs text-red-500 font-semibold mt-1">Rejected</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm w-fit">
        {['pending', 'approved', 'rejected', 'all'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold capitalize transition-colors ${
              filter === tab ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Requests list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-400 text-sm">
            No requests found.
          </div>
        )}
        {filtered.map((req) => (
          <div key={req.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${
            req.status === 'approved' ? 'border-emerald-100 opacity-80' :
            req.status === 'rejected' ? 'border-red-100 opacity-70' :
            'border-slate-100'
          }`}>
            {/* Icon & meta */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="text-2xl mt-0.5">{TYPE_ICONS[req.type] || '📋'}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{req.id}</span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{req.type}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[req.priority]}`}>
                    {req.priority} priority
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800 truncate">{req.description}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {req.submittedBy} · {req.role} · {req.submittedAt}
                  {req.amount && <span className="ml-2 font-semibold text-slate-600">{req.amount}</span>}
                </p>
              </div>
            </div>

            {/* Status / Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {req.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleAction(req.id, 'reject')}
                    disabled={!!actionLoading}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === req.id + 'reject' ? '...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'approve')}
                    disabled={!!actionLoading}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                  >
                    {actionLoading === req.id + 'approve' ? '...' : 'Approve'}
                  </button>
                </>
              ) : (
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize ${
                  req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {req.status === 'approved' ? '✓ Approved' : '✕ Rejected'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default RequestsPage;