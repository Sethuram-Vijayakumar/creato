"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export default function GoogleSSOPopup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelectAccount = async (email: string, name: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          provider: "google",
          displayName: name,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        setLoading(false);
      } else {
        // Communicate success back to parent window
        if (window.opener) {
          window.opener.postMessage({ ssoSuccess: true, isNew: data.isNew }, "*");
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
        
        {/* Google Logo */}
        <div className="flex justify-center">
          <svg className="w-10 h-10" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.488 0-6.321-2.833-6.321-6.321s2.833-6.321 6.321-6.321c1.558 0 2.977.568 4.093 1.503l3.056-3.056C19.294 2.457 16.08 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.783 0 10.609-4.14 11.218-9.67H12.24z"
            />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-800">Sign in with Google</h2>
          <p className="text-xs text-slate-500">to continue to **Creato**</p>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-red-50 text-red-650 text-xs font-semibold border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs text-slate-400 font-semibold">Authenticating credentials...</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-left">
            <button
              onClick={() => handleSelectAccount("sethuram.v@gmail.com", "Sethuram Vijayakumar")}
              className="w-full py-3 px-1 flex items-center gap-3 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                S
              </div>
              <div>
                <p className="text-slate-850 font-bold">Sethuram Vijayakumar</p>
                <p className="text-[10px] text-slate-450 font-normal">sethuram.v@gmail.com</p>
              </div>
            </button>

            <button
              onClick={() => handleSelectAccount("guest_creator@creato.in", "Guest Creator")}
              className="w-full py-3 px-1 flex items-center gap-3 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                G
              </div>
              <div>
                <p className="text-slate-850 font-bold">Guest Creator</p>
                <p className="text-[10px] text-slate-455 font-normal">guest_creator@creato.in</p>
              </div>
            </button>
          </div>
        )}

        <div className="text-[10px] text-slate-400 leading-normal border-t border-slate-100 pt-4">
          To continue, Google will share your name, email address, language preference, and profile picture with Creato.
        </div>
      </div>
    </div>
  );
}
