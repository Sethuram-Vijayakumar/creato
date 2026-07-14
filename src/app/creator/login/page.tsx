"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function CreatorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSSOClick = (provider: "google" | "instagram") => {
    const width = 500;
    const height = 620;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      `/auth/sso/${provider}`,
      `${provider}_sso`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.ssoSuccess) {
        window.removeEventListener("message", handleMessage);
        router.push("/creator/dashboard");
      }
    };
    window.addEventListener("message", handleMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password");
      } else {
        router.push("/creator/dashboard");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-6">
          <img src="/logo.png" alt="Creato Logo" className="h-8 object-contain" />
        </Link>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Sign in as Creator
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <Link href="/creator/signup" className="font-medium text-luxury-blue-600 hover:text-luxury-blue-500">
            register for a new portal
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-100 rounded-xl shadow-sm sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-luxury-blue-900 hover:bg-luxury-blue-900/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-4 text-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-6">
            <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Demo Creator Account:</span>
            <span className="text-[11px] text-slate-600 font-mono">priya@creato.in / password123</span>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
              <span className="bg-white px-2 text-slate-400">Or Login With SSO</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSSOClick("instagram")}
              className="w-full inline-flex justify-center py-2 px-3 border border-slate-200 rounded-lg bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs gap-1.5 items-center cursor-pointer"
            >
              <svg className="w-4 h-4 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              <span>Instagram</span>
            </button>

            <button
              type="button"
              onClick={() => handleSSOClick("google")}
              className="w-full inline-flex justify-center py-2 px-3 border border-slate-200 rounded-lg bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs gap-1.5 items-center cursor-pointer"
            >
              <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.488 0-6.321-2.833-6.321-6.321s2.833-6.321 6.321-6.321c1.558 0 2.977.568 4.093 1.503l3.056-3.056C19.294 2.457 16.08 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.783 0 10.609-4.14 11.218-9.67H12.24z" />
              </svg>
              <span>Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
