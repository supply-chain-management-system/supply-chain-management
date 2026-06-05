import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Settings,
  Bell,
  Navigation,
  Shield,
  RefreshCw,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { fetchSettings, saveSettings } from '../../../redux/logisticsDashboardSlice';

const LogisticsSettingsPage = () => {
  const dispatch = useDispatch();
  const reduxSettings = useSelector((state) => state.logisticsDashboard.settings);
  const [toastVisible, setToastVisible] = useState(false);
  
  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: '30',
    routeOptimization: true,
    fuelConservation: false,
    emailAlerts: true,
    smsAlerts: false,
    securityLogs: true,
  });

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (reduxSettings) {
      setSettings(reduxSettings);
    }
  }, [reduxSettings]);

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(saveSettings(settings))
      .unwrap()
      .then(() => {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
      });
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-xs text-white/40 mt-0.5">Configure routing rules, notifications and synchronization preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* General controls */}
        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" /> Operational Controls
          </h2>
          
          <div className="space-y-3.5 pt-2">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="text-xs font-semibold text-white">Automated Stand Balancing</p>
                <p className="text-[10px] text-white/30">Dynamically distribute vehicles to empty warehouse stands</p>
              </div>
              <input
                type="checkbox"
                checked={settings.routeOptimization}
                onChange={(e) => setSettings({ ...settings, routeOptimization: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 bg-[#141414] border-white/[0.08]"
              />
            </label>

            <div className="h-px bg-white/[0.04]" />

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="text-xs font-semibold text-white">Fuel Conservation Routing</p>
                <p className="text-[10px] text-white/30">Prioritize shipments along carbon-friendly, low-emission roadways</p>
              </div>
              <input
                type="checkbox"
                checked={settings.fuelConservation}
                onChange={(e) => setSettings({ ...settings, fuelConservation: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 bg-[#141414] border-white/[0.08]"
              />
            </label>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-500" /> Synchronization Settings
          </h2>
          
          <div className="space-y-4 pt-2">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="text-xs font-semibold text-white">Auto Refresh Telemetry</p>
                <p className="text-[10px] text-white/30">Poll stand allocations and vehicle positions automatically</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={(e) => setSettings({ ...settings, autoRefresh: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 bg-[#141414] border-white/[0.08]"
              />
            </label>

            {settings.autoRefresh && (
              <div>
                <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                  Polling Interval (seconds)
                </label>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => setSettings({ ...settings, refreshInterval: e.target.value })}
                  className="bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                >
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Notifications config */}
        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-500" /> Dispatch Alerts
          </h2>
          
          <div className="space-y-3.5 pt-2">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="text-xs font-semibold text-white">Email Dispatch Alerts</p>
                <p className="text-[10px] text-white/30">Receive updates when new shipments are created or dispatched</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 bg-[#141414] border-white/[0.08]"
              />
            </label>

            <div className="h-px bg-white/[0.04]" />

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="text-xs font-semibold text-white">SMS Critical Alerts</p>
                <p className="text-[10px] text-white/30">Immediate mobile alerts on delays or vehicle malfunctions</p>
              </div>
              <input
                type="checkbox"
                checked={settings.smsAlerts}
                onChange={(e) => setSettings({ ...settings, smsAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 bg-[#141414] border-white/[0.08]"
              />
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          {toastVisible && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Settings saved successfully.
            </div>
          )}
          <div className="flex-1" />
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]"
          >
            Save Settings
          </button>
        </div>

      </form>
    </div>
  );
};

export default LogisticsSettingsPage;
