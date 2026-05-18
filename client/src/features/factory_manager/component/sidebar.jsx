import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Factory, 
  Users, 
  Settings2, 
  Package, 
  ClipboardList, 
  FileOutput,
  Settings
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',path: '/factorydash',active: true },
  { icon: Factory, label: 'Production', path:'/production', active: false },
  { icon: Users, label: 'Teams',path:'/factoryteam', active: false },
  { icon: Settings2, label: 'Machines',path:'/factory_machine', active: false },
  { icon: Package, label: 'Materials', active: false },
  { icon: ClipboardList, label: 'Requests', active: false },
  { icon: FileOutput, label: 'Output Logs',path:'/outputlogs', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

const Sidebar = () => {
  const navigate=useNavigate()
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={()=>navigate(item.path)}

            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              item.active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className={`w-5 h-5 ${item.active ? 'text-blue-600' : 'text-gray-400'}`} />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;