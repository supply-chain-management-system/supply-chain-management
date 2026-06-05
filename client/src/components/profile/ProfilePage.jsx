import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { logoutUser } from "../../redux/authslice";
import LogoutConfirmModal from "./LogoutConfirmModal";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  Building,
  LogOut,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  DollarSign,
  TrendingUp,
  Package,
  Target,
  Hash,
  Truck,
  Compass,
  Shield,
  Factory,
  Box
} from "lucide-react";

const roleConfigs = {
  admin: {
    title: "Administrator Profile",
    subtitle: "Root authentication & system-wide parameters",
    colorClass: "text-blue-500",
    gradient: "from-blue-600 to-indigo-600",
    badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    avatarBg: "bg-blue-50 text-blue-600 border-blue-200",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
    icon: Shield,
  },
  owner: {
    title: "Owner Profile",
    subtitle: "Enterprise ownership & administrative controls",
    colorClass: "text-blue-500",
    gradient: "from-blue-600 to-indigo-600",
    badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    avatarBg: "bg-blue-50 text-blue-600 border-blue-200",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
    icon: Shield,
  },
  business_manager: {
    title: "Manager Profile",
    subtitle: "Personal identification & administrative boundaries",
    colorClass: "text-cyan-400",
    gradient: "from-cyan-500 to-blue-600",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    avatarBg: "bg-cyan-950/40 text-cyan-400 border-cyan-500/30",
    btnColor: "bg-cyan-500 hover:bg-cyan-600 text-black",
    icon: Briefcase,
  },
  supply_manager: {
    title: "Sourcing Profile",
    subtitle: "Sourcing officer credentials & SLA targets",
    colorClass: "text-red-500",
    gradient: "from-red-600 to-rose-500",
    badgeBg: "bg-red-500/10 text-red-400 border-red-500/20",
    avatarBg: "bg-red-950/40 text-red-400 border-red-500/30",
    btnColor: "bg-red-600 hover:bg-red-700 text-white",
    icon: Package,
  },
  logistics_manager: {
    title: "Logistics Profile",
    subtitle: "Personal identification, licensing & dispatch jurisdiction",
    colorClass: "text-emerald-400",
    gradient: "from-emerald-500 via-emerald-600 to-teal-600",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    avatarBg: "bg-[#101915] text-emerald-400 border-emerald-500/30",
    btnColor: "bg-emerald-500 hover:bg-emerald-600 text-black",
    icon: Truck,
  },
  warehouse_manager: {
    title: "Warehouse Profile",
    subtitle: "Stock authority, rack routing & storage settings",
    colorClass: "text-amber-600",
    gradient: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    avatarBg: "bg-amber-50 text-amber-600 border-amber-200",
    btnColor: "bg-amber-600 hover:bg-amber-750 text-white",
    icon: Box,
  },
  factory_manager: {
    title: "Factory Profile",
    subtitle: "Production logs, efficiency oversight & team configurations",
    colorClass: "text-purple-600",
    gradient: "from-purple-600 to-indigo-600",
    badgeBg: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    avatarBg: "bg-purple-50 text-purple-600 border-purple-200",
    btnColor: "bg-purple-600 hover:bg-purple-700 text-white",
    icon: Factory,
  },
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [profile, setProfile] = useState({
    phone: "",
    job_title: "",
    department: "",
    location: "",
    bio: "",
    budget_authority: "",
    focus_area: "",
    categories_managed: "",
    supplier_target_score: "",
    office_extension: "",
    fleet_size: "",
    regions_managed: "",
    logistics_license_no: "",
  });

  const [baseInfo, setBaseInfo] = useState({
    name: "",
    email: "",
    role: "",
    company_name: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.get("/profile");
      const data = res.data;
      setBaseInfo({
        name: data.name,
        email: data.email,
        role: data.role,
        company_name: data.company_name,
      });
      if (data.profile) {
        setProfile({
          phone: data.profile.phone || "",
          job_title: data.profile.job_title || "",
          department: data.profile.department || "",
          location: data.profile.location || "",
          bio: data.profile.bio || "",
          budget_authority: data.profile.budget_authority || "",
          focus_area: data.profile.focus_area || "",
          categories_managed: data.profile.categories_managed || "",
          supplier_target_score: data.profile.supplier_target_score || "",
          office_extension: data.profile.office_extension || "",
          fleet_size: data.profile.fleet_size || "",
          regions_managed: data.profile.regions_managed || "",
          logistics_license_no: data.profile.logistics_license_no || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile details:", err);
      setErrorMsg("Could not retrieve profile information. Please try reloading.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const payload = {
        phone: profile.phone,
        job_title: profile.job_title,
        department: profile.department,
        location: profile.location,
        bio: profile.bio,
        budget_authority: profile.budget_authority,
        focus_area: profile.focus_area,
        categories_managed: profile.categories_managed,
        supplier_target_score: profile.supplier_target_score,
        office_extension: profile.office_extension,
        fleet_size: profile.fleet_size,
        regions_managed: profile.regions_managed,
        logistics_license_no: profile.logistics_license_no,
      };
      await api.patch("/profile", payload);
      setSuccessMsg("Profile details saved successfully ✅");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // Determine current theme parameters based on role
  const roleKey = baseInfo.role || "business_manager";
  const config = roleConfigs[roleKey] || roleConfigs.business_manager;
  const isDarkMode = ["business_manager", "supply_manager", "logistics_manager"].includes(roleKey);
  const IconComponent = config.icon;

  if (loading) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center gap-4 ${isDarkMode ? "text-cyan-400" : "text-indigo-600"}`}>
        <Loader2 size={36} className="animate-spin" />
        <span className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? "text-white/60" : "text-slate-600"}`}>
          Accessing Secure Profile...
        </span>
      </div>
    );
  }

  // Styled Cards based on Theme Mode
  const glassCardClass = isDarkMode
    ? "bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-3xl overflow-hidden"
    : "bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm";

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto ${isDarkMode ? "text-white" : "text-slate-800"}`}>
      {/* Title block */}
      <div className="flex flex-col gap-1">
        <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          {config.title.split(" ")[0]} <span className={config.colorClass}>{config.title.split(" ")[1]}</span>
        </h1>
        <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>
          {config.subtitle}
        </p>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2 font-bold animate-in slide-in-from-top-1">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2 font-bold animate-in slide-in-from-top-1">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Summary Card & Logout */}
        <div className="md:col-span-1 space-y-6">
          <div className={`${glassCardClass} p-6 flex flex-col items-center text-center`}>
            {/* Avatar */}
            <div className="relative mb-4">
              <div className={`w-20 h-20 rounded-2xl p-[3px] bg-gradient-to-br ${config.gradient} shadow-lg transition-transform duration-300 hover:scale-105`}>
                <div className={`w-full h-full rounded-[13px] flex items-center justify-center font-black text-2xl ${isDarkMode ? "bg-[#101012] text-white" : "bg-white"}`}>
                  {baseInfo.name?.charAt(0)?.toUpperCase() || "M"}
                </div>
              </div>
            </div>

            <h3 className={`text-base font-black leading-tight ${isDarkMode ? "text-white" : "text-slate-800"}`}>
              {baseInfo.name}
            </h3>
            <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest mt-1.5 border ${config.badgeBg}`}>
              {baseInfo.role?.replace("_", " ")}
            </span>
            <p className={`text-xs mt-2 truncate w-full ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>
              {baseInfo.email}
            </p>

            <div className={`w-full border-t my-5 ${isDarkMode ? "border-white/5" : "border-slate-100"}`} />

            <div className="w-full text-left space-y-3.5 text-xs">
              <div className="flex items-center gap-2.5">
                <Building size={14} className={isDarkMode ? "text-white/40" : "text-slate-400"} />
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? "text-gray-600" : "text-slate-400"}`}>Company</p>
                  <p className={`font-bold ${isDarkMode ? "text-white/90" : "text-slate-700"}`}>{baseInfo.company_name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Briefcase size={14} className={isDarkMode ? "text-white/40" : "text-slate-400"} />
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? "text-gray-600" : "text-slate-400"}`}>Job Title</p>
                  <p className={`font-bold ${isDarkMode ? "text-white/90" : "text-slate-700"}`}>{profile.job_title || "Not Configured"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Logout Area */}
          <div className={`${glassCardClass} p-6 ${isDarkMode ? "bg-red-950/5 border-red-500/10" : "bg-red-50/50 border-red-100"}`}>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2 flex items-center gap-2">
              <Info size={12} /> System Actions
            </h4>
            <p className={`text-xs leading-relaxed mb-4 ${isDarkMode ? "text-gray-500" : "text-slate-500"}`}>
              Close your active session. You will need your credentials to log back in.
            </p>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white font-bold text-xs uppercase tracking-wider border border-red-500/20 hover:border-transparent transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut size={14} />
              <span>Session Log Out</span>
            </button>
          </div>
        </div>

        {/* Right Column: Editable Details Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave}>
            <div className={`${glassCardClass} p-6 space-y-6`}>
              <h3 className={`font-black flex items-center gap-2 mb-2 text-xs uppercase tracking-widest border-b pb-4 ${isDarkMode ? "text-white border-white/5" : "text-slate-900 border-slate-100"}`}>
                <User size={14} className={isDarkMode ? "text-white/40" : "text-slate-400"} /> Personal Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 0123"
                      className={`w-full h-10 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                        isDarkMode 
                          ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                          : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                      }`}
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      name="job_title"
                      value={profile.job_title}
                      onChange={handleChange}
                      placeholder="Manager"
                      className={`w-full h-10 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                        isDarkMode 
                          ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                          : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                      }`}
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                    Department
                  </label>
                  <div className="relative">
                    <Building size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      name="department"
                      value={profile.department}
                      onChange={handleChange}
                      placeholder="Operations"
                      className={`w-full h-10 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                        isDarkMode 
                          ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                          : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                      }`}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                    Office Location
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      placeholder="Headquarters"
                      className={`w-full h-10 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                        isDarkMode 
                          ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                          : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                  Biography / Focus Description
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your role, responsibilities, or administrative oversight..."
                  className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none transition-all resize-none ${
                    isDarkMode 
                      ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                      : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                  }`}
                />
              </div>

              {/* Dynamic Business Manager section */}
              {roleKey === "business_manager" && (
                <div className={`space-y-4 pt-4 border-t ${isDarkMode ? "border-white/5" : "border-slate-100"}`}>
                  <h3 className={`font-black flex items-center gap-2 text-xs uppercase tracking-widest ${isDarkMode ? "text-cyan-400" : "text-indigo-600"}`}>
                    <DollarSign size={14} /> Business Manager Limits & Scope
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                        Financial Budget Authority
                      </label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          name="budget_authority"
                          value={profile.budget_authority}
                          onChange={handleChange}
                          placeholder="e.g. Up to $100k, Unlimited"
                          className={`w-full h-10 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                              : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                        Strategic Focus Area
                      </label>
                      <div className="relative">
                        <TrendingUp size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          name="focus_area"
                          value={profile.focus_area}
                          onChange={handleChange}
                          placeholder="e.g. Factory Optimization, Supplier SLAs"
                          className={`w-full h-10 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                              : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Supplier Manager section */}
              {roleKey === "supply_manager" && (
                <div className={`space-y-4 pt-4 border-t ${isDarkMode ? "border-white/5" : "border-slate-100"}`}>
                  <h3 className={`font-black flex items-center gap-2 text-xs uppercase tracking-widest ${isDarkMode ? "text-red-500" : "text-red-650"}`}>
                    <Package size={14} /> Sourcing Catalog & Performance Targets
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                        Categories Managed
                      </label>
                      <div className="relative">
                        <Package size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          name="categories_managed"
                          value={profile.categories_managed}
                          onChange={handleChange}
                          placeholder="e.g. Raw Materials, Packaging"
                          className={`w-full h-10 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                              : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                        Target SLA Score (%)
                      </label>
                      <div className="relative">
                        <Target size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          name="supplier_target_score"
                          value={profile.supplier_target_score}
                          onChange={handleChange}
                          placeholder="e.g. 95%"
                          className={`w-full h-10 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                              : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                        Office Extension
                      </label>
                      <div className="relative">
                        <Hash size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          name="office_extension"
                          value={profile.office_extension}
                          onChange={handleChange}
                          placeholder="e.g. Ext. 204"
                          className={`w-full h-10 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                              : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Logistics Manager section */}
              {roleKey === "logistics_manager" && (
                <div className={`space-y-4 pt-4 border-t ${isDarkMode ? "border-white/5" : "border-slate-100"}`}>
                  <h3 className={`font-black flex items-center gap-2 text-xs uppercase tracking-widest ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                    <Truck size={14} /> Logistics Jurisdiction & Fleet Authority
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                        Fleet Size (Vehicles)
                      </label>
                      <div className="relative">
                        <Truck size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          name="fleet_size"
                          value={profile.fleet_size}
                          onChange={handleChange}
                          placeholder="e.g. 50+ Trucks"
                          className={`w-full h-10 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                              : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                        Regions Covered
                      </label>
                      <div className="relative">
                        <Compass size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          name="regions_managed"
                          value={profile.regions_managed}
                          onChange={handleChange}
                          placeholder="e.g. Midwest Zone"
                          className={`w-full h-10 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                              : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-wider block ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}>
                        Dispatch License No.
                      </label>
                      <div className="relative">
                        <Shield size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          name="logistics_license_no"
                          value={profile.logistics_license_no}
                          onChange={handleChange}
                          placeholder="e.g. LIC-LOG-8910"
                          className={`w-full h-10 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? "bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500 text-white" 
                              : "bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-4 flex justify-end border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 duration-200 ${config.btnColor} disabled:opacity-50`}
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Secure Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Profile Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        accentColor={config.gradient}
        isDark={isDarkMode}
      />
    </div>
  );
};

export default ProfilePage;
