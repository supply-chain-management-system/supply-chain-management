import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import api from "../../../api/api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [planSlug, setPlanSlug] = useState("");
  const [txnId, setTxnId] = useState("");

  useEffect(() => {
    // Try to get transactionId from query params first, then from localStorage
    let transactionId = searchParams.get("transactionId");
    if (!transactionId) {
      transactionId = localStorage.getItem("pending_payment_txn_id");
    }

    if (!transactionId) {
      setStatus("error");
      return;
    }

    setTxnId(transactionId);
    let attempts = 0;
    const maxAttempts = 6;

    const checkStatus = async () => {
      try {
        const res = await api.get(`/subscriptions/status/${transactionId}`);
        if (res.data && res.data.success) {
          setStatus("success");
          setPlanSlug(res.data.plan_slug || "Plan");
          localStorage.removeItem("pending_payment_txn_id");
        } else if (res.data && res.data.status === "FAILED") {
          setStatus("error");
        } else {
          // Still pending, retry
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 2500);
          } else {
            setStatus("error");
          }
        }
      } catch (err) {
        console.error("Error verifying payment status:", err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2500);
        } else {
          setStatus("error");
        }
      }
    };

    // Initial check delay to allow webhook to hit
    setTimeout(checkStatus, 1500);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-gray-900/60 border border-gray-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center z-10">
        
        {status === "loading" && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="h-16 w-16 text-emerald-400 animate-spin mb-6" />
            <h1 className="text-2xl font-black text-white tracking-tight">Verifying Payment</h1>
            <p className="text-gray-400 mt-2 text-sm max-w-xs">
              We are verifying your transaction with the bank. Please do not close this window or refresh the page.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            {/* Success Animation Container */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full scale-125 animate-pulse" />
              <CheckCircle2 className="h-20 w-20 text-emerald-400 relative z-10" />
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight">Payment Successful!</h1>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <ShieldCheck size={14} />
              Plan Upgraded to {planSlug.toUpperCase()}
            </div>

            <div className="w-full border-t border-gray-800 my-6" />

            <div className="w-full space-y-3.5 text-left text-sm text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono text-xs bg-gray-800/60 px-2 py-0.5 rounded text-white">{txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Billing Cycle</span>
                <span>Monthly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
            </div>

            <div className="w-full border-t border-gray-800 my-6" />

            <button
              onClick={() => navigate("/business-manager/dashboard")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition-all hover:bg-gray-100 hover:scale-[1.02] active:scale-95"
            >
              Go to Dashboard <ArrowRight size={15} />
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center py-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full scale-125 animate-pulse" />
              <AlertTriangle className="h-20 w-20 text-red-500 relative z-10" />
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight">Verification Failed</h1>
            <p className="text-gray-400 mt-2 text-sm max-w-xs">
              We couldn't confirm your payment status. If the amount was debited, it will be automatically verified or refunded.
            </p>

            <div className="w-full border-t border-gray-800 my-6" />

            <button
              onClick={() => navigate("/pricing")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-95"
            >
              Return to Pricing
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
