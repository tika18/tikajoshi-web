"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, ArrowRight, TrendingUp } from "lucide-react";

const searchData = [
  { keywords: ["voice", "speak", "typing", "ai"],          title: "Voice to Text AI",    link: "/tools/voice-to-text", icon: "🎙️", tag: "Tool"     },
  { keywords: ["pdf", "convert", "merge"],                  title: "PDF Tools",           link: "/tools/img-to-pdf",    icon: "📄", tag: "Tool"     },
  { keywords: ["bike", "scooter", "car", "vehicle"],        title: "Vehicle Reviews",     link: "/vehicles",            icon: "🏍️", tag: "Vehicles" },
  { keywords: ["result", "tu", "neb", "see", "ioe"],        title: "Exam Results Hub",    link: "/tools/tu-result",     icon: "🎓", tag: "Results"  },
  { keywords: ["loksewa", "lok sewa", "psc"],               title: "Loksewa Prep",        link: "/study/loksewa",       icon: "📋", tag: "Study"    },
  { keywords: ["share", "nepse", "market", "stock"],        title: "NEPSE Share Market",  link: "/market",              icon: "📈", tag: "Market"   },
  { keywords: ["cricket", "football", "live", "sports"],    title: "Live Sports",         link: "/chill-zone",          icon: "🏏", tag: "Chill"    },
  { keywords: ["compress", "image", "photo"],               title: "Image Compressor",    link: "/tools/compressor",    icon: "🗜️", tag: "Tool"     },
];

const tagColors: Record<string, string> = {
  Tool:     "bg-violet-500/15 text-violet-300 border-violet-500/20",
  Study:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  Market:   "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  Results:  "bg-amber-500/15 text-amber-300 border-amber-500/20",
  Vehicles: "bg-orange-500/15 text-orange-300 border-orange-500/20",
  Chill:    "bg-pink-500/15 text-pink-300 border-pink-500/20",
};

const WORDS = [
  { text: "Smart Minds",  colors: ["#a78bfa", "#818cf8", "#67e8f9"] },
  { text: "Live Sports",  colors: ["#f87171", "#fb923c", "#fbbf24"] },
  { text: "Study Hub",    colors: ["#34d399", "#22d3ee", "#60a5fa"] },
  { text: "Future Nepal", colors: ["#c084fc", "#a78bfa", "#f472b6"] },
];

const TYPE_SPEED   = 70;
const DELETE_SPEED = 38;
const PAUSE_MS     = 2600;

function useTypewriter() {
  const [wi,      setWi]      = useState(0);
  const [ci,      setCi]      = useState(0);
  const [del,     setDel]     = useState(false);
  const [display, setDisplay] = useState("");
  const [blink,   setBlink]   = useState(true);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const word = WORDS[wi].text;
    let timer: ReturnType<typeof setTimeout>;

    if (!del) {
      if (ci < word.length) {
        timer = setTimeout(() => {
          setDisplay(word.slice(0, ci + 1));
          setCi(c => c + 1);
        }, TYPE_SPEED);
      } else {
        timer = setTimeout(() => setDel(true), PAUSE_MS);
      }
    } else {
      if (ci > 0) {
        timer = setTimeout(() => {
          setDisplay(word.slice(0, ci - 1));
          setCi(c => c - 1);
        }, DELETE_SPEED);
      } else {
        setDel(false);
        setWi(i => (i + 1) % WORDS.length);
      }
    }
    return () => clearTimeout(timer);
  }, [ci, del, wi]);

  return { display, colors: WORDS[wi].colors, blink };
}

