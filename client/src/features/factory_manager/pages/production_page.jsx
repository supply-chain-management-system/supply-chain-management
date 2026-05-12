import React, { useState, useEffect } from "react";
import api from "../../../api/api";

const ProductionManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // Form state from CreateProduct
  const [form, setForm] = useState({
    product_name: "",
    target_qty: "",
    factory_id: "",
    // created_by: "",
  });
  const [product, setproduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
   const [users, setUsers] = useState([]);

useEffect(() => {
  api.get("production/factory/products")
    .then((res) => {
      setproduct(res.data);
    })
    .catch((err) => {
      console.error(err);
    });
}, []);

    useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/production/factory/user");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);
  console.log(product)


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/production/factory/product_create", {
        ...form,
        target_qty: Number(form.target_qty) || 0,
        factory_id: Number(form.factory_id),
        // created_by: Number(form.created_by),
      });

      setMessage("✅ Production job created successfully");
      setForm({
        product_name: "",
        target_qty: "",
        factory_id: "",
        // created_by: "",
      });

    
      setTimeout(() => {
        setShowModal(false);
        setMessage("");
      }, 2000);
    } catch (err) {
  console.log(err.response?.data);

  const errorDetail = err.response?.data?.detail;

  if (Array.isArray(errorDetail)) {
    setMessage(errorDetail[0]?.msg || "❌ Validation Error");
  } else {
    setMessage(errorDetail || "❌ Error creating product");
  }
}

    setLoading(false);
  };

 
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    if (showModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [showModal]);
const activeJobsCount = product.filter(
  (item) => item.status === "pending"
).length;
 
  const stats = [
    { label: "Active Jobs", value: activeJobsCount, icon: "📊", color: "bg-blue-50 text-blue-600" },
    { label: "Avg Cycle Time", value: "14.2 min", icon: "⏱️", color: "bg-yellow-50 text-yellow-600" },
    { label: "Overall Efficiency", value: "98.4%", icon: "📈", color: "bg-purple-50 text-purple-600" },
    { label: "Completed Today", value: "182", icon: "✅", color: "bg-green-50 text-green-600" },
  ];

 


  const jobs = product.map((item, index) => ({
  id: item.id || `JOB-${index + 1}`,
  name: item.product_name,
  machine: item.factory_name || `Factory ${item.factory_id}`,
  progress: item.progress || 0,
  output: `${item.completed_qty || 0} / ${item.target_qty}`,
  status: item.status || "Pending",
  statusColor:
    item.status === "Completed"
      ? "bg-green-100 text-green-700"
      : item.status === "In Progress"
      ? "bg-blue-100 text-blue-700"
      : "bg-yellow-100 text-yellow-700",
}));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Production Management</h1>
          <button
            onClick={() => {
              setShowModal(true);
              setMessage("");
              setForm({ product_name: "", target_qty: "", factory_id: "", created_by: "" });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md shadow-blue-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Production Job
          </button>
        </div>
        <p className="text-gray-500 mb-8">
          Monitor and manage ongoing manufacturing jobs across all lines.
        </p>

   
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div> */}

      
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex gap-6">
              {["all", "inprogress", "pending"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 font-medium text-sm transition-colors relative capitalize ${
                    activeTab === tab ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "all" ? "All Jobs" : tab === "inprogress" ? "In Progress" : "Pending"}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

    
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600">
              <div className="col-span-4">Job Name / ID</div>
              <div className="col-span-2">Machine</div>
              <div className="col-span-3">Progress</div>
              <div className="col-span-1">Output</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>

     
          <div className="divide-y divide-gray-200">
            {jobs.map((job, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <p className="font-semibold text-gray-900">{job.name}</p>
                    <p className="text-sm text-gray-500">{job.id}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-700">{job.machine}</p>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{job.progress}%</span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm font-medium text-gray-900">{job.output}</p>
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${job.statusColor}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

       
          {/* <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">Showing 1-4 of 24 jobs</p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div> */}
        </div>
      </div>

     
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowModal(false);
            setMessage("");
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

          {/* Modal Content */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Create Production Job</h2>
                  <p className="text-blue-100 text-sm mt-1">Fill in the details to start a new job</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setMessage("");
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  placeholder="Enter product name"
                  value={form.product_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Target Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Quantity</label>
                <input
                  type="number"
                  name="target_qty"
                  placeholder="Enter target quantity"
                  value={form.target_qty}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Factory ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Factory ID</label>
                <input
                  type="number"
                  name="factory_id"
                  placeholder="Enter factory ID"
                  value={form.factory_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Assigned User */}
              {/* 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To</label>
                <select
                  name="created_by"
                  value={form.created_by}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  required
                >
                  <option value="" disabled>Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              */}

              {/* Message */}
              {message && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${
                    message.includes("✅")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Production Job
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Inline styles for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductionManagement;