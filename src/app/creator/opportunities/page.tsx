"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Sparkles, 
  MapPin, 
  Globe, 
  DollarSign, 
  Briefcase, 
  CheckCircle,
  Filter
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSelector from "@/components/LanguageSelector";
import AICreatorAgent from "@/components/AICreatorAgent";

export default function CreatorOpportunities() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [briefs, setBriefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"matching" | "all">("matching");

  const fetchData = async () => {
    try {
      // 1. Fetch user session
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/creator/login");
        return;
      }
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== "CREATOR") {
        router.push("/creator/login");
        return;
      }
      setCreatorProfile(meData.profile);

      // 2. Fetch briefs
      const briefsRes = await fetch("/api/brand/briefs");
      const briefsData = await briefsRes.json();
      setBriefs(briefsData.briefs || []);
    } catch (e) {
      console.error("Error fetching opportunities details", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = (brief: any) => {
    const event = new CustomEvent("startCreatorAgentDraft", { detail: brief });
    window.dispatchEvent(event);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-luxury-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-500 font-sans">Loading open campaigns...</p>
        </div>
      </div>
    );
  }

  // Filter logic
  const filteredBriefs = briefs.filter((b) => {
    if (filterMode === "all" || !creatorProfile) return true;
    
    // Match criteria: niche OR language OR state
    const matchesNiche = b.niche.toLowerCase() === creatorProfile.niche.toLowerCase();
    const matchesLanguage = b.targetLanguages.includes(creatorProfile.primaryLanguage) || 
      (creatorProfile.secondaryLanguages || []).some((lang: string) => b.targetLanguages.includes(lang));
    const matchesState = b.targetStates.includes(creatorProfile.state);

    return matchesNiche || matchesLanguage || matchesState;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen font-sans pb-16">
      
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/creator/dashboard" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <div className="font-bold text-md tracking-tight text-slate-800">Campaigns Directory</div>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-luxury-blue-900 via-luxury-blue-800 to-luxury-blue-700 text-white py-12 px-6 shadow-sm">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-luxury-blue-300 animate-pulse" />
            <span>AI Matchmaker Engine Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Discover Brand Campaigns</h1>
          <p className="text-xs text-luxury-blue-100 max-w-xl leading-relaxed">
            Browse active marketing campaigns looking for regional voices. Use our opportunities agent to draft personalized applications backed by your verified Audience Trust Index score.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full space-y-6">
        
        {/* Toggle Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Campaign Opportunities</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Showing {filteredBriefs.length} campaigns</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 self-start shadow-3xs">
            <button
              onClick={() => setFilterMode("matching")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filterMode === "matching"
                  ? "bg-luxury-blue-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Recommended For You
            </button>
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filterMode === "all"
                  ? "bg-luxury-blue-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Open Briefs
            </button>
          </div>
        </div>

        {/* List of briefs */}
        {filteredBriefs.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
            <Briefcase className="w-10 h-10 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No campaigns found</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-normal">
              Try switching filters to "All Open Briefs" to view other available campaign opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBriefs.map((b) => {
              // Check if matching creator profile
              const matchesNiche = creatorProfile && b.niche.toLowerCase() === creatorProfile.niche.toLowerCase();
              return (
                <div 
                  key={b.id} 
                  className={`bg-white border rounded-2xl p-6 shadow-3xs hover:shadow-2xs transition-all flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden ${
                    matchesNiche ? "border-luxury-blue-100" : "border-slate-100"
                  }`}
                >
                  {matchesNiche && (
                    <div className="absolute top-0 left-0 bg-luxury-blue-900 text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-br-lg shadow-sm">
                      Niche Match
                    </div>
                  )}

                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-luxury-purple-50 text-luxury-purple-600 font-bold uppercase tracking-wider">
                          {b.niche}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                          {b.deliverableType}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">{b.title}</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Campaign by {b.brand?.companyName || "Partner Brand"}</p>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{b.description}</p>

                    {/* Targeted specs */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[10px] text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Languages: {b.targetLanguages.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>States: {b.targetStates.join(", ")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Budget column */}
                  <div className="w-full md:w-48 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0 gap-4">
                    <div className="text-left md:text-right w-full">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Estimated Budget</span>
                      <span className="text-md font-extrabold text-luxury-purple-600 tabular-nums">
                        ₹{b.budgetMin.toLocaleString()} - ₹{b.budgetMax.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleApply(b)}
                      className="w-full py-2.5 bg-luxury-blue-900 hover:bg-luxury-blue-750 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-luxury-blue-300 animate-pulse" />
                      <span>Apply via AI Agent</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      <AICreatorAgent />
    </div>
  );
}
