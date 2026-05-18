import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, handleRequestAction } from '../../../redux/requestsSlice';
import { 
  BellRing, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  User,
  Activity,
  History
} from 'lucide-react';

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] overflow-hidden ${className}`}>
    {children}
  </div>
);

const RequestsPage = () => {
  const dispatch = useDispatch();
  const { items: requests, loading } = useSelector(s => s.requests);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  // Filter for requests relevant to Supplier Manager or global requests if empty
  const smRequests = requests.filter(r => r.role === 'supply_manager' || r.status === 'pending');

  const onAction = (id, action) => {
    dispatch(handleRequestAction({ requestId: id, action }));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Decision Center</h1>
           <p className="text-gray-500 font-bold ml-1">Critical authorization queue for supply chain synchronization.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
             <Activity size={14} /> System Active
           </div>
           <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
             <History size={18} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white/5 rounded-[32px] animate-pulse" />)
        ) : smRequests.length === 0 ? (
          <div className="py-32 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-2">Queue Cleared</h3>
            <p className="text-gray-500 font-bold">All procurement authorizations are up to date.</p>
          </div>
        ) : (
          smRequests.map((req) => (
            <GlassCard key={req.id} className="group hover:bg-white/[0.05] transition-all duration-300">
               <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <ShieldAlert size={28} />
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <span className="text-lg font-black text-white tracking-tight uppercase">Request #{req.id}</span>
                           <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400 border border-white/5">
                             {req.role.replace('_', ' ')}
                           </span>
                        </div>
                        <p className="text-sm font-bold text-gray-400 leading-tight mb-2">{req.description}</p>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-600">
                              <User size={12} /> Requester ID: {req.id + 100}
                           </div>
                           <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-600">
                              <Clock size={12} /> 2h ago
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                     <button 
                       onClick={() => onAction(req.id, 'REJECT')}
                       className="px-6 py-3 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/5"
                     >
                       Deny Access
                     </button>
                     <button 
                       onClick={() => onAction(req.id, 'APPROVE')}
                       className="px-8 py-3 rounded-2xl bg-red-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/20 hover:bg-red-500 hover:scale-105 transition-all flex items-center gap-2"
                     >
                       Authorize <ArrowRight size={14} />
                     </button>
                  </div>
               </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
