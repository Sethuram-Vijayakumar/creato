"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Shield, Sparkles, Users } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSelector from "@/components/LanguageSelector";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200/40 bg-white/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Creato Logo" className="h-16 object-contain mix-blend-multiply" />
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link href="/creator/login" className="text-xs font-bold text-slate-655 hover:text-luxury-blue-900 transition-colors">{t("creatorPortal")}</Link>
            <Link href="/brand/login" className="text-xs font-bold text-slate-655 hover:text-luxury-purple-600 transition-colors">{t("brandPortal")}</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-16">
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glow-badge text-xs font-semibold self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-status shrink-0"></span>
            <Sparkles className="w-3.5 h-3.5 text-luxury-purple-500" />
            <span>Celebrating regional Indian content creators</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-1">
            {t("heroSlogan")}
          </h1>
          
          <p className="text-sm md:text-md text-slate-550 max-w-2xl mx-auto leading-relaxed">
            {t("heroSubtext")}
          </p>
        </div>

        {/* Two-Sided CTA Section */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          {/* Creator side */}
          <div className="luxury-card p-8 flex flex-col justify-between hover:shadow-xl hover:border-luxury-blue-100 transition-all group duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-blue-50/40 rounded-full blur-xl group-hover:scale-150 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-luxury-blue-50 flex items-center justify-center text-luxury-blue-500 mb-6 group-hover:bg-luxury-blue-500 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-3">{t("creatorPortal")}</h2>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                Get rewarded for your genuine vernacular connection. Join as a creator to discover your dynamic ATI score, access our fair-rate calculator, and receive direct brand collaboration offers.
              </p>
              <ul className="space-y-2 mb-8 text-xs text-slate-400 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-luxury-blue-500" />
                  <span>{t("atiScoreLabel")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-luxury-blue-500" />
                  <span>{t("suggestedPostRate")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-luxury-blue-500" />
                  <span>{t("dealsInbox")}</span>
                </li>
              </ul>
            </div>
            <Link 
              href="/creator/login" 
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 group-hover:-translate-y-1 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <span>{t("imCreator")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Brand side */}
          <div className="luxury-card p-8 flex flex-col justify-between hover:shadow-xl hover:border-luxury-purple-100 transition-all group duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-purple-50/40 rounded-full blur-xl group-hover:scale-150 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-luxury-purple-50 flex items-center justify-center text-luxury-purple-500 mb-6 group-hover:bg-luxury-purple-500 group-hover:text-white transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-3">{t("brandPortal")}</h2>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                Target vernacular communities with precision. Discover vetted creators across 8+ states and languages, view their true local engagement scores, and send transparent offers.
              </p>
              <ul className="space-y-2 mb-8 text-xs text-slate-400 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-luxury-purple-500" />
                  <span>Language & Niche Filtering</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-luxury-purple-500" />
                  <span>Direct Deal Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-luxury-purple-500" />
                  <span>Verified Campaign Outcomes</span>
                </li>
              </ul>
            </div>
            <Link 
              href="/brand/login" 
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 group-hover:-translate-y-1 shadow-md shadow-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <span>{t("imBrand")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="futuristic-divider max-w-4xl mx-auto w-full my-4"></div>

        {/* Explain the ATI Concept */}
        <section className="luxury-card p-8 md:p-12 max-w-4xl mx-auto w-full">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">{t("atiTitle")}</h2>
          
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-lg font-extrabold text-luxury-purple-600 block mb-1">35%</span>
                <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-2">{t("engagementLabel")}</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal mt-2">{t("engagementDesc")}</p>
            </div>
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-lg font-extrabold text-luxury-purple-600 block mb-1">25%</span>
                <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-2">{t("vernacularLabel")}</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal mt-2">{t("vernacularDesc")}</p>
            </div>
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-lg font-extrabold text-luxury-purple-600 block mb-1">20%</span>
                <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-2">{t("communityLabel")}</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal mt-2">{t("communityDesc")}</p>
            </div>
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-lg font-extrabold text-luxury-purple-600 block mb-1">20%</span>
                <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-2">{t("localLabel")}</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal mt-2">{t("localDesc")}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 {t("appName")} Inc. Celebrating regional voices across India.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
