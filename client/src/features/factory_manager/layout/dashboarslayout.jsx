import React from 'react';
import Navbar from '../component/navbar';
import Sidebar from '../component/sidebar';
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <Outlet />   
        </main>
      </div>
    </div>
  );
};

export default Layout;