import React from 'react';
import Layout from '../layout/dashboarslayout';
import AlertBanner from '../component/alert';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  PlayCircle, 
  CheckCircle2, 
  Package,
  Plus
} from 'lucide-react';

const Dashboard = () => {
 const navigate=useNavigate()
  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(180deg, #94a3b8, #64748b)' }} />
              <h1 className="text-3xl font-bold text-gray-900">Factory Overview</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-4">Real-time status of production line 04 - Sector B</p>
          </div>
          
          <div className="flex items-center gap-4">
            <AlertBanner 
              type="warning"
              title="STOCK SHORTAGE"
              message="Aluminum Grade A (Low Stock)"
            />
            
            <button
              className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)' }}
              onClick={() => navigate('/createproduct')}
            >
              <Plus className="w-5 h-5" />
              New Job
            </button>
          </div>
        </div>

       
       

        

        {/* Machine Status Section */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Machine Status Overview</h3>
            <p className="text-sm text-gray-500">Real-time telemetry and availability</p>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#94a3b8' }}></div>
              <span className="text-sm text-gray-600">In Use</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Maintenance</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;