import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Extract initials for the avatar
  const getInitials = () => {
    if (!user?.name) return "AD";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
    <>
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

        {/* Profile Section (Clickable to go to Profile Page) */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <NavLink 
            to="/admin_profile"
            className={({ isActive }) => 
              `flex items-center gap-3 px-2 py-3 rounded-md transition-all ${
                isActive ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
              }`
            }
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
              {getInitials()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-gray-700 truncate leading-tight">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5 leading-none">
                {user?.email || "admin@korvex.dev"}
              </p>
            </div>
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default AdminNavbar;