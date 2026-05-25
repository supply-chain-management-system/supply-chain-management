import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../../redux/inventorySlice';
import { fetchSuppliers } from '../../../redux/supplierSlice';
import { createOrder } from '../../../redux/orderSlice';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  ArrowUpRight, 
  History, 
  Filter,
  Search,
  Box,
  Layers,
  Thermometer,
  MoreVertical,
  X,
  Building,
  Edit,
  Trash2,
  TrendingUp,
  RefreshCw,
  ArrowUpDown
} from 'lucide-react';

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] overflow-hidden ${className}`}>
    {children}
  </div>
);

const CATEGORIES = [
  'Electronics', 'Raw Material', 'Hydraulics', 'Plastics',
  'Chemicals', 'Packaging', 'Textiles', 'Machinery'
];

const InventoryPage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.inventory);
  const { suppliers } = useSelector(s => s.supplier);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All'); // All, Low Stock, Normal Stock
  const [sortBy, setSortBy] = useState('name-asc'); // name-asc, quantity-desc, quantity-asc
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    material_name: '',
    category: 'Electronics',
    quantity: 0.0,
    unit: 'kg',
    min_threshold: 10.0,
    supplier_id: ''
  });

  // Restock Form State
  const [restockData, setRestockData] = useState({
    quantity: 100,
    unit_price: 15.0,
    expected_delivery: ''
  });

  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchSuppliers({ size: 100 }));
  }, [dispatch]);

  const showToast = (msg, type = 'success') => {
    let message = msg;
    if (typeof msg === 'object' && msg !== null) {
      if (Array.isArray(msg)) {
        message = msg.map(m => m.msg || JSON.stringify(m)).join(', ');
      } else if (msg.detail) {
        message = typeof msg.detail === 'object' ? JSON.stringify(msg.detail) : msg.detail;
      } else {
        message = JSON.stringify(msg);
      }
    }
    setToast({ msg: message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      material_name: '',
      category: 'Electronics',
      quantity: 0.0,
      unit: 'kg',
      min_threshold: 10.0,
      supplier_id: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      material_name: item.material_name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      min_threshold: item.min_threshold,
      supplier_id: item.supplier_id.toString()
    });
    setIsModalOpen(true);
  };

  const handleOpenRestockModal = (item) => {
    setRestockItem(item);
    setRestockData({
      quantity: Math.max(50, Math.ceil(item.min_threshold * 2 - item.quantity)),
      unit_price: 12.50,
      expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 week from now
    });
    setIsRestockModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.material_name || !formData.supplier_id) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const payload = {
      material_name: formData.material_name.trim(),
      category: formData.category,
      quantity: parseFloat(formData.quantity) || 0.0,
      unit: formData.unit,
      min_threshold: parseFloat(formData.min_threshold) || 10.0,
      supplier_id: parseInt(formData.supplier_id),
      business_id: 1
    };

    try {
      if (editingItem) {
        await dispatch(updateInventoryItem({ itemId: editingItem.id, data: payload })).unwrap();
        showToast(`${formData.material_name} successfully updated.`, "success");
      } else {
        await dispatch(addInventoryItem(payload)).unwrap();
        showToast(`${formData.material_name} successfully registered in material registry.`, "success");
      }
      setIsModalOpen(false);
      dispatch(fetchInventory());
    } catch (err) {
      showToast(err || "Failed to save resource.", "error");
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockItem) return;

    const calculatedTotal = parseFloat(restockData.quantity) * parseFloat(restockData.unit_price);
    const payload = {
      supplier_id: restockItem.supplier_id,
      material_name: restockItem.material_name,
      quantity: parseFloat(restockData.quantity),
      unit: restockItem.unit,
      unit_price: parseFloat(restockData.unit_price),
      total_amount: calculatedTotal,
      status: "pending",
      expected_delivery: restockData.expected_delivery ? new Date(restockData.expected_delivery).toISOString() : null
    };

    try {
      await dispatch(createOrder(payload)).unwrap();
      showToast(`Restock order placed successfully for ${restockItem.material_name}!`, "success");
      setIsRestockModalOpen(false);
    } catch (err) {
      showToast(err || "Failed to place restock order.", "error");
    }
  };

  const handleDeleteItem = async (itemId, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from inventory?`)) {
      try {
        await dispatch(deleteInventoryItem(itemId)).unwrap();
        showToast(`${name} removed from inventory.`, "success");
      } catch (err) {
        showToast(err || "Failed to delete item.", "error");
      }
    }
  };

  const getSupplierName = (id) => {
    const s = suppliers.find(sup => sup.id === id);
    return s ? s.name : `Supplier #${id}`;
  };

  const filteredItems = items
    .filter(item => {
      const matchesSearch = 
        item.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' ? true : item.category === selectedCategory;
      const matchesStock = stockFilter === 'All' ? true :
                           stockFilter === 'Low Stock' ? item.quantity <= item.min_threshold :
                           stockFilter === 'Normal' ? item.quantity > item.min_threshold : true;
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.material_name.localeCompare(b.material_name);
      if (sortBy === 'quantity-desc') return b.quantity - a.quantity;
      if (sortBy === 'quantity-asc') return a.quantity - b.quantity;
      return 0;
    });

  const totalValue = filteredItems.reduce((acc, curr) => acc + (curr.quantity * 12.5), 0); // Mock cost per unit: $12.50

  const stats = [
    { label: 'Estimated Value', value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Box, color: 'text-red-500' },
    { label: 'Active Categories', value: new Set(filteredItems.map(i => i.category)).size.toString(), icon: Layers, color: 'text-rose-400' },
    { label: 'Low Stock Alerts', value: filteredItems.filter(i => i.quantity <= i.min_threshold).length.toString(), icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Optimal Items', value: filteredItems.filter(i => i.quantity > i.min_threshold).length.toString(), icon: Package, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className="w-1.5 h-6 bg-red-600 rounded-full" />
             <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Resource Inventory</h1>
           </div>
           <p className="text-gray-500 text-xs ml-4">Real-time raw material monitoring, reorder threshold verification, and supplier tracking.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={16} />
             <input 
               className="bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white outline-none focus:border-red-500/50 focus:bg-white/10 transition-all w-56 placeholder:text-gray-650"
               placeholder="Search materials..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
           <button 
             onClick={handleOpenAddModal}
             className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/10 transition-colors flex items-center gap-2"
           >
             <Plus size={15} />
             <span>Add Resource</span>
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <GlassCard key={i} className="p-6 group hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-black text-white tabular-nums tracking-tighter mb-1">{s.value}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-550">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Filter and Sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.08] p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-gray-500" />
            <select
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-red-500"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Stock Status Filter */}
          <select
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-red-500"
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value)}
          >
            <option value="All">All Stock Levels</option>
            <option value="Low Stock">Low Stock Alert</option>
            <option value="Normal">Normal Stock</option>
          </select>
        </div>

        {/* Sorting selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown size={12} className="text-gray-500" />
          <select
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-red-500"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="name-asc">Sort by: Name (A-Z)</option>
            <option value="quantity-desc">Sort by: Stock (High-Low)</option>
            <option value="quantity-asc">Sort by: Stock (Low-High)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table/List */}
      <GlassCard>
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
           <div className="flex items-center gap-3">
             <div className="w-1 h-5 bg-red-600 rounded-full" />
             <h2 className="text-sm font-black text-white uppercase tracking-wider">Material Registry</h2>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead className="bg-white/[0.005] text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
               <tr>
                 <th className="px-6 py-4">Material Name</th>
                 <th className="px-6 py-4">Classification</th>
                 <th className="px-6 py-4">Supplied By</th>
                 <th className="px-6 py-4">Current Stock</th>
                 <th className="px-6 py-4">Capacity Level</th>
                 <th className="px-6 py-4">Health Status</th>
                 <th className="px-6 py-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {loading ? (
                 [...Array(4)].map((_, i) => (
                   <tr key={i} className="animate-pulse">
                     <td colSpan="7" className="px-6 py-5"><div className="h-4 bg-white/5 rounded w-full" /></td>
                   </tr>
                 ))
               ) : filteredItems.length === 0 ? (
                 <tr>
                   <td colSpan="7" className="px-6 py-12 text-center text-xs text-gray-500 italic">No raw material stock records detected.</td>
                 </tr>
               ) : filteredItems.map((item) => {
                 const capacityPct = Math.min(100, (item.quantity / (item.min_threshold * 2)) * 100);
                 const barColor = item.quantity <= item.min_threshold ? 'bg-amber-500' : 'bg-emerald-500';
                 return (
                   <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group text-xs text-white">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-br from-red-600/10 to-rose-600/5 flex items-center justify-center text-red-500 border border-red-500/10">
                           <Box size={15} />
                         </div>
                         <span className="font-bold">{item.material_name}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold text-gray-400 border border-white/5 uppercase tracking-wider">
                         {item.category}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5 text-gray-450 font-semibold">
                         <Building size={12} className="text-red-500/60" />
                         <span>{getSupplierName(item.supplier_id)}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <span className="font-black text-white tabular-nums">
                         {item.quantity} <span className="text-gray-500 font-bold ml-0.5 uppercase text-[9px]">{item.unit}</span>
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <div className="w-24">
                         <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 mb-1">
                           <span>{Math.round(capacityPct)}%</span>
                           <span>Target: {item.min_threshold * 2}</span>
                         </div>
                         <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${barColor}`} style={{ width: `${capacityPct}%` }} />
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                        {item.quantity <= item.min_threshold ? (
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider animate-pulse">
                            <AlertTriangle size={13} /> Low Stock
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-450 font-bold text-[11px] uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Normal
                          </div>
                        )}
                     </td>
                     <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         {item.quantity <= item.min_threshold && (
                           <button 
                             onClick={() => handleOpenRestockModal(item)}
                             className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black font-bold uppercase text-[9px] tracking-wider transition-all"
                             title="Quick restock purchase order"
                           >
                             Restock
                           </button>
                         )}
                         <button 
                           onClick={() => handleOpenEditModal(item)}
                           className="p-1.5 rounded bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                           title="Edit resource"
                         >
                           <Edit size={13} />
                         </button>
                         <button 
                           onClick={() => handleDeleteItem(item.id, item.material_name)}
                           className="p-1.5 rounded bg-red-950/20 border border-red-500/10 text-red-400 hover:text-white hover:bg-red-600 transition-colors"
                           title="Delete resource"
                         >
                           <Trash2 size={13} />
                         </button>
                       </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
        </div>
      </GlassCard>

      {/* Add / Edit Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#120a0a] border border-white/10 rounded-[32px] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-white/[0.01]">
              <div>
                <h2 className="text-md font-black uppercase text-white tracking-wide">
                  {editingItem ? 'Modify Raw Resource' : 'Register Raw Resource'}
                </h2>
                <p className="text-[9px] text-gray-500 mt-0.5">
                  {editingItem ? 'Update specifications and source attributes' : 'Add a material record to registry and assign its source supplier'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Supplier Node</label>
                <select
                  required
                  className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                  value={formData.supplier_id}
                  onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                >
                  <option value="" className="bg-[#120a0a]">-- Select Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id} className="bg-[#120a0a]">{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Material Description</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500 placeholder:text-gray-650"
                    placeholder="e.g. Copper Sheets"
                    value={formData.material_name}
                    onChange={e => setFormData({ ...formData, material_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Classification</label>
                  <select
                    className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c} className="bg-[#120a0a]">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Unit</label>
                  <select
                    className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="kg" className="bg-[#120a0a]">kg</option>
                    <option value="units" className="bg-[#120a0a]">units</option>
                    <option value="liters" className="bg-[#120a0a]">liters</option>
                    <option value="tons" className="bg-[#120a0a]">tons</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Low Stock Reorder Threshold</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                  value={formData.min_threshold}
                  onChange={e => setFormData({ ...formData, min_threshold: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md shadow-red-600/10"
                >
                  {editingItem ? 'Save Changes' : 'Register Resource'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Quick Restock Modal */}
      {isRestockModalOpen && restockItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#120a0a] border border-white/10 rounded-[32px] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-white/[0.01]">
              <div>
                <h2 className="text-md font-black uppercase text-white tracking-wide flex items-center gap-2">
                  <RefreshCw size={16} className="text-amber-500 animate-spin" />
                  <span>Quick Restock Procurement</span>
                </h2>
                <p className="text-[9px] text-gray-500 mt-0.5">
                  Generate instant purchase order for <span className="text-white font-bold">{restockItem.material_name}</span> from <span className="text-white font-bold">{getSupplierName(restockItem.supplier_id)}</span>
                </p>
              </div>
              <button 
                onClick={() => setIsRestockModalOpen(false)} 
                className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Order Quantity ({restockItem.unit})</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                    value={restockData.quantity}
                    onChange={e => setRestockData({ ...restockData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Negotiated Unit Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                    value={restockData.unit_price}
                    onChange={e => setRestockData({ ...restockData, unit_price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Expected Delivery Date</label>
                <input
                  type="date"
                  className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                  value={restockData.expected_delivery}
                  onChange={e => setRestockData({ ...restockData, expected_delivery: e.target.value })}
                />
              </div>

              <div className="bg-[#1f1212] border border-red-500/10 rounded-2xl p-4 text-xs flex justify-between items-center text-gray-300">
                <span className="font-bold text-[10px] tracking-wider uppercase text-gray-550">Total Purchase Value</span>
                <span className="text-base font-black text-white">
                  ${(parseFloat(restockData.quantity || 0) * parseFloat(restockData.unit_price || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase rounded-xl transition-all shadow-md shadow-amber-500/10"
                >
                  Confirm Purchase Order
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold border transition-all ${
          toast.type === 'success' ? 'bg-[#1e1111] border-red-500/30 text-white' : 'bg-[#291111] border-rose-500/30 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

    </div>
  );
};

export default InventoryPage;
