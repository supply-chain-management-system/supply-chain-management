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
  Filter
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

  const [workers, setWorkers] = useState([]);

  const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=10";


useEffect(() => {
  api.get('factory_team/factory/get_worker')
    .then((res) => {
     
      setWorkers(res.data);
      console.log(res.data)
    })
    .catch((err) => console.log(err));

}, []);

const handleRemoveMember = async (mem_id) => {
 
    console.log(mem_id,'ajss')
  try {
    await api.delete(`factory_team/factory/removemember/${mem_id}`);


   
    setGroupedTeam((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((productionId) => {
        updated[productionId] = updated[productionId].filter(
          (m) => m.id !== mem_id
        );
      });

      return updated;
    });

    alert("Member removed successfully");
  } catch (error) {
    console.error(error);
    alert("Failed to remove member");
  }
};

useEffect(() => {
  api.get("factory_team/factory/all_team")
    .then((res) => {
      console.log('haid',res.data);
      setGroupedTeam(res.data)


    });
}, []);



const handleAssignTeam = async () => {
    console.log('hai ian',selectedRole)
  try {
    const payload = {
      production_id: 1, 
      workers: selectedUsers, 
      
   
      
    };
    console.log(payload,'hao')

    const res = await api.post(
      "factory_team/factory/assign_team",
      payload
    );

    console.log("Assigned:", res.data);

    alert("Team assigned successfully");

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
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm font-medium">
                <option>Line A - High Precision Component Assembly</option>
                <option>Line B - Standard Assembly</option>
                <option>Line C - Quality Control</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
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

        
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700">Available Personnel</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                 {workers.length}found
                </span>
              </div>
              
              <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
               {workers.map((person) => (
              
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
/>                      <div>
                        <p className="text-sm font-medium text-slate-900">{person.name}</p>
                        <p className="text-xs text-slate-500">{person.role}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedUsers.includes(person.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                      {selectedUsers.includes(person.id) && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

       
            <div className="space-y-3">
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
              
              <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                <span className={`text-xs font-medium px-2 ${autoAssign ? 'text-blue-600' : 'text-gray-500'}`}>Manual</span>
                <button 
                  onClick={() => setAutoAssign(!autoAssign)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${autoAssign ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${autoAssign ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <span className={`text-xs font-medium px-2 ${!autoAssign ? 'text-blue-600' : 'text-gray-500'}`}>Auto</span>
              </div>
            </div>

     
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="p-4 pl-6">Name</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">

  {Object.entries(groupedTeam).map(([productionId, members]) => (
    <>

      <tr key={`prod-${productionId}`}>
        <td colSpan="4" className="bg-gray-100 p-3 font-bold text-sm">
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


            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
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
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}