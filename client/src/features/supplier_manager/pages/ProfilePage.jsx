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
  Package,
  Target,
  Hash,
} from "lucide-react";

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-[32px] overflow-hidden ${className}`}>
    {children}
  </div>
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userState = useSelector((state) => state.auth.user);

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
    categories_managed: "",
    supplier_target_score: "",
    office_extension: "",
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
          categories_managed: data.profile.categories_managed || "",
          supplier_target_score: data.profile.supplier_target_score || "",
          office_extension: data.profile.office_extension || "",
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
        categories_managed: profile.categories_managed,
        supplier_target_score: profile.supplier_target_score,
        office_extension: profile.office_extension,
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-red-500">
        <Loader2 size={36} className="animate-spin" />
        <span className="text-sm font-black uppercase tracking-widest">Opening Secure Sourcing Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
          Sourcing <span className="text-red-500">Profile</span>
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
          Sourcing officer credentials & SLA targets
        </p>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle size={16} />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-[20px] bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <GlassCard className="p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative group mb-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-600 to-rose-500 p-[3px] shadow-[0_0_30px_rgba(225,29,72,0.25)] transition-transform duration-500 group-hover:scale-105">
                <div className="w-full h-full rounded-[21px] bg-[#1a1111] flex items-center justify-center text-white font-black text-3xl">
                  {baseInfo.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-black text-white leading-tight">{baseInfo.name}</h3>
            <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-1">
              {baseInfo.role?.replace("_", " ")}
            </p>
            <p className="text-[11px] text-gray-500 font-bold mt-2 truncate w-full">{baseInfo.email}</p>

            <div className="w-full border-t border-white/5 my-6" />

            <div className="w-full text-left space-y-3.5 text-xs">
              <div className="flex items-center gap-2.5 text-gray-400">
                <Building size={14} className="text-red-500" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Company</p>
                  <p className="font-bold text-white/90">{baseInfo.company_name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-gray-400">
                <Briefcase size={14} className="text-red-500" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Job Title</p>
                  <p className="font-bold text-white/90">{profile.job_title || "Not Configured"}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Secure Logout Area (Moved from Header) */}
          <GlassCard className="p-6 border-red-500/10 bg-red-950/5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2 flex items-center gap-2">
              <Info size={12} /> System Actions
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Close your active session. You will need your credentials to log back in.
            </p>
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white font-bold text-xs uppercase tracking-wider border border-red-500/20 hover:border-transparent transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 duration-200"
            >
              <LogOut size={14} />
              <span>Session Log Out</span>
            </button>
          </GlassCard>
        </div>

        {/* Right Column: Editable Details Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave}>
            <GlassCard className="p-8 space-y-6">
              <h3 className="font-black text-white flex items-center gap-2 mb-2 text-xs uppercase tracking-widest border-b border-white/5 pb-4">
                <User size={14} className="text-red-500" /> Professional Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-4 top-3.5 text-gray-500" />
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 0123"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-red-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-4 top-3.5 text-gray-500" />
                    <input
                      type="text"
                      name="job_title"
                      value={profile.job_title}
                      onChange={handleChange}
                      placeholder="Sourcing Coordinator"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-red-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                    Department
                  </label>
                  <div className="relative">
                    <Building size={14} className="absolute left-4 top-3.5 text-gray-500" />
                    <input
                      type="text"
                      name="department"
                      value={profile.department}
                      onChange={handleChange}
                      placeholder="Procurement & Sourcing"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-red-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                    Office Location
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-4 top-3.5 text-gray-500" />
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      placeholder="Warehouse Sourcing Desk"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-red-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                  Biography / Sourcing Focus
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your supplier focus, SLA goals, or product categorization..."
                  className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-red-500 focus:outline-none text-xs font-semibold text-white transition-colors resize-none"
                />
              </div>

              {/* Supplier Manager Role-specific settings */}
              <div className="space-y-6 pt-4 border-t border-white/5">
                <h3 className="font-black text-red-500 flex items-center gap-2 text-xs uppercase tracking-widest">
                  <Package size={14} /> Sourcing Catalog & Performance Targets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Categories Managed */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                      Categories Managed
                    </label>
                    <div className="relative">
                      <Package size={14} className="absolute left-4 top-3.5 text-red-500" />
                      <input
                        type="text"
                        name="categories_managed"
                        value={profile.categories_managed}
                        onChange={handleChange}
                        placeholder="e.g. Raw Materials, Packaging, Hardware"
                        className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-red-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Supplier Target Score */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                      Target SLA Score (%)
                    </label>
                    <div className="relative">
                      <Target size={14} className="absolute left-4 top-3.5 text-red-500" />
                      <input
                        type="text"
                        name="supplier_target_score"
                        value={profile.supplier_target_score}
                        onChange={handleChange}
                        placeholder="e.g. 95% SLA"
                        className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-red-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Office Extension */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                      Office Extension
                    </label>
                    <div className="relative">
                      <Hash size={14} className="absolute left-4 top-3.5 text-red-500" />
                      <input
                        type="text"
                        name="office_extension"
                        value={profile.office_extension}
                        onChange={handleChange}
                        placeholder="e.g. Ext. 204"
                        className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.02] border border-white/[0.08] focus:border-red-500 focus:outline-none text-xs font-semibold text-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.25)] hover:shadow-[0_0_25px_rgba(225,29,72,0.4)] disabled:opacity-50 disabled:scale-100 active:scale-95 duration-200"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Sourcing Profile...</span>
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

export default ProfilePage;
