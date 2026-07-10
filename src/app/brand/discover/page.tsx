"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Compass, 
  MapPin, 
  Globe, 
  Sparkles, 
  Search, 
  ChevronRight, 
  Users, 
  SlidersHorizontal 
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSelector from "@/components/LanguageSelector";
import AIScoutDrawer from "@/components/AIScoutDrawer";

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Karnataka", "Maharashtra", "Punjab", "Tamil Nadu", "West Bengal"
];

const LANGUAGES = [
  "Assamese", "Bengali", "Bhojpuri", "English", "Hindi", "Kannada", "Marathi", "Punjabi", "Tamil", "Telugu"
];

const NICHES = [
  "Beauty", "Comedy", "Education", "Entertainment", "Finance", "Food", "Tech", "Travel"
];

export default function BrandDiscover() {
  const { t } = useLanguage();
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [minATI, setMinATI] = useState(0);
  const [maxBudget, setMaxBudget] = useState(80000);
  const [minFollowers, setMinFollowers] = useState(0);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      selectedStates.forEach((s) => params.append("state", s));
      selectedLanguages.forEach((l) => params.append("language", l));
      selectedNiches.forEach((n) => params.append("niche", n));
      params.append("minATI", minATI.toString());
      params.append("minFollowers", minFollowers.toString());
      params.append("maxBudget", maxBudget.toString());

      const res = await fetch(`/api/creators?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCreators(data.creators || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [selectedStates, selectedLanguages, selectedNiches, minATI, maxBudget, minFollowers]);

  const handleToggleState = (state: string) => {
    setSelectedStates((prev) => 
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const handleToggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) => 
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleToggleNiche = (niche: string) => {
    setSelectedNiches((prev) => 
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  };

  const handleResetFilters = () => {
    setSelectedStates([]);
    setSelectedLanguages([]);
    setSelectedNiches([]);
    setMinATI(0);
    setMaxBudget(80000);
    setMinFollowers(0);
    setSearchQuery("");
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-luxury-blue-500 to-luxury-purple-500 flex items-center justify-center text-white font-bold text-lg">C</span>
            <span className="font-bold text-xl tracking-tight text-slate-800">{t("appName")}</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <LanguageSelector />
            <Link href="/brand/dashboard" className="text-xs font-semibold text-slate-655 hover:text-slate-900 transition-colors">
              {t("dashboard")}
            </Link>
            <Link href="/brand/discover" className="text-xs font-bold text-luxury-purple-600">
              {t("discover")}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Discover Layout */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid md:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Filter Sidebar */}
        <div className="md:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-800">Search Filters</h3>
            </div>
            <button 
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-luxury-purple-600 uppercase hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCreators()}
              className="w-full px-3 py-2 pl-9 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-luxury-purple-500 focus:border-transparent"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* State Multi-Select */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Indian State Reach</h4>
            <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto pr-1">
              {INDIAN_STATES.map((s) => {
                const active = selectedStates.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleToggleState(s)}
                    className={`text-[10px] px-2 py-1 rounded-md border font-medium ${active ? 'border-luxury-purple-500 bg-luxury-purple-50 text-luxury-purple-600 font-bold' : 'border-slate-100 bg-slate-50 text-slate-655'}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Multi-Select */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Linguistic Languages</h4>
            <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto pr-1">
              {LANGUAGES.map((l) => {
                const active = selectedLanguages.includes(l);
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleToggleLanguage(l)}
                    className={`text-[10px] px-2 py-1 rounded-md border font-medium ${active ? 'border-luxury-purple-500 bg-luxury-purple-50 text-luxury-purple-600 font-bold' : 'border-slate-100 bg-slate-50 text-slate-655'}`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Niche Multi-Select */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Content Niche</h4>
            <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto pr-1">
              {NICHES.map((n) => {
                const active = selectedNiches.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleToggleNiche(n)}
                    className={`text-[10px] px-2 py-1 rounded-md border font-medium ${active ? 'border-luxury-purple-500 bg-luxury-purple-50 text-luxury-purple-600 font-bold' : 'border-slate-100 bg-slate-50 text-slate-655'}`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Min ATI slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Min {t("atiScoreLabel").split(" ")[0]} Score</span>
              <span className="text-luxury-purple-600 font-mono">{minATI}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={minATI}
              onChange={(e) => setMinATI(parseInt(e.target.value))}
              className="w-full accent-luxury-purple-500"
            />
          </div>

          {/* Followers slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Min Followers</span>
              <span className="text-slate-600 font-mono">{(minFollowers / 1000).toFixed(0)}K+</span>
            </div>
            <input
              type="range"
              min="0"
              max="80000"
              step="5000"
              value={minFollowers}
              onChange={(e) => setMinFollowers(parseInt(e.target.value))}
              className="w-full accent-luxury-purple-500"
            />
          </div>

          {/* Budget slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Max Post Rate</span>
              <span className="text-slate-600 font-mono">₹{maxBudget.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="80000"
              step="2000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(parseInt(e.target.value))}
              className="w-full accent-luxury-purple-500"
            />
          </div>
        </div>

        {/* Right Side: Creator Grid */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-bold text-slate-800">
              Available Regional Creators ({creators.length})
            </h2>
            <div className="inline-flex items-center gap-1.5 text-xs text-luxury-purple-600 font-semibold bg-luxury-purple-50 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>Matching Verified regional accounts</span>
            </div>
          </div>

          {loading ? (
            <div className="h-64 bg-white border border-slate-100 rounded-2xl flex items-center justify-center">
              <div className="text-center flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-luxury-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-semibold">Filtering creators...</span>
              </div>
            </div>
          ) : creators.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center flex flex-col items-center gap-4 text-slate-400">
              <Compass className="w-12 h-12 opacity-30 text-luxury-purple-500" />
              <div className="space-y-1">
                <p className="font-bold text-slate-700">No creators found</p>
                <p className="text-xs max-w-sm">No creators matched your combination of filters. Try widening your budget or ATI parameters.</p>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((c) => (
                <div 
                  key={c.uid}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Header: Profile image & Display name */}
                    <div className="flex items-center gap-3">
                      <img 
                        src={c.profileImageUrl} 
                        alt={c.displayName} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-100"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{c.displayName}</h4>
                        <span className="text-[9px] font-semibold text-slate-400 font-mono">@{c.handle}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-luxury-blue-50 text-luxury-blue-900 font-bold uppercase tracking-wider">{c.niche}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-luxury-purple-50 text-luxury-purple-600 font-bold tracking-wider">{c.primaryLanguage}</span>
                    </div>

                    {/* Short Bio */}
                    <p className="text-xs text-slate-500 line-clamp-2 h-8 leading-relaxed">{c.bio}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                      <div>
                        <span className="text-slate-400 font-medium block">Followers</span>
                        <div className="flex items-center gap-1 font-bold text-slate-800 mt-0.5">
                          <Users className="w-3.5 h-3.5 text-slate-450" />
                          <span>{c.followerCount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block">{t("suggestedPostRate")}</span>
                        <span className="font-extrabold text-luxury-purple-600 block mt-0.5">₹{c.suggestedRate.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* ATI Score display & CTA */}
                  <div className="mt-2 border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full border-2 border-luxury-purple-500 bg-luxury-purple-50 flex items-center justify-center text-[10px] font-extrabold text-luxury-purple-600 font-mono">
                        {c.atiScore.overallScore}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t("atiScoreLabel").split(" ")[0]}</span>
                    </div>

                    <Link 
                      href={`/creators/${c.handle}`}
                      className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold flex items-center gap-1 transition-all shrink-0"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </main>
      <AIScoutDrawer />
    </div>
  );
}
