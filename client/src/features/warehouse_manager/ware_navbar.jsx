import React, { useState } from "react";

function Ware_Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white px-6 py-4">
      <div className="flex justify-between items-center">

        {/* Logo */}
        <div className="text-xl font-bold">
          NexusGrid
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <a href="/ware_dashboard" className="hover:text-blue-400">Dashboard</a>
          <a href="/Inventory" className="hover:text-blue-400">Inventory</a>
          <a href="/ware_products" className="hover:text-blue-400">Products</a>
          <a href="/racks" className="hover:text-blue-400">Racks</a>
          <a href="/stockupdate" className="hover:text-blue-400">Stock Update</a>

          <button className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden flex flex-col gap-3 mt-4">
          <a href="/dashboard">Dashboard</a>
          <a href="/inventory">Inventory</a>
          <a href="/ware_products">Products</a>
          <a href="/Racks">Racks</a>
          <a href="/stockupdate">Stock Update</a>

          <button className="bg-red-500 px-3 py-1 rounded w-fit">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Ware_Navbar;