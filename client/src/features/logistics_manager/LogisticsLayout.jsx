import React from 'react';
import { Outlet } from 'react-router-dom';
import LogisticsSidebar from './LogisticsSidebar';
import './logistics.css';

const LogisticsLayout = () => {
  return (
    <div className="logistics-wrapper">
      <div className="logistics-container">
        <LogisticsSidebar />
        <div className="logistics-main-content">
          <header className="logistics-header">
            <h2>Logistics Management</h2>
            <div className="user-profile">Admin</div>
          </header>
          <main className="logistics-outlet">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default LogisticsLayout;
