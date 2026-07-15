"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Calculator, 
  ChevronRight, 
  DollarSign, 
  Globe, 
  Inbox, 
  LogOut, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSelector from "@/components/LanguageSelector";
import ATIScoreCard from "@/components/ATIScoreCard";
import AICreatorAgent from "@/components/AICreatorAgent";

export default function CreatorDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [atiScore, setAtiScore] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [collabs, setCollabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== "CREATOR") {
        router.push("/creator/login");
        return;
      }
      
      setProfile(meData.profile);

      if (meData.profile) {
        const profileRes = await fetch(`/api/creators/${meData.profile.handle}`);
        const profileData = await profileRes.json();
        setAtiScore(profileData.atiScore);
        setCollabs(profileData.collabs);
      }

      const dealsRes = await fetch("/api/deals");
      const dealsData = await dealsRes.json();
      setDeals(dealsData.deals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/creator/login");
  };

  const handleConnectChannel = (provider: "instagram" | "youtube") => {
    const width = 500;
    const height = 620;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      `/auth/connect/${provider}`,
      `${provider}_connect`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.connectSuccess && event.data.provider === provider) {
        window.removeEventListener("message", handleMessage);
        fetchDashboardData();
      }
    };
    window.addEventListener("message", handleMessage);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-luxury-purple-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-screen p-6">
        <h2 className="text-2xl font-bold text-slate-800">Onboarding Pending</h2>
        <p className="text-xs text-slate-500 mt-2 text-center max-w-sm">
          Please complete your onboarding questionnaire to view your creator dashboard.
        </p>
        <Link 
          href="/creator/onboarding" 
          className="mt-6 px-6 py-3 rounded-lg bg-luxury-blue-900 text-white font-semibold text-xs hover:bg-luxury-blue-900/90 shadow-sm"
        >
          Complete Onboarding
        </Link>
      </div>
    );
  }

  // Calculate pricing recommendations
  const suggestedRate = atiScore ? Math.round(profile.followerCount * 0.3 * (0.3 + (atiScore.overallScore / 100) * 1.7)) : 0;
  const minSuggested = Math.round(suggestedRate * 0.85);
  const maxSuggested = Math.round(suggestedRate * 1.15);

  const collabsWithPrices = collabs.map((c, i) => {
    const historicalPrice = i === 0 ? 2500 : 3000;
    const isUnderpriced = historicalPrice < minSuggested;
    return {
      ...c,
      price: historicalPrice,
      isUnderpriced
    };
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Creato Logo" className="h-16 object-contain mix-blend-multiply" />
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link href="/creator/opportunities" className="text-xs font-bold text-slate-655 hover:text-slate-900">
              Find Campaigns
            </Link>
            <Link href="/creator/deals" className="text-xs font-bold text-slate-655 hover:text-slate-900">
              {t("dealsInbox")}
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title={t("logout")}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard grid */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full flex flex-col gap-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-4">
            <img 
              src={profile.profileImageUrl} 
              alt={profile.displayName} 
              className="w-14 h-14 rounded-full object-cover ring-2 ring-luxury-purple-100"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{profile.displayName}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-luxury-blue-50 text-luxury-blue-900 font-bold uppercase tracking-wider">{profile.niche}</span>
              </div>
              <p className="text-xs font-mono text-slate-400">@{profile.handle}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link 
              href="/creator/rate-calculator"
              className="py-2 px-3.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs"
            >
              <Calculator className="w-4 h-4 text-slate-400" />
              <span>{t("rateCalculator")}</span>
            </Link>
            <Link 
              href={`/creators/${profile.handle}`}
              className="py-2 px-3.5 rounded-lg bg-luxury-blue-900 hover:bg-luxury-blue-900/90 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <span>{t("viewPublicProfile")}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Dashboard Grid layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: ATI Scores & Recommendations */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* ATI Card Widget */}
            {atiScore && <ATIScoreCard score={atiScore} />}

            {/* suggestedRateRange Pricing card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-luxury-blue-900 bg-luxury-blue-50 px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Fair Pricing Index</span>
                </div>
                <h3 className="text-md font-bold text-slate-800">{t("suggestedPostRate")}</h3>
                <p className="text-xs text-slate-500 leading-normal max-w-sm">
                  Calculated dynamically from your overall trust index of **{atiScore?.overallScore}** and follower count of **{profile.followerCount.toLocaleString()}**.
                </p>
              </div>

              <div className="text-center md:text-right bg-luxury-blue-50/30 border border-luxury-blue-50/50 p-4 rounded-xl min-w-[200px]">
                <span className="text-xl font-extrabold text-luxury-blue-900 tabular-nums">
                  ₹{minSuggested.toLocaleString()} - ₹{maxSuggested.toLocaleString()}
                </span>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">{t("suggestedPostRate")}</span>
              </div>
            </div>

            {/* Past Collaborations with flags */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Past Collaborations Valuation Audit</h3>
              <div className="space-y-4">
                {collabsWithPrices.map((c, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{c.brandName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{c.outcome}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{c.date}</p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700">₹{c.price.toLocaleString()}</span>
                        <span className="block text-[9px] text-slate-400">Deal Amount</span>
                      </div>
                      
                      {c.isUnderpriced ? (
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Underpriced</span>
                        </div>
                      ) : (
                        <div className="text-[9px] font-bold text-green-700 bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-full">
                          <span>Fair Value</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Column 3: Stats & Deal Inbox */}
          <div className="flex flex-col gap-8">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs text-center flex flex-col justify-center">
                <Globe className="w-5 h-5 text-luxury-blue-500 mx-auto mb-2" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Language</span>
                <span className="text-xs font-bold text-slate-850 mt-1">{profile.primaryLanguage}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs text-center flex flex-col justify-center">
                <MapPin className="w-5 h-5 text-luxury-blue-500 mx-auto mb-2" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">State Reach</span>
                <span className="text-xs font-bold text-slate-850 mt-1">{profile.state}</span>
              </div>
            </div>

            {/* Connected Channels Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-luxury-purple-600 animate-pulse" />
                <span>Connected Channels</span>
              </h3>
              <div className="space-y-3">
                {/* Instagram */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-650" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Instagram Insights</h4>
                      <p className="text-[9px] text-slate-400 font-medium">
                        {profile.followerCount === 22000 
                          ? "@priya_cooks • 22,000 Followers" 
                          : "Disconnected"}
                      </p>
                    </div>
                  </div>
                  {profile.followerCount === 22000 ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold border border-green-150">Synced</span>
                  ) : (
                    <button
                      onClick={() => handleConnectChannel("instagram")}
                      className="py-1 px-2.5 rounded bg-luxury-blue-900 text-white text-[10px] font-bold hover:bg-luxury-blue-900/90 transition-all cursor-pointer"
                    >
                      Connect
                    </button>
                  )}
                </div>

                {/* YouTube */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">YouTube Channel</h4>
                      <p className="text-[9px] text-slate-400 font-medium">
                        {profile.followerCount === 55000 
                          ? "@ravi_laughs • 55,000 Subscribers" 
                          : "Disconnected"}
                      </p>
                    </div>
                  </div>
                  {profile.followerCount === 55000 ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold border border-green-150">Synced</span>
                  ) : (
                    <button
                      onClick={() => handleConnectChannel("youtube")}
                      className="py-1 px-2.5 rounded bg-luxury-blue-900 text-white text-[10px] font-bold hover:bg-luxury-blue-900/90 transition-all cursor-pointer"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Deal Inbox Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-800">{t("dealsInbox")}</h3>
                </div>
                <Link href="/creator/deals" className="text-xs font-bold text-luxury-purple-600 hover:text-luxury-purple-500">View All</Link>
              </div>

              <div className="space-y-4 flex-1">
                {deals.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 gap-2">
                    <DollarSign className="w-8 h-8 opacity-40" />
                    <p className="text-[11px]">No active campaign offers in your inbox.</p>
                  </div>
                ) : (
                  deals.slice(0, 4).map((d) => (
                    <Link 
                      key={d.id} 
                      href={`/creator/deals/${d.id}`}
                      className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all shadow-2xs bg-white"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-855 truncate max-w-[120px]">{d.brand?.companyName || "Brand"}</span>
                        <span className="text-xs font-bold text-slate-900 tabular-nums">₹{d.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="text-[9px] text-slate-400 truncate max-w-[120px]">{d.deliverableType}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          d.status === 'OFFER_SENT' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          d.status === 'COUNTERED' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                          d.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border border-green-100' :
                          'bg-slate-50 text-slate-700 border border-slate-100'
                        }`}>
                          {d.status.replace("_", " ")}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </main>
      <AICreatorAgent />
    </div>
  );
}
