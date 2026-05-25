import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, createOrder, updateOrder, deleteOrder, updateOrderStatus } from '../../../redux/orderSlice';
import { fetchSuppliers } from '../../../redux/supplierSlice';
import { 
  ShoppingCart, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Search, 
  Filter, 
  DollarSign, 
  Truck, 
  Calendar, 
  Zap,
  Building,
  Info,
  ChevronDown,
  X,
  Edit,
  Trash2,
  ArrowUpDown,
  CreditCard,
  AlertCircle,
  Check
} from 'lucide-react';

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] overflow-hidden ${className}`}>
    {children}
  </div>
);

const STATUS_STEPS = ['pending', 'sent', 'received'];
const STATUS_LABELS = {
  pending: 'Draft/Pending',
  sent: 'Shipped (In Transit)',
  received: 'Restocked'
};

const ProgressTracker = ({ currentStatus }) => {
  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-1.5 text-red-400 font-bold text-[10px] uppercase tracking-wider py-1">
        <XCircle size={13} /> Order Cancelled
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="w-full mt-4 mb-4">
      <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-gray-500 mb-2">
        {STATUS_STEPS.map((step, idx) => {
          let color = 'text-gray-600';
          if (idx < currentIndex) color = 'text-emerald-450';
          if (idx === currentIndex) {
            color = step === 'pending' ? 'text-amber-450' : step === 'sent' ? 'text-blue-400' : 'text-emerald-400';
          }
          return (
            <span key={step} className={color}>
              {STATUS_LABELS[step]}
            </span>
          );
        })}
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full flex items-center justify-between relative">
        {STATUS_STEPS.map((step, idx) => {
          let dotColor = 'bg-[#1b1212] border-white/10';
          if (idx < currentIndex) {
            dotColor = 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
          } else if (idx === currentIndex) {
            dotColor = step === 'pending' 
              ? 'bg-amber-500 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
              : step === 'sent'
              ? 'bg-blue-500 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
              : 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
          }
          return (
            <div 
              key={step} 
              className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 z-10 ${dotColor}`} 
            />
          );
        })}
        {/* Progress Fill Line */}
        <div 
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500" 
          style={{ width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(s => s.order);
  const { suppliers } = useSelector(s => s.supplier);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [valueFilter, setValueFilter] = useState('All'); // All, Under $1k, $1k - $5k, Over $5k
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, value-desc, value-asc
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const [editingPriceId, setEditingPriceId] = useState(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState('');

  const handleStartNegotiation = (order) => {
    setEditingPriceId(order.id);
    setNegotiatedPrice(order.unit_price ? order.unit_price.toString() : '');
  };

  const handleSaveNegotiatedPrice = async (order) => {
    const newPrice = parseFloat(negotiatedPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      showToast("Please enter a valid price.", "error");
      return;
    }

    const calculatedTotal = (order.quantity || 1) * newPrice;
    const payload = {
      supplier_id: order.supplier_id,
      material_name: order.material_name,
      quantity: order.quantity,
      unit: order.unit,
      unit_price: newPrice,
      total_amount: calculatedTotal,
      status: order.status,
      expected_delivery: order.expected_delivery
    };

    try {
      await dispatch(updateOrder({ orderId: order.id, data: payload })).unwrap();
      showToast(`Unit price negotiated to $${newPrice.toFixed(2)}/unit!`, "success");
      setEditingPriceId(null);
      dispatch(fetchOrders());
    } catch (err) {
      showToast(err || "Failed to update negotiated price.", "error");
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    supplier_id: '',
    material_name: '',
    quantity: 100,
    unit: 'kg',
    unit_price: 15.0,
    expected_delivery: ''
  });

  useEffect(() => {
    dispatch(fetchOrders());
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
    setEditingOrder(null);
    setFormData({
      supplier_id: '',
      material_name: '',
      quantity: 100,
      unit: 'kg',
      unit_price: 15.0,
      expected_delivery: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (order) => {
    setEditingOrder(order);
    setFormData({
      supplier_id: order.supplier_id.toString(),
      material_name: order.material_name || '',
      quantity: order.quantity || 100,
      unit: order.unit || 'kg',
      unit_price: order.unit_price || 15.0,
      expected_delivery: order.expected_delivery ? new Date(order.expected_delivery).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.supplier_id || !formData.material_name || !formData.quantity || !formData.unit_price) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    const calculatedTotal = parseFloat(formData.quantity) * parseFloat(formData.unit_price);
    const payload = {
      supplier_id: parseInt(formData.supplier_id),
      material_name: formData.material_name.trim(),
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      unit_price: parseFloat(formData.unit_price),
      total_amount: calculatedTotal,
      status: editingOrder ? editingOrder.status : "pending",
      expected_delivery: formData.expected_delivery ? new Date(formData.expected_delivery).toISOString() : null
    };

    try {
      if (editingOrder) {
        await dispatch(updateOrder({ orderId: editingOrder.id, data: payload })).unwrap();
        showToast("Purchase Order successfully modified.", "success");
      } else {
        await dispatch(createOrder(payload)).unwrap();
        showToast("Purchase Order created and dispatched!", "success");
      }
      setIsModalOpen(false);
      dispatch(fetchOrders());
    } catch (err) {
      showToast(err || "Failed to save Purchase Order.", "error");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this purchase order from records?")) {
      try {
        await dispatch(deleteOrder(orderId)).unwrap();
        showToast("Purchase Order deleted successfully.", "success");
      } catch (err) {
        showToast(err || "Failed to delete Purchase Order.", "error");
      }
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      showToast(
        newStatus === 'received' 
          ? "Cargo received! Materials have been added to active Inventory." 
          : `Order status updated to ${newStatus}.`, 
        "success"
      );
      dispatch(fetchOrders());
    } catch (err) {
      showToast(err || "Failed to update order status.", "error");
    }
  };

  const getSupplierName = (id) => {
    const s = suppliers.find(sup => sup.id === id);
    return s ? s.name : `Supplier #${id}`;
  };

  // Metrics Calculations
  const totalSpend = orders.reduce((acc, curr) => acc + (curr.total_amount || (curr.quantity * curr.unit_price)), 0);
  const pendingSpend = orders.filter(o => o.status !== 'received' && o.status !== 'cancelled')
                             .reduce((acc, curr) => acc + (curr.total_amount || (curr.quantity * curr.unit_price)), 0);
  const fulfilledSpend = orders.filter(o => o.status === 'received')
                               .reduce((acc, curr) => acc + (curr.total_amount || (curr.quantity * curr.unit_price)), 0);

  const stats = [
    { label: 'Total Placed Value', value: `$${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-red-500' },
    { label: 'Active/Pending Outlay', value: `$${pendingSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Clock, color: 'text-amber-400' },
    { label: 'Fulfilled/Restocked Value', value: `$${fulfilledSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Total Orders Count', value: orders.length.toString(), icon: ShoppingCart, color: 'text-rose-400' }
  ];

  const filteredOrders = orders
    .filter(order => {
      const sName = getSupplierName(order.supplier_id).toLowerCase();
      const matName = (order.material_name || '').toLowerCase();
      const orderIdStr = order.id.toString();
      const query = searchTerm.toLowerCase();

      const matchesSearch = sName.includes(query) || matName.includes(query) || orderIdStr.includes(query);
      
      const matchesStatus = statusFilter === 'All' ? true : 
                            statusFilter === 'Pending' ? order.status === 'pending' :
                            statusFilter === 'In Transit' ? order.status === 'sent' :
                            statusFilter === 'Received' ? order.status === 'received' : true;

      const orderVal = order.total_amount || (order.quantity * order.unit_price);
      const matchesValue = valueFilter === 'All' ? true :
                            valueFilter === 'Under $1k' ? orderVal < 1000 :
                            valueFilter === '$1k - $5k' ? (orderVal >= 1000 && orderVal <= 5000) :
                            valueFilter === 'Over $5k' ? orderVal > 5000 : true;

      return matchesSearch && matchesStatus && matchesValue;
    })
    .sort((a, b) => {
      const valA = a.total_amount || (a.quantity * a.unit_price);
      const valB = b.total_amount || (b.quantity * b.unit_price);
      if (sortBy === 'date-desc') return new Date(b.order_date) - new Date(a.order_date);
      if (sortBy === 'date-asc') return new Date(a.order_date) - new Date(b.order_date);
      if (sortBy === 'value-desc') return valB - valA;
      if (sortBy === 'value-asc') return valA - valB;
      return 0;
    });

  const getDaysRemainingStr = (expectedDate) => {
    if (!expectedDate) return 'TBD';
    const diff = new Date(expectedDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)} Days Overdue`;
    if (days === 0) return 'Arriving Today';
    return `${days} Days Left`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className="w-1.5 h-6 bg-red-600 rounded-full" />
             <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Purchase Orders</h1>
           </div>
           <p className="text-gray-500 text-xs ml-4">Strategic procurement orchestration, restocking cycles, and cargo verification.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/10 transition-colors flex items-center gap-2 self-start lg:self-auto"
        >
          <Plus size={15} />
          <span>New Purchase Order</span>
        </button>
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

      {/* Dynamic Filter Strip */}
      <div className="flex flex-wrap items-center gap-4 bg-white/[0.02] border border-white/[0.08] p-4 rounded-2xl">
        <div className="relative group flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={16} />
          <input 
            className="bg-[#0f0a0a] border border-white/10 rounded-xl pl-11 pr-4 py-2 text-xs text-white outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/10 transition-all w-full placeholder:text-gray-600"
            placeholder="Search by order ID, material name, or supplier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3.5">
          {/* Status Buttons */}
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-0.5 shrink-0 overflow-x-auto">
            {['All', 'Pending', 'In Transit', 'Received'].map((f) => (
              <button 
                key={f} 
                onClick={() => setStatusFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  statusFilter === f ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Value Bracket Filter */}
          <select
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-red-500"
            value={valueFilter}
            onChange={e => setValueFilter(e.target.value)}
          >
            <option value="All">All Values</option>
            <option value="Under $1k">Under $1,000</option>
            <option value="$1k - $5k">$1,000 - $5,000</option>
            <option value="Over $5k">Over $5,000</option>
          </select>

          {/* Sort selection */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={12} className="text-gray-500" />
            <select
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-red-500"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="date-desc">Order Date: Newest</option>
              <option value="date-asc">Order Date: Oldest</option>
              <option value="value-desc">Total Value: High-Low</option>
              <option value="value-asc">Total Value: Low-High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-44 bg-white/5 border border-white/5 rounded-3xl animate-pulse" />)
        ) : filteredOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
            <ShoppingCart size={40} className="text-gray-700 mx-auto mb-3 animate-bounce" />
            <h3 className="text-md font-bold text-white uppercase mb-1">No Purchase Orders Found</h3>
            <p className="text-xs text-gray-550">Draft a new procurement cycle to request raw materials from your active suppliers.</p>
          </div>
        ) : filteredOrders.map((order) => {
          const totalValuation = order.total_amount || (order.quantity * order.unit_price);
          const daysRemaining = getDaysRemainingStr(order.expected_delivery);
          const isOverdue = daysRemaining.includes('Overdue');

          return (
            <GlassCard key={order.id} className="p-6 hover:border-red-500/30 transition-all duration-300 relative flex flex-col justify-between">
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-black text-white tabular-nums">#{order.id.toString().padStart(4, '0')}</span>
                      <span className="text-xs font-black text-white px-2 py-0.5 bg-white/5 rounded border border-white/5 tabular-nums">
                        ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <Building size={11} className="text-red-500" />
                      <span>{getSupplierName(order.supplier_id)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(order.status === 'pending' || order.status === 'sent' || order.status === 'received') && (
                      <button 
                        onClick={() => handleOpenEditModal(order)}
                        className="p-1.5 rounded bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors"
                        title="Edit order"
                      >
                        <Edit size={13} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1.5 rounded bg-red-950/20 border border-red-550/10 text-red-400 hover:text-white hover:bg-red-650 transition-colors"
                      title="Delete order"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress tracker */}
                <ProgressTracker currentStatus={order.status} />

                {/* Material Details Block */}
                {order.material_name && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Material</span>
                      <span className="text-white font-mono font-semibold">{order.material_name}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-white/5 pt-1.5">
                      <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Purchase Quantity</span>
                      <span className="text-white font-mono font-semibold">{order.quantity} {order.unit || 'units'}</span>
                    </div>
                    {order.unit_price && (
                      <div className="flex justify-between items-center text-xs border-t border-white/5 pt-1.5">
                        <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Unit Price</span>
                        {editingPriceId === order.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 font-mono text-xs">$</span>
                            <input 
                              type="number"
                              step="0.01"
                              min="0.01"
                              className="w-16 bg-[#0a0505] border border-white/20 rounded-md px-1.5 py-0.5 text-xs text-white outline-none focus:border-red-500 font-mono text-right"
                              value={negotiatedPrice}
                              onChange={e => setNegotiatedPrice(e.target.value)}
                              autoFocus
                            />
                            <button 
                              onClick={() => handleSaveNegotiatedPrice(order)}
                              className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all"
                              title="Save negotiated price"
                            >
                              <Check size={10} />
                            </button>
                            <button 
                              onClick={() => setEditingPriceId(null)}
                              className="p-1 rounded bg-red-900/20 text-red-400 border border-red-500/15 hover:bg-red-650 hover:text-white transition-all"
                              title="Cancel"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group/price cursor-pointer" onClick={() => handleStartNegotiation(order)}>
                            <span className="text-white font-mono font-semibold">${order.unit_price}</span>
                            <Edit size={11} className="text-gray-500 opacity-0 group-hover/price:opacity-100 transition-opacity" />
                            <span className="text-[8px] font-black uppercase tracking-wider text-red-500/80 underline decoration-red-500/40 opacity-0 group-hover/price:opacity-100 transition-opacity">Negotiate</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-500" />
                    <div>
                      <p className="text-[8.5px] font-bold uppercase text-gray-500">Ordered</p>
                      <p className="text-white text-[11px] font-semibold">{new Date(order.order_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-gray-500" />
                    <div>
                      <p className="text-[8.5px] font-bold uppercase text-gray-500">Arrival / Timer</p>
                      <div className="flex items-center gap-1">
                        <p className="text-white text-[11px] font-semibold">{order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : 'TBD'}</p>
                        {order.status !== 'received' && order.status !== 'cancelled' && (
                          <span className={`text-[8px] font-black uppercase px-1 rounded ${
                            isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-400'
                          }`}>
                            {daysRemaining}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Action Center</span>
                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'sent')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                    >
                      Ship Cargo
                    </button>
                  )}
                  {order.status === 'sent' && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'received')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                    >
                      Receive & Restock
                    </button>
                  )}
                  {order.status !== 'received' && order.status !== 'cancelled' && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                      className="px-3 py-1.5 border border-red-500/20 hover:bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {order.status === 'received' && (
                    <span className="text-[9.5px] text-emerald-400/80 font-bold uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 size={12} /> Stock Logged
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* New / Edit Purchase Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#120a0a] border border-white/10 rounded-[32px] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-white/[0.01]">
              <div>
                <h2 className="text-md font-black uppercase text-white tracking-wide">
                  {editingOrder ? 'Modify Purchase Order' : 'Procure Raw Materials'}
                </h2>
                <p className="text-[9px] text-gray-500 mt-0.5">
                  {editingOrder ? 'Update order metrics and parameters' : 'Order raw stock from active suppliers and auto-restock inventory'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 space-y-4">
              
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
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Unit Metric</label>
                  <select
                    className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="kg" className="bg-[#120a0a]">kg (Kilograms)</option>
                    <option value="units" className="bg-[#120a0a]">units (Count)</option>
                    <option value="liters" className="bg-[#120a0a]">liters (Volume)</option>
                    <option value="tons" className="bg-[#120a0a]">tons (Bulk)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Quantity</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Unit Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                    value={formData.unit_price}
                    onChange={e => setFormData({ ...formData, unit_price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Expected Delivery</label>
                <input
                  type="date"
                  className="w-full bg-[#0a0505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                  value={formData.expected_delivery}
                  onChange={e => setFormData({ ...formData, expected_delivery: e.target.value })}
                />
              </div>

              <div className="bg-red-950/20 border border-red-550/10 rounded-2xl p-4 text-xs flex justify-between items-center text-gray-300">
                <span className="font-bold text-[10px] tracking-wider uppercase text-gray-550">Total Purchase Value</span>
                <span className="text-base font-black text-white">
                  ${(parseFloat(formData.quantity || 0) * parseFloat(formData.unit_price || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
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
                  {editingOrder ? 'Save Changes' : 'Confirm Purchase'}
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

export default OrdersPage;
