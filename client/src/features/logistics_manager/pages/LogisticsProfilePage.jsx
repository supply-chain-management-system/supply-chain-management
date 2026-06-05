import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import { logoutUser } from "../../../redux/authSlice";
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
  Truck,
  Compass,
  Shield,
} from "lucide-react";

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-[#0a0a0a] border border-white/[0.05] rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const LogisticsProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [profile, setProfile] = useState({
    phone: "",
    job_title: "",
    department: "",
    location: "",
    bio: "",
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
          fleet_size: data.profile.fleet_size || "",
          regions_managed: data.profile.regions_managed || "",
          logistics_license_no: data.profile.logistics_license_no || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile details:", err);
      setErrorMsg("Could not retrieve profile information. Please reload the page.");
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
        fleet_size: profile.fleet_size,
        regions_managed: profile.regions_managed,
        logistics_license_no: profile.logistics_license_no,
      };
      await api.patch("/profile", payload);
      setSuccessMsg("Profile details saved successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-emerald-400">
        <Loader2 size={36} className="animate-spin" />
        <span className="text-sm font-black uppercase tracking-widest text-white/50">Accessing Secure Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Logistics <span className="text-emerald-400">Profile</span>
        </h1>
        <p className="text-xs text-white/40">
          Personal identification, licensing & dispatch jurisdiction settings
        </p>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle size={16} />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <GlassCard className="p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative group mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-[2px] shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-transform duration-300">
                <div className="w-full h-full rounded-[14px] bg-[#101010] flex items-center justify-center text-white font-bold text-3xl">
                  {baseInfo.name?.charAt(0)?.toUpperCase() || "L"}
                </div>
              </div>
            </div>

            <h3 className="text-base font-bold text-white leading-tight">{baseInfo.name}</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">
              {baseInfo.role?.replace("_", " ")}
            </p>
            <p className="text-[11px] text-white/40 font-medium mt-2 truncate w-full">{baseInfo.email}</p>

            <div className="w-full border-t border-white/[0.05] my-5" />

            <div className="w-full text-left space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Building size={14} className="text-emerald-500" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">Company</p>
                  <p className="font-medium text-white/80">{baseInfo.company_name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Briefcase size={14} className="text-emerald-500" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">Job Title</p>
                  <p className="font-medium text-white/80">{profile.job_title || "Not Configured"}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Secure Logout Area */}
          <GlassCard className="p-6 border-red-500/10 bg-red-950/5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2 flex items-center gap-2">
              <Info size={12} /> System Actions
            </h4>
            <p className="text-xs text-white/45 leading-relaxed mb-4">
              Close your active session. You will need your credentials to log back in.
            </p>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white font-bold text-xs uppercase tracking-wider border border-red-500/20 hover:border-transparent transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              <span>Session Log Out</span>
            </button>
          </GlassCard>
        </div>

        {/* Right Column: Editable Details Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave}>
            <GlassCard className="p-6 space-y-6">
              <h3 className="font-bold text-white flex items-center gap-2 mb-2 text-xs uppercase tracking-widest border-b border-white/[0.05] pb-3">
                <User size={14} className="text-emerald-400" /> Professional Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-white/30" />
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 0123"
                      className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#141414] border border-white/[0.06] focus:border-emerald-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-3 top-3 text-white/30" />
                    <input
                      type="text"
                      name="job_title"
                      value={profile.job_title}
                      onChange={handleChange}
                      placeholder="Logistics Manager"
                      className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#141414] border border-white/[0.06] focus:border-emerald-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                    Department
                  </label>
                  <div className="relative">
                    <Building size={14} className="absolute left-3 top-3 text-white/30" />
                    <input
                      type="text"
                      name="department"
                      value={profile.department}
                      onChange={handleChange}
                      placeholder="Fleet & Dispatch Ops"
                      className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#141414] border border-white/[0.06] focus:border-emerald-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                    Office Location
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-3 text-white/30" />
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      placeholder="East Warehouse Depot"
                      className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#141414] border border-white/[0.06] focus:border-emerald-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                  Biography / Dispatch Philosophy
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your dispatch oversight, driver routing strategies, or transport goals..."
                  className="w-full p-3 rounded-lg bg-[#141414] border border-white/[0.06] focus:border-emerald-500 focus:outline-none text-xs font-semibold text-white transition-colors resize-none"
                />
              </div>

              {/* Logistics Manager specific settings */}
              <div className="space-y-4 pt-4 border-t border-white/[0.05]">
                <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-xs uppercase tracking-widest">
                  <Truck size={14} /> Logistics Jurisdiction & Fleet Authority
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Fleet Size Managed */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                      Fleet Size (Vehicles)
                    </label>
                    <div className="relative">
                      <Truck size={14} className="absolute left-3 top-3 text-emerald-500" />
                      <input
                        type="text"
                        name="fleet_size"
                        value={profile.fleet_size}
                        onChange={handleChange}
                        placeholder="e.g. 50+ Trucks"
                        className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#141414] border border-white/[0.06] focus:border-emerald-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Regions Covered */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                      Regions / Zones Covered
                    </label>
                    <div className="relative">
                      <Compass size={14} className="absolute left-3 top-3 text-emerald-500" />
                      <input
                        type="text"
                        name="regions_managed"
                        value={profile.regions_managed}
                        onChange={handleChange}
                        placeholder="e.g. Midwest & Northeast"
                        className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#141414] border border-white/[0.06] focus:border-emerald-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Dispatch License No */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                      Dispatch License No.
                    </label>
                    <div className="relative">
                      <Shield size={14} className="absolute left-3 top-3 text-emerald-500" />
                      <input
                        type="text"
                        name="logistics_license_no"
                        value={profile.logistics_license_no}
                        onChange={handleChange}
                        placeholder="e.g. LIC-LOG-8910"
                        className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#141414] border border-white/[0.06] focus:border-emerald-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)] disabled:opacity-50 disabled:scale-100"
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
            </GlassCard>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogisticsProfilePage;
