import { useState, useEffect } from 'react';
import apiClient from '../../../api/api';

const ProductionDrafts = () => {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    // Fetch production requests where status is 'PENDING'
    apiClient.get('/factory/production?status=PENDING')
      .then(res => setDrafts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-100 font-bold text-slate-700">
        AI-Drafted Production Orders
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Qty</th>
            <th className="px-4 py-3">Factory</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {drafts.map(d => (
            <tr key={d.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4 font-medium text-slate-800">{d.product_name}</td>
              <td className="px-4 py-4">{d.target_qty}</td>
              <td className="px-4 py-4">Factory {d.factory_id}</td>
              <td className="px-4 py-4">
                <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 font-semibold">
                  Send to Factory
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductionDrafts;