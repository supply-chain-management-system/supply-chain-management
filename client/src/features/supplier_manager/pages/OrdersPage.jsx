import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../../redux/orderSlice';
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
  Zap
} from 'lucide-react';

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] overflow-hidden ${className}`}>
    {children}
  </div>
);

const StatusPill = ({ status }) => {
  const themes = {
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: Clock },
    sent: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: Zap },
    received: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle2 },
    cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', icon: XCircle },
  };
  const theme = themes[status] || themes.pending;
  return (
    <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${theme.bg} border border-white/5`}>
      <theme.icon size={10} className={theme.text} />
      <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>{status}</span>
    </div>
  );
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(s => s.order);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Purchase Orders</h1>
           <p className="text-gray-500 font-bold ml-1">Strategic procurement orchestration and delivery tracking.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-2">
             <Plus size={18} /> New Order
           </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative group flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500" size={18} />
          <input 
            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white outline-none focus:border-red-500/50 transition-all w-full"
            placeholder="Search order ID or supplier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {['All', 'Pending', 'In Transit', 'Received'].map((f) => (
          <button key={f} className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/10 transition-all">
            {f}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-48 bg-white/5 rounded-[32px] animate-pulse" />)
        ) : orders.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <ShoppingCart size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white uppercase mb-1">No Orders Found</h3>
            <p className="text-gray-500 font-bold">Initiate a new procurement cycle to see orders here.</p>
          </div>
        ) : orders.map((order) => (
          <GlassCard key={order.id} className="p-8 group hover:border-red-500/40 transition-all duration-500">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl font-black text-white tabular-nums tracking-tighter">#{order.id.toString().padStart(4, '0')}</span>
                      <StatusPill status={order.status} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Procurement Node: Supplier ID {order.supplier_id}</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-white tabular-nums tracking-tighter">${order.total_amount?.toLocaleString()}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Total Valuation</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-rose-500 border border-white/5">
                      <Calendar size={18} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Order Date</p>
                      <p className="text-xs font-bold text-white">{new Date(order.order_date).toLocaleDateString()}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-rose-500 border border-white/5">
                      <Truck size={18} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Expected Arrival</p>
                      <p className="text-xs font-bold text-white">{order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : 'TBD'}</p>
                   </div>
                </div>
             </div>

             <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex -space-x-2">
                   {[...Array(3)].map((_, i) => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0f0a0a] bg-gradient-to-br from-red-600 to-rose-700" />
                   ))}
                </div>
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-500 hover:text-white transition-all">
                   Manage Logistics <ChevronRight size={14} />
                </button>
             </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
