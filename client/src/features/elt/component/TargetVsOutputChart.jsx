import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function TargetVsOutputChart({ data }) {
  return (
    <div className="h-80 bg-gray-900 p-3 rounded">
      <h3 className="mb-2">Target vs Output</h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="product_name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="target_qty" fill="#f59e0b" />
          <Bar dataKey="output_qty" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}