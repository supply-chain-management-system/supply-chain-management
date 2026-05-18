import React from 'react';
import { Truck, Package, Clock, AlertTriangle, Map } from 'lucide-react';
import './logistics.css';

const LogisticsDashboard = () => {
  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-title">Dashboard Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card glassmorphism">
          <div className="stat-icon-wrapper blue">
            <Truck />
          </div>
          <div className="stat-info">
            <h3>Active Vehicles</h3>
            <p className="stat-value">42</p>
          </div>
        </div>
        <div className="stat-card glassmorphism">
          <div className="stat-icon-wrapper green">
            <Package />
          </div>
          <div className="stat-info">
            <h3>Deliveries Today</h3>
            <p className="stat-value">128</p>
          </div>
        </div>
        <div className="stat-card glassmorphism">
          <div className="stat-icon-wrapper yellow">
            <Clock />
          </div>
          <div className="stat-info">
            <h3>Pending Shipments</h3>
            <p className="stat-value">15</p>
          </div>
        </div>
        <div className="stat-card glassmorphism">
          <div className="stat-icon-wrapper red">
            <AlertTriangle />
          </div>
          <div className="stat-info">
            <h3>Alerts</h3>
            <p className="stat-value">3</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-shipments glassmorphism">
          <h2>Recent Shipments</h2>
          <table className="shipment-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Destination</th>
                <th>Status</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#SHP-1001</td>
                <td>New York, NY</td>
                <td><span className="status-badge in-transit">In Transit</span></td>
                <td>Today, 2:30 PM</td>
              </tr>
              <tr>
                <td>#SHP-1002</td>
                <td>Los Angeles, CA</td>
                <td><span className="status-badge pending">Pending</span></td>
                <td>Tomorrow, 10:00 AM</td>
              </tr>
              <tr>
                <td>#SHP-1003</td>
                <td>Chicago, IL</td>
                <td><span className="status-badge delivered">Delivered</span></td>
                <td>Today, 9:15 AM</td>
              </tr>
              <tr>
                <td>#SHP-1004</td>
                <td>Houston, TX</td>
                <td><span className="status-badge in-transit">In Transit</span></td>
                <td>Today, 4:45 PM</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="tracking-map-placeholder glassmorphism">
          <h2>Live Tracking</h2>
          <div className="map-view">
            <Map className="map-icon-large" />
            <p>Interactive Map View</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard;
