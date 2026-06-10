import React, { useEffect, useState } from 'react';

import api from '../../../api/api';
import { 
  Search, 
  ChevronDown, 
  MoreHorizontal, 
  Check, 
  User, 
  Settings, 
  Cpu, 
  Shield, 
  Briefcase, 
  Activity, 
  Clock, 
  Users,
  Plus,
  Filter,
  Trash2
} from 'lucide-react';



const ROLES = [
  { id: 'worker', label: 'Worker', icon: Briefcase },
  { id: 'operator', label: 'Operator', icon: Cpu },
  { id: 'supervisor', label: 'Supervisor', icon: Shield },
];

export default function Team() {
  const [selectedRole, setSelectedRole] = useState([]);
  const [groupedTeam, setGroupedTeam] = useState({});
  const [autoAssign, setAutoAssign] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [productionJobs, setProductionJobs] = useState([]);
  const [selectedProductionId, setSelectedProductionId] = useState('');

  const fetchTeams = async () => {
    try {
      const res = await api.get("factory_team/factory/all_team");
      setGroupedTeam(res.data);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  };

  const fetchProductionJobs = async () => {
    try {
      const res = await api.get("production/factory/products");
      setProductionJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch production jobs:", err);
    }
  };

  const [workers, setWorkers] = useState([]);
  const [newWorker, setNewWorker] = useState({
    name: "",
    role: "",
    factory_id: 1,
    email: "",
    phone: "",
    hourly_rate: 15.0
  });

  const [editingWorker, setEditingWorker] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    factory_id: 1,
    email: "",
    phone: "",
    hourly_rate: 15.0
  });

  const handleCreateWorker = async () => {
    try {
      const payload = {
        name: newWorker.name,
        role: newWorker.role,
        factory_id: Number(newWorker.factory_id),
        email: newWorker.email || null,
        phone: newWorker.phone || null,
        hourly_rate: parseFloat(newWorker.hourly_rate) || 15.0
      };

      const res = await api.post(
        '/factory_team/factory/create_worker',
        payload
      );

      console.log(res.data);
      alert("Worker created successfully");

      // refresh list
      fetchWorkers();

      // reset form
      setNewWorker({ name: "", role: "", factory_id: 1, email: "", phone: "", hourly_rate: 15.0 });

  } catch (err) {
    console.error(err);
    alert("Failed to create worker");
  }
};

const handleDeleteWorker = async (workerId) => {
  if (!window.confirm("Are you sure you want to delete this worker completely?")) return;
  try {
    await api.delete(`factory_team/factory/delete_worker/${workerId}`);
    alert("Worker deleted successfully");
    fetchWorkers();
  } catch (err) {
    console.error(err);
    alert("Failed to delete worker");
  }
};

const handleOpenEditWorker = (worker) => {
  setEditingWorker(worker);
  setEditForm({
    name: worker.name || "",
    role: worker.role || "",
    factory_id: worker.factory_id || 1,
    email: worker.email || "",
    phone: worker.phone || "",
    hourly_rate: worker.hourly_rate || 15.0
  });
  setShowEditModal(true);
};

const handleUpdateWorker = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      name: editForm.name,
      role: editForm.role,
      factory_id: Number(editForm.factory_id),
      email: editForm.email || null,
      phone: editForm.phone || null,
      hourly_rate: parseFloat(editForm.hourly_rate) || 15.0
    };

    await api.put(`/factory_team/factory/update_worker/${editingWorker.id}`, payload);
    alert("Worker updated successfully ✅");
    setShowEditModal(false);
    setEditingWorker(null);
    fetchWorkers();
  } catch (err) {
    console.error(err);
    alert("Failed to update worker");
  }
};

  const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=10";


useEffect(() => {
  api.get('factory_team/factory/get_worker')
    .then((res) => {
      setWorkers(res.data);
      console.log(res.data)
    })
    .catch((err) => console.log(err));

  fetchTeams();
  fetchProductionJobs();
}, []);

const handleRemoveMember = async (mem_id) => {
  console.log(mem_id,'ajss')
  try {
    await api.delete(`factory_team/factory/removemember/${mem_id}`);

    // Update state locally
    setGroupedTeam((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((productionId) => {
        updated[productionId] = updated[productionId].filter(
          (m) => m.id !== mem_id
        );
      });
      return updated;
    });

    // Sync with backend
    fetchTeams();
    alert("Member removed successfully");
  } catch (error) {
    console.error(error);
    alert("Failed to remove member");
  }
};

