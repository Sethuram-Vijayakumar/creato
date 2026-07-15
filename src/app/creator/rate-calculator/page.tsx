"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, TrendingUp, ShieldAlert, Award } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSelector from "@/components/LanguageSelector";

export default function RateCalculator() {
  const router = useRouter();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [atiScore, setAtiScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simulation inputs
  const [followers, setFollowers] = useState<number>(10000);
  const [customATI, setCustomATI] = useState<number>(75);

  const fetchCalculatorData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== "CREATOR") {
        router.push("/creator/login");
        return;
      }
      
      setProfile(meData.profile);
      
      if (meData.profile) {
        setFollowers(meData.profile.followerCount);
        const profileRes = await fetch(`/api/creators/${meData.profile.handle}`);
        const profileData = await profileRes.json();
        setAtiScore(profileData.atiScore);
        if (profileData.atiScore) {
          setCustomATI(profileData.atiScore.overallScore);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculatorData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-luxury-purple-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading calculator...</p>
        </div>
      </div>
    );
  }

  // Calculate pricing based on inputs
  const baseRate = followers * 0.30;
  const atiMultiplier = 0.3 + (customATI / 100) * 1.7;
  const suggestedRate = Math.round(baseRate * atiMultiplier);
  const minRate = Math.round(suggestedRate * 0.85);
  const maxRate = Math.round(suggestedRate * 1.15);

  const isHighVernacular = (atiScore?.vernacularDepth || 50) > 75;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/creator/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-655 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>{t("dashboard")}</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <div className="font-bold text-xl tracking-tight text-slate-800">{t("rateCalculator")}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full flex flex-col gap-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t("rateCalculator")}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate your recommended post values by adjusting your follower footprint and trust score.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* Simulator Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-100 pb-3">Simulator Parameters</h3>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Follower Count</label>
              <input
                type="number"
                value={followers}
                onChange={(e) => setFollowers(Math.max(0, parseInt(e.target.value) || 0))}
                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-blue-500 focus:border-transparent font-mono"
              />
              <p className="text-[9px] text-slate-400 mt-1.5">Default set to your actual profile follower count.</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">{t("atiScoreLabel")}</label>
                <span className="text-sm font-bold text-luxury-purple-600 font-mono">{customATI}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={customATI}
                onChange={(e) => setCustomATI(parseInt(e.target.value))}
                className="w-full accent-luxury-purple-500"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                <span>0 (No Trust)</span>
                <span>50 (Avg)</span>
                <span>100 (Exceptional)</span>
              </div>
            </div>

            {atiScore && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Your Real Profile Scores</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                  <div>Overall: <span className="font-semibold text-luxury-purple-600">{atiScore.overallScore}</span></div>
                  <div>{t("vernacularLabel")}: <span className="font-semibold text-slate-700">{atiScore.vernacularDepth}%</span></div>
                  <div>{t("communityLabel")}: <span className="font-semibold text-slate-700">{atiScore.communityDepth}%</span></div>
                  <div>{t("localLabel")}: <span className="font-semibold text-slate-700">{atiScore.localRelevance}%</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Results & Explanations */}
          <div className="space-y-6">
            
            {/* Suggested Rate */}
            <div className="bg-gradient-to-br from-luxury-blue-900 to-slate-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-luxury-blue-500/10 rounded-full blur-xl" />
              
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-luxury-blue-100 text-[10px] font-semibold tracking-wider uppercase mb-4">
                <Sparkles className="w-3 h-3" />
                <span>Simulated Output</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-300 font-medium">{t("suggestedPostRate")}</span>
                <div className="text-2xl font-extrabold font-mono tracking-tighter text-white tabular-nums">
                  ₹{minRate.toLocaleString()} - ₹{maxRate.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 pt-2">
                  Suggested target amount: <strong className="text-white">₹{suggestedRate.toLocaleString()}</strong> per campaign post.
                </p>
              </div>
            </div>

            {/* Pricing factors / reasoning */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rate Valuation Factors</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs leading-relaxed text-slate-655">
                  <div className="w-5 h-5 rounded-full bg-luxury-purple-50 flex items-center justify-center text-luxury-purple-500 shrink-0 mt-0.5 font-bold">₹</div>
                  <div>
                    <p className="font-bold text-slate-800">Base Follower Rate (₹0.30 per follower)</p>
                    <p className="text-[11px] text-slate-500">Base value for {followers.toLocaleString()} followers is ₹{baseRate.toLocaleString()}.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs leading-relaxed text-slate-655">
                  <TrendingUp className="w-5 h-5 text-luxury-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">ATI Multiplier ({atiMultiplier.toFixed(2)}x)</p>
                    <p className="text-[11px] text-slate-500">Based on a simulated Creato Score of {customATI}. Highly trusted regional creators multiply campaign conversion values.</p>
                  </div>
                </div>

                {isHighVernacular && (
                  <div className="flex items-start gap-3 text-xs leading-relaxed text-slate-655">
                    <Award className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-green-700">Vernacular Premium Match</p>
                      <p className="text-[11px] text-slate-500">Your mother-tongue tone ratio adds targeting conversion premium for regional brand sponsors.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advice panel */}
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3 text-xs text-orange-850">
              <ShieldAlert className="w-5 h-5 text-orange-655 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Pricing Integrity Policy</h4>
                <p className="leading-relaxed text-slate-700">
                  Brands are visually flagged if they propose rates below your ATI minimum recommended threshold. Keep your engagement authentic to preserve your pricing power.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
