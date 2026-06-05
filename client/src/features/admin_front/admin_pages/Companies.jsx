import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Globe, 
  Phone, 
  Check, 
  X, 
  Loader2, 
  Search,
  Building,
  AlertTriangle,
  User,
  ShieldCheck,
  CheckCircle,
  FileText
} from 'lucide-react';
import api from '../../../api/api';

function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals / Selection
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit fields
  const [editForm, setEditForm] = useState({
    name: '',
    industry: '',
    company_size: '',
    address: '',
    country: '',
    phone: '',
    website: '',
    is_active: true,
    is_verified: false
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/companies?size=100');
      setCompanies(res.data.items || []);
    } catch (err) {
      console.error("Failed to load companies:", err);
      setError("Unable to retrieve companies list. Please verify your admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (company) => {
    try {
      setActionLoading(true);
      const res = await api.get(`/admin/companies/${company.id}`);
      setSelectedCompany(res.data);
      setEditForm({
        name: res.data.name || '',
        industry: res.data.industry || '',
        company_size: res.data.company_size || '',
        address: res.data.address || '',
        country: res.data.country || '',
        phone: res.data.phone || '',
        website: res.data.website || '',
        is_active: res.data.is_active ?? true,
        is_verified: res.data.is_verified ?? false
      });
      setDetailModalOpen(true);
      setEditMode(false);
    } catch (err) {
      console.error("Failed to get company details:", err);
      alert("Failed to load company detail record.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;
    try {
      setActionLoading(true);
      await api.put(`/admin/companies/${selectedCompany.id}`, editForm);
      setDetailModalOpen(false);
      fetchCompanies();
    } catch (err) {
      console.error("Failed to update company:", err);
      alert("Error occurred while saving modifications.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCompany = async (id) => {
    try {
      setActionLoading(true);
      await api.delete(`/admin/companies/${id}`);
      setConfirmDeleteId(null);
      setDetailModalOpen(false);
      fetchCompanies();
    } catch (err) {
      console.error("Failed to delete company:", err);
      alert("Could not remove the selected company. Dependency cascade violation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleVerify = async (company, e) => {
    e.stopPropagation();
    try {
      setActionLoading(true);
      await api.put(`/admin/companies/${company.id}`, {
        is_verified: !company.is_verified
      });
      fetchCompanies();
    } catch (err) {
      console.error("Verification toggle failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (company, e) => {
    e.stopPropagation();
    try {
      setActionLoading(true);
      await api.put(`/admin/companies/${company.id}`, {
        is_active: !company.is_active
      });
      fetchCompanies();
    } catch (err) {
      console.error("Active status toggle failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.owner_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 font-sans">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Companies Control
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
            Global Tenant Onboarding, Schema Records & Quotas
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name, category or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl mb-6">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assembling company registry...</span>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building className="text-slate-400" size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No companies found</h3>
          <p className="text-xs text-slate-400 mt-1">There are no company entities matching your criteria.</p>
        </div>
      ) : (
        /* Companies Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div 
              key={company.id}
              onClick={() => handleOpenDetails(company)}
              className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="text-blue-600" size={20} />
                  </div>
                  
                  {/* Action badges */}
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => handleToggleVerify(company, e)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
                        company.is_verified 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' 
                          : 'bg-slate-50 text-slate-400 border-slate-200/50'
                      }`}
                    >
                      {company.is_verified ? 'Verified' : 'Unverified'}
                    </button>
                    <button 
                      onClick={(e) => handleToggleActive(company, e)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
                        company.is_active 
                          ? 'bg-blue-50 text-blue-600 border-blue-200/50' 
                          : 'bg-amber-50 text-amber-600 border-amber-200/50'
                      }`}
                    >
                      {company.is_active ? 'Active' : 'Suspended'}
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-800 leading-snug tracking-tight">
                  {company.name}
                </h3>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">
                  {company.industry || 'Unknown Sector'}
                </p>

                <p className="text-xs text-slate-500 line-clamp-2 mt-3 mb-4 leading-relaxed">
                  Managed Schema: <code className="bg-slate-50 px-1.5 py-0.5 rounded text-[10px] border font-mono">{company.schema_name}</code>
                </p>
              </div>

              <div className="border-t border-slate-50 pt-4 flex justify-between items-center text-xs">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Users</p>
                  <p className="font-bold text-slate-700 mt-0.5">{company.user_count} registered</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Onboard Date</p>
                  <p className="font-semibold text-slate-500 mt-0.5">{new Date(company.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Company Details & Edit Modal */}
      {detailModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800 leading-tight">
                    {editMode ? 'Edit Company Profile' : selectedCompany.name}
                  </h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                    Tenant ID: #{selectedCompany.id} · UUID: {selectedCompany.public_id?.slice(0,8)}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setDetailModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {confirmDeleteId ? (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-center space-y-4">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-800">Critical Confirmation Request</h4>
                    <p className="text-xs text-red-600 mt-1 max-w-md mx-auto leading-relaxed">
                      You are about to delete <strong>{selectedCompany.name}</strong>. This operation will purge the database schema, all associated users, and historical data logs.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                    >
                      Abort Deletion
                    </button>
                    <button 
                      onClick={() => handleDeleteCompany(selectedCompany.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl transition"
                    >
                      Confirm Hard Delete
                    </button>
                  </div>
                </div>
              ) : editMode ? (
                <form onSubmit={handleUpdateCompany} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company Name</label>
                      <input 
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Industry Sector</label>
                      <input 
                        type="text"
                        value={editForm.industry}
                        onChange={(e) => setEditForm({...editForm, industry: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company Size</label>
                      <input 
                        type="text"
                        value={editForm.company_size}
                        onChange={(e) => setEditForm({...editForm, company_size: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Country Origin</label>
                      <input 
                        type="text"
                        value={editForm.country}
                        onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Contact</label>
                      <input 
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Website URL</label>
                      <input 
                        type="text"
                        value={editForm.website}
                        onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Address Details</label>
                    <textarea 
                      value={editForm.address}
                      rows={2}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-6 py-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={editForm.is_active}
                        onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300"
                      />
                      Active Account State
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={editForm.is_verified}
                        onChange={(e) => setEditForm({...editForm, is_verified: e.target.checked})}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300"
                      />
                      Verified Status Badge
                    </label>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={actionLoading}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl transition flex items-center gap-1.5"
                    >
                      {actionLoading && <Loader2 size={12} className="animate-spin" />}
                      Save Updates
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Info Metadata */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Industry</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedCompany.industry || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Size Class</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedCompany.company_size || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Registered Owner</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{selectedCompany.owner_email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Phone Contact</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedCompany.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Website URL</span>
                      <p className="text-xs font-bold text-blue-600 mt-0.5 flex items-center gap-1 hover:underline">
                        {selectedCompany.website ? (
                          <a href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer">
                            {selectedCompany.website} <ExternalLink size={10} className="inline" />
                          </a>
                        ) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Origin / Country</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedCompany.country || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Office Address</span>
                    <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">{selectedCompany.address || 'No office address specified.'}</p>
                  </div>

                  {/* Registered Users */}
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
                      <User size={14} className="text-indigo-500" /> Company Personnel
                    </h4>
                    {selectedCompany.users?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">No registered personnel accounts found inside this company.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedCompany.users?.map((usr) => (
                          <div key={usr.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <div>
                              <span className="text-xs font-bold text-slate-700">{usr.name}</span>
                              <span className="block text-[10px] text-slate-400 mt-0.5">{usr.email}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[9px] font-black uppercase tracking-wider">
                              {usr.role?.replace(/_/g, ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action panel */}
                  <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-6">
                    <button 
                      onClick={() => setConfirmDeleteId(selectedCompany.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      Delete Company
                    </button>

                    <button 
                      onClick={() => setEditMode(true)}
                      className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Edit3 size={13} />
                      Edit Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CompaniesPage;