const handleAssignTeam = async () => {
  if (!selectedProductionId) {
    alert("Please select a target production job.");
    return;
  }
  if (selectedUsers.length === 0) {
    alert("Please select at least one worker to assign.");
    return;
  }

  try {
    const payload = {
      production_id: Number(selectedProductionId),
      workers: selectedUsers,
    };
    console.log('Assigning payload:', payload);

    const res = await api.post(
      "factory_team/factory/assign_team",
      payload
    );

    console.log("Assigned:", res.data);
    alert("Team assigned successfully");
    
    // Clear selection
    setSelectedUsers([]);
    // Reload team allocations
    fetchTeams();
  } catch (error) {
    console.error(error);
    alert("Error assigning team");
  }
};

useEffect(() => {
  const delayDebounce = setTimeout(() => {
    fetchWorkers();
  }, 400);

  return () => clearTimeout(delayDebounce);
}, [searchQuery]);

const fetchWorkers = async () => {
  try {
    const res = await api.get(
      `factory_team/factory/find_wroker?search=${searchQuery}`

      
    );
     setWorkers(res.data)
    console.log('seatc',res.data)

    
  } catch (err) {
    console.log(err);
  }
};

const toggleUserSelection = (id) => {
  id = Number(id);

  setSelectedUsers(prev =>
    prev.includes(id)
      ? prev.filter(uid => uid !== id)
      : [...prev, id]
  );
};




  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'On Break': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };


