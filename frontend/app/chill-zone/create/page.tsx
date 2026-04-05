"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { client } from "@/sanity/client";
import { db } from "@/lib/firebase";
import { ref, push, onValue } from "firebase/database";
import {
  Play, Tv, Film, MonitorPlay, ExternalLink, Send,
  MessageSquare, Zap, Globe, Trophy, Plus, User,
  Heart, Share2, X, Loader2
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// CHANNELS
// ============================================================
const channels = [
  // 🏏 CRICKET
  { id: "cricbuzz-hd", category: "cricket", name: "Cricbuzz HD 🔥", url: "https://playerado.top/embed2.php?id=osncric&v=su", desc: "Full HD Premium", badge: "HD", img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200" },
  { id: "star1", category: "cricket", name: "Star Sports 1", url: "https://crichd.one/stream.php?id=starsp1", desc: "IPL & India Cricket", badge: "IPL", img: "https://images.unsplash.com/photo-1531415074968-055a44455887?q=80&w=1200" },
  { id: "star2", category: "cricket", name: "Star Sports 2", url: "https://crichd.one/stream.php?id=starsp2", desc: "Test Matches", badge: null, img: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=1200" },
  { id: "willow", category: "cricket", name: "Willow Cricket", url: "https://crichd.one/stream.php?id=willow", desc: "ICC Matches", badge: null, img: "https://images.unsplash.com/photo-1631194758628-71ec7c35137e?q=80&w=1200" },
  { id: "ten", category: "cricket", name: "Ten Sports", url: "https://crichd.one/stream.php?id=tensp", desc: "Pakistan Cricket", badge: null, img: "https://images.unsplash.com/photo-1531415074968-055a44455887?q=80&w=1200" },
  { id: "sonysix", category: "cricket", name: "Sony Six", url: "https://crichd.one/stream.php?id=sonysix", desc: "Live Cricket", badge: null, img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200" },
  // ⚽ FOOTBALL
  { id: "football-hd", category: "football", name: "Football HD", url: "https://istreameast.app/v17", desc: "Premier League & La Liga", badge: "EPL", img: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1200" },
  { id: "bein", category: "football", name: "beIN Sports", url: "https://crichd.one/stream.php?id=bein1", desc: "Champions League", badge: "UCL", img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200" },
  { id: "espn-football", category: "football", name: "ESPN Sports", url: "https://istreameast.app/v3", desc: "MLS & Serie A", badge: null, img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200" },
  // 🏀 NBA
  { id: "nba-tv", category: "nba", name: "NBA TV Live", url: "https://istreameast.app/v4", desc: "NBA Games", badge: "NBA", img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200" },
  { id: "espn-nba", category: "nba", name: "ESPN NBA", url: "https://istreameast.app/v5", desc: "Playoffs & Finals", badge: null, img: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1200" },
  // 🏎️ F1
  { id: "f1-sky", category: "f1", name: "Sky Sports F1", url: "https://istreameast.app/v6", desc: "Formula 1 Grand Prix", badge: "F1", img: "https://images.unsplash.com/photo-1647026027895-15b9be40f6f8?q=80&w=1200" },
  // 📺 NEPALI TV
  { id: "ntv", category: "nepali", name: "NTV Nepal", url: "https://www.youtube.com/embed/live_stream?channel=UCnZBNBXSV9MYrPS1_LGk7Gg&autoplay=1", desc: "Nepal Television Live", badge: "🇳🇵", img: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=1200" },
  { id: "kantipur", category: "nepali", name: "Kantipur TV", url: "https://www.youtube.com/embed/live_stream?channel=UCQHh1T9A719DsApPTEMSUaQ&autoplay=1", desc: "Kantipur Live News", badge: "NEWS", img: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=1200" },
  { id: "ap1", category: "nepali", name: "AP1 HD Nepal", url: "https://www.youtube.com/embed/live_stream?channel=UCQmkDFqm6HM2PktnUPaEGgQ&autoplay=1", desc: "AP1 Television Live", badge: null, img: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=1200" },
];

const categories = [
  { id: "all",      label: "All",       icon: "🔥", color: "from-red-500 to-orange-500" },
  { id: "cricket",  label: "Cricket",   icon: "🏏", color: "from-emerald-500 to-cyan-500" },
  { id: "football", label: "Football",  icon: "⚽", color: "from-blue-500 to-indigo-500" },
  { id: "nba",      label: "NBA",       icon: "🏀", color: "from-orange-500 to-red-500" },
  { id: "f1",       label: "F1",        icon: "🏎️", color: "from-red-600 to-rose-500" },
  { id: "nepali",   label: "Nepali TV", icon: "🇳🇵", color: "from-blue-600 to-red-600" },
];

const schedule = [
  { time: "Today 7:30 PM", match: "India vs Australia", sport: "🏏", channel: "Star Sports 1", live: true },
  { time: "Today 9:00 PM", match: "Man City vs Arsenal", sport: "⚽", channel: "beIN Sports", live: true },
  { time: "Tomorrow 6:00 AM", match: "Lakers vs Warriors", sport: "🏀", channel: "NBA TV", live: false },
  { time: "Sunday 5:00 PM", match: "Monaco Grand Prix", sport: "🏎️", channel: "Sky F1", live: false },
  { time: "Tomorrow 7:00 PM", match: "Pakistan vs England", sport: "🏏", channel: "Ten Sports", live: false },
];

export default function ChillZone() {
  const { user } = useAuth();

  // Player state
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [showOverlay, setShowOverlay] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  // Chat state
  const [chatMsg, setChatMsg] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Community posts state
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const filteredChannels = activeCategory === "all"
    ? channels
    : channels.filter(c => c.category === activeCategory);

  // Firebase Realtime Chat
  useEffect(() => {
    const chatRef = ref(db, "chillzone-chat");
    const unsub = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.entries(data)
          .map(([id, val]: any) => ({ id, ...val }))
          .sort((a: any, b: any) => a.timestamp - b.timestamp)
          .slice(-50);
        setChatMessages(msgs);
        // Auto scroll to bottom
        setTimeout(() => {
          if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
          }
        }, 100);
      }
    });
    return () => unsub();
  }, []);

  // Sanity Community Posts
  useEffect(() => {
    client.fetch(`*[_type == "chillPost"] | order(publishedAt desc) {
      _id, title, author, category, body,
      "images": images[].asset->url,
      publishedAt
    }`).then(data => { setPosts(data); setPostsLoading(false); })
      .catch(() => setPostsLoading(false));
  }, []);

  const switchChannel = (ch: typeof channels[0]) => {
    setActiveChannel(ch);
    setShowOverlay(true);
  };

  const sendMessage = async () => {
    if (!chatMsg.trim() || !user) return;
    const chatRef = ref(db, "chillzone-chat");
    await push(chatRef, {
      text: chatMsg.trim(),
      name: user.displayName || user.email?.split("@")[0] || "User",
      uid: user.uid,
      timestamp: Date.now(),
    });
    setChatMsg("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#070c14] text-white">
      <Navbar />
      <div className="max-w-[1440px] mx-auto pt-24 md:pt-32 pb-24 px-4 md:px-8">

        {/* ── HEADER ── */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full mb-3">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Live Now</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
              <span className="text-white">Chill </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">Zone</span>
              <span className="ml-3">🔥</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              {channels.length}+ Live Channels · Cricket · Football · NBA · F1 · Nepali TV
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 bg-white/4 px-3 py-2 rounded-full border border-white/8">
              <Globe size={12} className="text-cyan-400" />
              <span>{channels.length} Channels</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/4 px-3 py-2 rounded-full border border-white/8">
              <Zap size={12} className="text-yellow-400" />
              <span>Free · HD</span>
            </div>
          </div>
        </div>

        {/* ── CATEGORY TABS ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6" style={{ scrollbarWidth: "none" }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg`
                  : "bg-white/4 border-white/8 text-slate-400 hover:text-white hover:bg-white/8"
              }`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* ── PLAYER + CHANNEL LIST ── */}
        <div className="grid lg:grid-cols-10 gap-5 mb-6">

          {/* PLAYER */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/60">
              <iframe
                key={activeChannel.id}
                src={activeChannel.url}
                width="100%" height="100%"
                frameBorder="0" scrolling="no"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                className="w-full h-full z-10 relative"
              />
              {showOverlay && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)" }}
                  onClick={() => setShowOverlay(false)}
                >
                  <img src={activeChannel.img} className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" alt="" />
                  <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full text-xs font-black shadow-lg">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE HD
                  </div>
                  {activeChannel.badge && (
                    <div className="absolute top-4 right-4 z-30 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold">
                      {activeChannel.badge}
                    </div>
                  )}
                  <button className="relative z-30">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-full flex items-center justify-center hover:bg-white/20 transition shadow-2xl">
                      <Play size={32} className="text-white fill-white ml-1" />
                    </div>
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 z-30 p-6 bg-gradient-to-t from-black to-transparent">
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <MonitorPlay size={12} /> {activeChannel.desc}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-black text-white">{activeChannel.name}</h3>
                  </div>
                </div>
              )}
            </div>

            {/* Info bar */}
            <div className="flex items-center justify-between bg-white/4 border border-white/8 rounded-xl px-4 py-3 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-sm">
                  {categories.find(c => c.id === activeChannel.category)?.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{activeChannel.name}</p>
                  <p className="text-xs text-slate-500">{activeChannel.desc}</p>
                </div>
              </div>
              <a href={activeChannel.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg transition">
                Not working? Open Source <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* CHANNEL LIST */}
          <div className="lg:col-span-3 flex flex-col bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2 bg-white/3">
              <Tv size={16} className="text-cyan-400" />
              <span className="font-bold text-sm text-white">
                {activeCategory === "all" ? "All Channels" : categories.find(c => c.id === activeCategory)?.label}
              </span>
              <span className="ml-auto text-xs text-slate-500 bg-white/8 px-2 py-0.5 rounded-full">
                {filteredChannels.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[420px] lg:max-h-none" style={{ scrollbarWidth: "thin" }}>
              {filteredChannels.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => switchChannel(ch)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border ${
                    activeChannel.id === ch.id
                      ? "bg-gradient-to-r from-red-600/20 to-orange-600/10 border-red-500/30 shadow-lg"
                      : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/8"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${activeChannel.id === ch.id ? "bg-red-500/20" : "bg-white/5"}`}>
                    {categories.find(c => c.id === ch.category)?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${activeChannel.id === ch.id ? "text-white" : "text-slate-300"}`}>{ch.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{ch.desc}</p>
                  </div>
                  {ch.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${activeChannel.id === ch.id ? "bg-red-500/30 text-red-300" : "bg-white/8 text-slate-400"}`}>
                      {ch.badge}
                    </span>
                  )}
                  {activeChannel.id === ch.id && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── MATCH SCHEDULE ── */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-xl shadow-lg shadow-amber-500/20">
              <Trophy size={18} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-white">Upcoming Matches</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {schedule.map((s, i) => (
              <div key={i} className={`relative p-4 rounded-2xl border transition-all ${s.live ? "bg-red-500/8 border-red-500/20" : "bg-white/3 border-white/8"}`}>
                {s.live && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500/20 border border-red-500/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    <span className="text-[9px] font-black text-red-400">LIVE</span>
                  </div>
                )}
                <div className="text-2xl mb-2">{s.sport}</div>
                <p className="text-white font-bold text-sm leading-tight mb-1">{s.match}</p>
                <p className="text-xs text-slate-500 mb-2">{s.channel}</p>
                <p className={`text-[10px] font-bold ${s.live ? "text-red-400" : "text-slate-600"}`}>{s.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── MOVIES & SERIES ── */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-pink-500/20">
              <Film size={18} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-white">Movies & Series</h2>
            <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full border border-white/8 ml-auto">Free · No Subscription</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: "https://www.cineby.gd/", title: "CineBy", badge: "NO ADS • HD", badgeColor: "bg-pink-600", desc: "Latest Netflix, Hollywood & Bollywood movies free.", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000", border: "border-pink-500/20" },
              { href: "https://himovies.sx/", title: "HiMovies", badge: "FAST SERVER", badgeColor: "bg-violet-600", desc: "Best for TV Series, Anime & International Cinema.", img: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000", border: "border-violet-500/20" },
            ].map((m, i) => (
              <a key={i} href={m.href} target="_blank" rel="noopener noreferrer"
                className={`relative h-52 md:h-64 rounded-2xl overflow-hidden group border ${m.border} shadow-xl hover:shadow-2xl transition-all duration-500`}>
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition z-10" />
                <img src={m.img} alt={m.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-6">
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">{m.title}</h3>
                  <span className={`${m.badgeColor} text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg mb-2`}>{m.badge}</span>
                  <p className="text-slate-200 text-xs md:text-sm drop-shadow-md">{m.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── LIVE CHAT ── */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <MessageSquare size={18} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-white">Live Discussion</h2>
            <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold text-red-400 ml-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
            </span>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            {/* Messages */}
            <div ref={chatBoxRef} className="p-4 space-y-4 h-72 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                  <MessageSquare size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">No messages yet — be the first! 👋</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.uid === user?.uid ? "flex-row-reverse" : ""}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold shrink-0">
                      {msg.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className={`max-w-[75%] ${msg.uid === user?.uid ? "items-end" : "items-start"} flex flex-col`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{msg.uid === user?.uid ? "You" : msg.name}</span>
                        <span className="text-[10px] text-slate-600">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className={`text-sm text-slate-200 px-3 py-2 rounded-xl ${
                        msg.uid === user?.uid
                          ? "bg-indigo-600/30 border border-indigo-500/30 rounded-tr-none"
                          : "bg-white/6 border border-white/8 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/8 bg-white/2">
              {user ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Say something... (Enter to send)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!chatMsg.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-indigo-500/20 disabled:opacity-40"
                  >
                    <Send size={14} /> Send
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Login to join the live discussion 💬</p>
                  <Link href="/login" className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
                    Login →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SEO CONTENT BLOCK ── */}
        <section className="mb-14 border border-white/6 rounded-2xl p-6 bg-white/2">
          <h2 className="text-xl font-black text-white mb-3">Watch Live Cricket, Football & Sports Free in Nepal 🏏⚽</h2>
          <div className="text-slate-500 text-sm space-y-2">
            <p>Tikajoshi Chill Zone is Nepal's best platform to watch <strong className="text-slate-300">live IPL cricket stream free</strong>, Premier League football, NBA basketball, and Formula 1 — all completely free in HD quality.</p>
            <p>Watch <strong className="text-slate-300">Star Sports 1 live stream</strong> for IPL 2025 matches, Willow Cricket for ICC tournaments, and beIN Sports for Champions League. No subscription needed.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {["Cricbuzz Live HD Stream", "Star Sports 1 - IPL Live", "Star Sports 2 - Test Cricket", "Willow Cricket - ICC Live", "beIN Sports - Champions League", "Sky Sports F1 - Formula 1", "NTV Nepal Live", "Kantipur TV Live", "NBA TV Live Stream"].map((ch, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-500 bg-white/3 border border-white/6 px-3 py-2 rounded-lg">
                  <span className="text-green-400">✓</span> {ch}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMUNITY POSTS ── */}
        <div className="border-t border-white/6 pt-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-violet-500 to-pink-500 p-2 rounded-xl shadow-lg shadow-violet-500/20">
                <User size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-white">Student Community</h2>
            </div>
            <Link href={user ? "/chill-zone/create" : "/login"}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:opacity-90 transition">
              {user ? <><Plus size={14} /> Create Post</> : <><User size={14} /> Login to Post</>}
            </Link>
          </div>

          {postsLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-violet-500 w-8 h-8" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white/2 border border-dashed border-white/10 rounded-2xl">
              <div className="text-5xl mb-3">🍿</div>
              <p className="text-slate-500 font-medium">No posts yet — be the first!</p>
              <Link href={user ? "/chill-zone/create" : "/login"} className="inline-block mt-4 text-sm font-bold text-violet-400 hover:text-violet-300 transition">
                Create a post →
              </Link>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {posts.map((post, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  onClick={() => setSelectedPost(post)}
                  className="break-inside-avoid bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  {post.images?.[0] && <img src={post.images[0]} alt={post.title} className="w-full h-auto object-cover" />}
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/20 uppercase">{post.category}</span>
                      <span className="text-[10px] text-slate-600">{new Date(post.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-3 line-clamp-2 group-hover:text-violet-300 transition">{post.title}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
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
      </div>

      {/* ── POST MODAL ── */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedPost(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/60 backdrop-blur rounded-full hover:bg-red-600 transition border border-white/10">
                <X size={18} />
              </button>
              <div className="md:w-3/5 bg-black overflow-y-auto max-h-[40vh] md:max-h-full flex items-center">
                {selectedPost.images?.length > 0
                  ? selectedPost.images.map((img: string, idx: number) => <img key={idx} src={img} className="w-full h-auto object-contain" alt="" />)
                  : <div className="w-full h-full flex items-center justify-center text-slate-700"><Film size={48} /></div>
                }
              </div>
              <div className="md:w-2/5 p-6 md:p-8 bg-[#0f172a] border-l border-white/8 flex flex-col overflow-y-auto">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/20 uppercase self-start mb-3">{selectedPost.category}</span>
                <h2 className="text-xl font-black text-white mb-4 leading-tight">{selectedPost.title}</h2>
                <div className="flex items-center gap-2 mb-5 pb-5 border-b border-white/8">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
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
                    <Heart size={14} /> Like
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-blue-600 border border-white/8 hover:border-blue-500 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition">
                    <Share2 size={14} /> Share
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