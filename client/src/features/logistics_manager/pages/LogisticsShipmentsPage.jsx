import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package,
  Plus,
  Search,
  MapPin,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  ChevronRight,
} from 'lucide-react';
import {
  fetchShipments,
  addShipment,
  updateShipment,
  deleteShipment,
} from '../../../redux/logisticsDashboardSlice';

const emptyShipment = {
  tracking_number: '',
  destination: '',
  driver_name: '',
  weight_kg: '',
  status: 'Pending',
  eta: '',
};

const ShipmentModal = ({ isOpen, onClose, onSave, editingShipment }) => {
  const [formData, setFormData] = useState(emptyShipment);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingShipment) {
      // Parse ETA date to fit datetime-local input string format
      let formattedEta = '';
      if (editingShipment.eta_iso) {
        // Formats "2026-05-27T15:00:00" to "2026-05-27T15:00"
        formattedEta = editingShipment.eta_iso.slice(0, 16);
      } else if (editingShipment.eta) {
        try {
          const dateObj = new Date(editingShipment.eta);
          if (!isNaN(dateObj)) {
            formattedEta = dateObj.toISOString().slice(0, 16);
          }
        } catch (e) {
          formattedEta = '';
        }
      }
      
      setFormData({
        tracking_number: editingShipment.tracking_number || editingShipment.id || '',
        destination: editingShipment.destination || '',
        driver_name: editingShipment.driver || '',
        weight_kg: editingShipment.weight_kg || (editingShipment.weight ? parseFloat(editingShipment.weight) : ''),
        status: editingShipment.status || 'Pending',
        eta: formattedEta,
      });
    } else {
      setFormData(emptyShipment);
    }
    setError('');
  }, [editingShipment, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tracking_number.trim() || !formData.destination.trim() || !formData.driver_name.trim() || !formData.weight_kg) {
      setError('All fields are required');
      return;
    }

    if (Number(formData.weight_kg) <= 0) {
      setError('Weight must be greater than 0 kg');
      return;
    }

    try {
      const payload = {
        tracking_number: formData.tracking_number.trim(),
        destination: formData.destination.trim(),
        driver_name: formData.driver_name.trim(),
        weight_kg: Number(formData.weight_kg),
        status: formData.status,
        eta: formData.eta ? new Date(formData.eta).toISOString() : null,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save shipment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-500" />
            {editingShipment ? 'Edit Shipment' : 'Create New Shipment'}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
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
                Tracking Number
              </label>
              <input
                type="text"
                value={formData.tracking_number}
                onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/20"
                placeholder="TRK-9001"
                disabled={!!editingShipment}
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Destination
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/20"
                placeholder="Dallas, TX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Driver Name
              </label>
              <input
                type="text"
                value={formData.driver_name}
                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/20"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                placeholder="2800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              >
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Estimated Delivery (ETA)
              </label>
              <input
                type="datetime-local"
                value={formData.eta}
                onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                className="w-full bg-[#141414] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-white/80"
              />
            </div>
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
              {editingShipment ? 'Save Changes' : 'Create Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LogisticsShipmentsPage = () => {
  const dispatch = useDispatch();
  const { shipments, loading } = useSelector((state) => state.logisticsDashboard);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchShipments());
  }, [dispatch]);

  const filteredShipments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return shipments;

    return shipments.filter((shipment) => (
      shipment.id?.toLowerCase().includes(query)
      || shipment.destination?.toLowerCase().includes(query)
      || shipment.driver?.toLowerCase().includes(query)
      || shipment.status?.toLowerCase().includes(query)
    ));
  }, [searchTerm, shipments]);

  const handleOpenAdd = () => {
    setEditingShipment(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shipment) => {
    setEditingShipment(shipment);
    setIsModalOpen(true);
  };

  const handleSaveShipment = async (formData) => {
    if (editingShipment) {
      const numericId = editingShipment.db_id ? Number(editingShipment.db_id) : (editingShipment.id.startsWith('#SHP-1') ? parseInt(editingShipment.id.replace('#SHP-1', ''), 10) : parseInt(editingShipment.id.replace(/^\D+/g, ''), 10));
      await dispatch(updateShipment({ id: numericId, shipmentData: formData })).unwrap();
    } else {
      await dispatch(addShipment(formData)).unwrap();
    }
    dispatch(fetchShipments());
  };

  const handleDeleteShipment = async (shipment) => {
    if (window.confirm(`Are you sure you want to delete shipment ${shipment.id}?`)) {
      const numericId = shipment.db_id ? Number(shipment.db_id) : (shipment.id.startsWith('#SHP-1') ? parseInt(shipment.id.replace('#SHP-1', ''), 10) : parseInt(shipment.id.replace(/^\D+/g, ''), 10));
      await dispatch(deleteShipment(numericId)).unwrap();
      dispatch(fetchShipments());
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Shipments Dispatcher</h1>
          <p className="text-xs text-white/40 mt-0.5">Control live deliveries, update destination routing and log drivers</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Create Shipment
        </button>
      </div>

      {/* Overview widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'In Transit', count: shipments.filter(s => s.status === 'In Transit').length, color: 'text-emerald-400' },
          { label: 'Pending Dispatch', count: shipments.filter(s => s.status === 'Pending').length, color: 'text-white/45' },
          { label: 'Delivered', count: shipments.filter(s => s.status === 'Delivered').length, color: 'text-white/60' },
          { label: 'Delayed', count: shipments.filter(s => s.status === 'Delayed').length, color: 'text-red-400 animate-pulse' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-white/40">{stat.label}</p>
            <p className={`text-lg font-bold mt-1 ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by tracking, destination, driver..."
              className="w-full bg-[#111] border border-white/[0.06] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.05] bg-[#0d0d0d]">
                {['Tracking ID', 'Destination', 'Driver', 'Load Weight', 'Status', 'ETA', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading.shipments && shipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-white/30">
                    Loading shipments data...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Package className="w-8 h-8 text-white/10 mx-auto mb-3" />
                    <p className="text-sm font-medium text-white/60">No shipments found</p>
                    <p className="text-xs text-white/30 mt-1">Create a shipment to start dispatcher operations.</p>
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-emerald-400">
                      {s.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <MapPin className="w-4 h-4 text-white/30" />
                        {s.destination}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      {s.driver}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      {s.weight}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        s.status === 'In Transit' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : s.status === 'Delayed' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : s.status === 'Delivered' ? 'bg-white/[0.06] text-white/70 border-white/[0.08]'
                              : 'bg-white/[0.04] text-white/40 border-white/[0.06]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          s.status === 'In Transit' ? 'bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.5)]'
                            : s.status === 'Delayed' ? 'bg-red-400'
                              : s.status === 'Delivered' ? 'bg-white/50' : 'bg-white/20'
                        }`} />
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-white/25" />
                        {s.eta}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-white/30 hover:text-white hover:bg-white/[0.05] rounded-md transition-all"
                          title="Edit Shipment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteShipment(s)}
                          className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                          title="Delete Shipment"
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

      <ShipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveShipment}
        editingShipment={editingShipment}
      />
    </div>
  );
};

export default LogisticsShipmentsPage;
