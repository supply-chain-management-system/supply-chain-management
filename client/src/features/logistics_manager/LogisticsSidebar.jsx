import React from 'react';
import { NavLink } from 'react-router-dom';
import { Truck, Map, Package, Activity, Settings } from 'lucide-react';
import './logistics.css';

const LogisticsSidebar = () => {
  return (
    <aside className="logistics-sidebar">
      <div className="sidebar-brand">
        <Truck className="brand-icon" />
        <h1>LogiManage</h1>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/logistics_dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Activity className="nav-icon" /> Dashboard
        </NavLink>
        <NavLink to="/logistics_shipments" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Package className="nav-icon" /> Shipments
        </NavLink>
        <NavLink to="/logistics_routes" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Map className="nav-icon" /> Routes & Tracking
        </NavLink>
        <NavLink to="/logistics_fleet" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Truck className="nav-icon" /> Fleet Management
        </NavLink>
        <NavLink to="/logistics_settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Settings className="nav-icon" /> Settings
        </NavLink>
      </nav>
    </aside>
  );
};

export default LogisticsSidebar;