console.log(workers.id)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
      
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Team Assignment</h1>
            <p className="text-slate-500 mt-1">Configure your operations unit and assign personnel to active production lines.</p>
          </div>
          
          {/* <div className="flex items-center gap-3">
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm font-medium">
                <option>Line A - High Precision Component Assembly</option>
                <option>Line B - Standard Assembly</option>
                <option>Line C - Quality Control</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div> */}
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
    
          <div className="lg:col-span-4 space-y-6">
            
        
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter by name or specialty..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
              <h3 className="font-semibold text-slate-700">Add Worker</h3>

              <input
                className="w-full p-2 border rounded text-sm"
                placeholder="Name"
                value={newWorker.name}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, name: e.target.value })
                }
              />

              <select
                className="w-full p-2 border rounded text-sm bg-white"
                value={newWorker.role}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, role: e.target.value })
                }
              >
                <option value="">Select Role</option>
                <option value="worker">Worker</option>
                <option value="operator">Operator</option>
                <option value="supervisor">Supervisor</option>
              </select>

              <input
                className="w-full p-2 border rounded text-sm"
                placeholder="Email Address"
                value={newWorker.email}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, email: e.target.value })
                }
              />

              <input
                className="w-full p-2 border rounded text-sm"
                placeholder="Phone Number"
                value={newWorker.phone}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, phone: e.target.value })
                }
              />

              <input
                type="number"
                step="any"
                min="0"
                className="w-full p-2 border rounded text-sm"
                placeholder="Hourly Rate ($/hr)"
                value={newWorker.hourly_rate}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, hourly_rate: e.target.value })
                }
              />

              <button
                onClick={handleCreateWorker}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors text-sm"
              >
                Create Worker
              </button>
            </div>

        
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700">Available Personnel</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                 {workers.length}found
                </span>
              </div>
              
              <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">               {workers.map((person) => (
               
                  <div 
                    key={person.id} 
                    
                    
                    className={`p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors cursor-pointer ${selectedUsers.includes(person.id) ? 'bg-blue-50/50' : ''}`}
                    onClick={() => toggleUserSelection(Number(person.id))}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={DEFAULT_AVATAR} 
                        alt={person.name} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{person.name}</p>
                        <p className="text-xs text-slate-500">{person.role} • ${person.hourly_rate || 15}/hr</p>
                        {(person.email || person.phone) && (
                          <p className="text-[10px] text-slate-400">
                            {person.email || ""} {person.phone ? `(${person.phone})` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditWorker(person);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit worker specs"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorker(person.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete worker completely"
                      >
                        <Trash2 size={15} />
                      </button>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedUsers.includes(person.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                        {selectedUsers.includes(person.id) && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

       
            {/* <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 px-1">Role Assignment</h3>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' 
                          : 'bg-white border-gray-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span className="text-xs font-medium">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div> */}

       
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">
              Select Production Job
            </label>
            <div className="relative">
              <select
                value={selectedProductionId}
                onChange={(e) => setSelectedProductionId(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm font-medium"
              >
                <option value="">Choose a Production Job</option>
                {productionJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.product_name} (ID: {job.id}) — {job.status}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button 
            onClick={handleAssignTeam}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Assign Team
          </button>
          </div>

      
          <div className="lg:col-span-8 space-y-6">
            
     
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Assigned Team</h2>
                <p className="text-sm text-slate-500 mt-0.5">Personnel currently assigned to this high-precision production line.</p>
              </div>
              
              {/* <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                <span className={`text-xs font-medium px-2 ${autoAssign ? 'text-blue-600' : 'text-gray-500'}`}>Manual</span>
                <button 
                  onClick={() => setAutoAssign(!autoAssign)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${autoAssign ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${autoAssign ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <span className={`text-xs font-medium px-2 ${!autoAssign ? 'text-blue-600' : 'text-gray-500'}`}>Auto</span>
              </div> */}
            </div>

     
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="p-4 pl-6">Name</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Rate & Contact</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">

  {Object.entries(groupedTeam).map(([productionId, members]) => (
    <>

      <tr key={`prod-${productionId}`}>
        <td colSpan="5" className="bg-gray-100 p-3 font-bold text-sm">
          Production ID: {productionId}
        </td>
      </tr>


      {members.map((member) => (
        <tr key={member.id} className="group hover:bg-gray-50/50 transition-colors">


          <td className="p-4 pl-6">
            <div className="flex items-center gap-3">
              <img
                src={DEFAULT_AVATAR}
                alt={member.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {member.name}
                </p>
                <p className="text-xs text-slate-500">
                  ID: #{member.worker_id}
                </p>
              </div>
            </div>
          </td>

          <td className="p-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-blue-50 text-blue-700 border-blue-100">
              {member.role}
            </span>
          </td>

          <td className="p-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700">${member.hourly_rate || 15}/hr</span>
              {(member.email || member.phone) && (
                <span className="text-[10px] text-slate-400">
                  {member.email || ""} {member.phone ? `(${member.phone})` : ""}
                </span>
              )}
            </div>
          </td>

          <td className="p-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  member.status === "Active"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              ></span>
              <span className="text-sm font-medium">
                {member.status}
              </span>
            </div>
          </td>


          <td className="p-4 pr-6 text-right">
            <button
  onClick={() => handleRemoveMember(member.id)}
  className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
>
  <MoreHorizontal className="w-5 h-5" />
</button>
          </td>

        </tr>
      ))}
    </>
  ))}

</tbody>
                </table>
              </div>
              
        
              {groupedTeam.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-slate-900 font-medium">No team members assigned</h3>
                  <p className="text-slate-500 text-sm mt-1">Select personnel from the left panel to begin.</p>
                </div>
              )}
            </div>


            {/* <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-lg font-bold text-slate-900">03</p>
                    <p className="text-xs text-slate-500 font-medium">Members</p>
                  </div>
                </div>
                
                <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                
                <div className="flex items-center gap-2 text-slate-600">
                  <Activity className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-lg font-bold text-slate-900">88%</p>
                    <p className="text-xs text-slate-500 font-medium">Efficiency</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-lg font-bold text-slate-900">04:22</p>
                  <p className="text-xs text-slate-500 font-medium">Avg Time</p>
                </div>
              </div>
            </div> */}

          </div>
        </div>
    </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl w-[400px] shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Edit Worker Details</h2>
            
            <form onSubmit={handleUpdateWorker} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Role</label>
                <select 
                  value={editForm.role} 
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm bg-white" 
                  required
                >
                  <option value="">Select Role</option>
                  <option value="worker">Worker</option>
                  <option value="operator">Operator</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={editForm.phone} 
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Hourly Rate ($/hr)</label>
                <input 
                  type="number" 
                  step="any"
                  min="0"
                  value={editForm.hourly_rate} 
                  onChange={(e) => setEditForm({ ...editForm, hourly_rate: e.target.value })} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm" 
                  required 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => { setShowEditModal(false); setEditingWorker(null); }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold text-sm"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}