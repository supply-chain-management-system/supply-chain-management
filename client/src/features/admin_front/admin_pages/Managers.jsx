import React, { useEffect, useState } from 'react';
import { Plus, Mail, UserCheck, Send, Loader2, X ,ArrowRight} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import api from '../../../api/api';

const ManagerGrid = () => {
  const navigate = useNavigate();
  const [apiManagers, setApiManagers] = useState([]);
  const [extraContainers, setExtraContainers] = useState([]);

  useEffect(() => {
    api.get('/invite')
      .then((res) => setApiManagers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const managerGroups = chunkArray(apiManagers, 3);

  const addNewContainer = () => {
    setExtraContainers([...extraContainers, { id: Date.now(), managers: [] }]);
  };

  const removeContainer = (id) => {
    setExtraContainers(extraContainers.filter(c => c.id !== id));
  };

  return (
    <div className="ml-64 min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Managers</h1>
          <p className="text-sm text-gray-500">Each container holds up to 3 managers.</p>
        </div>
        
        {/* THE PLUS ICON: Creates a new empty container */}
        <button 
          onClick={addNewContainer}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-all group"
        >
          <Plus size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold uppercase text-gray-600">New Container</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        
        {/* 1. RENDER CONTAINERS FROM API DATA */}
        {managerGroups.map((group, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-md p-6 shadow-sm flex flex-col gap-4 relative">
            <span className="text-[10px] font-black text-gray-300 uppercase absolute top-4 right-6">Group {idx + 1}</span>
            
            {group.map((mgr) => (
              <div key={mgr.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-md border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  <UserCheck size={18} className="text-blue-500" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-800 truncate">{mgr.email}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">{mgr.role}</p>
                </div>
              </div>
            ))}

            {/* Only show Invite Button if container has space (less than 3) */}
            {group.length < 3 && (
              <button 
                onClick={() => navigate('/addmanagers')}
                className="mt-2 w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-md flex items-center justify-center gap-2 hover:bg-blue-700"
              >
                Invite Manager <ArrowRight size={14} />
              </button>
            )}
          </div>
        ))}

        {/* 2. RENDER MANUALLY ADDED EMPTY CONTAINERS */}
        {extraContainers.map((container) => (
          <div key={container.id} className="bg-white border-2 border-dashed border-blue-200 rounded-md p-6 shadow-sm flex flex-col items-center justify-center min-h-[250px] relative animate-in fade-in zoom-in duration-300">
            
            {/* CANCEL BUTTON */}
            <button 
              onClick={() => removeContainer(container.id)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Plus size={32} className="text-blue-400" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Empty Container</p>
              
              <button 
                onClick={() => navigate('/addmanagers')}
                className="mt-2 px-8 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-md shadow-lg hover:bg-blue-800 transition-all"
              >
                Start Inviting
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default ManagerGrid;