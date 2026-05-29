import React, { useState, useEffect } from "react";
import api from "../../../api/api";
import KorvexCopilot from "../../KorvexCopilot";
import {
 
  MessageSquare
} from "lucide-react";
KorvexCopilot
const ProductionManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    product_name: "",
    target_qty: "",
    factory_id: "",
    status: "pending", 
  });
  
  const [products, setProducts] = useState([]);
  const [factories, setFactories] = useState([]); // Renamed from users for clarity
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    fetchFactories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("production/factory/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const fetchFactories = async () => {
    try {
      const res = await api.get("/production/factory/user"); // Adjust endpoint if needed
      setFactories(res.data);
    } catch (err) {
      console.error("Failed to fetch factories:", err);
    }
  };

  // Filter products based on active tab
const filteredProducts = products.filter((item) => {
  const status = item.status?.toLowerCase();

  if (activeTab === "all") return true;
  if (activeTab === "inprogress") return status === "progress";   
  if (activeTab === "pending") return status === "pending";
  if (activeTab === "completed") return status === "completed";  

  return true;
});

  const handleUpdate = async (id, updatedData) => {
    try {
      await api.put(`/production/factory/products/${id}`, updatedData);
      await fetchProducts();
    } catch (err) {
      console.error(err.response?.data || err);
      setMessage("❌ Failed to update product");
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.patch(`/production/factory/products/${id}/complete`);
      await fetchProducts();
      setMessage("✅ Job marked as complete");
    } catch (err) {
      console.error(err.response?.data || err);
      setMessage("❌ Failed to complete job");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        product_name: form.product_name,
        target_qty: Number(form.target_qty),
        factory_id: Number(form.factory_id),
        status: form.status, // ✅ ADD
      };

      if (editId) {
        await api.put(`/production/factory/products/${editId}`, payload);
        setMessage("✅ Product updated successfully");
      } else {
        await api.post("/production/factory/product_create", payload);
        setMessage("✅ Production job created successfully");
      }

      await fetchProducts();

      setTimeout(() => {
        setShowModal(false);
        setEditId(null);
        setForm({ product_name: "", target_qty: "", factory_id: "" });
        setMessage("");
      }, 1500);
    } catch (err) {
      const errorDetail = err.response?.data?.detail || "Something went wrong";
      setMessage(`❌ ${errorDetail}`);
    } finally {
      setLoading(false);
    }
  };

  // Escape key & body scroll lock for modal
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && setShowModal(false);
    
    if (showModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const activeJobsCount = products.filter((item) => 
    item.status?.toLowerCase() === "pending"
  ).length;

  const stats = [
    { label: "Active Jobs", value: activeJobsCount, icon: "📊", color: "bg-blue-50 text-blue-600" },
    { label: "Avg Cycle Time", value: "14.2 min", icon: "⏱️", color: "bg-yellow-50 text-yellow-600" },
    { label: "Overall Efficiency", value: "98.4%", icon: "📈", color: "bg-purple-50 text-purple-600" },
    { label: "Completed Today", value: "182", icon: "✅", color: "bg-green-50 text-green-600" },
  ];

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed") return "bg-green-100 text-green-700";
    if (s === "progress") return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const openEditModal = (job) => {
    setEditId(job.id);
    setForm({
      product_name: job.product_name,
      target_qty: job.target_qty || "",
      factory_id: job.factory_id || "",
       status: job.status || "pending",
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditId(null);
    setForm({ product_name: "", target_qty: "", factory_id: "" });
    setMessage("");
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Management</h1>
            <p className="text-gray-500 mt-1">Monitor and manage manufacturing jobs across all lines</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-md shadow-blue-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Job
          </button>
        </div>

        {/* Stats Cards (Uncomment to use) */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div> */}

        {/* Jobs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 py-3">
            <div className="flex gap-6">
              {[
                { key: "all", label: "All Jobs" },
                { key: "inprogress", label: "In Progress" },
                { key: "pending", label: "Pending" },
                 { key: "completed", label: "Completed" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-2 px-1 text-sm font-medium transition-colors relative capitalize ${
                    activeTab === tab.key 
                      ? "text-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div className="col-span-4">Job</div>
              <div className="col-span-2">Factory</div>
              <div className="col-span-3">Progress</div>
              <div className="col-span-1 text-center">Output</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No jobs found for this filter
              </div>
            ) : (
              filteredProducts.map((item) => {
                const progress = item.progress || 0;
                const completed = item.completed_qty || 0;
                const target = item.target_qty || 0;
                
                return (
                  <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      
                      {/* Job Name & ID */}
                      <div className="col-span-4">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-400">#{item.id}</p>
                      </div>

                      {/* Factory */}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">
                          {item.factory_name || `Factory #${item.factory_id}`}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 w-8 text-right">
                            {progress}%
                          </span>
                        </div>
                      </div>

                      {/* Output */}
                      <div className="col-span-1 text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {completed}/{target}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="col-span-1 flex justify-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status || "Pending"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex justify-center gap-3">
                        <button
                          onClick={() => handleComplete(item.id)}
                          className="text-green-600 hover:text-green-700 text-xs font-medium transition-colors"
                          title="Mark Complete"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => openEditModal({
                            id: item.id,
                            name: item.product_name,
                            target_qty: item.target_qty,
                            factory_id: item.factory_id,
                            status: item.status
                          })}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
                          title="Edit Job"
                        >
                          ✎
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
          
          <div 
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {editId ? "Edit Production Job" : "Create Production Job"}
                  </h2>
                  <p className="text-blue-100 text-sm mt-0.5">
                    {editId ? "Update job details" : "Fill in details to start a new job"}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  value={form.product_name}
                  onChange={handleChange}
                  placeholder="e.g., Widget Pro X1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Target Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Quantity</label>
                <input
                  type="number"
                  name="target_qty"
                  value={form.target_qty}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  min="1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Factory Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Factory</label>
                {factories.length > 0 ? (
                  <select
                    name="factory_id"
                    value={form.factory_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    required
                  >
                    <option value="">Select a factory</option>
                    {factories.map((factory) => (
                      <option key={factory.id} value={factory.id}>
                        {factory.name || `Factory #${factory.id}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    name="factory_id"
                    value={form.factory_id}
                    onChange={handleChange}
                    placeholder="Enter factory ID"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                )}
              </div>
              {/* Status */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Status
  </label>
  <select
    name="status"
    value={form.status}
    onChange={handleChange}
    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
  >
    <option value="pending">Pending</option>
    <option value="progress">In Progress</option>
    <option value="completed">Completed</option>
  </select>
</div>

              {/* Status Message */}
              {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  message.includes("✅") 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {editId ? "Update Job" : "Create Job"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { 
          from { opacity: 0; transform: translateY(16px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
       {!isChatOpen && (
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="fixed bottom-6 right-6 z-[9998] w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #00c88c 0%, #00a06e 100%)" }}
                >
                  <MessageSquare size={24} color="#ffffff" strokeWidth={2.5} />
                </button>
              )}
        
              <KorvexCopilot 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
              />
    </div>
  );
};

export default ProductionManagement;