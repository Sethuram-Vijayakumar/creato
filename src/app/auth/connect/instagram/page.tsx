"use client";

import React, { useState } from "react";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function InstagramConnectPopup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuthorize = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/creator/connect-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "instagram" })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Connection failed.");
        setLoading(false);
      } else {
        if (window.opener) {
          window.opener.postMessage({ connectSuccess: true, provider: "instagram" }, "*");
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
        
        {/* Instagram Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-800">Connect Instagram</h2>
          <p className="text-xs text-slate-500">Link your Instagram Insights to **Creato**</p>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-red-50 text-red-655 text-xs font-semibold border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-650" />
            <span className="text-xs text-slate-400 font-semibold">Fetching followers and comment logs...</span>
          </div>
        ) : (
          <div className="text-left space-y-4">
            <p className="text-xs text-slate-655 leading-relaxed">
              Creato requests permission to fetch your Instagram Professional Account details:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Follower Reach & Demographics</p>
                  <p className="text-[10px] text-slate-455">Used to verify your true 22,000 follower headcount and state geolocation ratio.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Comment Text Insights</p>
                  <p className="text-[10px] text-slate-455">Used to calculate your vernacular depth match ratio (comment languages).</p>
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
                className="py-2.5 px-4 bg-gradient-to-tr from-yellow-600 via-red-500 to-purple-600 text-white text-xs font-semibold rounded-lg hover:opacity-90 shadow-sm text-center cursor-pointer"
              >
                Authorize & Link
              </button>
            </div>
          </div>
        )}

        <div className="text-[9px] text-slate-400 leading-normal border-t border-slate-100 pt-4 flex items-center gap-1.5 justify-center">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Meta Secure Graph API Integration</span>
        </div>
      </div>
    </div>
  );
}
