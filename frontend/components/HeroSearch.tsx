"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ArrowRight, TrendingUp, Sparkles,
  Clock, ChevronRight, ChevronLeft, X,
} from "lucide-react";

/* ─────────────────────────── DATA ─────────────────────────── */
const searchData = [
  { keywords: ["voice", "speak", "typing", "ai"],        title: "Voice to Text AI",   link: "/tools/voice-to-text", icon: "🎙️", tag: "Tool"     },
  { keywords: ["pdf", "convert", "merge"],                title: "PDF Tools",          link: "/tools/img-to-pdf",    icon: "📄", tag: "Tool"     },
  { keywords: ["bike", "scooter", "car", "vehicle"],      title: "Vehicle Reviews",    link: "/vehicles",            icon: "🏍️", tag: "Vehicles" },
  { keywords: ["result", "tu", "neb", "see", "ioe"],     title: "Exam Results Hub",   link: "/tools/tu-result",     icon: "🎓", tag: "Results"  },
  { keywords: ["loksewa", "lok sewa", "psc"],             title: "Loksewa Prep",       link: "/study/loksewa",       icon: "📋", tag: "Study"    },
  { keywords: ["share", "nepse", "market", "stock"],     title: "NEPSE Share Market", link: "/market",              icon: "📈", tag: "Market"   },
  { keywords: ["cricket", "football", "live", "sports"], title: "Live Sports",        link: "/chill-zone",          icon: "🏏", tag: "Chill"    },
  { keywords: ["compress", "image", "photo"],             title: "Image Compressor",   link: "/tools/compressor",   icon: "🗜️", tag: "Tool"     },
];

// Trending tags — click garne bittikai direct navigate huncha
const trendingTags = [
  { label: "Live Sports",  link: "/chill-zone"    },
  { label: "NEPSE",        link: "/market"        },
  { label: "Loksewa",      link: "/study/loksewa" },
  { label: "IOE Notes",    link: "/study/ioe"     },
  { label: "Bike Reviews", link: "/vehicles"      },
];

