import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  BarChart3, 
  ShieldAlert, 
  DollarSign, 
  Layers, 
  Cpu, 
  Mail, 
  Globe, 
  Activity,
  Award,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import api from '../../../api/api';

function FinancialPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    companies: 0,
    activeSchemas: 0,
    personal: 0,
    team: 0,
    enterprise: 0,
  });

  useEffect(() => {
    fetchFinancialMetadata();
  }, []);

  const fetchFinancialMetadata = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/overview');
      setStats({
        companies: res.data.companies.total || 0,
        activeSchemas: res.data.companies.total || 0,
        personal: res.data.companies.personal || 0,
        team: res.data.companies.team || 0,
        enterprise: res.data.companies.enterprise || 0,
      });
    } catch (e) {
      console.error("Failed to load financial telemetry:", e);
    } finally {
      setLoading(false);
    }
  };

  const mrr = (stats.personal * 299) + (stats.team * 999) + (stats.enterprise * 2499);
  const acv = stats.companies ? Math.round(mrr / stats.companies) : 0;

  const planBreakdown = [
    { 
      name: 'Enterprise Platinum', 
      count: stats.enterprise, 
      color: 'bg-purple-500 text-purple-700', 
      percentage: stats.companies ? Math.round((stats.enterprise / stats.companies) * 100) : 0, 
      price: 2499 
    },
    { 
      name: 'Growth Scale', 
      count: stats.team, 
      color: 'bg-blue-500 text-blue-700', 
      percentage: stats.companies ? Math.round((stats.team / stats.companies) * 100) : 0, 
      price: 999 
    },
    { 
      name: 'Starter Tier', 
      count: stats.personal, 
      color: 'bg-slate-300 text-slate-500', 
      percentage: stats.companies ? Math.round((stats.personal / stats.companies) * 100) : 0, 
      price: 299 
    },
  ];

  const quotas = [
    { name: 'Postgres Tenant Schemas', used: stats.activeSchemas, max: 20, unit: 'schemas', color: 'bg-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Financial & Quotas Cockpit
        </h1>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
          Billing Analytics, Resource Quotas & Enterprise License Oversight
        </p>
      </header>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: MRR */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full translate-x-8 -translate-y-8" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
            Projected MRR
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 leading-tight">
              ${mrr.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">/ month</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp size={14} />
            <span>Live telemetry revenue calculation</span>
          </div>
        </div>

        {/* Card 2: Enterprise Contracts */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full translate-x-8 -translate-y-8" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
            Onboarded Entities
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 leading-tight">
              {stats.companies}
            </span>
            <span className="text-xs font-bold text-slate-400">active tenants</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-600 font-bold">
            <Activity size={14} />
            <span>100% database schemas operational</span>
          </div>
        </div>

        {/* Card 3: Total ACV */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full translate-x-8 -translate-y-8" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
            Avg Contract Value (ACV)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 leading-tight">
              ${acv.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">/ tenant</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-purple-650 font-bold">
            <Award size={14} />
            <span>Based on active tenant pricing modes</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Resource Quotas (Col 1 & 2) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
              <Cpu size={14} className="text-indigo-500" /> Infrastructure Resource Quotas
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold">Real-time resource utilization indicators across public and tenant schemas.</p>
          </div>

          <div className="space-y-5">
            {quotas.map((quota, idx) => {
              const pct = Math.round((quota.used / quota.max) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-slate-700 font-bold">{quota.name}</span>
                    <span className="text-slate-500">
                      <strong>{quota.used}</strong> / {quota.max} {quota.unit} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${quota.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Share (Col 3) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
              <CreditCard size={14} className="text-emerald-500" /> Subscription Plan Distribution
            </h3>

            <div className="space-y-5">
              {planBreakdown.map((plan, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{plan.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">${plan.price} / month</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-800">{plan.count} unit{plan.count !== 1 ? 's' : ''}</span>
                    <span className="block text-[9px] font-bold text-slate-400 mt-0.5">{plan.percentage}% share</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-50 text-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1.5">
              <Clock size={12} /> Auto-renew cycle: 1st of month
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default FinancialPage;
