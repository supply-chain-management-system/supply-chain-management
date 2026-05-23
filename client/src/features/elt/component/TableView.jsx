export default function TableView({ data, onSelect }) {
  return (
    <div className="bg-gray-900 p-3 rounded overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400">
            <th>Product</th>
            <th>Target</th>
            <th>Output</th>
            <th>Status</th>
            <th>Efficiency</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="border-t border-gray-700">
              <td
                className="text-blue-400 cursor-pointer"
                onClick={() => onSelect(item.product_name)}
              >
                {item.product_name}
              </td>
              <td>{item.target_qty}</td>
              <td>{item.output_qty}</td>
              <td>{item.status}</td>
              <td>{item.efficiency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}