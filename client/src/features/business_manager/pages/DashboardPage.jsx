import { useState } from 'react';
import apiClient from '../../../api/api';

const DashboardPage = () => {
  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    role: 'Warehouse Manager' // Default role
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Sending the POST request to your FastAPI backend
      const response = await apiClient.post('/business-manager/team/invite', formData);
      
      // Show success message from the backend
      setMessage({ type: 'success', text: response.data.message });
      setFormData({ ...formData, email: '' }); // Clear the email field after success
      
    } catch (error) {
      console.error("Invite Error:", error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to send invitation. Is the server running?' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Business Control Tower</h1>
      
      {/* Invitation Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Invite Team Member</h2>
        <p className="text-slate-500 text-sm mb-6">
          Generate a role-scoped invitation link. The system will email it directly to the user.
        </p>

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. Nexus Logistics Corp"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="Co-Manager">Co-Manager</option>
                <option value="Warehouse Manager">Warehouse Manager</option>
                <option value="Factory Manager">Factory Manager</option>
                <option value="Logistics Team">Logistics Team</option>
              </select>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="colleague@example.com"
            />
          </div>

          {/* Alert Message Box */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Generating Invite...' : 'Send Invitation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;