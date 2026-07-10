"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  Users, 
  Award, 
  ChevronRight, 
  UserCheck, 
  MapPin, 
  MessageSquare,
  Bot
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  matches?: any[];
  createdAt: Date;
}

export default function AIScoutDrawer() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Namaste! I am your **Creato AI Scout**. 🤖\n\nTell me about your campaign target audience, niche, and regional language preferences (e.g. *'Find young female beauty creators in West Bengal'*) and I will instantly search your Supabase database and match you with the best fit!",
      createdAt: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_CHIPS = [
    "Female beauty creators in West Bengal",
    "High trust food creators in Tamil Nadu",
    "Tech creators in Karnataka"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
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
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text.trim() })
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: "ai_" + Math.random().toString(36).substring(2, 9),
        sender: "ai",
        text: data.message || "I encountered an error querying the registry.",
        matches: data.matches || [],
        createdAt: new Date()
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: Message = {
        id: "err_" + Math.random().toString(36).substring(2, 9),
        sender: "ai",
        text: "Sorry, I had trouble connecting to the database server. Please check your connection and try again.",
        createdAt: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI Matchmaker Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-luxury-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group cursor-pointer border border-white/20"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-xs whitespace-nowrap">
          AI Matchmaker
        </span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl border-l border-slate-100 z-50 flex flex-col justify-between transition-transform duration-300 transform ease-in-out h-full overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-gradient-to-r from-luxury-blue-900 to-luxury-purple-900 text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Creato AI Scout</h3>
                  <span className="text-[9px] text-purple-200 font-semibold tracking-wider uppercase block">Conversational Matchmaker</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30 flex flex-col justify-start">
              {messages.map((m) => {
                const isAI = m.sender === "ai";
                return (
                  <div key={m.id} className={`flex flex-col gap-1.5 ${isAI ? 'items-start' : 'items-end'}`}>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider px-1">
                      {isAI ? "AI Matchmaker" : "You"}
                    </span>
                    <div className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-xs leading-relaxed border shadow-3xs whitespace-pre-wrap ${
                      isAI 
                        ? 'bg-white text-slate-850 border-slate-100 rounded-bl-none' 
                        : 'bg-luxury-purple-500 text-white border-luxury-purple-500 rounded-br-none'
                    }`}>
                      {m.text}
                    </div>

                    {/* Matched Creator Cards inside Chat Log */}
                    {isAI && m.matches && m.matches.length > 0 && (
                      <div className="w-full space-y-3 mt-2 pl-1 pr-4">
                        {m.matches.map((c) => (
                          <div 
                            key={c.uid}
                            className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs flex justify-between items-center gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img 
                                src={c.profileImageUrl} 
                                alt={c.displayName} 
                                className="w-9 h-9 rounded-full object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 truncate">{c.displayName}</h4>
                                <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{c.city}, {c.state}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-center">
                                <span className="w-6 h-6 mx-auto rounded-full bg-luxury-purple-50 text-luxury-purple-600 flex items-center justify-center font-bold font-mono text-[10px] border border-luxury-purple-100">
                                  {c.atiScore.overallScore}
                                </span>
                                <span className="text-[8px] text-slate-400 font-bold block mt-0.5 uppercase">ATI</span>
                              </div>

                              <Link
                                href={`/creators/${c.handle}`}
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
                                title="View profile"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider px-1">AI Matchmaker</span>
                  <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-100 rounded-bl-none shadow-3xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-luxury-purple-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-luxury-purple-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-luxury-purple-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Composer / Suggestions */}
            <div className="p-4 border-t border-slate-150 bg-white space-y-4">
              
              {/* Suggested Prompt Chips */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Suggested Queries</span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleSendMessage(chip)}
                      className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 hover:border-luxury-purple-300 hover:bg-luxury-purple-50/50 text-slate-655 font-medium transition-all cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input */}
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
                  placeholder="Ask Scout to match a creator..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-luxury-purple-500 focus:border-transparent bg-slate-50/50"
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="p-2.5 rounded-lg bg-luxury-purple-500 hover:bg-luxury-purple-600 text-white transition-colors flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>
        </>
      )}
    </>
  );
}
