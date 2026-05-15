import React, { useState } from 'react';
import api from '../../../api/api';
import { useEffect } from 'react';

// Mock Data
const mockMachines = [
  {
    id: 1,
    name: 'BladeRunner X1',
    category: 'Cutting Unit',
    status: 'active',
    location: 'Building A - Bay 3',
    lastMaintenance: '2026-04-15',
    efficiency: 98
  },
  {
    id: 2,
    name: 'FusionArc 500',
    category: 'Welding Station',
    status: 'in-use',
    location: 'Building B - Bay 1',
    lastMaintenance: '2026-04-20',
    efficiency: 95
  },
  {
    id: 3,
    name: 'Nexus Assembly 8',
    category: 'Assembly Robot',
    status: 'maintenance',
    location: 'Building A - Bay 5',
    lastMaintenance: '2026-05-01',
    efficiency: 0
  },
  {
    id: 4,
    name: 'BladeRunner X2',
    category: 'Cutting Unit',
    status: 'available',
    location: 'Building C - Bay 2',
    lastMaintenance: '2026-04-28',
    efficiency: 99
  },
  {
    id: 5,
    name: 'PrecisionPress 300',
    category: 'Press Machine',
    status: 'active',
    location: 'Building B - Bay 4',
    lastMaintenance: '2026-04-10',
    efficiency: 97
  },
  {
    id: 6,
    name: 'AutoWelder Pro',
    category: 'Welding Station',
    status: 'available',
    location: 'Building A - Bay 2',
    lastMaintenance: '2026-04-25',
    efficiency: 96
  }
];

const technicians = [
  { id: 1, name: 'John Smith', specialization: 'Cutting Units' },
  { id: 2, name: 'Sarah Johnson', specialization: 'Welding Stations' },
  { id: 3, name: 'Mike Chen', specialization: 'Assembly Robots' },
  { id: 4, name: 'Emily Davis', specialization: 'General Maintenance' }
];

const recentAssignments = [
  { id: 1, machine: 'BladeRunner X1', technician: 'John Smith', date: '2026-05-05', status: 'completed' },
  { id: 2, machine: 'FusionArc 500', technician: 'Sarah Johnson', date: '2026-05-04', status: 'in-progress' },
  { id: 3, machine: 'Nexus Assembly 8', technician: 'Mike Chen', date: '2026-05-03', status: 'pending' }
];

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

const MachineCard = ({ machine, isSelected, onSelect }) => {
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
            <p className="text-sm text-gray-500">{machine.category}</p>
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
          {machine.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Last maintenance: {machine.lastMaintenance}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-700">{machine.efficiency}% Efficiency</span>
        </div>
        <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
          View Details →
        </button>
      </div>
    </div>
  );
};

const HeaderTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'all', label: 'All Machines', count: 6 },
    { id: 'available', label: 'Available', count: 2 },
    { id: 'maintenance', label: 'In Maintenance', count: 1 }
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

const SidebarPanel = ({ selectedMachine, setSelectedMachine }) => {
  const [selectedTech, setSelectedTech] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');

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
                const machine = mockMachines.find(m => m.id === parseInt(e.target.value));
                setSelectedMachine(machine);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Choose a machine...</option>
              {mockMachines.map(machine => (
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Choose technician...</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} - {tech.specialization}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2">
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
          {recentAssignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{assignment.machine}</p>
                <p className="text-xs text-gray-500">{assignment.technician} • {assignment.date}</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                assignment.status === 'completed' ? 'bg-green-500' :
                assignment.status === 'in-progress' ? 'bg-amber-500' : 'bg-gray-400'
              }`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const AddMachineModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
   
    status: 'available',
    location: '',
    lastMaintenance: '',
    efficiency: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = () => {
    onSubmit({
      ...form,
      efficiency: Number(form.efficiency)
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px]">
        <h2 className="font-bold mb-4">Add Machine</h2>

        <input name="name" placeholder="Name" required onChange={handleChange} className="input" />
        <input name="category" placeholder="Category" required onChange={handleChange} className="input" />
        <input name="location" placeholder="Location" onChange={handleChange} className="input" />
        <input type="date" name="lastMaintenance" onChange={handleChange} className="input" />
        <input name="efficiency" placeholder="Efficiency" onChange={handleChange} className="input" />

        <select name="status" onChange={handleChange} className="input">
          <option value="available">Available</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="in-use">In Use</option>
        </select>

        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose}>Cancel</button>
          <button onClick={submit} className="bg-blue-600 text-white px-3 py-1 rounded">
            Save
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
  

  const[model,showmodel]=useState(false)

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
    }

    const payload = {
      name: data.name,
      
      status: data.status,
      last_maintenance_date: data.lastMaintenance || null,
      purchase_date: new Date().toISOString().split('T')[0]
    };

    console.log("PAYLOAD:", payload); // 👈 DEBUG

    const res = await api.post('/factory_machine/machines/', payload);

    console.log("Created:", res.data);

    await fetchMachines();

    showmodel(false);

  } catch (err) {
    console.error("FULL ERROR:", err.response?.data);
  }
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
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2" onClick={()=>showmodel(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Register New Machine</span>
            </button>
          </div>
          
          <div className="mt-6">
            <HeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Machine Cards Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formattedMachines.map((machine) => (
                <MachineCard 
                  key={machine.id} 
                  machine={machine}
                  isSelected={selectedMachine?.id === machine.id}
                  onSelect={setSelectedMachine}
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
              />
            </div>
          </div>
        </div>
      </main>
      <AddMachineModal
  open={model}
  onClose={() => showmodel(false)}
  onSubmit={handleAddMachine}
/>
    </div>
  );
}