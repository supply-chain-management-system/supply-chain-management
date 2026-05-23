import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import api from "../../../api/api";

export default function ProductDetails({ product, onBack }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get(`elt/elt_production/production/t_lack_3f9d1/history/${product}`)
      .then((res) => setHistory(res.data));
  }, [product]);

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={onBack}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ⬅ Back
      </button>

      <h2 className="text-xl font-bold">📦 Product: {product}</h2>

      {/* Chart */}
      <div className="w-full h-80 bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">📈 Output History</h3>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <XAxis dataKey="created_at" />
            <YAxis />
            <Tooltip />

            <Line type="monotone" dataKey="output_qty" stroke="#10b981" />
            <Line type="monotone" dataKey="target_qty" stroke="#f59e0b" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Time</th>
              <th className="p-2">Target</th>
              <th className="p-2">Output</th>
              <th className="p-2">Status</th>
              <th className="p-2">Efficiency</th>
            </tr>
          </thead>

          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{h.created_at}</td>
                <td className="p-2">{h.target_qty}</td>
                <td className="p-2">{h.output_qty}</td>
                <td className="p-2">{h.status}</td>
                <td className="p-2">{h.efficiency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}