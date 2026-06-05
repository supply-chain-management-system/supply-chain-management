import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ShieldAlert, X, AlertTriangle } from "lucide-react";
import { logoutUser } from "../../redux/authslice";

/**
 * LogoutConfirmModal — Secure logout confirmation overlay.
 *
 * Props:
 *  - isOpen:       boolean — controls visibility
 *  - onClose:      () => void — called when user dismisses
 *  - accentColor:  string (optional) — tailwind gradient classes for the confirm button
 *                  e.g. "from-cyan-500 to-blue-600". Defaults to red gradient.
 *  - isDark:       boolean (optional) — use dark glassmorphic card (default false = light card)
 */
const LogoutConfirmModal = ({
  isOpen,
  onClose,
  accentColor = "from-red-600 to-rose-600",
  isDark = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState("");
  const [shaking, setShaking] = useState(false);

  // Reset input whenever modal opens
  useEffect(() => {
    if (isOpen) setInputVal("");
  }, [isOpen]);

  // Keyboard: Escape to close
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  const canConfirm = inputVal === "LOGOUT";

  const handleConfirm = () => {
    if (!canConfirm) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    dispatch(logoutUser());
    navigate("/login");
    onClose();
  };

  // ─── card styles ────────────────────────────────────────────────────────────
  const card = isDark
    ? "bg-[#0e0e10]/95 border border-white/[0.08] text-white"
    : "bg-white/95 border border-slate-200 text-slate-900";

  const inputStyle = isDark
    ? "bg-white/[0.04] border border-white/[0.12] text-white placeholder-white/25 focus:border-red-500/60 caret-red-400"
    : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-red-500 caret-red-500";

  const subtitleColor = isDark ? "text-white/40" : "text-slate-500";
  const labelColor = isDark ? "text-white/50" : "text-slate-500";
  const cancelStyle = isDark
    ? "bg-white/[0.05] border border-white/[0.08] text-white/70 hover:bg-white/[0.10]"
    : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* ── Modal Card ── */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`relative w-full max-w-md rounded-3xl ${card} shadow-2xl overflow-hidden`}
            >
              {/* Top accent line */}
              <div className={`h-[3px] w-full bg-gradient-to-r ${accentColor}`} />

              {/* Close button */}
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 p-1.5 rounded-lg transition-all ${
                  isDark
                    ? "text-white/30 hover:text-white hover:bg-white/[0.07]"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                <X size={16} />
              </button>

              <div className="p-7">
                {/* Icon + Heading */}
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${
                      isDark
                        ? "bg-red-500/10 border border-red-500/20"
                        : "bg-red-50 border border-red-100"
                    }`}
                  >
                    <ShieldAlert className="text-red-500" size={22} />
                  </div>
                  <div>
                    <h2
                      className={`text-base font-black tracking-tight mb-1 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Confirm Session End
                    </h2>
                    <p className={`text-xs leading-relaxed ${subtitleColor}`}>
                      Your active session will be terminated. You will be
                      redirected to the login screen.
                    </p>
                  </div>
                </div>

                {/* Warning banner */}
                <div
                  className={`flex items-center gap-2.5 p-3 rounded-xl mb-5 text-xs font-semibold ${
                    isDark
                      ? "bg-amber-500/8 border border-amber-500/15 text-amber-400"
                      : "bg-amber-50 border border-amber-100 text-amber-600"
                  }`}
                >
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>Any unsaved changes will be permanently lost.</span>
                </div>

                {/* Input field */}
                <div className="space-y-2 mb-6">
                  <label
                    htmlFor="logout-confirm-input"
                    className={`text-[10px] font-black uppercase tracking-widest block ${labelColor}`}
                  >
                    Type{" "}
                    <span className="font-black text-red-500">LOGOUT</span> to
                    confirm
                  </label>
                  <input
                    id="logout-confirm-input"
                    type="text"
                    autoFocus
                    autoComplete="off"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                    placeholder="LOGOUT"
                    className={`w-full h-11 px-4 rounded-xl text-sm font-bold tracking-widest focus:outline-none transition-all ${inputStyle}`}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className={`flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${cancelStyle}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    className={`flex-1 h-10 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${
                      canConfirm
                        ? `bg-gradient-to-r ${accentColor} text-white shadow-lg hover:opacity-90 active:scale-95`
                        : isDark
                        ? "bg-white/[0.04] text-white/20 cursor-not-allowed border border-white/[0.06]"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200"
                    }`}
                  >
                    <LogOut size={14} />
                    <span>Confirm Log Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LogoutConfirmModal;
