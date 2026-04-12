"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { client } from "@/sanity/client";
import { db } from "@/lib/firebase";
import LiveMatches from "@/components/LiveMatches";
import {
  ref as dbRef, push, onValue, query,
  orderByChild, limitToLast, serverTimestamp
} from "firebase/database";
import {
  Play, Tv, ExternalLink, Send, Share2, MessageSquare,
  Maximize, RefreshCw, ThumbsUp, Plus, User, Heart,
  X, Loader2, Film
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const channels = [
  { id: "ipl-hd",     category: "cricket",  name: "IPL Premium HD 🔥",  url: "https://w2.sportzsonline.click/channels/hd/hd1.php",        desc: "Tata IPL Live Feed",    badge: "IPL",   img: "https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Indian_Premier_League_Official_Logo.svg/1200px-Indian_Premier_League_Official_Logo.svg.png" },
  { id: "cricbuzz",   category: "cricket",  name: "Cricbuzz HD",         url: "https://playerado.top/embed2.php?id=osncric&v=su",           desc: "Full HD Premium",       badge: "HD",    img: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Cricbuzz_Logo.png" },
  { id: "star1",      category: "cricket",  name: "Star Sports 1",       url: "https://crichd.one/stream.php?id=starsp1",                   desc: "IPL & India",           badge: null,    img: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Star_Sports_Logo.svg/1200px-Star_Sports_Logo.svg.png" },
  { id: "star-hindi", category: "cricket",  name: "Star Sports Hindi",   url: "https://newcdn.tamils.click/live/tracks-v1a1/mono.m3u8",     desc: "Hindi Commentary",      badge: "HINDI", img: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Star_Sports_Logo.svg/1200px-Star_Sports_Logo.svg.png" },
  { id: "willow",     category: "cricket",  name: "Willow Cricket",      url: "https://crichd.one/stream.php?id=willow",                    desc: "ICC Matches",           badge: null,    img: "https://upload.wikimedia.org/wikipedia/en/2/29/Willow_TV_logo.png" },
  { id: "ten",        category: "cricket",  name: "Ten Sports",          url: "https://crichd.one/stream.php?id=tensp",                     desc: "Pakistan Cricket",      badge: null,    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Ten_Sports_logo.svg/1200px-Ten_Sports_logo.svg.png" },
  { id: "epl-hd",     category: "football", name: "Premier League HD",   url: "https://live5.msrktz.app/live/78905744.m3u8",                desc: "EPL Live",              badge: "EPL",   img: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png" },
  { id: "bein",       category: "football", name: "beIN Sports",         url: "https://crichd.one/stream.php?id=bein1",                     desc: "UCL & LaLiga",          badge: "UCL",   img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/BeIN_Sports_France_logo.svg/1200px-BeIN_Sports_France_logo.svg.png" },
  { id: "espn-fc",    category: "football", name: "ESPN FC",             url: "https://crichd.one/stream.php?id=espnfc",                    desc: "Global Football",       badge: null,    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_logo.svg/1200px-ESPN_logo.svg.png" },
  { id: "nba-tv",     category: "nba",      name: "NBA TV Live",         url: "https://istreameast.app/v4",                                 desc: "NBA Playoffs",          badge: "NBA",   img: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/1200px-National_Basketball_Association_logo.svg.png" },
  { id: "f1-sky",     category: "f1",       name: "Sky Sports F1",       url: "https://istreameast.app/v6",                                 desc: "Formula 1",             badge: "F1",    img: "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Sky_Sports_F1_logo.svg/1200px-Sky_Sports_F1_logo.svg.png" },
  { id: "ufc",        category: "others",   name: "UFC Fight Night",     url: "https://ww1.sportszonline.click/channels/hd/hd2.php",        desc: "MMA Live",              badge: "UFC",   img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UFC_Logo.svg/1200px-UFC_Logo.svg.png" },
];

const categories = [
  { id: "all",      label: "All",      icon: "🔥" },
  { id: "cricket",  label: "Cricket",  icon: "🏏" },
  { id: "football", label: "Football", icon: "⚽" },
  { id: "nba",      label: "NBA",      icon: "🏀" },
  { id: "f1",       label: "F1",       icon: "🏎️" },
  { id: "others",   label: "Others",   icon: "🎯" },
];

interface ChatMsg {
  id: string; uid: string; name: string;
  initial: string; text: string; ts: number;
}

const avatarColors = [
  "from-red-500 to-orange-500",   "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500", "from-violet-500 to-purple-500",
  "from-pink-500 to-rose-500",    "from-amber-500 to-yellow-500",
];
const colorFor = (uid: string) => avatarColors[uid.charCodeAt(0) % avatarColors.length];

export default function ChillZone() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [showOverlay,   setShowOverlay]   = useState(true);
  const [activeCat,     setActiveCat]     = useState("all");
  const [chatMsg,       setChatMsg]       = useState("");
  const [messages,      setMessages]      = useState<ChatMsg[]>([]);
  const [sending,       setSending]       = useState(false);
  const [reactions,     setReactions]     = useState({ fire: 124, heart: 89, clap: 42 });
  const [posts,         setPosts]         = useState<any[]>([]);
  const [postsLoading,  setPostsLoading]  = useState(true);
  const [selectedPost,  setSelectedPost]  = useState<any>(null);
  const [activeView,    setActiveView]    = useState<"streams" | "schedule">("streams");

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const iframeRef     = useRef<HTMLIFrameElement>(null);

  const filtered = activeCat === "all"
    ? channels
    : channels.filter(c => c.category === activeCat);

  // Firebase chat
  useEffect(() => {
    const msgsRef = query(
      dbRef(db, "livechat/messages"),
      orderByChild("ts"),
      limitToLast(60)
    );
    const unsub = onValue(msgsRef, snap => {
      const data = snap.val();
      if (!data) return;
      const arr: ChatMsg[] = Object.entries(data).map(([id, v]: any) => ({ id, ...v }));
      arr.sort((a, b) => a.ts - b.ts);
      setMessages(arr);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sanity posts
  useEffect(() => {
    client.fetch(`*[_type == "chillPost"] | order(publishedAt desc) {
      _id, title, author, category, body,
      "images": images[].asset->url, publishedAt
    }`)
      .then(d => { setPosts(d); setPostsLoading(false); })
      .catch(() => setPostsLoading(false));
  }, []);

  const sendMessage = async () => {
    const text = chatMsg.trim();
    if (!text || !user || sending) return;
    setSending(true);
    setChatMsg("");
    const name = user.displayName || user.email?.split("@")[0] || "User";
    await push(dbRef(db, "livechat/messages"), {
      uid: user.uid, name,
      initial: name[0].toUpperCase(),
      text, ts: serverTimestamp(),
    });
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const switchChannel = (ch: typeof channels[0]) => {
    setActiveChannel(ch);
    setShowOverlay(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    if (!iframeRef.current) return;
    const src = iframeRef.current.src;
    iframeRef.current.src = "";
    setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src; }, 100);
  };

  const renderPlayer = () => {
    const url = activeChannel.url;
    const isM3u8 = url.includes(".m3u8");
    const common = {
      ref: iframeRef,
      key: activeChannel.id,
      width: "100%", height: "100%",
      frameBorder: "0" as const,
      scrolling: "no" as const,
      allowFullScreen: true,
      allow: "autoplay; encrypted-media; fullscreen; picture-in-picture",
      className: "w-full h-full",
    };
    if (isM3u8) {
      return (
        <iframe {...common}
          srcDoc={`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#000}video{width:100vw;height:100vh;object-fit:contain}</style><script src="https://cdn.jsdelivr.net/npm/hls.js@latest"><\/script></head><body><video id="v" controls autoplay playsinline></video><script>var v=document.getElementById('v'),src='${url}';if(Hls.isSupported()){var h=new Hls();h.loadSource(src);h.attachMedia(v);h.on(Hls.Events.MANIFEST_PARSED,function(){v.play()})}else if(v.canPlayType('application/vnd.apple.mpegurl')){v.src=src;v.play()}<\/script></body></html>`}
        />
      );
    }
    return <iframe {...common} src={url} />;
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-white">
      <Navbar />
      <main className="max-w-[1500px] mx-auto pt-24 px-4 md:px-6 pb-24">

        {/* ── HEADER ── */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full mb-3">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-black uppercase tracking-widest">Live Now</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
              <span className="text-white">Live Sports </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">&amp; Movies</span>
              <span className="ml-3 text-4xl">🔥</span>
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              {channels.length}+ HD Channels · Cricket · Football · NBA · F1 · UFC
            </p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { icon: "📺", label: `${channels.length} Channels` },
              { icon: "⚡", label: "Free · HD" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/[0.04] border border-white/8 px-3 py-2 rounded-full text-xs text-slate-400">
                <span>{s.icon}</span> {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── LIVE MATCHES (Real API) ── */}
        <div className="mb-8">
          <LiveMatches />
        </div>

        {/* ── VIEW TOGGLE ── */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/[0.04] border border-white/8 p-1.5 rounded-2xl flex gap-1">
            {[
              { id: "streams",  label: "Live Streams",   icon: "📺" },
              { id: "schedule", label: "Global Schedule", icon: "📅" },
            ].map(v => (
              <button key={v.id}
                onClick={() => setActiveView(v.id as "streams" | "schedule")}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  activeView === v.id
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                    : "text-slate-500 hover:text-white"
                }`}>
                <span>{v.icon}</span> {v.label}
              </button>
            ))}
          </div>
        </div>

        {activeView === "streams" ? (
          <>
            {/* ── PLAYER + CHAT ── */}
            <div className="flex flex-col lg:flex-row gap-5 mb-8">

              {/* PLAYER */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/80">
                  {renderPlayer()}
                  {showOverlay && (
                    <div
                      className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer bg-black/80 backdrop-blur-sm"
                      onClick={() => setShowOverlay(false)}
                    >
                      <img src={activeChannel.img} alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay" />
                      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full text-xs font-black">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE HD
                      </div>
                      <button className="relative z-30 w-20 h-20 bg-white/10 backdrop-blur border-2 border-white/30 rounded-full flex items-center justify-center hover:bg-white/20 transition shadow-2xl hover:scale-110 duration-200">
                        <Play size={34} className="text-white fill-white ml-1" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 bg-gradient-to-t from-black to-transparent">
                        <h3 className="text-2xl font-black text-white">{activeChannel.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{activeChannel.desc}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={handleRefresh}
                    className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/8 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 transition">
                    <RefreshCw size={13} /> Refresh
                  </button>
                  <button onClick={() => iframeRef.current?.requestFullscreen()}
                    className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/8 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 transition">
                    <Maximize size={13} /> Fullscreen
                  </button>
                  <a href={activeChannel.url} target="_blank" rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/8 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 transition">
                    External <ExternalLink size={13} />
                  </a>
                </div>

                {/* Info + Reactions */}
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-white mb-2">{activeChannel.name} — Ads Free</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-red-500/15 border border-red-500/20 text-red-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {activeChannel.category}
                      </span>
                      {activeChannel.badge && (
                        <span className="bg-white/8 border border-white/10 text-slate-300 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {activeChannel.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { emoji: "🔥", key: "fire"  as const },
                      { emoji: "❤️", key: "heart" as const },
                      { emoji: "👏", key: "clap"  as const },
                    ].map(r => (
                      <button key={r.key}
                        onClick={() => setReactions(p => ({ ...p, [r.key]: p[r.key] + 1 }))}
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition group">
                        <span className="group-hover:scale-125 transition-transform">{r.emoji}</span>
                        <span className="text-xs font-bold text-slate-300">{reactions[r.key]}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => navigator.share?.({ title: activeChannel.name, url: window.location.href })}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition">
                      <Share2 size={13} /> Share
                    </button>
                  </div>
                </div>
              </div>

              {/* CHAT */}
              <div className="w-full lg:w-[380px] shrink-0 h-[620px] flex flex-col bg-[#0a0d15] border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2 bg-white/[0.02]">
                  <MessageSquare size={15} className="text-white" />
                  <span className="font-black text-white text-sm uppercase tracking-wider">Live Discussion</span>
                  <span className="ml-auto flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full text-[10px] font-black text-red-400">
                    <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" /> LIVE
                  </span>
                </div>

                <div className="p-4 border-b border-white/6 bg-[#070910]">
                  {user ? (
                    <div className="space-y-2">
                      <textarea
                        value={chatMsg}
                        onChange={e => setChatMsg(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Share your thoughts..."
                        maxLength={300} rows={2}
                        className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-red-500/40 transition resize-none"
                      />
                      <button onClick={sendMessage}
                        disabled={!chatMsg.trim() || sending}
                        className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:opacity-90 disabled:opacity-40 text-white py-2.5 rounded-xl font-black text-xs tracking-widest uppercase transition flex items-center justify-center gap-2">
                        <Send size={12} /> Post Comment
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-xs text-slate-500 mb-3">Login to join the discussion</p>
                      <Link href="/login"
                        className="inline-block bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition">
                        Login →
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-2">
                      <MessageSquare size={28} />
                      <p className="text-xs">No messages yet — be first!</p>
                    </div>
                  ) : messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.uid === user?.uid ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorFor(msg.uid)} flex items-center justify-center text-xs font-black shrink-0`}>
                        {msg.initial}
                      </div>
                      <div className={`flex flex-col max-w-[80%] ${msg.uid === user?.uid ? "items-end" : ""}`}>
                        <span className="text-[10px] text-slate-600 font-bold mb-1">
                          {msg.uid === user?.uid ? "You" : msg.name}
                        </span>
                        <p className={`text-sm text-slate-200 px-3 py-2 rounded-xl leading-relaxed break-words ${
                          msg.uid === user?.uid
                            ? "bg-red-600/25 border border-red-500/20 rounded-tr-none"
                            : "bg-white/5 border border-white/8 rounded-tl-none"
                        }`}>
                          {msg.text}
                        </p>
                        <button className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-white mt-1 transition">
                          <ThumbsUp size={10} /> Like
                        </button>
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>
              </div>
            </div>

            {/* ── CHANNEL CATALOG ── */}
            <div className="bg-white/[0.02] border border-white/8 rounded-3xl p-6 md:p-8 mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/6">
                <h2 className="text-xl font-black text-white flex items-center gap-3">
                  <Tv size={20} className="text-red-500" /> Channel Catalog
                </h2>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                        activeCat === cat.id
                          ? "bg-red-600 text-white border-transparent shadow-lg shadow-red-600/20"
                          : "bg-transparent border-white/10 text-slate-500 hover:border-white/25 hover:text-white"
                      }`}>
                      <span>{cat.icon}</span> {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filtered.map(ch => (
                  <button key={ch.id} onClick={() => switchChannel(ch)}
                    className={`relative group rounded-2xl overflow-hidden text-left transition-all duration-300 border ${
                      activeChannel.id === ch.id
                        ? "ring-2 ring-red-500 border-red-500/50"
                        : "border-white/8 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-black/50"
                    }`}>
                    <div className="aspect-video relative bg-black/50 overflow-hidden">
                      <img src={ch.img} alt={ch.name}
                        className="w-full h-full object-contain p-3 transition duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      {activeChannel.id === ch.id && (
                        <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                          <span className="bg-red-600 px-2 py-0.5 rounded-full text-[9px] font-black text-white uppercase">Watching</span>
                        </div>
                      )}
                      {ch.badge && (
                        <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase">
                          {ch.badge}
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 bg-white/[0.03] border-t border-white/6">
                      <p className="text-white text-xs font-bold truncate">{ch.name}</p>
                      <p className="text-slate-600 text-[9px] truncate mt-0.5">{ch.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── MOVIES ── */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-xl">
                  <Film size={18} className="text-white" />
                </div>
                <h2 className="text-xl font-black text-white">Movies &amp; Series</h2>
                <span className="text-xs text-slate-600 bg-white/4 border border-white/8 px-3 py-1 rounded-full ml-auto">
                  Free · No Subscription
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { href: "https://www.cineby.gd/",   title: "CineBy",    badge: "NO ADS • HD",  border: "border-pink-500/20",   img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000", desc: "Latest Netflix, Hollywood & Bollywood movies free." },
                  { href: "https://himovies.sx/",     title: "HiMovies",  badge: "FAST SERVER",  border: "border-violet-500/20", img: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000", desc: "Best for TV Series, Anime & International Cinema." },
                ].map((m, i) => (
                  <a key={i} href={m.href} target="_blank" rel="noopener noreferrer"
                    className={`relative h-52 rounded-2xl overflow-hidden group border ${m.border} hover:shadow-2xl transition-all duration-500`}>
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition z-10" />
                    <img src={m.img} alt={m.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-6">
                      <h3 className="text-3xl font-black text-white mb-2">{m.title}</h3>
                      <span className="bg-pink-600 text-white text-[10px] font-black px-3 py-1 rounded-full mb-2">{m.badge}</span>
                      <p className="text-slate-200 text-xs">{m.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* ── SEO ── */}
            <div className="mb-12 p-6 bg-white/[0.02] border border-white/6 rounded-2xl">
              <h2 className="text-lg font-black text-white mb-3">
                Watch Live Cricket, Football &amp; Sports Free in Nepal 🏏⚽
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Tikajoshi Chill Zone is Nepal's best platform for{" "}
                <strong className="text-slate-300">live IPL cricket stream free</strong>,
                Premier League football, NBA basketball, and Formula 1. No VPN, no subscription needed.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["IPL Live HD Nepal","Star Sports 1 Live","Premier League Stream","NBA Live Free","beIN Sports Nepal","Sky F1 Stream","UFC Fight Live","Cricbuzz HD Nepal"].map((ch, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-500 bg-white/3 border border-white/6 px-3 py-2 rounded-lg">
                    <span className="text-green-400">✓</span> {ch}
                  </div>
                ))}
              </div>
            </div>

            {/* ── COMMUNITY POSTS ── */}
            <div className="border-t border-white/6 pt-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-violet-500 to-pink-500 p-2 rounded-xl">
                    <User size={16} className="text-white" />
                  </div>
                  <h2 className="text-xl font-black text-white">Student Community</h2>
                </div>
                <Link href={user ? "/chill-zone/create" : "/login"}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg hover:opacity-90 transition">
                  {user ? <><Plus size={13} /> Create Post</> : <><User size={13} /> Login to Post</>}
                </Link>
              </div>

              {postsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-violet-500 w-7 h-7" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-14 bg-white/[0.02] border border-dashed border-white/8 rounded-2xl">
                  <div className="text-5xl mb-3">🍿</div>
                  <p className="text-slate-500 font-medium">No posts yet — be the first!</p>
                  <Link href={user ? "/chill-zone/create" : "/login"}
                    className="inline-block mt-4 text-sm font-bold text-violet-400 hover:text-violet-300">
                    Create a post →
                  </Link>
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
                  {posts.map((post, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      onClick={() => setSelectedPost(post)}
                      className="break-inside-avoid bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                      {post.images?.[0] && (
                        <img src={post.images[0]} alt={post.title} className="w-full h-auto object-cover" />
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 uppercase">
                            {post.category}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-violet-300 transition">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-[9px] font-black text-white">
                            {post.author?.[0]?.toUpperCase() || "U"}
                          </div>
                          <span className="text-xs text-slate-500">{post.author || "Anonymous"}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── SCHEDULE VIEW ── */
          <div className="bg-white/[0.02] border border-white/8 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/8 bg-white/[0.02]">
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Live Sports Schedule</h2>
              <p className="text-slate-500 text-xs mt-1">Real-time cricket data from CricAPI</p>
            </div>
            <div className="p-6">
              <LiveMatches />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-t border-white/6">
              {[
                { title: "Today's Big Games",  desc: "Check schedule to find channels for IPL, Premier League, and NBA. Links updated 30 min before kickoff." },
                { title: "Streaming Tips",     desc: "For best quality, use high-speed internet. If stream freezes, click Refresh above the player." },
                { title: "No Ads Policy",      desc: "We keep playback ad-free. Support us by sharing tikajoshi.com.np with your friends!" },
              ].map((c, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2">{c.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── POST MODAL ── */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedPost(null)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[#0f172a] border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/60 backdrop-blur rounded-full hover:bg-red-600 transition border border-white/10">
                <X size={18} />
              </button>
              <div className="md:w-3/5 bg-black overflow-y-auto max-h-[40vh] md:max-h-full flex items-center">
                {selectedPost.images?.length > 0
                  ? selectedPost.images.map((img: string, idx: number) => (
                      <img key={idx} src={img} className="w-full h-auto object-contain" alt="" />
                    ))
                  : <div className="w-full h-full flex items-center justify-center text-slate-700"><Film size={48} /></div>
                }
              </div>
              <div className="md:w-2/5 p-6 md:p-8 bg-[#0f172a] border-l border-white/8 flex flex-col overflow-y-auto">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 uppercase self-start mb-3">
                  {selectedPost.category}
                </span>
                <h2 className="text-xl font-black text-white mb-4">{selectedPost.title}</h2>
                <div className="flex items-center gap-2 mb-5 pb-5 border-b border-white/8">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-black">
                    {selectedPost.author?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{selectedPost.author || "Anonymous"}</p>
                    <p className="text-[10px] text-slate-500">{new Date(selectedPost.publishedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1 whitespace-pre-wrap">{selectedPost.body}</p>
                <div className="flex gap-3 mt-6 pt-5 border-t border-white/8">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-pink-600 border border-white/8 hover:border-pink-500 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition">
                    <Heart size={13} /> Like
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-blue-600 border border-white/8 hover:border-blue-500 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition">
                    <Share2 size={13} /> Share
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}