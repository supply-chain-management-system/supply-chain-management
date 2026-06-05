import React, { useState } from "react";
import { useSelector } from "react-redux";
import { User, Layers, Menu, X } from "lucide-react";

function Ware_Navbar() {
  const [open, setOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const navLinks = [
    { label: "Dashboard", href: "/ware_dashboard" },
    { label: "Inventory", href: "/Inventory" },
    { label: "Products", href: "/ware_products" },
    { label: "Racks", href: "/Racks" },
    { label: "Stock Update", href: "/stockupdate" },
    { label: "Requests", href: "/ware_requests" },
    { label: "ELT Analytics", href: "/elt_warehouse" },
    { label: "Chat", href: "/ware-chat" },
  ];

  return (
    <>
      <nav className="bg-stone-950 border-b border-amber-900/30 text-white px-6 py-0 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-lg"
              style={{ background: "linear-gradient(135deg, #b87333, #d4956a, #8b5a2b)" }}>
              <Layers size={16} className="text-stone-950" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight uppercase text-white">NexusGrid</span>
              <span className="block text-[9px] font-bold uppercase tracking-widest leading-none"
                style={{ color: "#d4956a" }}>Warehouse Ops</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-1 items-center">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-semibold px-3 py-2 rounded-lg text-stone-400 hover:text-white transition-all hover:bg-amber-900/20"
                style={{ '--hover-color': '#d4956a' }}
                onMouseEnter={e => e.target.style.color = '#d4956a'}
                onMouseLeave={e => e.target.style.color = ''}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/ware_profile"
              className="text-xs font-semibold px-3 py-2 rounded-lg text-stone-400 hover:text-white transition-all hover:bg-amber-900/20 flex items-center gap-1"
              onMouseEnter={e => e.target.style.color = '#d4956a'}
              onMouseLeave={e => e.target.style.color = ''}
            >
              <User size={12} /> Profile
            </a>

            <div className="flex items-center gap-2.5 border-l border-amber-900/40 pl-4 ml-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-stone-950"
                style={{ background: "linear-gradient(135deg, #b87333, #d4956a)" }}>
                {user?.name?.charAt(0)?.toUpperCase() || "W"}
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">{user?.name || "Manager"}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest leading-none" style={{ color: '#b87333' }}>
                  Warehouse
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-stone-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden flex flex-col gap-1 py-3 border-t border-amber-900/20">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold px-4 py-2.5 rounded-lg text-stone-400 hover:bg-amber-900/20 transition-all"
                style={{ '--hover-color': '#d4956a' }}
              >
                {link.label}
              </a>
            ))}
            <a href="/ware_profile" className="text-sm font-semibold px-4 py-2.5 rounded-lg text-stone-400 hover:bg-amber-900/20 flex items-center gap-2">
              <User size={14} /> Profile
            </a>
          </div>
        )}
      </nav>
    </>
  );
}

export default Ware_Navbar;