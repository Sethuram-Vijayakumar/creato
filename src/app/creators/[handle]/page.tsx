"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Sparkles, 
  Send, 
  Users, 
  Award 
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSelector from "@/components/LanguageSelector";
import ATIScoreCard from "@/components/ATIScoreCard";

export default function PublicCreatorProfile() {
  const router = useRouter();
  const params = useParams();
  const handle = params.handle as string;
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [creatorData, setCreatorData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Offer Composer states
  const [deliverableType, setDeliverableType] = useState("Instagram Reel");
  const [amount, setAmount] = useState("");
  const [brief, setBrief] = useState("");
  const [offerError, setOfferError] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);

  const fetchCreatorDetails = async () => {
    try {
      const res = await fetch(`/api/creators/${handle}`);
      if (res.ok) {
        const data = await res.json();
        setCreatorData(data);
        if (data.rateRange) {
          setAmount(data.rateRange.suggested.toString());
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const initPage = async () => {
    setLoading(true);
    await Promise.all([fetchCreatorDetails(), fetchCurrentUser()]);
    setLoading(false);
  };

  useEffect(() => {
    initPage();
  }, [handle]);

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferError("");
    setOfferLoading(true);

    if (!amount || !brief) {
      setOfferError("Amount and brief are required.");
      setOfferLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorUid: creatorData.profile.uid,
          deliverableType,
          amount,
          brief
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setOfferError(data.error || "Failed to submit offer.");
      } else {
        router.push(`/brand/deals/${data.dealId}`);
      }
    } catch (err) {
      setOfferError("Connection error.");
    } finally {
      setOfferLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-luxury-purple-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!creatorData || !creatorData.profile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Creator Profile Not Found</h2>
          <Link href="/" className="text-sm text-luxury-purple-600 hover:underline mt-2 inline-block">Go to Landing Page</Link>
        </div>
      </div>
    );
  }

  const { profile, atiScore, collabs, rateRange } = creatorData;
  const isBrand = currentUser?.user?.role === "BRAND";
  const isCreatorSelf = currentUser?.user?.uid === profile.uid;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Navigation Header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-655 hover:text-slate-905 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-luxury-blue-500 to-luxury-purple-500 flex items-center justify-center text-white font-bold text-lg">C</span>
              <span className="font-bold text-xl tracking-tight text-slate-800">{t("appName")}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Details Area */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid md:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Creator Identity & ATI Widget */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Identity details */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center gap-6">
            <img 
              src={profile.profileImageUrl} 
              alt={profile.displayName} 
              className="w-20 h-20 rounded-full object-cover ring-2 ring-luxury-purple-100"
            />
            <div className="text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-xl font-extrabold text-slate-900">{profile.displayName}</h1>
                <span className="w-fit mx-auto sm:mx-0 text-xs px-2.5 py-0.5 rounded-full bg-luxury-blue-50 text-luxury-blue-900 font-bold uppercase tracking-wider">{profile.niche}</span>
              </div>
              <p className="text-xs font-mono text-slate-400">@{profile.handle}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-medium text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{profile.city}, {profile.state}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>{profile.primaryLanguage} ({profile.secondaryLanguages.join(", ")})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{profile.followerCount.toLocaleString()} followers</span>
                </div>
              </div>

              <p className="text-xs text-slate-655 leading-relaxed pt-2">{profile.bio}</p>
            </div>
          </div>

          {/* ATI Widget Component */}
          {atiScore && <ATIScoreCard score={atiScore} />}

          {/* Past collaborations */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Collaboration Social Proof</h3>
            <div className="divide-y divide-slate-100">
              {collabs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No historical collaborations recorded yet.</p>
              ) : (
                collabs.map((c: any) => (
                  <div key={c.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{c.brandName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{c.outcome}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{c.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Offer Pitch Panel */}
        <div className="md:col-span-1">
          
          {/* If NOT logged in */}
          {!currentUser?.user && (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-center">
              <h3 className="text-sm font-bold text-slate-800">Propose Collaboration</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you representing a brand? Sign in to submit a structured post proposal and negotiate direct campaign terms with this creator.
              </p>
              <Link
                href="/brand/login"
                className="w-full py-2.5 rounded-lg bg-luxury-purple-500 hover:bg-luxury-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors"
              >
                <span>Login as Brand</span>
              </Link>
            </div>
          )}

          {/* If logged in as Creator themselves */}
          {isCreatorSelf && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs text-center space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">My Public Page</h3>
              <p className="text-xs text-slate-500">This is how brands see your profile in the Discover search directory.</p>
              <Link 
                href="/creator/dashboard"
                className="w-full py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold block border border-slate-100"
              >
                Return to Dashboard
              </Link>
            </div>
          )}

          {/* If logged in as Brand */}
          {isBrand && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{t("campaignProposal")}</h3>
                <p className="text-xs text-slate-500 mt-1">Submit your budget and campaign details.</p>
              </div>

              {offerError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100">
                  {offerError}
                </div>
              )}

              <form onSubmit={handleSubmitOffer} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t("deliverableType")}</label>
                  <select
                    value={deliverableType}
                    onChange={(e) => setDeliverableType(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none"
                  >
                    <option value="Instagram Reel">Instagram Reel</option>
                    <option value="Instagram Video">Instagram Video</option>
                    <option value="YouTube Video">YouTube Video</option>
                    <option value="YouTube Short">YouTube Short</option>
                    <option value="Bilingual Campaign Post">Bilingual Campaign Post</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t("offeredAmount")} (₹)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-luxury-purple-500 focus:border-transparent font-mono"
                    placeholder="e.g. 5000"
                  />
                  {rateRange && (
                    <span className="block text-[9px] text-slate-400 mt-1">
                      {t("recommendedRange")}: <strong>₹{rateRange.min.toLocaleString()} - ₹{rateRange.max.toLocaleString()}</strong>
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t("briefDetails")}</label>
                  <textarea
                    required
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-luxury-purple-500 focus:border-transparent min-h-[120px]"
                    placeholder="Provide details about the post script, product mentions, and timeline guidelines..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={offerLoading}
                  className="w-full py-3 px-4 rounded-lg bg-luxury-purple-500 hover:bg-luxury-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  {offerLoading ? (
                    <span>Submitting offer...</span>
                  ) : (
                    <>
                      <span>{t("submitOffer")}</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
