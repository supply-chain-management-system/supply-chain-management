import React from 'react';
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  BarChart3, 
  MapPin, 
  Clock 
} from 'lucide-react';

function Admin_dashboard() {
  const stats = [
    { title: 'Active Shipments', value: '1,284', icon: <Truck className="text-blue-600" />, trend: '+12%' },
    { title: 'In Inventory', value: '45,020', icon: <Package className="text-orange-600" />, trend: '+5%' },
    { title: 'Delayed', value: '12', icon: <AlertTriangle className="text-red-600" />, trend: '-2%' },
    { title: 'Efficiency', value: '94.2%', icon: <BarChart3 className="text-green-600" />, trend: '+1.5%' },
  ];

  const recentShipments = [
    { id: 'SHP-001', destination: 'New York, US', status: 'In Transit', ETA: '2h 15m' },
    { id: 'SHP-002', destination: 'London, UK', status: 'Delivered', ETA: 'Completed' },
    { id: 'SHP-003', destination: 'Berlin, DE', status: 'Delayed', ETA: '6h 45m' },
    { id: 'SHP-004', destination: 'Tokyo, JP', status: 'Processing', ETA: '12h 00m' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">

      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Logistics Overview</h1>
          <p className="text-gray-500">Real-time supply chain monitoring</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 border border-gray-200 rounded-md shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-md">{stat.icon}</div>
                <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-md shadow-sm">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Recent Shipments</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Destination</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{shipment.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                      <MapPin size={14} /> {shipment.destination}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                        shipment.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        shipment.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
                      <Clock size={14} /> {shipment.ETA}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin_dashboard;