"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSelector from "@/components/LanguageSelector";
import ATIScoreCard from "@/components/ATIScoreCard";

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Karnataka", "Maharashtra", "Punjab", "Tamil Nadu", "West Bengal"
];

const LANGUAGES = [
  "Assamese", "Bengali", "Bhojpuri", "English", "Hindi", "Kannada", "Marathi", "Punjabi", "Tamil", "Telugu"
];

const NICHES = [
  "Beauty", "Comedy", "Education", "Entertainment", "Finance", "Food", "Tech", "Travel"
];

export default function CreatorOnboarding() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Step 1 values
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");

  // Step 2 values
  const [city, setCity] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [primaryLanguage, setPrimaryLanguage] = useState("Tamil");
  const [secLangs, setSecLangs] = useState<string[]>([]);
  const [niche, setNiche] = useState("Food");
  const [followerCount, setFollowerCount] = useState("10000");

  // Step 3 values (calculated results)
  const [atiResult, setAtiResult] = useState<any>(null);
  const [onboardingError, setOnboardingError] = useState("");

  const [igConnecting, setIgConnecting] = useState(false);
  const [igConnected, setIgConnected] = useState(false);

  const handleConnectInstagram = () => {
    setIgConnecting(true);
    setTimeout(() => {
      setIgConnecting(false);
      setIgConnected(true);
      setFollowerCount("22000");
      setPrimaryLanguage("Tamil");
      setState("Tamil Nadu");
      setCity("Chennai");
      setNiche("Food");
      setSecLangs(["English", "Hindi"]);
      if (!bio) {
        setBio("Passionate home chef showcasing traditional Tamil unboxing and recipes.");
      }
    }, 1200);
  };

  const handleToggleLang = (lang: string) => {
    if (secLangs.includes(lang)) {
      setSecLangs(secLangs.filter((l) => l !== lang));
    } else {
      setSecLangs([...secLangs, lang]);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!displayName || !handle) {
        setOnboardingError("Display name and handle are required.");
        return;
      }
      setOnboardingError("");
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardingError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/creator/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          handle,
          bio,
          city,
          state,
          primaryLanguage,
          secondaryLanguages: secLangs,
          niche,
          followerCount: parseInt(followerCount) || 5000
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setOnboardingError(data.error || "Failed to save profile.");
        setSubmitting(false);
      } else {
        setAtiResult(data.atiScore);
        setStep(3);
        setSubmitting(false);
      }
    } catch (err) {
      setOnboardingError("Connection error.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-luxury-blue-500 to-luxury-purple-500 flex items-center justify-center text-white font-bold text-lg">C</span>
            <span className="font-bold text-xl tracking-tight text-slate-800">{t("appName")}</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest hidden sm:block">{t("onboarding")}</div>
          </div>
        </div>
      </header>

      {/* Main Form container */}
      <main className="flex-1 flex items-center justify-center p-6 md:py-12">
        <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
          
          {/* Progress Indicators */}
          {step < 3 && (
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-luxury-blue-900 text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
                <span className="text-xs font-semibold text-slate-700">{t("basicInfo")}</span>
              </div>
              <div className="flex-1 h-[2px] bg-slate-100" />
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-luxury-blue-900 text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
                <span className="text-xs font-semibold text-slate-700">{t("reachLangs")}</span>
              </div>
            </div>
          )}

          {onboardingError && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
              {onboardingError}
            </div>
          )}

          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Let&apos;s get to know you</h2>
                <p className="text-xs text-slate-500 mt-1">First, set up your public profile identity.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-blue-500 focus:border-transparent"
                  placeholder="e.g. Priya Sharma"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Unique Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-semibold font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                    className="block w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-blue-500 focus:border-transparent font-mono"
                    placeholder="priya_cooks"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Profile Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-blue-500 focus:border-transparent min-h-[100px]"
                  placeholder="Tell brands about your channel and audience..."
                />
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3 px-4 rounded-lg bg-luxury-blue-900 hover:bg-luxury-blue-900/90 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: REACH & LANGUAGES */}
          {step === 2 && (
            <form onSubmit={handleOnboardSubmit} className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-slate-800">Instagram Insights SSO Integration</h4>
                  <p className="text-[10px] text-slate-400">Instantly fetch follower counts and regional language comment ratios directly.</p>
                </div>
                <button
                  type="button"
                  disabled={igConnecting}
                  onClick={handleConnectInstagram}
                  className={`py-2 px-4 rounded-lg text-[11px] font-bold shadow-2xs transition-all cursor-pointer ${
                    igConnected 
                      ? 'bg-green-50 text-green-700 border border-green-150' 
                      : 'bg-gradient-to-r from-pink-500 to-luxury-purple-500 text-white hover:from-pink-650 hover:to-luxury-purple-600'
                  }`}
                >
                  {igConnecting ? "Connecting Graph API..." : igConnected ? "Connected (Priya Sharma)" : "Connect Instagram"}
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Follower Count</label>
                  <input
                    type="number"
                    required
                    value={followerCount}
                    onChange={(e) => setFollowerCount(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-blue-500 focus:border-transparent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Niche</label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm bg-white focus:outline-none"
                  >
                    {NICHES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-blue-500 focus:border-transparent"
                    placeholder="e.g. Pune"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm bg-white focus:outline-none"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Language</label>
                <select
                  value={primaryLanguage}
                  onChange={(e) => setPrimaryLanguage(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm bg-white focus:outline-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Secondary Languages</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {LANGUAGES.map((lang) => {
                    if (lang === primaryLanguage) return null;
                    const selected = secLangs.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleToggleLang(lang)}
                        className={`text-xs px-3 py-2 rounded-lg border text-left flex items-center justify-between font-medium ${selected ? 'border-luxury-blue-500 bg-luxury-blue-50/50 text-luxury-blue-900 font-semibold' : 'border-slate-100 bg-slate-50 text-slate-655'}`}
                      >
                        <span>{lang}</span>
                        {selected && <span className="w-1.5 h-1.5 rounded-full bg-luxury-blue-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 py-3 px-4 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-lg bg-luxury-purple-500 hover:bg-luxury-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing trust...</span>
                    </>
                  ) : (
                    <>
                      <span>{t("calculateATI")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SCORE REVEAL */}
          {step === 3 && atiResult && (
            <div className="text-center space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold shadow-xs border border-green-100">
                <CheckCircle2 className="w-4 h-4" />
                <span>Onboarding completed successfully!</span>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Your Creato Score Card</h2>
                <p className="text-xs text-slate-500 mt-2">
                  Our algorithm has scanned your audience signals and generated your initial trust metrics.
                </p>
              </div>

              <div className="flex justify-center max-w-md mx-auto">
                <ATIScoreCard score={atiResult} />
              </div>

              <button
                type="button"
                onClick={() => router.push("/creator/dashboard")}
                className="w-full py-3 px-4 rounded-lg bg-luxury-purple-500 hover:bg-luxury-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>Enter Creator Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
