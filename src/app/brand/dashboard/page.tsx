"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building, 
  ChevronRight, 
  Compass, 
  Globe, 
  LogOut, 
  MapPin, 
  MessageSquare, 
  Sparkles, 
  TrendingUp 
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSelector from "@/components/LanguageSelector";
import AIScoutDrawer from "@/components/AIScoutDrawer";

export default function BrandDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== "BRAND") {
        router.push("/brand/login");
        return;
      }
      setProfile(meData.profile);

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
    router.push("/brand/login");
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
        <h2 className="text-2xl font-bold text-slate-800">Brand Profile Pending</h2>
        <p className="text-xs text-slate-500 mt-2 text-center max-w-sm">
          Please fill in your company details to activate your brand dashboard.
        </p>
        <Link 
          href="/brand/dashboard" 
          onClick={async () => {
            // Force create sample brand profile
            await fetch("/api/brand/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                companyName: "D2C Brands India",
                industry: "Consumer Goods",
                city: "Mumbai",
                description: "Promoting regional household goods."
              })
            });
            fetchDashboardData();
          }}
          className="mt-6 px-6 py-3 rounded-lg bg-luxury-purple-500 text-white font-semibold text-xs hover:bg-luxury-purple-600 shadow-sm"
        >
          Initialize Brand Profile
        </Link>
      </div>
    );
  }

  // Calculate stats
  const activeCollaborations = deals.filter((d) => d.status !== "DECLINED" && d.status !== "DELIVERED");
  const completedCollaborations = deals.filter((d) => d.status === "DELIVERED");

  // Geographic state reach list from active deals
  const reachStates = Array.from(new Set(deals.map((d) => d.creator?.state).filter(Boolean)));

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Creato Logo" className="h-16 object-contain mix-blend-multiply" />
          </Link>
          
          <div className="flex items-center gap-6">
            <LanguageSelector />
            <Link href="/brand/dashboard" className="text-xs font-bold text-luxury-purple-600">
              {t("dashboard")}
            </Link>
            <Link href="/brand/discover" className="text-xs font-semibold text-slate-655 hover:text-slate-900 transition-colors">
              {t("discover")}
            </Link>
            <Link href="/brand/briefs/new" className="text-xs font-semibold text-slate-655 hover:text-slate-900 transition-colors">
              Post Brief
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

      {/* Main dashboard content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full flex flex-col gap-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-luxury-purple-50 flex items-center justify-center text-luxury-purple-500">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{profile.companyName}</h1>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-luxury-purple-50 text-luxury-purple-600 font-bold uppercase tracking-wider">{profile.industry}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{profile.city}</p>
            </div>
          </div>

          <Link 
            href="/brand/discover"
            className="py-2.5 px-4 rounded-lg bg-luxury-purple-500 hover:bg-luxury-purple-600 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
          >
            <Compass className="w-4 h-4" />
            <span>{t("discover")}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dashboard Grid layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Active Collaborations list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Campaign Collaboration Tracking</h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Active: {activeCollaborations.length}</span>
            </div>

            <div className="space-y-4">
              {activeCollaborations.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center flex flex-col items-center gap-4 text-slate-400">
                  <Compass className="w-10 h-10 opacity-30 text-luxury-purple-500" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">No active campaigns</p>
                    <p className="text-[11px] max-w-xs mx-auto">Discover regional creators to initiate customized offers and negotiate budgets.</p>
                  </div>
                  <Link 
                    href="/brand/discover"
                    className="py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-100 shadow-2xs"
                  >
                    Browse Directory
                  </Link>
                </div>
              ) : (
                activeCollaborations.map((d) => (
                  <Link 
                    key={d.id} 
                    href={`/brand/deals/${d.id}`}
                    className="block bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-slate-200 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Creator info */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={d.creator?.profileImageUrl} 
                          alt={d.creator?.displayName} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{d.creator?.displayName}</h4>
                          <span className="text-[10px] text-slate-400">@{d.creator?.handle} &bull; {d.creator?.state}</span>
                        </div>
                      </div>

                      {/* Campaign details */}
                      <div className="flex items-center gap-6 justify-between sm:justify-end">
                        <div className="text-left sm:text-right">
                          <span className="text-xs font-bold text-slate-800">₹{d.amount.toLocaleString()}</span>
                          <span className="block text-[9px] text-slate-400 font-medium">{d.deliverableType}</span>
                        </div>

                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          d.status === 'OFFER_SENT' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          d.status === 'COUNTERED' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                          d.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border border-green-100' :
                          'bg-slate-50 text-slate-700 border border-slate-100'
                        }`}>
                          {d.status.replace("_", " ")}
                        </span>
                      </div>

                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Geographic reach & performance summaries */}
          <div className="space-y-8">
            
            {/* Stats list */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs text-center">
                <Globe className="w-5 h-5 text-luxury-purple-500 mx-auto mb-2" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Geographic Reach</span>
                <span className="text-sm font-extrabold text-slate-800 mt-1 block">{reachStates.length} States</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs text-center">
                <TrendingUp className="w-5 h-5 text-luxury-purple-500 mx-auto mb-2" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Completed Deals</span>
                <span className="text-sm font-extrabold text-slate-800 mt-1 block">{completedCollaborations.length}</span>
              </div>
            </div>

            {/* Geographic footprint list */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Linguistic Footprints</h3>
              <div className="space-y-3">
                {reachStates.length === 0 ? (
                  <p className="text-xs text-slate-400">No active regional campaigns recorded.</p>
                ) : (
                  reachStates.map((st: string) => {
                    const count = deals.filter((d) => d.creator?.state === st).length;
                    return (
                      <div key={st} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-655 font-medium">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{st}</span>
                        </div>
                        <span className="font-bold text-slate-700">{count} campaigns</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

      </main>
      <AIScoutDrawer />
    </div>
  );
}
