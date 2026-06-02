import React, { useState, useEffect } from "react";
import api from "../../../api/api";
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  X,
  Layers,
  Activity,
  Calendar,
  Check
} from "lucide-react";

export default function FactoryMaterial() {
  const [materials, setMaterials] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [productionJobs, setProductionJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("materials"); // "materials" | "transactions"
  
  // Modals state
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" }); // type: "success" | "error"

  // Material Form state
  const [materialForm, setMaterialForm] = useState({
    name: "",
    unit: "",
    low_stock_threshold: 10.0,
    current_stock: 0.0
  });

  // Transaction Form state
  const [transactionForm, setTransactionForm] = useState({
    transaction_type: "RESTOCK", // "RESTOCK" | "PRODUCTION_DISPATCH"
    quantity: "",
    production_id: ""
  });

  useEffect(() => {
    fetchMaterials();
    fetchTransactions();
    fetchProductionJobs();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get("/factory_material/materials/");
      setMaterials(res.data);
    } catch (err) {
      console.error("Failed to fetch materials:", err);
      showNotification("Failed to fetch materials", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/factory_material/materials/transactions/all");
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  const fetchProductionJobs = async () => {
    try {
      const res = await api.get("production/factory/products");
      // filter out completed jobs for the selection dropdown
      const activeJobs = res.data.filter(job => job.status?.toLowerCase() !== "completed");
      setProductionJobs(activeJobs);
    } catch (err) {
      console.error("Failed to fetch production jobs:", err);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 4000);
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMaterial && selectedMaterial.id) {
        // Edit Material
        await api.put(`/factory_material/materials/${selectedMaterial.id}`, {
          name: materialForm.name,
          unit: materialForm.unit,
          low_stock_threshold: Number(materialForm.low_stock_threshold),
          current_stock: Number(materialForm.current_stock)
        });
        showNotification("Material updated successfully");
      } else {
        // Create Material
        await api.post("/factory_material/materials/", {
          name: materialForm.name,
          unit: materialForm.unit,
          low_stock_threshold: Number(materialForm.low_stock_threshold),
          current_stock: Number(materialForm.current_stock)
        });
        showNotification("Material registered successfully");
      }
      setShowMaterialModal(false);
      resetMaterialForm();
      fetchMaterials();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to save material";
      showNotification(errorMsg, "error");
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    try {
      const payload = {
        transaction_type: transactionForm.transaction_type,
        quantity: Number(transactionForm.quantity),
        production_id: transactionForm.production_id ? Number(transactionForm.production_id) : null
      };

      await api.post(`/factory_material/materials/${selectedMaterial.id}/transaction`, payload);
      showNotification("Transaction logged successfully and stock updated");
      setShowTransactionModal(false);
      resetTransactionForm();
      fetchMaterials();
      fetchTransactions();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Transaction failed";
      showNotification(errorMsg, "error");
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material? This will delete all its transaction history.")) return;
    try {
      await api.delete(`/factory_material/materials/${id}`);
      showNotification("Material deleted successfully");
      fetchMaterials();
      fetchTransactions();
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete material", "error");
    }
  };

  const resetMaterialForm = () => {
    setMaterialForm({
      name: "",
      unit: "",
      low_stock_threshold: 10.0,
      current_stock: 0.0
    });
    setSelectedMaterial(null);
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      transaction_type: "RESTOCK",
      quantity: "",
      production_id: ""
    });
  };

  const openEditModal = (material) => {
    setSelectedMaterial(material);
    setMaterialForm({
      name: material.name,
      unit: material.unit,
      low_stock_threshold: material.low_stock_threshold,
      current_stock: material.current_stock
    });
    setShowMaterialModal(true);
  };

  const openTransactionModal = (material) => {
    setSelectedMaterial(material);
    resetTransactionForm();
    setShowTransactionModal(true);
  };

  // Helper stats
  const totalMaterials = materials.length;
  const lowStockCount = materials.filter(m => m.current_stock <= m.low_stock_threshold && m.current_stock > 0).length;
  const outOfStockCount = materials.filter(m => m.current_stock <= 0).length;
  
  const getStockStatus = (material) => {
    if (material.current_stock <= 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800 border-red-200" };
    if (material.current_stock <= material.low_stock_threshold) return { label: "Low Stock", color: "bg-amber-100 text-amber-800 border-amber-200" };
    return { label: "In Stock", color: "bg-green-100 text-green-800 border-green-200" };
  };

  const getMaterialName = (id) => {
    const mat = materials.find(m => m.id === id);
    return mat ? mat.name : `Material #${id}`;
  };

  const getMaterialUnit = (id) => {
    const mat = materials.find(m => m.id === id);
    return mat ? mat.unit : "";
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 dark:bg-gray-950 dark:text-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5 dark:border-gray-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-8 h-8 text-blue-600 dark:text-blue-500" />
              Factory Material Manager
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Maintain resource balances, log stock transactions, and coordinate with active production jobs.
            </p>
          </div>
          <button
            onClick={() => { resetMaterialForm(); setShowMaterialModal(true); }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-blue-200 dark:shadow-none hover:translate-y-[-1px]"
          >
            <Plus className="w-5 h-5" />
            Register Material
          </button>
        </div>

        {/* Notifications */}
        {notification.message && (
          <div className={`p-4 rounded-xl text-sm font-medium border animate-fade-in flex items-center gap-2 ${
            notification.type === "error" 
              ? "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50" 
              : "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50"
          }`}>
            <span className="text-lg">{notification.type === "error" ? "❌" : "✓"}</span>
            {notification.message}
          </div>
        )}

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Materials</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalMaterials}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Items</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 mt-1">{lowStockCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-500 mt-1">{outOfStockCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Logged Logs</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-500 mt-1">{transactions.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tabs and Content Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("materials")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "materials"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                }`}
              >
                Materials Inventory
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "transactions"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                }`}
              >
                Stock Transaction Logs
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "materials" ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
                  <p>Loading inventory data...</p>
                </div>
              ) : materials.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">No materials registered</h3>
                  <p className="mt-1">Get started by registering a new factory material.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                        <th className="px-6 py-4">Material Name</th>
                        <th className="px-6 py-4">Stock Level</th>
                        <th className="px-6 py-4">Low Threshold</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Last Restocked</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {materials.map((material) => {
                        const status = getStockStatus(material);
                        return (
                          <tr key={material.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                              {material.name}
                              <span className="text-xs text-gray-400 block font-normal">ID: #{material.id}</span>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                              {material.current_stock} <span className="text-gray-400 text-sm font-normal">{material.unit}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                              {material.low_stock_threshold} {material.unit}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {material.last_restocked 
                                ? new Date(material.last_restocked).toLocaleString()
                                : "Never"
                              }
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => openTransactionModal(material)}
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                              >
                                Adjust Stock
                              </button>
                              <button
                                onClick={() => openEditModal(material)}
                                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 p-1.5 rounded-lg transition-all inline-flex"
                                title="Edit Material"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMaterial(material.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-400 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition-all inline-flex"
                                title="Delete Material"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            // Transactions Tab
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">No transactions logged</h3>
                  <p className="mt-1">Adjust stock levels above to register transactions.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                        <th className="px-6 py-4">Transaction ID</th>
                        <th className="px-6 py-4">Material</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Quantity</th>
                        <th className="px-6 py-4">Associated Production Job</th>
                        <th className="px-6 py-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {transactions.map((tx) => {
                        const isRestock = tx.transaction_type === "RESTOCK";
                        return (
                          <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                              #{tx.id}
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                              {getMaterialName(tx.material_id)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                isRestock 
                                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30" 
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                              }`}>
                                {isRestock ? (
                                  <>
                                    <ArrowDownLeft className="w-3.5 h-3.5" />
                                    RESTOCK
                                  </>
                                ) : (
                                  <>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    DISPATCH
                                  </>
                                )}
                              </span>
                            </td>
                            <td className={`px-6 py-4 font-bold text-sm ${isRestock ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-500"}`}>
                              {isRestock ? "+" : "-"}{tx.quantity} <span className="text-xs font-normal text-gray-400">{getMaterialUnit(tx.material_id)}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {tx.production_id ? (
                                <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200/50 dark:border-gray-700/50">
                                  Job #{tx.production_id}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(tx.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* REGISTER/EDIT MATERIAL MODAL */}
        {showMaterialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMaterialModal(false)} />
            
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800 overflow-hidden animate-slide-up">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between text-white">
                <div>
                  <h2 className="text-lg font-bold">
                    {selectedMaterial ? "Edit Material Details" : "Register New Material"}
                  </h2>
                  <p className="text-blue-100 text-xs mt-0.5">
                    {selectedMaterial ? "Modify specs and targets" : "Add a new material item to inventory"}
                  </p>
                </div>
                <button
                  onClick={() => setShowMaterialModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMaterialSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Material Name
                  </label>
                  <input
                    type="text"
                    required
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                    placeholder="e.g. Carbon Fiber Thread"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Measurement Unit
                    </label>
                    <input
                      type="text"
                      required
                      value={materialForm.unit}
                      onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                      placeholder="e.g. kg, meters, rolls"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={materialForm.low_stock_threshold}
                      onChange={(e) => setMaterialForm({ ...materialForm, low_stock_threshold: e.target.value })}
                      placeholder="e.g. 10"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Current Stock Balance
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={materialForm.current_stock}
                    onChange={(e) => setMaterialForm({ ...materialForm, current_stock: e.target.value })}
                    placeholder="e.g. 150"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMaterialModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Save Material
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LOG TRANSACTION MODAL */}
        {showTransactionModal && selectedMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTransactionModal(false)} />
            
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800 overflow-hidden animate-slide-up">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between text-white">
                <div>
                  <h2 className="text-lg font-bold">Adjust Material Stock</h2>
                  <p className="text-blue-100 text-xs mt-0.5">
                    Modifying: <span className="font-semibold">{selectedMaterial.name}</span> (Current: {selectedMaterial.current_stock} {selectedMaterial.unit})
                  </p>
                </div>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Action Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTransactionForm({ ...transactionForm, transaction_type: "RESTOCK" })}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold flex flex-col items-center gap-1.5 transition-all ${
                        transactionForm.transaction_type === "RESTOCK"
                          ? "bg-green-50/50 border-green-500 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                          : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      }`}
                    >
                      <ArrowDownLeft className="w-5 h-5" />
                      Restock Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransactionForm({ ...transactionForm, transaction_type: "PRODUCTION_DISPATCH" })}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold flex flex-col items-center gap-1.5 transition-all ${
                        transactionForm.transaction_type === "PRODUCTION_DISPATCH"
                          ? "bg-amber-50/50 border-amber-500 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                          : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      }`}
                    >
                      <ArrowUpRight className="w-5 h-5" />
                      Dispatch to Job
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Quantity ({selectedMaterial.unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.001"
                    required
                    value={transactionForm.quantity}
                    onChange={(e) => setTransactionForm({ ...transactionForm, quantity: e.target.value })}
                    placeholder={`e.g. 50`}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Associated Production (Only for production dispatch) */}
                {transactionForm.transaction_type === "PRODUCTION_DISPATCH" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Associate Production Job (Optional)
                    </label>
                    <select
                      value={transactionForm.production_id}
                      onChange={(e) => setTransactionForm({ ...transactionForm, production_id: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 transition-all text-sm"
                    >
                      <option value="">Select an active job</option>
                      {productionJobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.product_name} (Job #{job.id} — Target: {job.target_qty})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTransactionModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    Confirm Action
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { 
          from { opacity: 0; transform: translateY(16px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </div>
  );
}
