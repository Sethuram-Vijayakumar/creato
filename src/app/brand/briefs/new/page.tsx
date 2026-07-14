"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function NewBrandBrief() {
  const router = useRouter();
  const { t } = useLanguage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [niche, setNiche] = useState("Beauty");
  const [targetLanguages, setTargetLanguages] = useState("");
  const [targetStates, setTargetStates] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deliverableType, setDeliverableType] = useState("Instagram Reel");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Parse comma-separated lists
    const languages = targetLanguages
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l !== "");
    const states = targetStates
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    try {
      const res = await fetch("/api/brand/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          niche,
          targetLanguages: languages,
          targetStates: states,
          budgetMin: parseFloat(budgetMin),
          budgetMax: parseFloat(budgetMax),
          deliverableType
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post campaign brief");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/brand/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/brand/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="font-bold text-xl tracking-tight text-slate-800">Post New Brief</div>
        </div>
      </header>

      {/* Form Container */}
      <main className="flex-1 max-w-lg mx-auto px-6 py-12 w-full">
        <div className="bg-white p-8 border border-slate-100 rounded-2xl shadow-sm space-y-6">
          
          <div>
            <h1 className="text-xl font-bold text-slate-900">Campaign Details</h1>
            <p className="text-xs text-slate-500 mt-1">Publish an open brief for regional creators to browse and apply.</p>
          </div>

          {success ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
              <CheckCircle2 className="w-12 h-12 text-green-500 animate-bounce" />
              <h3 className="text-sm font-bold text-slate-850">Campaign Brief Published!</h3>
              <p className="text-xs text-slate-400">Redirecting to brand dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wide mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Traditional Matte Lipstick Review"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-luxury-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wide mb-1">Campaign Description & Guidelines</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your goals, requirements, product details, and styling preferences..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-luxury-purple-500 leading-normal"
                />
              </div>

              {/* Niche & Deliverable Type Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wide mb-1">Niche Category</label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-luxury-purple-500 bg-white"
                  >
                    <option value="Beauty">Beauty</option>
                    <option value="Food">Food</option>
                    <option value="Tech">Tech</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wide mb-1">Deliverable Type</label>
                  <select
                    value={deliverableType}
                    onChange={(e) => setDeliverableType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-luxury-purple-500 bg-white"
                  >
                    <option value="Instagram Reel">Instagram Reel</option>
                    <option value="Instagram Post">Instagram Post</option>
                    <option value="YouTube Video">YouTube Video</option>
                    <option value="YouTube Dedicated Video">YouTube Dedicated Video</option>
                  </select>
                </div>
              </div>

              {/* Languages & States */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-555 uppercase tracking-wide mb-1">Target Languages</label>
                  <input
                    type="text"
                    required
                    value={targetLanguages}
                    onChange={(e) => setTargetLanguages(e.target.value)}
                    placeholder="e.g. Tamil, English"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-luxury-purple-500"
                  />
                  <span className="text-[8px] text-slate-400 mt-1 block">Comma-separated values</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-555 uppercase tracking-wide mb-1">Target States</label>
                  <input
                    type="text"
                    required
                    value={targetStates}
                    onChange={(e) => setTargetStates(e.target.value)}
                    placeholder="e.g. Tamil Nadu, Kerala"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-luxury-purple-500"
                  />
                  <span className="text-[8px] text-slate-400 mt-1 block">Comma-separated values</span>
                </div>
              </div>

              {/* Budget Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-555 uppercase tracking-wide mb-1">Min Budget (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-luxury-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-555 uppercase tracking-wide mb-1">Max Budget (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="15000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-luxury-purple-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-luxury-purple-500 hover:bg-luxury-purple-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-colors cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Brief...</span>
                  </>
                ) : (
                  <span>Publish Campaign Brief</span>
                )}
              </button>

            </form>
          )}

        </div>
      </main>

    </div>
  );
}
