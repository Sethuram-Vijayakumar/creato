"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  DollarSign, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  ShieldCheck 
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSelector from "@/components/LanguageSelector";

export default function CreatorDealRoom() {
  const router = useRouter();
  const params = useParams();
  const dealId = params.id as string;
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [dealData, setDealData] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMsg, setCounterMsg] = useState("");
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchDealDetails = async () => {
    try {
      const res = await fetch(`/api/deals/${dealId}`);
      if (!res.ok) {
        router.push("/creator/login");
        return;
      }
      const data = await res.json();
      setDealData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/deals/${dealId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchDealDetails(), fetchMessages()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
    
    // Poll every 2 seconds
    const interval = setInterval(() => {
      fetchDealDetails();
      fetchMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [dealId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`/api/deals/${dealId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async (actionType: "ACCEPT" | "DECLINE" | "COUNTER" | "DELIVER") => {
    setError("");
    setActionLoading(true);

    try {
      const body: any = { action: actionType };
      if (actionType === "COUNTER") {
        body.counterAmount = counterAmount;
        body.message = counterMsg;
      }

      const res = await fetch(`/api/deals/${dealId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Action failed.");
      } else {
        setShowCounterForm(false);
        setCounterAmount("");
        setCounterMsg("");
        fetchDealDetails();
        fetchMessages();
      }
    } catch (e) {
      setError("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-luxury-purple-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading deal room...</p>
        </div>
      </div>
    );
  }

  if (!dealData || !dealData.deal) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Deal not found</h2>
          <Link href="/creator/deals" className="text-sm text-luxury-purple-600 hover:underline mt-2 inline-block">Back to inbox</Link>
        </div>
      </div>
    );
  }

  const { deal, brand, rateRange, currentUserId } = dealData;

  // Fairness check calculations
  let fairnessBanner = null;
  if (rateRange && (deal.status === "OFFER_SENT" || deal.status === "COUNTERED")) {
    const isUnderpriced = deal.amount < rateRange.min;
    const isOverpriced = deal.amount > rateRange.max;

    if (isUnderpriced) {
      fairnessBanner = (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex gap-3 text-xs text-orange-850 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-800 mb-1">{t("pricingValuation")}: Underpriced Offer</h4>
            <p className="leading-relaxed text-slate-700">
              The offered amount of <strong className="text-slate-900">₹{deal.amount.toLocaleString()}</strong> is below your recommended post range of <strong className="text-slate-900">₹{rateRange.min.toLocaleString()} - ₹{rateRange.max.toLocaleString()}</strong>. Proposing a counter-offer is highly recommended.
            </p>
          </div>
        </div>
      );
    } else if (isOverpriced) {
      fairnessBanner = (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3 text-xs text-green-800 shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-800 mb-1">{t("pricingValuation")}: Premium Offer</h4>
            <p className="leading-relaxed text-slate-750">
              The offered amount of <strong className="text-slate-900">₹{deal.amount.toLocaleString()}</strong> exceeds your recommended rate range! This is an excellent campaign opportunity.
            </p>
          </div>
        </div>
      );
    } else {
      fairnessBanner = (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3 text-xs text-blue-800 shadow-2xs">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-800 mb-1">{t("pricingValuation")}: Fair Offer</h4>
            <p className="leading-relaxed text-slate-750">
              The offered amount of <strong className="text-slate-900">₹{deal.amount.toLocaleString()}</strong> fits perfectly within your suggested post rate range of <strong className="text-slate-900">₹{rateRange.min.toLocaleString()} - ₹{rateRange.max.toLocaleString()}</strong>.
            </p>
          </div>
        </div>
      );
    }
  }

  const isMyTurn = deal.status === "OFFER_SENT";

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/creator/deals" className="flex items-center gap-2 text-sm font-semibold text-slate-655 hover:text-slate-905 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Inbox</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold font-mono">{deal.id}</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                deal.status === 'OFFER_SENT' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                deal.status === 'COUNTERED' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                deal.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border border-green-100' :
                deal.status === 'DECLINED' ? 'bg-red-50 text-red-700 border border-red-100' :
                'bg-slate-50 text-slate-700 border border-slate-100'
              }`}>
                {deal.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid lg:grid-cols-3 gap-8 items-stretch h-[calc(100vh-8rem)]">
        
        {/* Left Side: Campaign Brief, ATI Fairness Banner, Action Cards */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
          
          {/* Brief Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3">{t("campaignProposal")}</h2>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Partner Brand</span>
              <span className="text-sm font-bold text-slate-850 mt-1 block">{brand?.companyName}</span>
              <span className="text-xs text-slate-500 font-medium block">{brand?.industry} &bull; {brand?.city}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t("deliverableType")}</span>
              <span className="text-xs font-semibold text-slate-700 mt-1 block">{deal.deliverableType}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t("offeredAmount")}</span>
              <span className="text-xl font-extrabold text-luxury-purple-600 tabular-nums">₹{deal.amount.toLocaleString()}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t("briefDetails")}</span>
              <p className="text-xs text-slate-655 leading-relaxed mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">{deal.brief}</p>
            </div>
          </div>

          {/* Fairness Banner */}
          {fairnessBanner}

          {/* Action card if pending */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {isMyTurn && !showCounterForm && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800">{t("actionRequired")}</h3>
              <p className="text-xs text-slate-500">You received this campaign proposal. Make your decision:</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction("ACCEPT")}
                  disabled={actionLoading}
                  className="py-2.5 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{t("acceptOffer")}</span>
                </button>
                
                <button
                  onClick={() => handleAction("DECLINE")}
                  disabled={actionLoading}
                  className="py-2.5 px-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-100 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>{t("decline")}</span>
                </button>
              </div>

              <button
                onClick={() => setShowCounterForm(true)}
                className="w-full py-2.5 px-4 rounded-lg bg-luxury-blue-900 hover:bg-luxury-blue-900/90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                <span>{t("submitCounter")}</span>
              </button>
            </div>
          )}

          {/* Counter Form */}
          {showCounterForm && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800">{t("submitCounter")}</h3>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Counter Amount (₹)</label>
                <input
                  type="number"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-blue-500 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Reason / Message</label>
                <textarea
                  value={counterMsg}
                  onChange={(e) => setCounterMsg(e.target.value)}
                  placeholder="Explain why you are proposing this rate..."
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-805 text-xs focus:outline-none focus:ring-2 focus:ring-luxury-blue-500 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCounterForm(false)}
                  className="py-2 px-3 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("COUNTER")}
                  disabled={actionLoading || !counterAmount}
                  className="py-2 px-3 bg-luxury-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-luxury-blue-900/90 shadow-sm disabled:opacity-50"
                >
                  Send Counter
                </button>
              </div>
            </div>
          )}

          {/* Progress checks */}
          {deal.status === "ACCEPTED" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs text-center">
              <p className="text-xs text-slate-500">Wait for brand to put the campaign in production, or notify progress.</p>
              <div className="w-full py-2.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                Offer Accepted &. Awaiting Production
              </div>
            </div>
          )}

          {deal.status === "IN_PRODUCTION" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-700">Production Phase</h3>
              <p className="text-xs text-slate-500">You are currently filming/designing the deliverables. Once finished, submit it:</p>
              <button
                onClick={() => handleAction("DELIVER")}
                disabled={actionLoading}
                className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Mark Deliverables Delivered</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Message Thread */}
        <div className="lg:col-span-2 flex flex-col bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden h-full">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-800">{t("negotiationChat")}</h3>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/20">
            {messages.map((m) => {
              const isMe = m.senderUid === currentUserId;
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed border shadow-2xs whitespace-pre-wrap ${
                    isMe 
                      ? 'bg-luxury-blue-900 text-white border-luxury-blue-900 rounded-br-none' 
                      : 'bg-white text-slate-850 border-slate-100 rounded-bl-none'
                  }`}>
                    {m.message}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-3 bg-white">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send message to brand..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-luxury-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-luxury-purple-500 hover:bg-luxury-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors shrink-0"
            >
              <span>{t("send")}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}
