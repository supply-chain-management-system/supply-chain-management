import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, Edit2, Trash2, MapPin, Package, Plus, Search, Truck, UserRound, X } from 'lucide-react';
import {
  addVehicle,
  fetchVehicleWarehouses,
  fetchVehicles,
  updateVehicle,
  deleteVehicle,
} from '../../../redux/logisticsDashboardSlice';

const vehicleTypes = ['Truck', 'Box Truck', 'Van', 'Flatbed', 'Mini Truck', 'Refrigerated'];

const emptyVehicle = {
  fleet_id: '',
  stop_warehouse_id: '',
  stop_warehouse_name: '',
  capacity_kg: '',
  vehicle_type: 'Truck',
  driver_name: '',
  status: 'Active',
};

const VehicleModal = ({ isOpen, onClose, onSave, editingVehicle, warehouses, warehousesLoading }) => {
  const [formData, setFormData] = useState(emptyVehicle);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingVehicle) {
      setFormData({
        fleet_id: editingVehicle.id,
        stop_warehouse_id: editingVehicle.stop_warehouse_id || '',
        stop_warehouse_name: editingVehicle.stop_warehouse_name || '',
        capacity_kg: editingVehicle.capacity_kg || '',
        vehicle_type: editingVehicle.vehicle_type || 'Truck',
        driver_name: editingVehicle.driver_name || '',
        status: editingVehicle.status || 'Active',
      });
    } else {
      setFormData(emptyVehicle);
    }
    setError('');
  }, [editingVehicle, isOpen]);

  if (!isOpen) return null;

  const handleWarehouseChange = (e) => {
    const warehouseId = e.target.value;
    const selectedWarehouse = warehouses.find((warehouse) => String(warehouse.id) === warehouseId);

    setFormData({
      ...formData,
      stop_warehouse_id: warehouseId,
      stop_warehouse_name: selectedWarehouse?.name || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fleet_id.trim() || !formData.stop_warehouse_name || !formData.capacity_kg) {
      setError('Fleet ID, warehouse stand, and capacity are required');
      return;
    }

    if (Number(formData.capacity_kg) <= 0) {
      setError('Capacity must be greater than 0 kg');
      return;
    }

    try {
      await onSave({
        ...formData,
        fleet_id: formData.fleet_id.trim(),
        stop_warehouse_id: formData.stop_warehouse_id ? Number(formData.stop_warehouse_id) : null,
        capacity_kg: Number(formData.capacity_kg),
        driver_name: formData.driver_name.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save vehicle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-500" />
            {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Fleet ID
              </label>
              <input
                type="text"
                value={formData.fleet_id}
                onChange={(e) => setFormData({ ...formData, fleet_id: e.target.value })}
                className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/20"
                placeholder="TRK-001"
                disabled={!!editingVehicle}
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Vehicle Type
              </label>
              <select
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              >
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Warehouse Stop / Stand
            </label>
            <select
              value={formData.stop_warehouse_id}
              onChange={handleWarehouseChange}
              disabled={warehousesLoading}
              className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            >
              <option value="">{warehousesLoading ? 'Loading warehouse stands...' : 'Select warehouse stand'}</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}{warehouse.location ? ` - ${warehouse.location}` : ''}
                </option>
              ))}
            </select>
            {!warehousesLoading && warehouses.length === 0 && (
              <p className="text-[10px] text-red-400/80 mt-1.5">
                No warehouse stands found. Create a warehouse or assign one under Business Manager first.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Capacity (kg)
              </label>
              <input
                type="number"
                min="1"
                value={formData.capacity_kg}
                onChange={(e) => setFormData({ ...formData, capacity_kg: e.target.value })}
                className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                placeholder="2500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              >
                <option value="Active">Active</option>
                <option value="Idle">Idle</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Driver Name
            </label>
            <input
              type="text"
              value={formData.driver_name}
              onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
              className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/20"
              placeholder="Optional"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.05]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white/60 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LogisticsFleetPage = () => {
  const dispatch = useDispatch();
  const { vehicles, warehouses, loading } = useSelector((state) => state.logisticsDashboard);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchVehicleWarehouses());
  }, [dispatch]);

  const filteredVehicles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return vehicles;

    return vehicles.filter((vehicle) => (
      vehicle.id?.toLowerCase().includes(query)
      || vehicle.stop_warehouse_name?.toLowerCase().includes(query)
      || vehicle.vehicle_type?.toLowerCase().includes(query)
      || vehicle.driver_name?.toLowerCase().includes(query)
      || vehicle.status?.toLowerCase().includes(query)
    ));
  }, [searchTerm, vehicles]);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async (formData) => {
    if (editingVehicle) {
      await dispatch(updateVehicle({ id: editingVehicle.id, vehicleData: formData })).unwrap();
    } else {
      await dispatch(addVehicle(formData)).unwrap();
    }
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${vehicle.id}?`)) {
      await dispatch(deleteVehicle(vehicle.id)).unwrap();
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Fleet Management</h1>
          <p className="text-xs text-white/40 mt-0.5">Manage vehicle stands, load capacity, drivers, and availability</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40">Total Vehicles</p>
                <p className="text-lg font-bold text-white">{vehicles.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40">Total Capacity</p>
                <p className="text-lg font-bold text-white">
                  {vehicles.reduce((sum, vehicle) => sum + Number(vehicle.capacity_kg || 0), 0).toLocaleString()} kg
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40">Warehouse Stands</p>
                <p className="text-lg font-bold text-white">{warehouses.length}</p>
              </div>
            </div>
          </div>
        </div>

      <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vehicles, stands, drivers..."
              className="w-full bg-[#111] border border-white/[0.06] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.05] bg-[#0d0d0d]">
                {['Fleet ID', 'Warehouse Stand', 'Capacity', 'Type', 'Driver', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading.vehicles && vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-white/30">
                    Loading fleet data...
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Truck className="w-8 h-8 text-white/10 mx-auto mb-3" />
                    <p className="text-sm font-medium text-white/60">No vehicles tracked</p>
                    <p className="text-xs text-white/30 mt-1">Add a vehicle to start managing your fleet.</p>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                          <Truck className="w-4 h-4 text-white/60 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <span className="text-sm font-semibold text-white">{v.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <MapPin className="w-4 h-4 text-white/30" />
                        {v.stop_warehouse_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-white">{Number(v.capacity_kg || 0).toLocaleString()} kg</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/70">{v.vehicle_type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <UserRound className="w-4 h-4 text-white/30" />
                        {v.driver_name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        v.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : v.status === 'Maintenance' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-white/[0.05] text-white/50 border-white/[0.05]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          v.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]'
                            : v.status === 'Maintenance' ? 'bg-red-500' : 'bg-white/30'
                        }`} />
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-1.5 text-white/30 hover:text-white hover:bg-white/[0.05] rounded-md transition-all"
                          title="Edit Vehicle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(v)}
                          className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                          title="Delete Vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVehicle}
        editingVehicle={editingVehicle}
        warehouses={warehouses}
        warehousesLoading={loading.warehouses}
      />
    </div>
  );
};

export default LogisticsFleetPage;
