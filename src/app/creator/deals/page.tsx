"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Inbox, MessageSquare } from "lucide-react";

export default function CreatorDeals() {
  const router = useRouter();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = async () => {
    try {
      const res = await fetch("/api/deals");
      if (!res.ok) {
        router.push("/creator/login");
        return;
      }
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (e) {
      console.error("Fetch deals error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-luxury-purple-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/creator/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="font-bold text-xl tracking-tight text-slate-800">My Deals</div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Campaign Collaboration Inbox</h1>

        {deals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center gap-4 text-slate-400">
            <Inbox className="w-12 h-12 opacity-30 text-luxury-purple-500" />
            <div className="space-y-1">
              <p className="font-bold text-slate-700">No active offers</p>
              <p className="text-xs max-w-sm">When brands browse your profile on the Discover directory and submit proposals, they will show up here.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {deals.map((d) => (
                <Link 
                  key={d.id} 
                  href={`/creator/deals/${d.id}`}
                  className="block p-6 hover:bg-slate-50/50 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-md font-bold text-slate-800 group-hover:text-luxury-purple-600 transition-colors">
                          {d.brand?.companyName || "Brand"}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 font-semibold border border-slate-100">
                          {d.deliverableType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 max-w-xl line-clamp-1">{d.brief}</p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      <div className="text-right">
                        <span className="text-md font-extrabold text-slate-900 tabular-nums">₹{d.amount.toLocaleString()}</span>
                        <span className="block text-[10px] text-slate-400 font-medium">Offered Amount</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                          d.status === 'OFFER_SENT' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          d.status === 'COUNTERED' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                          d.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border border-green-100' :
                          d.status === 'DECLINED' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-slate-50 text-slate-700 border border-slate-100'
                        }`}>
                          {d.status.replace("_", " ")}
                        </span>
                        
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-luxury-purple-500 group-hover:bg-luxury-purple-50 transition-all">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
