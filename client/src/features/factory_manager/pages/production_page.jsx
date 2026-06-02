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
    output_qty: 0,
  });
  
  const [products, setProducts] = useState([]);
  const [factories, setFactories] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Complete job modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeJob, setCompleteJob] = useState(null);
  const [completeQty, setCompleteQty] = useState("");

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
      const res = await api.get("/production/factory/user");
      setFactories(res.data);
    } catch (err) {
      console.error("Failed to fetch factories:", err);
    }
  };

  const filteredProducts = products.filter((item) => {
    const status = item.status?.toLowerCase();
    if (activeTab === "all") return true;
    if (activeTab === "inprogress") return status === "progress";   
    if (activeTab === "pending") return status === "pending";
    if (activeTab === "completed") return status === "completed";  
    return true;
  });

  const handleComplete = async (id, outputQty) => {
    try {
      await api.patch(`/production/factory/products/${id}/complete`, { output_qty: Number(outputQty) });
      await fetchProducts();
      setMessage("Job marked as complete");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err.response?.data || err);
      setMessage("Failed to complete job");
      setTimeout(() => setMessage(""), 3000);
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
        status: form.status,
      };

      if (editId) {
        payload.output_qty = Number(form.output_qty);
        await api.put(`/production/factory/products/${editId}`, payload);
        setMessage("Product updated successfully");
      } else {
        await api.post("/production/factory/product_create", payload);
        setMessage("Production job created successfully");
      }

      await fetchProducts();

      setTimeout(() => {
        setShowModal(false);
        setEditId(null);
        setForm({ product_name: "", target_qty: "", factory_id: "", status: "pending", output_qty: 0 });
        setMessage("");
      }, 1500);
    } catch (err) {
      const errorDetail = err.response?.data?.detail || "Something went wrong";
      setMessage(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowModal(false);
        setShowCompleteModal(false);
      }
    };
    
    if (showModal || showCompleteModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [showModal, showCompleteModal]);

  const activeJobsCount = products.filter((item) => item.status?.toLowerCase() === "progress").length;
  const pendingJobsCount = products.filter((item) => item.status?.toLowerCase() === "pending").length;
  const completedJobsCount = products.filter((item) => item.status?.toLowerCase() === "completed").length;
  const totalQuantityProduced = products.reduce((acc, item) => acc + (item.output_qty || 0), 0);

  const stats = [
    { label: "Active Jobs", value: activeJobsCount },
    { label: "Pending Jobs", value: pendingJobsCount },
    { label: "Completed Jobs", value: completedJobsCount },
    { label: "Total Output", value: totalQuantityProduced.toLocaleString() },
  ];

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed") return "text-emerald-700 bg-emerald-50";
    if (s === "progress") return "text-blue-700 bg-blue-50";
    return "text-amber-700 bg-amber-50";
  };

  const openEditModal = (job) => {
    setEditId(job.id);
    setForm({
      product_name: job.product_name,
      target_qty: job.target_qty || "",
      factory_id: job.factory_id || "",
      status: job.status || "pending",
      output_qty: job.output_qty || 0,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditId(null);
    setForm({ product_name: "", target_qty: "", factory_id: "", status: "pending", output_qty: 0 });
    setMessage("");
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Production Management</h1>
            <p className="text-gray-500 mt-1 text-sm">Monitor and manage manufacturing jobs</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Job
          </button>
        </div>

        {/* Global Notification Message */}
        {message && !showModal && !showCompleteModal && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium border ${
            message.includes("✅") || message.includes("success") || message.includes("updated") || message.includes("created") || message.includes("complete")
              ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
              : "bg-red-50 text-red-800 border-red-200"
          }`}>
            {message.replace("✅ ", "").replace("❌ ", "")}
          </div>
        )}
 
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 py-3">
            <div className="flex gap-1">
              {[
                { key: "all", label: "All" },
                { key: "inprogress", label: "In Progress" },
                { key: "pending", label: "Pending" },
                { key: "completed", label: "Completed" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.key 
                      ? "bg-gray-900 text-white" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
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
              <div className="px-6 py-12 text-center text-gray-500 text-sm">
                No jobs found for this filter
              </div>
            ) : (
              filteredProducts.map((item) => {
                const target = item.target_qty || 0;
                const completed = item.output_qty || 0;
                const progress = target > 0 ? Math.min(Math.round((completed / target) * 100), 100) : 0;
                
                return (
                  <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      
                      {/* Job Name & ID */}
                      <div className="col-span-4">
                        <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">#{item.id}</p>
                      </div>

                      {/* Factory */}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">
                          {item.factory_name || `Factory #${item.factory_id}`}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-900 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-500 w-8 text-right">
                            {progress}%
                          </span>
                        </div>
                      </div>

                      {/* Output */}
                      <div className="col-span-1 text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {completed} <span className="text-gray-400 font-normal">/ {target}</span>
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="col-span-1 flex justify-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}>
                          {item.status || "Pending"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex justify-center gap-1">
                        {item.status?.toLowerCase() !== "completed" ? (
                          <button
                            onClick={() => {
                              setCompleteJob(item);
                              setCompleteQty(item.target_qty || "");
                              setShowCompleteModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                            title="Mark Complete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        ) : (
                          <span className="p-2 text-gray-200 cursor-default">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Edit Job"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
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

      {/* Edit/Create Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/20" />
          
          <div 
            className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {editId ? "Edit Production Job" : "Create Production Job"}
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {editId ? "Update job parameters" : "Provide details for the new job"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  value={form.product_name}
                  onChange={handleChange}
                  placeholder="e.g. Widget Pro X1"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Target Quantity */}
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">Target Quantity</label>
                <input
                  type="number"
                  name="target_qty"
                  value={form.target_qty}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  min="1"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Factory Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">Factory</label>
                {factories.length > 0 ? (
                  <select
                    name="factory_id"
                    value={form.factory_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm bg-white transition-all"
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
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm transition-all placeholder:text-gray-400"
                    required
                  />
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm bg-white transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Output Quantity (Only for Edit) */}
              {editId && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">Produced Quantity</label>
                  <input
                    type="number"
                    name="output_qty"
                    value={form.output_qty}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
              )}

              {/* Status Message */}
              {message && (
                <div className={`px-4 py-3 rounded-lg text-xs font-medium border ${
                  message.includes("✅") || message.includes("success") || message.includes("updated") || message.includes("created") || message.includes("complete")
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                    : "bg-red-50 text-red-800 border-red-200"
                }`}>
                  {message.replace("✅ ", "").replace("❌ ", "")}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  editId ? "Update Job" : "Create Job"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Complete Job Modal */}
      {showCompleteModal && completeJob && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCompleteModal(false)}
        >
          <div className="absolute inset-0 bg-black/20" />
          
          <div 
            className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Complete Production Job</h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  Record final output for "{completeJob.product_name}"
                </p>
              </div>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                await handleComplete(completeJob.id, completeQty);
                setLoading(false);
                setShowCompleteModal(false);
              }} 
              className="p-6 space-y-4"
            >
              {/* Target Quantity Info */}
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 flex justify-between text-xs">
                <span className="text-gray-500 uppercase tracking-wide">Target Quantity:</span>
                <span className="text-gray-900 font-medium">{completeJob.target_qty}</span>
              </div>

              {/* Completed Quantity Input */}
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
                  Actual Produced Quantity
                </label>
                <input
                  type="number"
                  value={completeQty}
                  onChange={(e) => setCompleteQty(e.target.value)}
                  placeholder="e.g. 500"
                  min="0"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Confirm & Complete"
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