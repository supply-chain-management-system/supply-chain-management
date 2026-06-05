import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, User, LogOut } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LogoutConfirmModal from '../../../components/profile/LogoutConfirmModal';

const Navbar = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  // Extract initials for the avatar
  const getInitials = () => {
    if (!user?.name) return "FM";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50" style={{ borderColor: '#e2e8f0' }}>
        <div className="h-full px-6 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)' }}>
              <span className="text-white font-black text-sm">N</span>
            </div>
            <div>
              <h1 className="text-base font-black text-gray-900 leading-tight tracking-tight">NexusGrid</h1>
              <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Factory Manager</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search production, machines, or materials..."
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ background: '#f1f5f9', borderRadius: '10px', '--tw-ring-color': '#94a3b8' }}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-3 pl-4 border-l hover:opacity-85 transition-opacity"
                style={{ borderColor: '#e2e8f0' }}
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || "Factory Manager"}</p>
                  <p className="text-xs uppercase font-bold" style={{ color: '#94a3b8' }}>{user?.role?.replace(/_/g, " ") || "PLANT MANAGER"}</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)' }}>
                  {getInitials()}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-1">
                    <button
                      onClick={() => { navigate('/factory_profile'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all font-medium"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={() => { setShowLogoutModal(true); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        accentColor="from-slate-400 to-slate-600"
        isDark={false}
      />
    </>
  );
};

export default Navbar;