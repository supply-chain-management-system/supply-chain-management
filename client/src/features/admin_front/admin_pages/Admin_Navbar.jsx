import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  UserPlus, 
  Factory, 
  Wallet, 
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react';

const AdminNavbar = () => {
  // Define your menu items with their respective paths
  const menuItems = [
    { name: 'Dashboard', path: '/admindashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Managers', path: '/managers', icon: <Users size={20} /> },
    { name: 'Companies', path: '/admin/companies', icon: <Building2 size={20} /> },
    { name: 'Sub-Managers', path: '/admin/sub-managers', icon: <UserPlus size={20} /> },
    { name: 'Factory', path: '/admin/factory', icon: <Factory size={20} /> },
    { name: 'Financial', path: '/admin/financial', icon: <Wallet size={20} /> },
    { name: 'Chat', path: '/admin-chat', icon: <MessageSquare size={20} /> },
  ];

  return (
    <nav className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          Admin Panel
        </h1>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center justify-between px-4 py-3 transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-50 text-blue-600 rounded-md'
                  : 'text-gray-600 hover:bg-gray-100 rounded-md'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={16} className="animate-in slide-in-from-left-1" />}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Profile Section */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-3 bg-gray-50 rounded-md">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            SM
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-700 truncate">Sophie Moore</p>
            <p className="text-xs text-gray-500 truncate">hello@sophiemoore.dev</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;