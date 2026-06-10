import React, { useState, useEffect } from 'react';
import AlertBanner from '../component/alert';
import { useNavigate } from 'react-router-dom';
import api from "../../../api/api";
import { 
  ClipboardList, 
  PlayCircle, 
  CheckCircle2, 
  Plus,
  Cpu,
  Search,
  Filter,
  ArrowRight,
  Activity,
  Layers
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, machRes] = await Promise.all([
        api.get("production/factory/products"),
        api.get("/factory_machine/machines/")
      ]);
      setProducts(prodRes.data || []);
      setMachines(machRes.data || []);
    } catch (err) {
      console.error("Error loading factory dashboard:", err);
      setError("Unable to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const totalProductions = products.length;
  const activeProductions = products.filter(p => p.status?.toLowerCase() === 'progress').length;
  const completedProductions = products.filter(p => p.status?.toLowerCase() === 'completed').length;
  
  const totalMachines = machines.length;
  const activeMachines = machines.filter(m => m.status?.toLowerCase() === 'active').length;

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.id?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || product.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || product.priority?.toLowerCase() === priorityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-1 space-y-6">
      {error && <AlertBanner message={error} type="error" />}

      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-7 h-7 text-slate-600" />
            Factory Manager Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time status of productions, machinery performance, and resources.
          </p>
        </div>
        <button 
          onClick={() => navigate('/production')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl text-sm font-semibold shadow-md hover:from-slate-800 hover:to-slate-900 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Create New Production
        </button>
      </div>

      {/* KPI Cards Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Productions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Productions</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">{totalProductions}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Across all factory sectors
            </div>
          </div>

          {/* Card 2: Active Jobs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Productions</p>
                <h3 className="text-3xl font-black text-amber-600 mt-2">{activeProductions}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-600">
                <PlayCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Currently running on floor
            </div>
          </div>

          {/* Card 3: Completed Jobs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Jobs</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-2">{completedProductions}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Transferred to Warehouse
            </div>
          </div>

          {/* Card 4: Machinery cockpit */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Machinery</p>
                <h3 className="text-3xl font-black text-indigo-600 mt-2">{activeMachines} <span className="text-sm font-medium text-slate-400">/ {totalMachines}</span></h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Active / Total equipment count
            </div>
          </div>
        </div>
      )}

      {/* Productions Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Production Runs</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click any row to inspect production teams, machines, materials, and ELT analytics.</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search production..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 w-full md:w-60 transition-all text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent focus:outline-none text-xs font-semibold cursor-pointer text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-400">
              <Layers className="w-3.5 h-3.5" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent focus:outline-none text-xs font-semibold cursor-pointer text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50">
              <p className="text-sm text-slate-500">No production runs found matching filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-4">Job ID</th>
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3 text-center">Target Qty</th>
                  <th className="pb-3 text-center">Output Qty</th>
                  <th className="pb-3 text-center">Scrap Qty</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredProducts.map((p) => {
                  const statusColors = 
                    p.status?.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                    p.status?.toLowerCase() === 'progress' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
                    'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-800';

                  const priorityColors = 
                    p.priority?.toLowerCase() === 'high' ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20' :
                    p.priority?.toLowerCase() === 'medium' ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20' :
                    'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/50';

                  return (
                    <tr 
                      key={p.id}
                      onClick={() => navigate(`/production-details/${p.id}`)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 pl-4 font-mono font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                        #{String(p.id).padStart(4, '0')}
                      </td>
                      <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {p.product_name}
                      </td>
                      <td className="py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {p.target_qty}
                      </td>
                      <td className="py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {p.output_qty || 0}
                      </td>
                      <td className="py-4 text-center font-semibold text-red-500 dark:text-red-400">
                        {p.scrap_qty || 0}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${priorityColors} capitalize`}>
                          {p.priority || 'medium'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold border rounded-full capitalize ${statusColors}`}>
                          {p.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-800 dark:group-hover:bg-slate-700 group-hover:text-white transition-all">
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
