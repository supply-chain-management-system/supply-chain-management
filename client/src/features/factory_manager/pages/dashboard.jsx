import React, { useState } from 'react';
import Layout from '../layout/dashboarslayout';
import AlertBanner from '../component/alert';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  PlayCircle, 
  CheckCircle2, 
  Package,
  Plus,
  Settings,
  AlertTriangle,
  TrendingUp,
  Gauge,
  Layers
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  // Dummy State for Machines
  const [machines] = useState([
    { id: 'M-01', name: 'CNC Cutting Axis', status: 'In Use', temp: '42°C', load: '78%', health: 94 },
    { id: 'M-02', name: 'Hydraulic Press B', status: 'Available', temp: '36°C', load: '0%', health: 100 },
    { id: 'M-03', name: 'Robotic Welder 04', status: 'Maintenance', temp: '68°C', load: '0%', health: 62 },
    { id: 'M-04', name: 'Laser Engraver X', status: 'In Use', temp: '51°C', load: '89%', health: 87 },
  ]);

  // Dummy State for Active Production Jobs
  const [activeJobs] = useState([
    { id: 'JOB-9022', product: 'Aluminum Frame V2', priority: 'High', progress: 68, quantity: '450/600 pcs' },
    { id: 'JOB-9023', product: 'Steel Bracket Alpha', priority: 'Medium', progress: 32, quantity: '160/500 pcs' },
  ]);

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto p-1 text-gray-900">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                Live Factory Feed
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">Factory Overview</h1>
            <p className="text-gray-500 mt-0.5 text-sm">Real-time status of production line 04 — Sector B</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <AlertBanner 
              type="warning"
              title="STOCK SHORTAGE"
              message="Aluminum Grade A (Low Stock)"
            />
            
            <button 
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-medium text-sm rounded-xl shadow-sm hover:bg-blue-700 active:scale-95 transition-all" 
              onClick={() => navigate('/createproduct')}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              New Job Order
            </button>
          </div>
        </div>

        {/* --- METRICS GRID SECTION --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Active Jobs</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">12 Run</h3>
              <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +2 schedules today
              </span>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Line Efficiency</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">92.4%</h3>
              <div className="w-24 bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Gauge className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Completed Output</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">3,240 <span className="text-sm font-normal text-gray-400">pcs</span></h3>
              <span className="text-xs text-gray-500 block mt-1">Target: 4,000 daily</span>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Faults</p>
              <h3 className="text-2xl font-bold mt-1 text-red-600">1 Warning</h3>
              <span className="text-xs text-amber-600 font-medium block mt-1">M-03 Maintenance due</span>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* --- CORE CONTENT LAYOUT --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT/CENTER COLUMN: Machine Status & Analytics */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Machine Status Component Block */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Telemetry Status Overview</h3>
                  <p className="text-xs text-gray-500">Live operational availability metrics</p>
                </div>
                
                {/* Visual Status Legend */}
                <div className="flex items-center gap-4 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-600">In Use</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-600">Maintenance</span>
                  </div>
                </div>
              </div>

              {/* Live Grid layout for individual machines */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {machines.map((machine) => (
                  <div key={machine.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-gray-200 transition-all flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-bold">{machine.id}</span>
                        <h4 className="font-semibold text-gray-800 text-sm mt-1">{machine.name}</h4>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        machine.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                        machine.status === 'In Use' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {machine.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center">
                      <div>
                        <span className="block text-[10px] text-gray-400 font-medium uppercase">Temp</span>
                        <span className="text-xs font-bold text-gray-700">{machine.temp}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-medium uppercase">Load</span>
                        <span className="text-xs font-bold text-gray-700">{machine.load}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-medium uppercase">Health</span>
                        <span className={`text-xs font-bold ${machine.health > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{machine.health}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Analytics Chart Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Hourly Production Volatility</h3>
                  <p className="text-xs text-gray-500">Units engineered vs baseline targets</p>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">Updated 2m ago</span>
              </div>
              
              {/* Dummy Simulated Chart Bars */}
              <div className="h-32 flex items-end gap-3 px-2 pt-4 border-b border-l border-gray-100">
                {[35, 45, 60, 25, 70, 85, 90, 65, 40, 55, 80, 95].map((val, idx) => (
                  <div key={idx} className="flex-1 group relative flex flex-col items-center">
                    <div className="absolute -top-6 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {val * 4} units
                    </div>
                    <div 
                      className="w-full bg-blue-500/80 group-hover:bg-blue-600 rounded-t-sm transition-all" 
                      style={{ height: `${val}%` }}
                    ></div>
                    <span className="text-[9px] text-gray-400 font-mono mt-1">{idx + 7}h</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Active Production Queue */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Active Queue</h3>
                  <p className="text-xs text-gray-500">Jobs processing currently on Line 04</p>
                </div>
                <Layers className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4 mt-6">
                {activeJobs.map((job, idx) => (
                  <div key={job.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-mono font-bold text-blue-600">{job.id}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        job.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {job.priority} Priority
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-gray-800">{job.product}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Quantity: {job.quantity}</p>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            job.progress > 50 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Micro-Report Summary Footer inside Queue panel */}
            <div className="mt-8 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-gray-700">All shifts configured</h5>
                  <p className="text-[11px] text-gray-400">Next roster switch scheduled at 22:00 IST</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;