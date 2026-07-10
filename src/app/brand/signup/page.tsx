"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail } from "lucide-react";

export default function BrandSignup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Sign up user
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "BRAND" }),
      });
      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        setError(signupData.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Step 2: Auto-create Brand Profile so they immediately land in active state
      const profileRes = await fetch("/api/brand/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: email.split("@")[0].toUpperCase() + " Brands",
          industry: "D2C",
          city: "Mumbai",
          description: "New brand collaborating with regional creators."
        }),
      });

      if (!profileRes.ok) {
        console.error("Auto brand profile creation failed");
      }

      router.push("/brand/dashboard");
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
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-luxury-blue-500 to-luxury-purple-500 flex items-center justify-center text-white font-bold text-lg">C</span>
          <span className="font-bold text-xl tracking-tight text-slate-800">Creato</span>
        </Link>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Register your Brand
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <Link href="/brand/login" className="font-medium text-luxury-purple-600 hover:text-luxury-purple-500">
            sign in to your brand portal
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
                Company Email address
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
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-purple-500 focus:border-transparent"
                  placeholder="marketing@company.com"
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-luxury-purple-600 hover:bg-luxury-purple-600/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-purple-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Registering..." : "Register Brand"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-luxury-blue-500 font-semibold bg-luxury-blue-50 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span>Connect directly with 15+ verified Indian creators</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
