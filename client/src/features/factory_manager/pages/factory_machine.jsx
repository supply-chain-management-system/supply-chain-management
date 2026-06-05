import React, { useState, useEffect } from 'react';
import api from '../../../api/api';

// Components
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Active' },
    'in-use': { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'In Use' },
    maintenance: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Maintenance' },
    available: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Available' }
  };

  const config = statusConfig[status] || statusConfig.available;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
};

const MachineCard = ({ machine, isSelected, onSelect, onEdit, onDelete }) => {
  return (
    <div 
      onClick={() => onSelect(machine)}
      className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{machine.name}</h3>
            <p className="text-sm text-gray-500">{machine.category || "General"}</p>
          </div>
        </div>
        <StatusBadge status={machine.status} />
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Loc: {machine.location || "Bay 1"}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          Model: {machine.model_number || "N/A"} (S/N: {machine.serial_number || "N/A"})
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Run Hours: {machine.operating_hours?.toFixed(1) || "0.0"} hrs
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-700">{machine.efficiency}% Efficiency</span>
        </div>
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => onEdit(machine)} 
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-50 transition-colors"
            title="Edit Machine"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(machine.id)} 
            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-50 transition-colors"
            title="Delete Machine"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
const HeaderTabs = ({ activeTab, setActiveTab, machines }) => {
  const allCount = machines.length;
  const availableCount = machines.filter(m => m.status === 'available').length;
  const maintenanceCount = machines.filter(m => m.status === 'maintenance').length;

  const tabs = [
    { id: 'all', label: 'All Machines', count: allCount },
    { id: 'available', label: 'Available', count: availableCount },
    { id: 'maintenance', label: 'In Maintenance', count: maintenanceCount }
=======
const HeaderTabs = ({ activeTab, setActiveTab, counts }) => {
  const tabs = [
    { id: 'all', label: 'All Machines', count: counts.all },
    { id: 'available', label: 'Available', count: counts.available },
    { id: 'maintenance', label: 'In Maintenance', count: counts.maintenance }
>>>>>>> development
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <span>{tab.label}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
          }`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

const SidebarPanel = ({ selectedMachine, setSelectedMachine, machines, technicians, assignments, onAssignCreated }) => {
  const [selectedTech, setSelectedTech] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');

  const handleConfirmAssignment = async () => {
    if (!selectedMachine) {
      alert("Please select a machine");
      return;
    }
    if (!selectedTech) {
      alert("Please select a technician");
      return;
    }
    if (!scheduleDate) {
      alert("Please select a schedule date");
      return;
    }

    try {
      const payload = {
        machine_id: Number(selectedMachine.id),
        worker_id: Number(selectedTech),
        assignment_date: new Date(scheduleDate).toISOString(),
        notes: `Scheduled maintenance assignment`,
        status: "pending"
      };

      await api.post('/factory_machine/machines/assignments', payload);
      alert("Assignment confirmed successfully ✅");
      setSelectedTech('');
      setScheduleDate('');
      if (onAssignCreated) {
        onAssignCreated();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to create assignment");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Machine Scheduler</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Machine</label>
            <select 
              value={selectedMachine?.id || ''}
              onChange={(e) => {
                const machine = machines.find(m => m.id === parseInt(e.target.value));
                setSelectedMachine(machine || null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
            >
              <option value="">Choose a machine...</option>
              {machines.map(machine => (
                <option key={machine.id} value={machine.id}>
                  {machine.name} - {machine.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Technician</label>
            <select 
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
            >
              <option value="">Choose technician...</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} - {tech.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date</label>
            <input 
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <button 
            onClick={handleConfirmAssignment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Confirm Assignment</span>
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold text-gray-900 mb-4">Recent Assignments</h4>
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{assignment.machine_name}</p>
                <p className="text-xs text-gray-500">{assignment.worker_name} • {new Date(assignment.assignment_date).toLocaleDateString()}</p>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                assignment.status === 'in-progress' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {assignment.status}
              </div>
            </div>
          ))}
          {assignments.length === 0 && (
            <p className="text-sm text-gray-400 italic">No recent assignments.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const AddMachineModal = ({ open, onClose, onSubmit, editingMachine }) => {
  const [form, setForm] = useState({
    name: '',
    category: 'General',
    status: 'available',
    location: 'Bay 1',
    serial_number: '',
    model_number: '',
    operating_hours: '0.0',
    efficiency: '100.0'
  });

  useEffect(() => {
    if (editingMachine) {
      setForm({
        name: editingMachine.name || '',
        category: editingMachine.category || 'General',
        status: editingMachine.status || 'available',
        location: editingMachine.location || 'Bay 1',
        serial_number: editingMachine.serial_number || '',
        model_number: editingMachine.model_number || '',
        operating_hours: editingMachine.operating_hours?.toString() || '0.0',
        efficiency: editingMachine.efficiency?.toString() || '100.0'
      });
    } else {
      setForm({
        name: '',
        category: 'General',
        status: 'available',
        location: 'Bay 1',
        serial_number: '',
        model_number: '',
        operating_hours: '0.0',
        efficiency: '100.0'
      });
    }
  }, [editingMachine, open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = () => {
    onSubmit({
      ...form,
      operating_hours: parseFloat(form.operating_hours) || 0.0,
      efficiency: parseFloat(form.efficiency) || 100.0
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl w-[450px] shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          {editingMachine ? "Edit Machine Specs" : "Register New Machine"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Machine Name</label>
            <input 
              name="name" 
              placeholder="e.g. BladeRunner X3" 
              required 
              value={form.name}
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</label>
              <input 
                name="category" 
                placeholder="e.g. Cutting Unit" 
                required 
                value={form.category}
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</label>
              <input 
                name="location" 
                placeholder="e.g. Bay 2" 
                value={form.location}
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Serial Number</label>
              <input 
                name="serial_number" 
                placeholder="SN-XXXX" 
                value={form.serial_number}
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Model Number</label>
              <input 
                name="model_number" 
                placeholder="M-XXXX" 
                value={form.model_number}
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Operating Hours</label>
              <input 
                type="number"
                name="operating_hours" 
                placeholder="0.0" 
                value={form.operating_hours}
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Efficiency (%)</label>
              <input 
                type="number"
                name="efficiency" 
                placeholder="100.0" 
                value={form.efficiency}
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
              <option value="available">Available</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="in-use">In Use</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={submit} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all"
          >
            {editingMachine ? "Update Machine" : "Save Machine"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Machine() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [machines, setMachines] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [model, showmodel] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);

  useEffect(() => {
    fetchMachines();
    fetchTechnicians();
    fetchAssignments();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await api.get('/factory_machine/machines/');
      setMachines(res.data);
    } catch (err) {
<<<<<<< HEAD
      console.error("Failed to fetch machines:", err);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

 const filteredMachines = machines.filter(machine => {
  if (activeTab === 'all') return true;
  if (activeTab === 'available') return machine.status === 'available';
  if (activeTab === 'maintenance') return machine.status === 'maintenance';
  return true;
});
const formattedMachines = filteredMachines.map(m => ({
  ...m,
  category: m.type, // backend → UI
  location: "Not Assigned", // temporary
  lastMaintenance: m.last_maintenance_date,
  efficiency: 100 // default
}));
const handleAddMachine = async (data) => {
  try {
    // 🔴 VALIDATION
    if (!data.name || !data.category) {
      alert("Name and Category are required");
      return;
=======
      console.error("Failed to fetch machines", err);
>>>>>>> development
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/factory_team/factory/get_worker');
      setTechnicians(res.data);
    } catch (err) {
      console.error("Failed to fetch technicians", err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/factory_machine/machines/assignments');
      setAssignments(res.data);
    } catch (err) {
      console.error("Failed to fetch assignments", err);
    }
  };

  const handleOpenCreate = () => {
    setEditingMachine(null);
    showmodel(true);
  };

  const handleOpenEdit = (machine) => {
    setEditingMachine(machine);
    showmodel(true);
  };

  const handleDeleteMachine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this machine?")) return;
    try {
      await api.delete(`/factory_machine/machines/${id}`);
      alert("Machine deleted successfully ✅");
      if (selectedMachine?.id === id) {
        setSelectedMachine(null);
      }
      await fetchMachines();
    } catch (err) {
      console.error(err);
      alert("Failed to delete machine");
    }
  };

  const handleAddMachine = async (data) => {
    try {
      if (!data.name || !data.category) {
        alert("Name and Category are required");
        return;
      }

      const payload = {
        name: data.name,
        status: data.status,
        serial_number: data.serial_number || null,
        model_number: data.model_number || null,
        operating_hours: data.operating_hours || 0.0,
        location: data.location || "Bay 1",
        efficiency: data.efficiency || 100.0,
        category: data.category || "General"
      };

      if (editingMachine) {
        await api.put(`/factory_machine/machines/${editingMachine.id}`, payload);
        alert("Machine updated successfully ✅");
      } else {
        payload.purchase_date = new Date().toISOString().split('T')[0];
        await api.post('/factory_machine/machines/', payload);
        alert("Machine registered successfully ✅");
      }
      await fetchMachines();
      showmodel(false);
      setEditingMachine(null);
    } catch (err) {
      console.error("FULL ERROR:", err.response?.data);
      alert(editingMachine ? "Failed to update machine" : "Failed to register machine");
    }
  };

  const filteredMachines = machines.filter(machine => {
    if (activeTab === 'all') return true;
    if (activeTab === 'available') return machine.status === 'available';
    if (activeTab === 'maintenance') return machine.status === 'maintenance';
    return true;
  });

  const counts = {
    all: machines.length,
    available: machines.filter(m => m.status === 'available').length,
    maintenance: machines.filter(m => m.status === 'maintenance').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Machine Management</h1>
              <p className="text-gray-500 text-sm mt-1">Monitor and manage your industrial equipment</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2" onClick={handleOpenCreate}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Register New Machine</span>
            </button>
          </div>
          
          <div className="mt-6">
<<<<<<< HEAD
            <HeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} machines={machines} />
=======
            <HeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />
>>>>>>> development
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Machine Cards Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMachines.map((machine) => (
                <MachineCard 
                  key={machine.id} 
                  machine={machine}
                  isSelected={selectedMachine?.id === machine.id}
                  onSelect={setSelectedMachine}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteMachine}
                />
              ))}
            </div>
            
            {filteredMachines.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No machines found</h3>
                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <SidebarPanel 
                selectedMachine={selectedMachine}
                setSelectedMachine={setSelectedMachine}
                machines={machines}
                technicians={technicians}
                assignments={assignments}
                onAssignCreated={() => {
                  fetchAssignments();
                  fetchTechnicians(); // Refresh technicians in case active list changes
                }}
              />
            </div>
          </div>
        </div>
      </main>
      <AddMachineModal
        open={model}
        onClose={() => { showmodel(false); setEditingMachine(null); }}
        onSubmit={handleAddMachine}
        editingMachine={editingMachine}
      />
    </div>
  );
}