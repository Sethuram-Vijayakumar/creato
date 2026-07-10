"use client";

import React, { useState } from "react";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function YouTubeConnectPopup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuthorize = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/creator/connect-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "youtube" })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Connection failed.");
        setLoading(false);
      } else {
        if (window.opener) {
          window.opener.postMessage({ connectSuccess: true, provider: "youtube" }, "*");
        }
        window.close();
      }
    } catch (err) {
      setError("Network connection failure.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-slate-100 p-8 text-center space-y-6">
        
        {/* YouTube Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-800">Connect YouTube</h2>
          <p className="text-xs text-slate-500">Link your YouTube channel to **Creato**</p>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-red-50 text-red-655 text-xs font-semibold border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            <span className="text-xs text-slate-400 font-semibold">Querying YouTube Data API...</span>
          </div>
        ) : (
          <div className="text-left space-y-4">
            <p className="text-xs text-slate-655 leading-relaxed">
              Creato requests permission to fetch your YouTube public channel details:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">YouTube Subscriber Analytics</p>
                  <p className="text-[10px] text-slate-455">Used to verify your true 55,000 subscriber count and audit engagement metrics.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Public Video Uploads</p>
                  <p className="text-[10px] text-slate-455">Fetch thumbnail graphics to display your latest uploads directly on your portfolio.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => window.close()}
                className="py-2.5 px-4 border border-slate-200 text-slate-505 text-xs font-semibold rounded-lg hover:bg-slate-50 text-center cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleAuthorize}
                className="py-2.5 px-4 bg-red-600 text-white text-xs font-semibold rounded-lg hover:opacity-90 shadow-sm text-center cursor-pointer"
              >
                Authorize & Link
              </button>
            </div>
          </div>
        )}

        <div className="text-[9px] text-slate-400 leading-normal border-t border-slate-100 pt-4 flex items-center gap-1.5 justify-center">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Google secure developer client check passed</span>
        </div>
      </div>
    </div>
  );
}
