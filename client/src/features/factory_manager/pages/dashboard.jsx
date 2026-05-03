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
            <h1 className="text-3xl font-bold text-gray-900">Factory Overview</h1>
            <p className="text-gray-500 mt-1">Real-time status of production line 04 - Sector B</p>
          </div>
          
          <div className="flex items-center gap-4">
            <AlertBanner 
              type="warning"
              title="STOCK SHORTAGE"
              message="Aluminum Grade A (Low Stock)"
            />
            
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors" onClick={()=>navigate('/createproduct')}>
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
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
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