import { useState, useEffect } from 'react';
import apiClient from '../../../api/api';

const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
  standard: 'bg-blue-100 text-blue-700'
};

const TYPE_ICONS = {
  'Purchase Order': '🧾',
  'Stock Adjustment': '⚖️',
  'Transfer Request': '↔️',
  'Restock Request': '📦',
  'System Action': '⚙️'
};

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  // --- FETCH REAL APPROVALS DATA ---
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/business-manager/requests');
      
      // Map exact backend schema to UI schema
      const formattedData = response.data.map(req => {
        // Normalize database status (e.g., PENDING_WHM_APPROVAL -> pending)
        let normalizedStatus = 'pending';
        if (req.status?.toLowerCase().includes('approve') && !req.status?.toLowerCase().includes('pending')) normalizedStatus = 'approved';
        if (req.status?.toLowerCase().includes('reject')) normalizedStatus = 'rejected';

        return {
          id: req.id,
          type: req.type || 'System Action',
          submittedBy: req.requester_name || 'System',
          role: req.role || 'Automated Agent',
          description: req.description || 'System generated request',
          amount: null, 
          submittedAt: req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Just now',
          status: normalizedStatus,
          priority: 'standard', // Defaulting to standard, can be mapped later if added to DB
        };
      });
      
      setRequests(formattedData);
    } catch (err) {
      console.error("Requests Fetch Error:", err);
      setRequests([]); // No dummy data, just an empty array on fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      // Send EXACT payload FastAPI expects: { action: "APPROVE" | "REJECT" }
      const actionPayload = action === 'approve' ? 'APPROVE' : 'REJECT';
      await apiClient.put(`/business-manager/requests/${id}/action`, { action: actionPayload });
      
      // Refresh real data immediately to sync UI
      fetchRequests();
      showToast(`Request ${id} ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, action === 'approve' ? 'success' : 'error');
    } catch (err) {
      showToast(`Error: ${err.response?.data?.detail || 'Failed to process request'}`, 'error');
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Request Approvals</h1>
          <p className="text-slate-400 text-sm mt-1">Review and action AI drafts and system-submitted requests</p>
        </div>
        <button 
          onClick={fetchRequests}
          className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          🔄 Sync Data
        </button>
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
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto mb-3"></div>
            <div className="h-3 bg-slate-100 rounded w-1/3 mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-400 text-sm">
            No requests found in the database.
          </div>
        ) : (
          filtered.map((req) => (
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
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">#{req.id}</span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{req.type}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${PRIORITY_STYLES[req.priority] || PRIORITY_STYLES.standard}`}>
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
          ))
        )}
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