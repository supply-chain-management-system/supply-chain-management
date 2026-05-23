import { useEffect, useState } from "react";
import api from "../../api/api";

import EfficiencyChart from "./component/EfficiencyChart";
import TargetVsOutputChart from "./component/TargetVsOutputChart";
import StatusChart from "./component/StatusChart";
import TableView from "./component/TableView";
import ProductDetails from "./component/ProductDetailsels";

export default function ProductionELT() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get("elt/elt_production/production/t_lack_3f9d1");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 3000);
    return () => clearInterval(t);
  }, []);

  if (selected) {
    return (
      <div className="p-6">
        <button
          onClick={() => setSelected(null)}
          className="mb-4 px-4 py-2 bg-gray-700 text-white rounded"
        >
          ⬅ Back
        </button>

        <ProductDetails product={selected} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-950 text-white min-h-screen">

      <h1 className="text-2xl font-bold">🚀 Production Dashboard</h1>

      {/* TABLE */}
      <TableView data={data} onSelect={setSelected} />

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EfficiencyChart data={data} />
        <TargetVsOutputChart data={data} />
        <StatusChart data={data} />
      </div>
    </div>
  );
}