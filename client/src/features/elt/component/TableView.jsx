const getStatusStyle = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "completed") return "text-emerald-700 bg-emerald-50";
  if (s === "progress") return "text-blue-700 bg-blue-50";
  return "text-amber-700 bg-amber-50";
};

export default function TableView({ data, onSelect }) {
  return (
    <div className="overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 rounded-t-lg border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <div className="col-span-4">Product</div>
          <div className="col-span-2 text-center">Target</div>
          <div className="col-span-2 text-center">Output</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-center">Efficiency</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {data.map((item, i) => {
          const eff = parseFloat(item.efficiency) || 0;
          const target = item.target_qty || 0;
          const output = item.output_qty || 0;
          const progress = target > 0 ? Math.min(Math.round((output / target) * 100), 100) : 0;

          return (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => onSelect(item.product_name)}
            >
              {/* Product Name */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 group-hover:bg-gray-200 transition-colors">
                  {(item.product_name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-900">
                    {item.product_name}
                  </p>
                </div>
              </div>

              {/* Target */}
              <div className="col-span-2 text-center">
                <p className="text-sm text-gray-600">{target.toLocaleString()}</p>
              </div>

              {/* Output */}
              <div className="col-span-2 text-center">
                <p className="text-sm font-medium text-gray-900">{output.toLocaleString()}</p>
              </div>

              {/* Status Badge */}
              <div className="col-span-2 flex justify-center">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}>
                  {item.status || "Pending"}
                </span>
              </div>

              {/* Efficiency */}
              <div className="col-span-2">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(eff, 100)}%`,
                        background: eff >= 80 ? "#059669" : eff >= 50 ? "#d97706" : "#dc2626"
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500 w-10 text-right">
                    {eff}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}