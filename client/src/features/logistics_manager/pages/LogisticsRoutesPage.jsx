import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin,
  Wifi,
  Navigation,
  Activity,
  Truck,
  Layers,
  Search,
  CheckCircle,
  Play,
  Pause,
  Terminal,
  Sliders,
  Flame,
  BatteryCharging,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { fetchVehicles, fetchVehicleWarehouses } from '../../../redux/logisticsDashboardSlice';
import api from '../../../api/api';

// Map Coordinate System Nodes
const mapNodes = {
  destinations: [
    { id: 'dest-1', label: 'Austin Depot', x: 500, y: 90, color: '#ec4899', lat: 30.2672, lng: -97.7431 },
    { id: 'dest-2', label: 'Dallas Port', x: 520, y: 250, color: '#a855f7', lat: 32.7767, lng: -96.7970 }
  ],
  hub: { id: 'hub', label: 'Central Hub', x: 340, y: 170, color: '#3b82f6', lat: 31.9686, lng: -99.9018 }
};

// Coordinate helpers for warehouse stands
const getStandCoords = (index) => {
  const coords = [
    { x: 80, y: 80 },
    { x: 80, y: 260 },
    { x: 200, y: 170 }
  ];
  return coords[index % coords.length];
};

const LogisticsRoutesPage = () => {
  const dispatch = useDispatch();
  const { vehicles, warehouses, loading } = useSelector((state) => state.logisticsDashboard);
  
  // State
  const [selectedItem, setSelectedItem] = useState(null); // { type: 'stand'|'vehicle', data: object }
  const [searchQuery, setSearchQuery] = useState('');
  
  // Telemetry Simulation States
  const [simVehicles, setSimVehicles] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 4x
  const [logs, setLogs] = useState([]);
  
  // Quick Dispatcher Form State
  const [dispatchVehicleId, setDispatchVehicleId] = useState('');
  const [dispatchDestId, setDispatchDestId] = useState('dest-1');
  const [dispatchCargo, setDispatchCargo] = useState('Electronics');
  const [dispatchWeight, setDispatchWeight] = useState(3000);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchVehicleWarehouses());
  }, [dispatch]);

  // Map vehicles to warehouse stands
  const standsData = useMemo(() => {
    return warehouses.map((w, idx) => {
      const coords = getStandCoords(idx);
      const assignedVehicles = vehicles.filter((v) => String(v.stop_warehouse_id) === String(w.id));
      const totalCapacity = assignedVehicles.reduce((sum, v) => sum + Number(v.capacity_kg || 0), 0);
      
      return {
        id: w.id,
        name: w.name,
        zone: w.location || 'Loading Bay',
        x: coords.x,
        y: coords.y,
        assignedCount: assignedVehicles.length,
        totalCapacity,
        vehicles: assignedVehicles,
        status: assignedVehicles.length > 0 ? 'Busy' : 'Available',
      };
    });
  }, [warehouses, vehicles]);

  // Sync redux vehicles to simulation state on load
  useEffect(() => {
    if (vehicles.length > 0 && simVehicles.length === 0) {
      const initialSims = vehicles.map((v, idx) => {
        const wIdx = warehouses.findIndex(w => String(w.id) === String(v.stop_warehouse_id));
        const standPos = getStandCoords(wIdx !== -1 ? wIdx : idx);
        const dest = mapNodes.destinations[idx % mapNodes.destinations.length];
        
        return {
          ...v,
          x: standPos.x,
          y: standPos.y,
          startX: standPos.x,
          startY: standPos.y,
          endX: dest.x,
          endY: dest.y,
          progress: Math.floor(Math.random() * 40), // start somewhat along the route
          speed: Math.floor(Math.random() * 15) + 55, // 55-70 mph
          fuel: 100 - Math.floor(Math.random() * 20),
          temp: v.vehicle_type === 'Refrigerated' ? -18.5 : null,
          engineTemp: 90 + Math.floor(Math.random() * 8),
          destinationName: dest.label,
          routePhase: 'Outbound', // Outbound | Unloading | Returning | Docked
          cargoWeight: Math.floor(v.capacity_kg * 0.8),
          cargoType: 'Industrial Parts'
        };
      });
      
      setSimVehicles(initialSims);
      
      setLogs([
        { time: new Date().toLocaleTimeString(), text: 'CONTROL TOWER: GPS tracking network established.', type: 'sys' },
        { time: new Date().toLocaleTimeString(), text: `${initialSims.length} active fleet transponders online.`, type: 'sys' }
      ]);
    }
  }, [vehicles, warehouses, simVehicles.length]);

  // Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimVehicles((prev) =>
        prev.map((v) => {
          if (v.status !== 'Active') return v;

          let nextProgress = v.progress + 1.2 * simSpeed;
          let nextX = v.x;
          let nextY = v.y;
          let nextPhase = v.routePhase;
          let nextStartX = v.startX;
          let nextStartY = v.startY;
          let nextEndX = v.endX;
          let nextEndY = v.endY;
          let nextDestName = v.destinationName;
          let newLogs = [];

          // Decrease fuel
          const nextFuel = Math.max(0, Number((v.fuel - 0.04 * simSpeed).toFixed(2)));

          // Telemetry drift
          const nextSpeed = Math.max(40, Math.min(78, v.speed + (Math.random() * 4 - 2)));
          const nextEngineTemp = Math.max(82, Math.min(102, v.engineTemp + (Math.random() * 2 - 1)));
          const nextTemp = v.temp !== null ? Number((v.temp + (Math.random() * 0.4 - 0.2)).toFixed(1)) : null;

          if (nextProgress >= 100) {
            if (nextPhase === 'Outbound') {
              nextPhase = 'Unloading';
              nextProgress = 0;
              nextX = v.endX;
              nextY = v.endY;
              newLogs.push({
                time: new Date().toLocaleTimeString(),
                text: `[GATEWAY] Vehicle ${v.id} arrived at ${v.destinationName}. Docking & Unloading cargo.`,
                type: 'ok'
              });
            } else if (nextPhase === 'Unloading') {
              nextPhase = 'Returning';
              nextProgress = 0;
              nextStartX = v.endX;
              nextStartY = v.endY;
              
              // Find coordinates of home stand
              const wIdx = warehouses.findIndex(w => String(w.id) === String(v.stop_warehouse_id));
              const homePos = getStandCoords(wIdx !== -1 ? wIdx : 0);
              nextEndX = homePos.x;
              nextEndY = homePos.y;
              nextDestName = v.stop_warehouse_name || 'Home Stand';
              
              newLogs.push({
                time: new Date().toLocaleTimeString(),
                text: `[DISPATCH] Vehicle ${v.id} empty. Returning to ${nextDestName}.`,
                type: 'sys'
              });
            } else if (nextPhase === 'Returning') {
              nextPhase = 'Docked';
              nextProgress = 0;
              nextX = v.startX;
              nextY = v.startY;
              newLogs.push({
                time: new Date().toLocaleTimeString(),
                text: `[DOCK] Vehicle ${v.id} docked successfully at ${v.stop_warehouse_name}. Powering down engine.`,
                type: 'ok'
              });
            } else if (nextPhase === 'Docked') {
              // Idle docked logic: 10% chance to autostart a new dispatch
              if (Math.random() < 0.1) {
                nextPhase = 'Outbound';
                nextProgress = 0;
                nextStartX = v.startX;
                nextStartY = v.startY;
                const newDest = mapNodes.destinations[Math.floor(Math.random() * mapNodes.destinations.length)];
                nextEndX = newDest.x;
                nextEndY = newDest.y;
                nextDestName = newDest.label;
                newLogs.push({
                  time: new Date().toLocaleTimeString(),
                  text: `[AUTO-DISPATCH] Vehicle ${v.id} departing stand for ${newDest.label}.`,
                  type: 'sys'
                });
              }
            }
          } else {
            // Interpolate position along path
            const rad = nextProgress / 100;
            // Let's draw slight curve paths
            const curveOffset = Math.sin(rad * Math.PI) * 12;
            nextX = nextStartX + (nextEndX - nextStartX) * rad;
            nextY = nextStartY + (nextEndY - nextStartY) * rad;
            
            const dx = nextEndX - nextStartX;
            const dy = nextEndY - nextStartY;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
              const nx = -dy / len;
              const ny = dx / len;
              nextX += nx * curveOffset;
              nextY += ny * curveOffset;
            }

            // Periodic telemetry check in terminal
            if (Math.random() < 0.03) {
              newLogs.push({
                time: new Date().toLocaleTimeString(),
                text: `[PING] ${v.id} status: ${nextPhase}, speed: ${nextSpeed.toFixed(1)}mph, fuel: ${nextFuel}%, cargo: ${v.cargoWeight}kg`,
                type: 'gps'
              });
            }
          }

          if (newLogs.length > 0) {
            setLogs((l) => [...l.slice(-49), ...newLogs]);
          }

          return {
            ...v,
            x: nextX,
            y: nextY,
            progress: nextProgress,
            routePhase: nextPhase,
            startX: nextStartX,
            startY: nextStartY,
            endX: nextEndX,
            endY: nextEndY,
            destinationName: nextDestName,
            fuel: nextFuel,
            speed: nextSpeed,
            engineTemp: nextEngineTemp,
            temp: nextTemp
          };
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, warehouses]);

  // Dispatch custom route manual trigger
  const handleManualDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchVehicleId) return;

    const targetVehicle = simVehicles.find(v => v.id === dispatchVehicleId);
    const targetDest = mapNodes.destinations.find(d => d.id === dispatchDestId);
    if (!targetVehicle || !targetDest) return;

    // 1. Update local simulation state
    setSimVehicles((prev) =>
      prev.map((v) => {
        if (v.id === dispatchVehicleId) {
          return {
            ...v,
            status: 'Active',
            routePhase: 'Outbound',
            progress: 0,
            startX: v.x,
            startY: v.y,
            endX: targetDest.x,
            endY: targetDest.y,
            destinationName: targetDest.label,
            cargoType: dispatchCargo,
            cargoWeight: Number(dispatchWeight),
            speed: 62,
            fuel: Math.max(v.fuel, 90) // top up fuel
          };
        }
        return v;
      })
    );

    // 2. Add local log entry
    setLogs((l) => [
      ...l,
      {
        time: new Date().toLocaleTimeString(),
        text: `[MANUAL DISPATCH] Dispatching ${dispatchVehicleId} carrying ${dispatchCargo} (${dispatchWeight}kg) to ${targetDest.label}.`,
        type: 'sys'
      }
    ]);

    // 3. Persist dispatch details to database endpoints
    try {
      // Create a unique tracking number
      const trackingNum = `TRK-${Date.now().toString().slice(-6)}`;
      
      // Post the new shipment dispatch
      await api.post('/logistics-dashboard/shipments', {
        tracking_number: trackingNum,
        destination: targetDest.label,
        driver_name: targetVehicle.driver_name || 'Automated Driver',
        weight_kg: Number(dispatchWeight),
        status: 'In Transit',
        eta: new Date(Date.now() + 4 * 3600 * 1000).toISOString()
      });

      // Update vehicle status to Active in the database
      await api.put(`/logistics-dashboard/vehicles/${dispatchVehicleId}`, {
        status: 'Active',
        driver_name: targetVehicle.driver_name || 'Automated Driver'
      });

      // Log dispatch activity in backend DB
      await api.post('/logistics-dashboard/activities', {
        event_text: `Manual Dispatch: ${dispatchVehicleId} departing for ${targetDest.label} with ${dispatchWeight}kg of ${dispatchCargo}.`,
        status_type: 'success'
      });
      
      // Refresh redux dashboard store to capture new database state
      dispatch(fetchVehicles());
    } catch (err) {
      console.error("Failed to persist manual dispatch to database:", err);
      setLogs((l) => [
        ...l,
        {
          time: new Date().toLocaleTimeString(),
          text: `[ERROR] Database sync failed: ${err.response?.data?.detail || err.message}`,
          type: 'error'
        }
      ]);
    }
  };

  // Filter stands based on search query
  const filteredStands = standsData.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quick select items on map
  const selectStand = (stand) => {
    setSelectedItem({ type: 'stand', data: stand });
  };

  const selectVehicle = (vehicle) => {
    setSelectedItem({ type: 'vehicle', data: vehicle });
  };

  // Re-synchronize simulation state with database
  const handleResetTelemetry = () => {
    setSimVehicles([]);
    setLogs((l) => [
      ...l,
      { time: new Date().toLocaleTimeString(), text: '[SYS] Recalibrating tracking coordinates and reloading database states.', type: 'sys' }
    ]);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      
      {/* --- Heading --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-500 animate-pulse" /> Stands & Live Tracking
          </h1>
          <p className="text-xs text-white/40 mt-0.5">Real-time GPS control room with loading docks allocations and fleet telemetrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetTelemetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-xs font-semibold text-white/80 transition-all"
            title="Reset simulation parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Re-sync Database
          </button>
          
          <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
            isSimulating
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-white/40 bg-white/[0.03] border-white/[0.05]'
          }`}>
            <Wifi className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse' : ''}`} />
            Telemetry {isSimulating ? 'Active' : 'Standby'}
          </div>
        </div>
      </div>

      {/* --- Main Dashboard Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        
        {/* Left Column (Allocations list, SVG Map, Log console) */}
        <div className="space-y-6">
          
          {/* Allocations & stands slider */}
          <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-4 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Stands Allocations</h2>
                <p className="text-[10px] text-white/35">Warehouse docks linked to active loading activities</p>
              </div>
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter docks / stands..."
                  className="w-full bg-[#141414] border border-white/[0.06] rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {loading.warehouses && standsData.length === 0 ? (
                <div className="col-span-3 text-center text-xs text-white/30 py-8">
                  Contacting warehouse database...
                </div>
              ) : filteredStands.length === 0 ? (
                <div className="col-span-3 text-center text-xs text-white/30 py-8">
                  No warehouse stands found matching your search.
                </div>
              ) : (
                filteredStands.map((stand) => {
                  const isSelected = selectedItem?.type === 'stand' && selectedItem.data.id === stand.id;
                  return (
                    <div
                      key={stand.id}
                      onClick={() => selectStand(stand)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.06)]'
                          : 'bg-[#0f0f0f] border-white/[0.06] hover:border-white/[0.12] hover:bg-[#121212]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            stand.status === 'Busy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.05] text-white/30'
                          }`}>
                            <Layers className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white leading-none truncate">{stand.name}</p>
                            <p className="text-[9px] text-white/30 leading-none mt-1 truncate">{stand.zone}</p>
                          </div>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                          stand.status === 'Busy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-white/[0.05] text-white/40 border border-white/[0.05]'
                        }`}>
                          {stand.status}
                        </span>
                      </div>

                      <div className="mt-3.5 flex items-center justify-between border-t border-white/[0.04] pt-2.5 text-[9px] text-white/40">
                        <span>Vehicles: <strong className="text-white/80">{stand.assignedCount}</strong></span>
                        <span>Capacity: <strong className="text-white/80">{stand.totalCapacity.toLocaleString()} kg</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Premium SVG Tracking Map */}
          <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between z-10">
              <div>
                <h2 className="text-sm font-semibold text-white">Live Tracking Grid</h2>
                <p className="text-[10px] text-white/35">Real-time animated positioning network of vehicles and stands</p>
              </div>
              
              {/* Telemetry controls */}
              <div className="flex items-center gap-2">
                <div className="flex border border-white/[0.06] bg-[#141414] rounded-lg p-0.5">
                  {[1, 2, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSimSpeed(s)}
                      disabled={!isSimulating}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        simSpeed === s && isSimulating
                          ? 'bg-emerald-500 text-black'
                          : 'text-white/40 hover:text-white disabled:opacity-30'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSimulating
                      ? 'bg-red-500/15 hover:bg-red-500/25 border border-red-500/35 text-red-400'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  }`}
                >
                  {isSimulating ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" /> Pause Tracking
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Tracking
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SVG Visualizer Area */}
            <div className="relative w-full h-[360px] bg-[#0c0c0c] border border-white/[0.04] rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
              
              {/* Radar Grid Pattern */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="routesGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.8"/>
                    <circle cx="0" cy="0" r="1.5" fill="rgba(255,255,255,0.06)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#routesGrid)" />
                
                {/* Radial radar sweeps */}
                <circle cx="340" cy="170" r="120" stroke="rgba(16, 185, 129, 0.03)" strokeWidth="1" fill="none" strokeDasharray="3 6" />
                <circle cx="340" cy="170" r="220" stroke="rgba(16, 185, 129, 0.02)" strokeWidth="1.5" fill="none" />
              </svg>

              {/* Dynamic Path Lines */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Outbound Stand paths to Hub */}
                {standsData.map((stand, i) => (
                  <path
                    key={`p1-${i}`}
                    d={`M ${stand.x} ${stand.y} Q ${(stand.x + mapNodes.hub.x)/2 - 10} ${(stand.y + mapNodes.hub.y)/2 + 20} ${mapNodes.hub.x} ${mapNodes.hub.y}`}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                ))}
                
                {/* Paths from Hub to destinations */}
                {mapNodes.destinations.map((dest, i) => (
                  <path
                    key={`p2-${i}`}
                    d={`M ${mapNodes.hub.x} ${mapNodes.hub.y} Q ${(mapNodes.hub.x + dest.x)/2 + 10} ${(mapNodes.hub.y + dest.y)/2 - 15} ${dest.x} ${dest.y}`}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                ))}

                {/* Animated overlay lines for simulating signal pulses */}
                {isSimulating && (
                  <>
                    {standsData.map((stand, i) => (
                      <path
                        key={`pulse1-${i}`}
                        d={`M ${stand.x} ${stand.y} Q ${(stand.x + mapNodes.hub.x)/2 - 10} ${(stand.y + mapNodes.hub.y)/2 + 20} ${mapNodes.hub.x} ${mapNodes.hub.y}`}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="10 120"
                        strokeDashoffset="-20"
                        fill="none"
                        className="animate-[dash_4s_linear_infinite]"
                      />
                    ))}
                    {mapNodes.destinations.map((dest, i) => (
                      <path
                        key={`pulse2-${i}`}
                        d={`M ${mapNodes.hub.x} ${mapNodes.hub.y} Q ${(mapNodes.hub.x + dest.x)/2 + 10} ${(mapNodes.hub.y + dest.y)/2 - 15} ${dest.x} ${dest.y}`}
                        stroke="#a855f7"
                        strokeWidth="1.5"
                        strokeDasharray="10 120"
                        strokeDashoffset="-35"
                        fill="none"
                        className="animate-[dash_3.5s_linear_infinite]"
                      />
                    ))}
                  </>
                )}
              </svg>

              {/* DOCK STANDS NODES */}
              {standsData.map((stand) => {
                const isSelected = selectedItem?.type === 'stand' && selectedItem.data.id === stand.id;
                return (
                  <div
                    key={stand.id}
                    className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: stand.x, top: stand.y }}
                    onClick={() => selectStand(stand)}
                  >
                    <div className="relative">
                      <span className={`flex h-7 w-7 rounded-xl items-center justify-center border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110'
                          : 'bg-[#0f0f0f] text-emerald-400 border-emerald-500/30 group-hover:border-emerald-400/80 group-hover:scale-105'
                      }`}>
                        <Layers className="w-3.5 h-3.5" />
                      </span>
                      {stand.status === 'Busy' && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                      )}
                      
                      {/* Name Label */}
                      <span className="absolute top-8 left-1/2 -translate-x-1/2 text-[9px] text-white/50 font-bold tracking-wide whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-white/[0.05]">
                        {stand.name}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* CENTRAL DISPATCH HUB NODE */}
              <div
                className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: mapNodes.hub.x, top: mapNodes.hub.y }}
                onClick={() => setSelectedItem({ type: 'stand', data: { name: 'Central Distribution Hub', zone: 'State Highway Intersection 1', totalCapacity: 150000, assignedCount: vehicles.length, status: 'Active' } })}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/40 flex items-center justify-center transition-all group-hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="w-3 h-3 rounded-full bg-blue-400 animate-ping absolute" />
                    <div className="w-4 h-4 rounded-full bg-blue-500 border border-black z-10" />
                  </div>
                  <span className="absolute top-11 left-1/2 -translate-x-1/2 text-[9px] text-blue-400 font-bold whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-blue-500/20">
                    Central Hub
                  </span>
                </div>
              </div>

              {/* DESTINATIONS NODES */}
              {mapNodes.destinations.map((dest) => (
                <div
                  key={dest.id}
                  className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: dest.x, top: dest.y }}
                  onClick={() => setSelectedItem({ type: 'stand', data: { name: dest.label, zone: 'Offsite Client Warehouse', totalCapacity: 80000, assignedCount: 0, status: 'Available' } })}
                >
                  <div className="relative">
                    <span className="flex h-7 w-7 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 items-center justify-center transition-all group-hover:border-purple-400 group-hover:scale-105">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <span className="absolute top-8 left-1/2 -translate-x-1/2 text-[9px] text-purple-300/80 font-bold whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-purple-500/10">
                      {dest.label}
                    </span>
                  </div>
                </div>
              ))}

              {/* SIMULATED VEHICLES MOVING ON MAP */}
              {simVehicles.map((vehicle) => {
                const isSelected = selectedItem?.type === 'vehicle' && selectedItem.data.id === vehicle.id;
                
                // Don't render stationary vehicles that are docked right on top of stand position,
                // or offset them slightly to avoid overlap
                const offset = vehicle.routePhase === 'Docked' ? 12 : 0;
                const vx = vehicle.x + offset;
                const vy = vehicle.y + (vehicle.routePhase === 'Docked' ? -8 : 0);

                return (
                  <div
                    key={vehicle.id}
                    className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out z-20 group"
                    style={{ left: vx, top: vy }}
                    onClick={() => selectVehicle(vehicle)}
                  >
                    <div className="relative">
                      {/* Visual Indicator */}
                      <span className={`flex h-5 w-5 rounded-lg items-center justify-center border transition-all duration-200 ${
                        isSelected
                          ? 'bg-purple-500 text-black border-purple-300 scale-125 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                          : 'bg-black text-emerald-400 border-emerald-500/40 group-hover:scale-110 group-hover:border-emerald-400'
                      }`}>
                        <Truck className="w-3 h-3" />
                      </span>
                      
                      {/* Small Vehicle ID tag */}
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-white bg-black/85 px-1 py-0.2 rounded border border-white/[0.1] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {vehicle.id}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dispatcher Terminal / Live Telemetry Logs */}
          <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-2.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> Telemetry Command Terminal
              </h2>
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                GPS ping log (limit 50)
              </span>
            </div>

            <div className="h-32 overflow-y-auto bg-black border border-white/[0.03] rounded-lg p-3 font-mono text-[10px] leading-relaxed space-y-1.5">
              {logs.map((log, index) => {
                const color =
                  log.type === 'sys' ? 'text-blue-400' :
                  log.type === 'gps' ? 'text-white/40' :
                  log.type === 'ok' ? 'text-emerald-400' : 'text-amber-400';
                
                return (
                  <div key={index} className="flex items-start gap-2.5">
                    <span className="text-white/20 shrink-0">{log.time}</span>
                    <span className={color}>{log.text}</span>
                  </div>
                );
              })}
              {logs.length === 0 && (
                <div className="text-white/25 italic text-center py-8">
                  Telemetry logs await tracking activation...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Sidebar: Telemetry detail panel & controller */}
        <div className="space-y-6">

          {/* Selected Stand / Vehicle Telemetry Card */}
          <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Telemetry Breakdown</h2>
              <p className="text-[10px] text-white/35">Detailed parameters of the highlighted tracking node</p>
            </div>

            {selectedItem ? (
              <div className="space-y-4 pt-1">
                {/* Header Info */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      {selectedItem.type === 'stand' ? selectedItem.data.name : `TRANS-UNIT ${selectedItem.data.id}`}
                    </h3>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {selectedItem.type === 'stand' ? selectedItem.data.zone : selectedItem.data.vehicle_type}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedItem.data.status === 'Busy' || selectedItem.data.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/[0.03] text-white/40 border-white/[0.05]'
                  }`}>
                    {selectedItem.data.status}
                  </span>
                </div>

                {/* Specific details based on selection type */}
                {selectedItem.type === 'stand' ? (
                  // --- Stand details ---
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                        <p className="text-[8px] text-white/30 uppercase font-bold tracking-wider">Vehicles Assigned</p>
                        <p className="text-sm font-black text-white mt-1 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-emerald-400" />
                          {selectedItem.data.assignedCount}
                        </p>
                      </div>
                      <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                        <p className="text-[8px] text-white/30 uppercase font-bold tracking-wider">Total Load Capacity</p>
                        <p className="text-sm font-black text-white mt-1 flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                          {(selectedItem.data.totalCapacity || 0).toLocaleString()} kg
                        </p>
                      </div>
                    </div>

                    {/* Assigned vehicles list */}
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Assigned Stand Fleet</h4>
                      {simVehicles.filter(v => String(v.stop_warehouse_id) === String(selectedItem.data.id)).map(v => (
                        <div
                          key={v.id}
                          onClick={() => selectVehicle(v)}
                          className="p-2.5 bg-black border border-white/[0.04] rounded-lg flex items-center justify-between cursor-pointer hover:border-emerald-500/30 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5 text-white/40" />
                            <div>
                              <p className="text-xs font-bold text-white">{v.id}</p>
                              <p className="text-[9px] text-white/30">{v.vehicle_type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-white/60">{v.driver_name || 'No driver'}</p>
                            <p className="text-[9px] text-emerald-400 mt-0.5">{v.routePhase}</p>
                          </div>
                        </div>
                      ))}
                      {simVehicles.filter(v => String(v.stop_warehouse_id) === String(selectedItem.data.id)).length === 0 && (
                        <p className="text-xs text-white/30 italic text-center py-2">No vehicles assigned to this stand</p>
                      )}
                    </div>
                  </div>
                ) : (
                  // --- Vehicle details ---
                  <div className="space-y-4">
                    {/* Telemetry metrics dials */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                        <p className="text-[8px] text-white/30 uppercase font-bold tracking-wider">Speed</p>
                        <p className="text-sm font-black text-white mt-1 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          {selectedItem.data.status === 'Active' && isSimulating ? `${selectedItem.data.speed.toFixed(1)} mph` : '0 mph'}
                        </p>
                      </div>
                      <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                        <p className="text-[8px] text-white/30 uppercase font-bold tracking-wider">Fuel Level</p>
                        <p className="text-sm font-black text-white mt-1 flex items-center gap-1.5">
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                          {selectedItem.data.fuel}%
                        </p>
                      </div>
                      <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                        <p className="text-[8px] text-white/30 uppercase font-bold tracking-wider">Engine Temp</p>
                        <p className="text-sm font-black text-white mt-1 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-emerald-400" />
                          {selectedItem.data.engineTemp}°C
                        </p>
                      </div>
                      <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                        <p className="text-[8px] text-white/30 uppercase font-bold tracking-wider">Cargo Weight</p>
                        <p className="text-sm font-black text-white mt-1 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-400" />
                          {selectedItem.data.cargoWeight.toLocaleString()} kg
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar if traveling */}
                    {selectedItem.data.routePhase !== 'Docked' && (
                      <div className="space-y-1.5 p-3 bg-white/[0.01] border border-white/[0.03] rounded-lg">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-white/40">Route: <strong className="text-white/80">{selectedItem.data.routePhase}</strong></span>
                          <span className="text-emerald-400 font-bold">{selectedItem.data.progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#141414] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${selectedItem.data.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-white/30 pt-0.5">
                          <span>{selectedItem.data.stop_warehouse_name || 'Stand'}</span>
                          <span className="flex items-center gap-1">
                            {selectedItem.data.destinationName} <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Telemetry info */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-white/[0.03] py-1.5">
                        <span className="text-white/35">Driver Assigned</span>
                        <span className="font-semibold text-white/80">{selectedItem.data.driver_name || 'No driver name'}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.03] py-1.5">
                        <span className="text-white/35">Cargo Type</span>
                        <span className="font-semibold text-white/80">{selectedItem.data.cargoType || 'Freight load'}</span>
                      </div>
                      {selectedItem.data.temp !== null && (
                        <div className="flex justify-between border-b border-white/[0.03] py-1.5">
                          <span className="text-white/35">Refrigeration Temp</span>
                          <span className="font-semibold text-emerald-400">{selectedItem.data.temp}°C</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1.5">
                        <span className="text-white/35">GPS Coordinates</span>
                        <span className="font-mono text-[10px] text-white/60">
                          {(30 + selectedItem.data.x/100).toFixed(6)} N, {(-97 - selectedItem.data.y/100).toFixed(6)} W
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-white/20 border border-dashed border-white/[0.06] rounded-xl">
                <MapPin className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-xs">Select a stand or moving vehicle on the live tracking grid to display telemetry diagnostics</p>
              </div>
            )}
          </div>

          {/* Quick Route Dispatcher Module */}
          <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Manual Dispatch Override</h2>
              <p className="text-[10px] text-white/35">Force-initialize driver cargo dispatches directly onto the GPS grid</p>
            </div>

            <form onSubmit={handleManualDispatch} className="space-y-3.5">
              
              {/* Select vehicle */}
              <div>
                <label className="block text-[9px] font-bold text-white/45 uppercase tracking-wider mb-1">
                  Select Unit
                </label>
                <select
                  value={dispatchVehicleId}
                  onChange={(e) => setDispatchVehicleId(e.target.value)}
                  className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  required
                >
                  <option value="">Choose active vehicle...</option>
                  {simVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.id} ({v.vehicle_type} - {v.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-[9px] font-bold text-white/45 uppercase tracking-wider mb-1">
                  Destination Node
                </label>
                <select
                  value={dispatchDestId}
                  onChange={(e) => setDispatchDestId(e.target.value)}
                  className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                >
                  {mapNodes.destinations.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Cargo info & Cargo Weight */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] font-bold text-white/45 uppercase tracking-wider mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={dispatchCargo}
                    onChange={(e) => setDispatchCargo(e.target.value)}
                    className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    placeholder="Electronics"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-white/45 uppercase tracking-wider mb-1">
                    Cargo Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={dispatchWeight}
                    onChange={(e) => setDispatchWeight(e.target.value)}
                    className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    min="100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 fill-current" /> Dispatch Active Route
              </button>

            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default LogisticsRoutesPage;