const tagColors: Record<string, string> = {
  Tool:     "bg-violet-500/15 text-violet-300 border border-violet-500/25",
  Study:    "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  Market:   "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25",
  Results:  "bg-amber-500/15 text-amber-300 border border-amber-500/25",
  Vehicles: "bg-orange-500/15 text-orange-300 border border-orange-500/25",
  Chill:    "bg-pink-500/15 text-pink-300 border border-pink-500/25",
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

const featuredBlogs = [
  {
    id: 1,
    tag: "AI & Tech",
    tagColor: "bg-blue-500",
    title: "The Future of AI in Nepal's Education System",
    desc: "How ChatGPT and Gemini are reshaping how IOE and TU students learn in 2024.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop",
    author: "Tech Desk",
    readTime: "4 min",
    link: "/news/tech",
  },
  {
    id: 2,
    tag: "Auto Review",
    tagColor: "bg-orange-500",
    title: "Triumph Speed 400 Arrives in Nepal",
    desc: "Is it the ultimate Royal Enfield killer? Full specs, price, and performance breakdown.",
    image: "https://images.unsplash.com/photo-1695634065664-946cebaefdbd?q=80&w=1200&auto=format&fit=crop",
    author: "Auto Expert",
    readTime: "6 min",
    link: "/vehicles",
  },
  {
    id: 3,
    tag: "Sports",
    tagColor: "bg-emerald-500",
    title: "Nepal's Historic T20 World Cup Run",
    desc: "Exclusive insights, player stats, and what to expect from upcoming clashes.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop",
    author: "Sports Live",
    readTime: "3 min",
    link: "/news/sports",
  },
];

/* ─────────────────────────── TYPEWRITER ─────────────────────────── */
function useTypewriter() {
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  const [display, setDisplay] = useState("");
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const word = WORDS[wi].text;
    let timer: ReturnType<typeof setTimeout>;
    if (!del) {
      if (ci < word.length) {
        timer = setTimeout(() => {
          setDisplay(word.slice(0, ci + 1));
          setCi((c) => c + 1);
        }, TYPE_SPEED);
      } else {
        timer = setTimeout(() => setDel(true), PAUSE_MS);
      }
    } else {
      if (ci > 0) {
        timer = setTimeout(() => {
          setDisplay(word.slice(0, ci - 1));
          setCi((c) => c - 1);
        }, DELETE_SPEED);
      } else {
        setDel(false);
        setWi((i) => (i + 1) % WORDS.length);
      }
    }
    return () => clearTimeout(timer);
  }, [ci, del, wi]);

  return { display, colors: WORDS[wi].colors, blink };
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
export default function HeroSearch() {
  const router = useRouter();
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState<typeof searchData>([]);
  const [focused,     setFocused]     = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused,      setPaused]      = useState(false);
  const [touchStart,  setTouchStart]  = useState<number | null>(null);

  const { display, colors, blink } = useTypewriter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const q = query.toLowerCase();
      setResults(
        searchData.filter(
          (item) =>
            item.keywords.some((k) => k.includes(q)) ||
            item.title.toLowerCase().includes(q)
        )
      );
    } else {
      setResults([]);
    }
  }, [query]);

  const nextSlide = () => setActiveSlide((p) => (p + 1) % featuredBlogs.length);
  const prevSlide = () => setActiveSlide((p) => (p === 0 ? featuredBlogs.length - 1 : p - 1));

  useEffect(() => {
    if (paused) return;
    const t = setInterval(nextSlide, 6000);
    return () => clearInterval(t);
  }, [paused]);

  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? nextSlide() : prevSlide();
    setTouchStart(null);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden selection:bg-violet-500/30 pt-16 pb-20 md:pt-20">

      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[#020409]">
        <div className="absolute top-[-15%] left-[-10%] w-[65vw] h-[65vw] max-w-[560px] max-h-[560px] rounded-full bg-violet-700/12 blur-[110px]" />
        <div className="absolute top-[15%] right-[-12%] w-[50vw] h-[50vw] max-w-[480px] max-h-[480px] rounded-full bg-cyan-600/10 blur-[95px]" />
        <div className="absolute bottom-[-8%] left-[20%] w-[65vw] h-[65vw] max-w-[560px] max-h-[560px] rounded-full bg-indigo-700/9 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.013]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 0%, transparent 30%, #020409 100%)",
          }}
        />
      </div>

      {/* ── MAIN GRID ── */}
      <div className="relative z-10 w-full max-w-[1380px] mx-auto px-5 sm:px-8 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-y-14 gap-x-10 items-center">

        {/* ══════════ LEFT ══════════ */}
        <div className="lg:col-span-7 flex flex-col justify-center">

          {/* Live pill */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-[0.18em]">
              <Sparkles size={11} className="text-violet-400" />
              Nepal's Premium Hub
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>
          </div>

          {/* Headline */}
          <div className="mb-5 sm:mb-7">
            <h1 className="font-black tracking-tighter leading-[1.04]">
              <span className="block text-[clamp(2rem,5.2vw,4rem)] text-white/90 mb-1">
                Everything for
              </span>
              <span
                className="block leading-none"
                style={{ minHeight: "clamp(2.8rem,7.5vw,5.5rem)" }}
              >
                <span
                  className="text-transparent bg-clip-text text-[clamp(2.6rem,7vw,5.2rem)]"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
                    transition: "background-image 0.5s ease",
                  }}
                >
                  {display}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    width: "clamp(3px,0.35vw,4px)",
                    height: "0.78em",
                    background: "white",
                    marginLeft: "7px",
                    verticalAlign: "middle",
                    borderRadius: "1px",
                    opacity: blink ? 1 : 0,
                    transition: "opacity 0.1s",
                  }}
                />
              </span>
            </h1>
          </div>

          {/* Subheading */}
          <p className="text-slate-400 text-[15px] sm:text-lg font-light leading-relaxed max-w-lg mb-8 sm:mb-10">
            Free IOE notes, real-time NEPSE updates, live sports, and professional AI tools — all in one place.
          </p>

          {/* ── SEARCH BAR ── */}
          <div className="relative w-full max-w-xl z-30">
            {focused && (
              <div className="absolute -inset-[3px] rounded-[2rem] bg-gradient-to-r from-violet-500/25 via-cyan-500/20 to-emerald-500/25 blur-md pointer-events-none" />
            )}
            <div
              className={`relative flex items-center bg-[#0c1018]/85 backdrop-blur-2xl rounded-full px-4 sm:px-5 py-3.5 sm:py-4 md:py-[1.1rem] gap-3 border transition-all duration-300 ${
                focused
                  ? "border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                  : "border-white/[0.08] hover:border-white/15"
              }`}
            >
              <Search
                size={19}
                className={`shrink-0 transition-colors duration-300 ${focused ? "text-cyan-400" : "text-slate-500"}`}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search news, tools, live sports..."
                className="w-full bg-transparent outline-none text-white text-sm sm:text-base placeholder:text-slate-500 font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 160)}
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/15 text-slate-400 hover:text-white transition-all"
                  aria-label="Clear"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown */}
            {results.length > 0 && focused && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#0c1018]/98 backdrop-blur-3xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 p-1.5">
                {results.map((item, i) => (
                  <Link
                    key={i}
                    href={item.link}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.05] rounded-xl transition-all group"
                  >
                    <span className="text-lg bg-white/[0.05] p-2 rounded-lg shrink-0 leading-none">
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm group-hover:text-cyan-400 transition-colors truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.link}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 hidden sm:inline-flex ${tagColors[item.tag] ?? ""}`}>
                      {item.tag}
                    </span>
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── TRENDING — Link bata direct navigate ── */}
          <div className="mt-6 sm:mt-8 flex items-center gap-2.5 flex-wrap">
            <span className="text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0">
              <TrendingUp size={12} /> Trending
            </span>
            {trendingTags.map((t, i) => (
              <Link
                key={i}
                href={t.link}
                className="text-[11px] sm:text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-white/[0.07] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-200 whitespace-nowrap"
              >
                {t.label}
              </Link>
            ))}
          </div>

          {/* ── STATS ── */}
          <div className="mt-8 sm:mt-10 flex items-center gap-7 sm:gap-10">
            {[
              { value: "50K+",  label: "Monthly Users"   },
              { value: "200+",  label: "Free Resources"  },
              { value: "Live",  label: "Market & Sports" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-base sm:text-lg font-black text-white tracking-tight leading-none">
                  {stat.value}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 font-medium leading-none whitespace-nowrap">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════ RIGHT: BLOG SLIDER ══════════ */}
        <div className="lg:col-span-5 w-full">
          <div className="relative w-full">
            <div className="absolute -inset-6 bg-gradient-to-tr from-violet-600/15 via-transparent to-emerald-600/12 blur-[70px] rounded-[3rem] pointer-events-none" />

            <div
              className="relative w-full"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {/* Aspect ratio wrapper */}
              <div className="relative w-full" style={{ paddingBottom: "122%" }}>
                {featuredBlogs.map((blog, idx) => {
                  const isActive = idx === activeSlide;
                  return (
                    <div
                      key={blog.id}
                      className={`absolute inset-0 rounded-[1.75rem] overflow-hidden border border-white/[0.09] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                        isActive
                          ? "opacity-100 scale-100 z-20 shadow-[0_40px_80px_rgba(0,0,0,0.85)]"
                          : "opacity-0 scale-[0.97] z-0 pointer-events-none"
                      }`}
                    >
                      <div className="absolute inset-0 bg-[#090c10]">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-[58%] object-cover"
                          style={{ opacity: 0.72 }}
                          loading={idx === 0 ? "eager" : "lazy"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090c10] via-[#090c10]/88 to-transparent" />
                        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/25 to-transparent" />
                      </div>

                      {/* Tag */}
                      <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white ${blog.tagColor}`}>
                          {blog.tag}
                        </span>
                      </div>

                      {/* Read time */}
                      <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-semibold text-slate-300 bg-black/40 border border-white/10 backdrop-blur-md">
                          <Clock size={9} />
                          {blog.readTime}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 lg:p-7 flex flex-col">
                        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium mb-3">
                          <span className="w-4 h-[1.5px] bg-slate-600 rounded-full" />
                          <span>{blog.author}</span>
                          <span className="w-1 h-1 bg-slate-600 rounded-full" />
                          <span>Today</span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-black text-white leading-[1.25] mb-2.5 line-clamp-2">
                          {blog.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed mb-5">
                          {blog.desc}
                        </p>

                        <Link
                          href={blog.link}
                          className="w-full py-3 sm:py-3.5 bg-white/[0.07] hover:bg-white/[0.13] active:bg-white/[0.18] border border-white/[0.1] hover:border-white/20 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white transition-all duration-200 backdrop-blur-md group"
                        >
                          Read Story
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-5 px-1">
                <button
                  onClick={prevSlide}
                  className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/10 active:scale-95 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  aria-label="Previous"
                >
                  <ChevronLeft size={17} />
                </button>

                <div className="flex gap-2 items-center">
                  {featuredBlogs.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        idx === activeSlide ? "w-7 bg-white" : "w-2 bg-white/20 hover:bg-white/40"
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/10 active:scale-95 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  aria-label="Next"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}