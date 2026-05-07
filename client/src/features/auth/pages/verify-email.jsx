import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../api/api";

export default function OTPVerification() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [timer, setTimer] = useState(0);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const saveEmailChange = () => {
    localStorage.setItem("email", email);
    setIsEditingEmail(false);
    setMessage({ text: "Email updated locally. Please resend OTP.", type: "success" });
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      const response = await api.post("/verify-otp", {
        email,
        otp,
      });

      setMessage({ 
        text: response.data.message || "OTP Verified Successfully ✅", 
        type: "success" 
      });

      localStorage.removeItem("email");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      setMessage({ 
        text: error.response?.data?.detail || "Verification Failed ❌", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      const response = await api.post("/resend-otp", { email });

      setMessage({ 
        text: response.data.message || "New OTP sent to your email ✅", 
        type: "success" 
      });
      setTimer(30);

    } catch (error) {
      setMessage({ 
        text: error.response?.data?.detail || "Failed to resend OTP ❌", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Verify OTP
          </h1>
          <p className="text-gray-500 text-sm">
            We've sent a code to your inbox
          </p>
        </div>

        {/* Email Field with Edit Capability */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Email Address
            </label>
            <button 
              onClick={() => isEditingEmail ? saveEmailChange() : setIsEditingEmail(true)}
              className={`text-xs font-bold px-2 py-1 rounded ${
                isEditingEmail ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50"
              }`}
            >
              {isEditingEmail ? "SAVE" : "EDIT"}
            </button>
          </div>
          <input
            type="email"
            value={email}
            disabled={!isEditingEmail}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 rounded-xl border-2 transition-all outline-none ${
              isEditingEmail 
                ? "border-blue-400 bg-white ring-4 ring-blue-50" 
                : "border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed"
            }`}
          />
        </div>

        {/* OTP Input */}
        <div className="mb-8">
          <label className="block mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            6-Digit Code
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="w-full border-2 border-gray-100 p-4 rounded-xl text-center text-3xl tracking-[0.3em] font-black outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={verifyOTP}
            disabled={loading || otp.length < 4 || isEditingEmail}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          <button
            onClick={resendOTP}
            disabled={loading || timer > 0 || isEditingEmail}
            className={`w-full py-3 rounded-xl border-2 font-semibold transition-all ${
              timer > 0 || isEditingEmail
                ? "border-gray-100 text-gray-400 cursor-not-allowed"
                : "border-black text-black hover:bg-gray-50"
            }`}
          >
            {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
          </button>
        </div>

        {/* Status Message */}
        {message.text && (
          <div className={`mt-6 p-4 rounded-xl text-sm text-center font-medium animate-pulse ${
            message.type === "success" 
              ? "bg-green-50 text-green-700 border border-green-100" 
              : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {message.text}
          </div>
        )}

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 tracking-tighter font-medium">Or</span></div>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-4">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-black font-bold hover:underline transition-all">
              Log In
            </Link>
          </p>
          <p className="text-xs text-gray-400">
            Wrong email? <Link to="/signup" className="underline hover:text-gray-600">Start over</Link>
          </p>
        </div>

      </div>
    </div>
  );
}