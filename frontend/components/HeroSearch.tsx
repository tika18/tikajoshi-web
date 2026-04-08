"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, ArrowRight, TrendingUp, Zap, BookOpen, Car } from "lucide-react";

const searchData = [
  { keywords: ["voice", "speak", "typing", "ai"], title: "Voice to Text AI", link: "/tools/voice-to-text", icon: "🎙️", tag: "Tool" },
  { keywords: ["pdf", "convert", "merge"], title: "PDF Tools", link: "/tools/img-to-pdf", icon: "📄", tag: "Tool" },
  { keywords: ["bike", "scooter", "car", "vehicle", "pulsar"], title: "Vehicle Reviews", link: "/vehicles", icon: "🏍️", tag: "Vehicles" },
  { keywords: ["news"], title: "Latest News", link: "/news", icon: "📰", tag: "News" },
  { keywords: ["result", "tu", "neb", "see", "ioe"], title: "Exam Results Hub", link: "/tools/tu-result", icon: "🎓", tag: "Results" },
  { keywords: ["loksewa", "lok sewa", "psc"], title: "Loksewa Prep", link: "/study/loksewa", icon: "📋", tag: "Study" },
  { keywords: ["share", "nepse", "market", "stock"], title: "NEPSE Share Market", link: "/market", icon: "📈", tag: "Market" },
  { keywords: ["qr", "qr code"], title: "QR Generator", link: "/tools/qr-generator", icon: "📷", tag: "Tool" },
  { keywords: ["cricket", "football", "live", "sports"], title: "Live Sports", link: "/chill-zone", icon: "🏏", tag: "Chill" },
  { keywords: ["compress", "image", "photo"], title: "Image Compressor", link: "/tools/compressor", icon: "🗜️", tag: "Tool" },
];

const trending = [
  { label: "TU Result", href: "/tools/tu-result", icon: "🎓" },
  { label: "Loksewa", href: "/study/loksewa", icon: "📋" },
  { label: "NEPSE Live", href: "/market", icon: "📈" },
  { label: "Live Cricket", href: "/chill-zone", icon: "🏏" },
  { label: "Voice AI", href: "/tools/voice-to-text", icon: "🎙️" },
];

const tagColors: Record<string, string> = {
  Tool: "bg-violet-500/15 text-violet-300",
  Study: "bg-emerald-500/15 text-emerald-300",
  Market: "bg-cyan-500/15 text-cyan-300",
  News: "bg-blue-500/15 text-blue-300",
  Results: "bg-amber-500/15 text-amber-300",
  Vehicles: "bg-orange-500/15 text-orange-300",
  Chill: "bg-pink-500/15 text-pink-300",
};

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof searchData>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const q = query.toLowerCase();
      setResults(searchData.filter(item =>
        item.keywords.some(k => k.includes(q)) || item.title.toLowerCase().includes(q)
      ));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 pt-20 pb-16 z-10">

      {/* Floating orbs behind hero */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-cyan-600/10 blur-[80px] pointer-events-none" />

      {/* Badge */}
      <div className="animate-fade-up delay-1 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-primary/20 text-xs font-semibold text-primary uppercase tracking-widest shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Nepal's #1 Student Platform
        </div>
      </div>

      {/* Headline */}
      <div className="animate-fade-up delay-2 text-center mb-4 max-w-4xl">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight">
          <span className="text-foreground block">Tools for</span>
          <span className="shimmer-text block mt-1">Smart Minds</span>
        </h1>
      </div>

      {/* Subheadline */}
      <div className="animate-fade-up delay-3 mb-10">
        <p className="text-muted-foreground text-center text-base md:text-lg max-w-xl leading-relaxed">
          IOE Notes · Loksewa Prep · NEPSE Live · TU Results · Live Sports<br />
          <span className="text-muted-foreground/80 text-sm">सबै एकै ठाउँमा — free, fast, always updated</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="animate-fade-up delay-4 w-full max-w-2xl relative z-20">
        <div className={`relative rounded-2xl transition-all duration-300 ${focused ? "grad-border" : ""}`}>
          <div className={`flex items-center bg-card rounded-2xl px-5 py-4 gap-3 transition-all duration-300 border ${
            focused
              ? "border-primary/50 shadow-lg shadow-primary/10"
              : "border-border hover:border-border/80"
          }`}>
            <Search size={18} className={`shrink-0 transition-colors ${focused ? "text-primary" : "text-muted-foreground"}`} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tools, results, news..."
              className="w-full bg-transparent outline-none text-foreground text-base placeholder:text-muted-foreground/60 font-medium"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-slate-600 hover:text-white transition shrink-0 text-xs"
              >✕</button>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {results.length > 0 && focused && (
          <div className="absolute top-full left-0 right-0 mt-3 glass-card rounded-2xl overflow-hidden shadow-2xl shadow-black/60 z-50">
            {results.map((item, i) => (
              <Link
                key={i}
                href={item.link}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/6 transition border-b border-white/4 last:border-0 group"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-sm text-slate-200 group-hover:text-white transition flex-1">{item.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColors[item.tag] || "bg-white/10 text-slate-400"}`}>
                  {item.tag}
                </span>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Trending Tags */}
      <div className="animate-fade-up delay-5 mt-8 flex flex-wrap justify-center gap-2">
        <span className="text-slate-600 text-xs font-medium flex items-center gap-1 mr-1">
          <TrendingUp size={12} /> Trending:
        </span>
        {trending.map((t, i) => (
          <Link
            key={i}
            href={t.href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/6 text-xs font-medium text-slate-400 hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/8 transition"
          >
            <span>{t.icon}</span> {t.label}
          </Link>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-float opacity-40">
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-white/40 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}