import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe, cancelAuthCheck } from "./authslice";
import { Loader2 } from "lucide-react";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const hasSession = localStorage.getItem("has_session") === "true" || localStorage.getItem("token");
    if (hasSession) {
      dispatch(fetchMe());
    } else {
      dispatch(cancelAuthCheck());
    }

    // Setup periodic real-time session validation checks (every 5 minutes)
    const interval = setInterval(() => {
      const activeSession = localStorage.getItem("has_session") === "true" || localStorage.getItem("token");
      if (activeSession) {
        dispatch(fetchMe());
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
        <p className="text-sm font-semibold tracking-wider text-gray-400 uppercase animate-pulse">
          Validating Session…
        </p>
      </div>
    );
  }

  return children;
};

export default AuthProvider;