export default function HeroSearch() {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<typeof searchData>([]);
  const [focused, setFocused] = useState(false);
  const { display, colors, blink } = useTypewriter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const q = query.toLowerCase();
      setResults(searchData.filter(item =>
        item.keywords.some(k => k.includes(q)) || item.title.toLowerCase().includes(q)
      ));
    } else setResults([]);
  }, [query]);

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-4 pt-24 pb-8 overflow-hidden">

      {/* ── PREMIUM BACKGROUND ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 70% 55% at 50% -5%, rgba(99,102,241,0.16) 0%, transparent 58%),
            radial-gradient(ellipse 50% 40% at 85% 85%, rgba(6,182,212,0.09) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 10% 70%, rgba(139,92,246,0.07) 0%, transparent 55%)
          `
        }} />
        <div className="absolute top-[8%]  left-[12%] w-96 h-96 rounded-full bg-violet-600/8  blur-[120px] animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute top-[15%] right-[8%] w-80 h-80 rounded-full bg-cyan-600/7    blur-[100px] animate-pulse" style={{ animationDuration: "7s", animationDelay: "1s" }} />
        <div className="absolute bottom-[15%] left-[35%] w-72 h-72 rounded-full bg-indigo-600/6 blur-[100px] animate-pulse" style={{ animationDuration: "9s", animationDelay: "2s" }} />
        {/* Fine grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)",
          backgroundSize: "52px 52px"
        }} />
        <div className="absolute top-[63%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/12 to-transparent" />
      </div>

      {/* ── BADGE ── */}
      <div className="relative z-10 mb-8">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-xs font-bold text-slate-300 uppercase tracking-[0.18em]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          Nepal's #1 Student Platform
        </div>
      </div>

      {/* ── HEADLINE ── */}
      <div className="relative z-10 text-center mb-7 max-w-5xl">
        <h1 className="font-black leading-[0.88] tracking-tight select-none">
          {/* Static line */}
          <span className="block text-[clamp(2.2rem,5.5vw,4.2rem)] text-white/75 mb-3 font-[900] tracking-tight">
            Tools for
          </span>

          {/* Typewriter line */}
          <span className="block text-[clamp(2.8rem,8.5vw,6.8rem)] font-[900] min-h-[1.1em] leading-none">
           <span
  className="text-transparent bg-clip-text"
  style={{
    backgroundImage: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
    transition: "background-image 0.6s ease",
  }}
>
  {display}
</span>
            {/* Blinking cursor — separate span, never shows | character */}
            <span
              style={{
                display: "inline-block",
                width: "3px",
                height: "0.82em",
                borderRadius: "2px",
                background: colors[0],
                marginLeft: "6px",
                verticalAlign: "middle",
                opacity: blink ? 1 : 0,
                transition: "opacity 0.1s, background 0.5s",
                boxShadow: `0 0 10px ${colors[0]}`,
              }}
            />
          </span>
        </h1>
      </div>

      {/* ── SUBHEADLINE ── */}
      <div className="relative z-10 mb-10 text-center">
        <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
          IOE Notes · Loksewa Prep · NEPSE Live · TU Results · Live Cricket
        </p>
        <p className="text-slate-600 text-sm mt-1.5">
          सबै एकै ठाउँमा —{" "}
          <span className="text-emerald-400 font-semibold">free</span>, fast, always updated
        </p>
      </div>

      {/* ── SEARCH ── */}
      <div className="relative z-20 w-full max-w-2xl">
        <div className="relative">
          {focused && (
            <div className="absolute -inset-[1.5px] rounded-2xl z-0 pointer-events-none">
              <div className="absolute inset-0 rounded-2xl" style={{
                background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
                opacity: 0.65,
                filter: "blur(1px)",
              }} />
            </div>
          )}
          <div className={`relative z-10 flex items-center bg-[#070c14]/90 backdrop-blur-xl rounded-2xl px-5 py-4 gap-3 border transition-all duration-300 ${focused ? "border-transparent" : "border-white/8 hover:border-white/14"}`}
            style={focused ? { boxShadow: `0 6px 36px ${colors[0]}20` } : {}}>
            <Search size={18} className="shrink-0 transition-colors"
              style={{ color: focused ? colors[0] : "#475569" }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tools, results, live sports..."
              className="w-full bg-transparent outline-none text-white text-base placeholder:text-slate-600 font-medium"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="text-slate-600 hover:text-white transition shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">
                ✕
              </button>
            )}
          </div>
        </div>

        {results.length > 0 && focused && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-[#070c14]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/70 z-50">
            {results.map((item, i) => (
              <Link key={i} href={item.link}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition border-b border-white/4 last:border-0 group">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-sm text-slate-200 group-hover:text-white transition flex-1">{item.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagColors[item.tag] || "bg-white/10 text-slate-400"}`}>
                  {item.tag}
                </span>
                <ArrowRight size={14} className="text-slate-600 group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── TRENDING ── */}
      <div className="relative z-10 mt-7 flex flex-wrap justify-center gap-2">
        <span className="text-slate-600 text-xs font-medium flex items-center gap-1 mr-1">
          <TrendingUp size={11} /> Trending:
        </span>
        {[
          { label: "TU Result", href: "/tools/tu-result",       icon: "🎓" },
          { label: "IPL Live",  href: "/chill-zone",            icon: "🏏" },
          { label: "Loksewa",  href: "/study/loksewa",          icon: "📋" },
          { label: "NEPSE",    href: "/market",                 icon: "📈" },
          { label: "Voice AI", href: "/tools/voice-to-text",    icon: "🎙️" },
        ].map((t, i) => (
          <Link key={i} href={t.href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/8 text-xs font-medium text-slate-400 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/8 transition">
            <span>{t.icon}</span> {t.label}
          </Link>
        ))}
      </div>

      {/* ── SCROLL INDICATOR ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-25 animate-bounce">
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}