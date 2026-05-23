import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function EfficiencyChart({ data }) {
  return (
    <div className="h-80 bg-gray-900 p-3 rounded">
      <h3 className="mb-2">Efficiency</h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="product_name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="efficiency" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}