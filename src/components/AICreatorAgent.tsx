"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  Briefcase, 
  ChevronRight, 
  MapPin, 
  Bot,
  Loader2,
  DollarSign,
  ArrowRight,
  Edit2,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  briefs?: any[];
  createdAt: Date;
}

export default function AICreatorAgent() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Namaste! I am your **Creato Opportunities Agent**. 🤖\n\nI can help you search for open brand briefs and draft personalized pitches matching your niche, past collabs, and ATI score.\n\nTry asking me: *'Find beauty briefs in West Bengal'* or *'Show me campaigns with budget above 15000'*.",
      createdAt: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Drafting and Confirmation states
  const [draftingBrief, setDraftingBrief] = useState<any>(null);
  const [personalizedNote, setPersonalizedNote] = useState("");
  const [draftText, setDraftText] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdDealId, setCreatedDealId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_CHIPS = [
    "Beauty briefs in West Bengal",
    "Food briefs in Delhi",
    "Comedy campaigns > 15000"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: "user_" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: text.trim(),
      createdAt: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/creator/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", message: text.trim() })
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: "ai_" + Math.random().toString(36).substring(2, 9),
        sender: "ai",
        text: data.message || "I had trouble scanning brand briefs.",
        briefs: data.briefs || [],
        createdAt: new Date()
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: Message = {
        id: "err_" + Math.random().toString(36).substring(2, 9),
        sender: "ai",
        text: "Sorry, I had trouble connecting to the database server.",
        createdAt: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDraft = async (brief: any) => {
    setDraftingBrief(brief);
    setPersonalizedNote("");
    setDraftText("");
    setDraftLoading(true);

    try {
      const res = await fetch("/api/creator/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "draft", briefId: brief.id })
      });
      const data = await res.json();
      setDraftText(data.draft || "");
    } catch (e) {
      console.error(e);
    } finally {
      setDraftLoading(false);
    }
  };

  const handleRegenerateDraft = async () => {
    if (!draftingBrief) return;
    setDraftLoading(true);
    try {
      const res = await fetch("/api/creator/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "draft", 
          briefId: draftingBrief.id, 
          personalizedNote 
        })
      });
      const data = await res.json();
      setDraftText(data.draft || "");
    } catch (e) {
      console.error(e);
    } finally {
      setDraftLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!draftingBrief || !draftText.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/creator/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "submit", 
          briefId: draftingBrief.id, 
          finalMessage: draftText 
        })
      });

      const data = await res.json();
      if (data.success) {
        setCreatedDealId(data.dealId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleStartDraftEvent = (e: CustomEvent) => {
      setIsOpen(true);
      handleStartDraft(e.detail);
    };
    window.addEventListener("startCreatorAgentDraft", handleStartDraftEvent as any);
    return () => {
      window.removeEventListener("startCreatorAgentDraft", handleStartDraftEvent as any);
    };
  }, []);

  return (
    <>
      {/* Floating Sparkles Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-luxury-blue-600 to-luxury-blue-900 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group cursor-pointer border border-white/20"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-xs whitespace-nowrap">
          Opportunities Agent
        </span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => {
              setIsOpen(false);
              setDraftingBrief(null);
              setCreatedDealId(null);
            }}
          />
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl border-l border-slate-100 z-50 flex flex-col justify-between transition-transform duration-300 transform ease-in-out h-full overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-gradient-to-r from-luxury-blue-900 to-luxury-blue-750 text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-luxury-blue-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Opportunities Agent</h3>
                  <span className="text-[9px] text-luxury-blue-200 font-semibold tracking-wider uppercase block">Creators Campaign Scout</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setDraftingBrief(null);
                  setCreatedDealId(null);
                }}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Application Success Screen */}
            {createdDealId ? (
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center gap-6 bg-slate-50/50">
                <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-800">Application Sent Successfully!</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-normal">
                    Your application and personalized pitch have been registered as an active deal proposal.
                  </p>
                </div>
                <Link
                  href={`/creator/deals/${createdDealId}`}
                  onClick={() => {
                    setIsOpen(false);
                    setCreatedDealId(null);
                    setDraftingBrief(null);
                  }}
                  className="py-3 px-6 rounded-lg bg-luxury-blue-900 hover:bg-luxury-blue-900/90 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-colors"
                >
                  <span>Open Deal Room</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : draftingBrief ? (
              // --------------------------------------------------
              // Dynamic Drafting & Review panel
              // --------------------------------------------------
              <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-55/20 flex flex-col justify-start">
                <button
                  onClick={() => setDraftingBrief(null)}
                  className="text-xs font-bold text-luxury-blue-900 hover:underline flex items-center gap-1 mb-2"
                >
                  &larr; Back to Briefs Chat
                </button>

                <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-3xs space-y-2">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-luxury-blue-50 text-luxury-blue-900 font-bold uppercase tracking-wider">
                    {draftingBrief.niche}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800">{draftingBrief.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">{draftingBrief.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-50">
                    <span>Deliverable: {draftingBrief.deliverableType}</span>
                    <span className="text-luxury-purple-600 font-bold">
                      Budget: ₹{draftingBrief.budgetMin.toLocaleString()} - ₹{draftingBrief.budgetMax.toLocaleString()}
                    </span>
                  </div>
                </div>

                {draftLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-luxury-blue-750" />
                    <span className="text-xs text-slate-400 font-semibold">Composing customized pitch...</span>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 flex flex-col justify-start">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Personalized Note / Add-ons</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={personalizedNote}
                          onChange={(e) => setPersonalizedNote(e.target.value)}
                          placeholder="e.g. Can deliver in 3 days, or add reels bundle..."
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-luxury-blue-500"
                        />
                        <button
                          onClick={handleRegenerateDraft}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 shrink-0"
                        >
                          Update Pitch
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-start space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Edit Draft Pitch</label>
                      <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        className="w-full flex-1 min-h-[220px] p-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-luxury-blue-500 font-mono leading-relaxed"
                      />
                    </div>

                    <button
                      onClick={handleSubmitApplication}
                      disabled={submitting}
                      className="w-full py-3 bg-luxury-blue-900 hover:bg-luxury-blue-900/90 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Confirm and Submit Application</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // --------------------------------------------------
              // Regular Chat Log Interface
              // --------------------------------------------------
              <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-55/20 flex flex-col justify-start">
                {messages.map((m) => {
                  const isAI = m.sender === "ai";
                  return (
                    <div key={m.id} className={`flex flex-col gap-1.5 ${isAI ? 'items-start' : 'items-end'}`}>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider px-1">
                        {isAI ? "Agent" : "You"}
                      </span>
                      <div className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-xs leading-relaxed border shadow-3xs whitespace-pre-wrap ${
                        isAI 
                          ? 'bg-white text-slate-850 border-slate-100 rounded-bl-none' 
                          : 'bg-luxury-blue-900 text-white border-luxury-blue-900 rounded-br-none'
                      }`}>
                        {m.text}
                      </div>

                      {/* Display open brief cards inside logs */}
                      {isAI && m.briefs && m.briefs.length > 0 && (
                        <div className="w-full space-y-3 mt-2 pl-1 pr-4">
                          {m.briefs.map((b) => (
                            <div 
                              key={b.id}
                              className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs flex flex-col gap-2.5"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-luxury-purple-50 text-luxury-purple-600 font-bold uppercase tracking-wider">
                                    {b.niche}
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-800 mt-1">{b.title}</h4>
                                  <p className="text-[10px] text-slate-450 mt-0.5">By {b.brand?.companyName || "Brand"}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-bold text-luxury-blue-900 block">
                                    ₹{b.budgetMax.toLocaleString()}
                                  </span>
                                  <span className="text-[8px] text-slate-400 block uppercase">Max Budget</span>
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">{b.description}</p>
                              
                              <button
                                onClick={() => handleStartDraft(b)}
                                className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer mt-1"
                              >
                                <span>Draft Application</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider px-1">Agent</span>
                    <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-100 rounded-bl-none shadow-3xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-luxury-blue-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-luxury-blue-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-luxury-blue-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Input Composer / Suggested query chips */}
            {!createdDealId && !draftingBrief && (
              <div className="p-4 border-t border-slate-150 bg-white space-y-4">
                
                {/* Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Suggested Queries</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 hover:border-luxury-blue-300 hover:bg-luxury-blue-50/50 text-slate-655 font-medium transition-all cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input text */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask Agent to search briefs..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-luxury-blue-500 focus:border-transparent bg-slate-50/50"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputValue.trim()}
                    className="p-2.5 rounded-lg bg-luxury-blue-900 hover:bg-luxury-blue-750 text-white transition-colors flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

          </div>
        </>
      )}
    </>
  );
}
