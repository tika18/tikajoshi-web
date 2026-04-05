"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  Play, Tv, Film, MonitorPlay, ExternalLink, Send,
  MessageSquare, Radio, Zap, Globe, Trophy, ChevronRight
} from "lucide-react";
import Link from "next/link";

// ============================================================
// PREMIUM CHANNELS CONFIG
// ============================================================
const channels = [
  // 🏏 CRICKET
  {
    id: "cricket-ntv-hd",
    category: "cricket",
    name: "Cricket Live HD",
    url: "https://ntv.cx/embed?t=cEZxcDdEVEtaUE90NGFtWWo3UlYrWm1mZERuck5jVWxqMXowajNvbzJyblpueW0wUllIdUp1SkJMc3p5ZW1vbXljTVNGc3dQREZaemFEeENTa0pvOW5ybk0zcDRQK3gwYnB5N09rSEx5akxkVWhqbzE0eHlUc1NGV1kyenk0QWE~",
    desc: "HD Premium Cricket Stream",
    badge: "LIVE",
    img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200",
  },
  {
    id: "cricbuzz-hd",
    category: "cricket",
    name: "Cricbuzz HD 🔥",
    url: "https://playerado.top/embed2.php?id=osncric&v=su",
    desc: "Full HD Premium • Best Quality",
    badge: "HD",
    img: "https://images.unsplash.com/photo-1531415074968-055a44455887?q=80&w=1200",
  },
  {
    id: "star1",
    category: "cricket",
    name: "Star Sports 1",
    url: "https://crichd.one/stream.php?id=starsp1",
    desc: "IPL & India Cricket",
    badge: "IPL",
    img: "https://images.unsplash.com/photo-1531415074968-055a44455887?q=80&w=1200",
  },
  {
    id: "willow",
    category: "cricket",
    name: "Willow Cricket",
    url: "https://embedsports.top/embed/admin/ppv-kolkata-knight-riders-vs-sunrisers-hyderabad/1",
    desc: "ICC Matches & USA Cricket",
    badge: null,
    img: "https://images.unsplash.com/photo-1631194758628-71ec7c35137e?q=80&w=1200",
  },
  {
    id: "Star Sports 1 Hindi",
    category: "cricket",
    name: "Star Sports 1 Hindi",
    url: "https://ntv.cx/embed?t=VzdwekdHWjF5RmJWT2o3d0VPbFFnemNkcE1TcHVmRCt4VEgzS2dOK0RDNnFhVlhIbXczZEdTTGxKWU44MTNIdg~~",
    desc: "IPL & India Cricket",
    badge: "LIVE",
    img: "https://images.unsplash.com/photo-1531415074968-055a44455887?q=80&w=1200",
  },
  {
    id: "sonysix",
    category: "cricket",
    name: "Sony Six",
    url: "https://crichd.one/stream.php?id=sonysix",
    desc: "Live Cricket & Sports",
    badge: null,
    img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200",
  },
  // ⚽ FOOTBALL
  {
    id: "football-premier-ntv",
    category: "football",
    name: "Premier League HD",
    url: "https://ntv.cx/embed?t=cEZxcDdEVEtaUE90NGFtWWo3UlYrWm1mZERuck5jVWxqMXowajNvbzJyblpueW0wUllIdUp1SkJMc3p5ZW1vbWt6WlE4UnNqVURsdWhXZTBhcHZSTzhJTkEvVHQycnJSeXNHYzExSmlEdXUrRWozZHduL1NIV3FGMTh0ODlrdGNGcTNHcE5rUC9BUElIVjZjUENDSDF3PT0~",
    desc: "EPL Premium Stream",
    badge: "EPL",
    img: "https://images.unsplash.com/photo-1600250395178-40fe752e5189?q=80&w=1200",
  },
  {
    id: "football-ntv-hd",
    category: "football",
    name: "Football Live HD",
    url: "https://ntv.cx/embed?t=cEZxcDdEVEtaUE90NGFtWWo3UlYrWm1mZERuck5jVWxqMXowajNvbzJyblpueW0wUllIdUp1SkJMc3p5ZW1vbVMyN3dSNUR5dHFWblhTOU5CazZVWFlMUm9zZVFqNU55dFNaVm5mQTdwMWU4OEs1bmdjeXU4U3lWTURNeVBVbFlKT0tpSUNvUUkvMzE5VzlyWUxwTWF3PT0~",
    desc: "Champions League & More",
    badge: "LIVE",
    img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200",
  },
  {
    id: "football-hd",
    category: "football",
    name: "Football HD",
    url: "https://istreameast.app/v17",
    desc: "Premier League & La Liga",
    badge: "EPL",
    img: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1200",
  },
  {
    id: "bein",
    category: "football",
    name: "beIN Sports",
    url: "https://crichd.one/stream.php?id=bein1",
    desc: "Champions League & LaLiga",
    badge: "UCL",
    img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200",
  },
  {
    id: "espn-football",
    category: "football",
    name: "ESPN Sports",
    url: "https://istreameast.app/v3",
    desc: "MLS, Serie A & More",
    badge: null,
    img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200",
  },
  // 🏀 NBA & BASKETBALL
  {
    id: "nba-tv",
    category: "nba",
    name: "NBA TV Live",
    url: "https://istreameast.app/v4",
    desc: "NBA Games & Highlights",
    badge: "NBA",
    img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200",
  },
  {
    id: "nba-live-hd",
    category: "nba",
    name: "NBA Live HD",
    url: "https://ntv.cx/embed?t=RnBicEVST3ZWdWxIOTdKVHE4MlUycy92eDUvdG80bjlEK3VWOU9rOFg5SHhMZnFZREY1TGpxQk9pSncxSmhncjQ5R0JVR3NGWW1oTWNONFNNOXhiWitVQlNtRWtmQ2h1R1RreFhwRWlKd3M9",
    desc: "High Quality NBA Stream",
    badge: "LIVE",
    img: "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?q=80&w=1200",
  },
  {
    id: "espn-nba",
    category: "nba",
    name: "ESPN NBA",
    url: "https://istreameast.app/v5",
    desc: "Playoffs & Finals",
    badge: null,
    img: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1200",
  },
  // 🏎️ F1 & MOTORSPORT
  {
    id: "f1-sky",
    category: "f1",
    name: "Sky Sports F1",
    url: "https://istreameast.app/v6",
    desc: "Formula 1 Grand Prix",
    badge: "F1",
    img: "https://images.unsplash.com/photo-1647026027895-15b9be40f6f8?q=80&w=1200",
  },
  // 📺 NEPALI TV
  {
    id: "ntv",
    category: "nepali",
    name: "NTV Nepal",
    url: "https://www.youtube.com/embed/live_stream?channel=UCnZBNBXSV9MYrPS1_LGk7Gg&autoplay=1",
    desc: "Nepal Television Live",
    badge: "🇳🇵",
    img: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=1200",
  },
  {
    id: "kantipur",
    category: "nepali",
    name: "Kantipur TV",
    url: "https://www.youtube.com/embed/live_stream?channel=UCQHh1T9A719DsApPTEMSUaQ&autoplay=1",
    desc: "Kantipur Live News",
    badge: "NEWS",
    img: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=1200",
  },
  {
    id: "avr",
    category: "nepali",
    name: "AP1 HD Nepal",
    url: "https://www.youtube.com/embed/live_stream?channel=UCQmkDFqm6HM2PktnUPaEGgQ&autoplay=1",
    desc: "AP1 Television Live",
    badge: null,
    img: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=1200",
  },
];

const categories = [
  { id: "all",     label: "All",        icon: "🔥", color: "from-zinc-500 to-zinc-400" },
  { id: "cricket", label: "Cricket",    icon: "🏏", color: "from-emerald-500 to-teal-500" },
  { id: "football",label: "Football",   icon: "⚽", color: "from-blue-600 to-indigo-500" },
  { id: "nba",     label: "NBA",        icon: "🏀", color: "from-amber-500 to-orange-500" },
  { id: "f1",      label: "F1",         icon: "🏎️", color: "from-red-600 to-rose-500" },
  { id: "nepali",  label: "Nepali TV",  icon: "🇳🇵", color: "from-blue-600 to-red-600" },
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
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [showOverlay, setShowOverlay] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [chatMsg, setChatMsg] = useState("");

  const filteredChannels = activeCategory === "all"
    ? channels
    : channels.filter(c => c.category === activeCategory);

  const switchChannel = (ch: typeof channels[0]) => {
    setActiveChannel(ch);
    setShowOverlay(true);
    // Slight scroll to top logic for mobile users clicking a channel far down
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-red-500/30">
      <Navbar />

      <main className="max-w-[1600px] mx-auto pt-24 pb-20 px-4 md:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full mb-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <span className="text-red-400 text-xs font-black uppercase tracking-widest flex shrink-0">Live Premium Access</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              <span className="text-white">Live Sports </span>
              <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">& Movies</span>
              <span className="ml-3">🎟️</span>
            </h1>
            <p className="text-slate-400 mt-4 text-sm md:text-lg max-w-xl font-medium">
              Experience edge-to-edge high-definition viewing. Unlimited cricket, football, F1, and cinema directly in your browser.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300 font-bold font-mono">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-lg">
              <Globe size={16} className="text-cyan-400" />
              <span>{channels.length} HD Streams</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-lg">
              <Zap size={16} className="text-yellow-400" />
              <span>Zero Buffering</span>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT: PLAYER (Left) + CHAT (Right) */}
        <div className="flex flex-col xl:flex-row gap-6 mb-12">
          
          {/* THEATER PLAYER SECTION */}
          <div className="flex-1 flex flex-col drop-shadow-2xl relative z-20">
            {/* Edge-to-edge styled video wrapper */}
            <div className="relative w-full aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.4)] ring-1 ring-white/10 group">
              {/* Background Glow */}
              <div className="absolute -inset-10 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-3xl rounded-[3rem] -z-10 group-hover:opacity-100 transition duration-1000 opacity-50" />
              
              <iframe
                key={activeChannel.id}
                src={activeChannel.url}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                className="w-full h-full z-10 relative bg-black"
                style={{ borderRadius: 'inherit' }}
              />

              {/* OVERLAY FOR CLICK TO PLAY */}
              {showOverlay && (
                <div
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
                  style={{ background: "radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.95) 100%)" }}
                  onClick={() => setShowOverlay(false)}
                >
                  <img
                    src={activeChannel.img}
                    className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity scale-105 group-hover:scale-100 transition-transform duration-1000"
                    alt=""
                  />

                  {/* Player Start Button UI */}
                  <div className="relative z-30 transform hover:scale-110 transition duration-300 ease-out flex flex-col items-center">
                    <div className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full scale-150 animate-pulse" />
                    <button className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-white/20 hover:text-cyan-300 transition-colors">
                      <Play size={40} className="ml-2 fill-current" />
                    </button>
                    <h2 className="mt-6 text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-md">
                      {activeChannel.name}
                    </h2>
                    <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase mt-1 drop-shadow-xl flex items-center gap-2">
                       <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                       Click to Watch Free
                    </p>
                  </div>
                  
                  {/* Badges top absolute */}
                  {activeChannel.badge && (
                    <div className="absolute top-6 right-6 z-30 bg-red-600 border border-red-500 px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-red-500/40 tracking-wider">
                      {activeChannel.badge}
                    </div>
                  )}
                  <div className="absolute top-6 left-6 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-slate-300">
                    <MonitorPlay size={12} className="text-cyan-400"/>
                    High Definition
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-5 gap-4">
              <div className="flex items-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/5 py-3 px-5 rounded-2xl w-full sm:w-auto">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/10">
                  {categories.find(c => c.id === activeChannel.category)?.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{activeChannel.name}</h3>
                  <p className="text-sm font-medium text-slate-400">{activeChannel.desc}</p>
                </div>
              </div>
              <a
                href={activeChannel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-sm font-bold bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 px-6 py-4 rounded-2xl transition w-full sm:w-auto text-slate-300 hover:text-white justify-center"
              >
                External Player <ExternalLink size={16} className="text-slate-500 group-hover:text-cyan-400 transition" />
              </a>
            </div>
          </div>

          {/* LIVE CHAT SECTION (Right Side Pane) */}
          <div className="w-full xl:w-[400px] shrink-0 flex flex-col h-[500px] xl:h-auto bg-[#0a0f1c] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="px-6 py-5 border-b border-white/[0.06] bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-indigo-400" />
                <h3 className="font-black text-white text-lg">Live Chat</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">Online</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
              {[
                { name: "Admin", color: "from-blue-500 to-indigo-600", msg: "Welcome to Live Sports & Movies! If the stream buffers, try pausing for 5 seconds.", time: "Pinned" },
                { name: "Rahul", color: "from-amber-400 to-orange-500", msg: "Wow, the premier league stream is buttery smooth 🔥", time: "just now" },
                { name: "Ashish", color: "from-emerald-400 to-teal-600", msg: "Cricket link working perfectly. No lag!", time: "1 min ago" },
                { name: "Prashant", color: "from-violet-500 to-purple-600", msg: "Guys switch to F1, the race is starting!!", time: "3 mins ago" },
              ].map((msg, i) => (
                <div key={i} className="flex gap-3 relative group/msg">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${msg.color} flex items-center justify-center text-sm font-black shrink-0 border border-white/20 shadow-lg`}>
                    {msg.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-200">{msg.name}</span>
                      <span className="text-[10px] font-medium text-slate-500">{msg.time}</span>
                    </div>
                    <p className={`text-sm ${msg.name === "Admin" ? "text-blue-300 font-medium" : "text-slate-400"} leading-relaxed`}>
                      {msg.msg}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-black/40 border-t border-white/[0.06]">
              {user ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    placeholder="Send a message..."
                    className="flex-1 bg-white/[0.05] border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition shadow-inner"
                  />
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl flex items-center justify-center transition shadow-lg shadow-indigo-600/30 w-12 shrink-0">
                    <Send size={18} className="translate-x-[1px]" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-slate-500">Sign in to chat</span>
                  <Link href="/login" className="text-xs font-black uppercase tracking-wider bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition">
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HORIZONTAL CHANNEL NAVIGATION (NETFLIX STYLE) */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Tv className="text-indigo-400" /> Premium Channels
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Select a stream below</p>
            </div>
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0 hide-scroll">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black tracking-wide whitespace-nowrap transition-all duration-300 border ${
                    activeCategory === cat.id
                      ? `bg-white text-black border-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)]`
                      : "bg-[#0f172a] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span> 
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredChannels.map(ch => (
              <button
                key={ch.id}
                onClick={() => switchChannel(ch)}
                className={`relative group rounded-2xl overflow-hidden transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-left ${
                  activeChannel.id === ch.id 
                  ? "ring-2 ring-white ring-offset-4 ring-offset-[#030712] scale-[1.02] shadow-2xl" 
                  : "hover:scale-105 hover:shadow-xl opacity-80 hover:opacity-100"
                }`}
              >
                {/* Thumb Aspect */}
                <div className="aspect-[4/5] relative w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 opacity-90 group-hover:opacity-100 transition" />
                  <img src={ch.img} className="w-full h-full object-cover transition duration-700 group-hover:scale-110 blur-[2px] group-hover:blur-0" alt="" />
                  
                  {activeChannel.id === ch.id && (
                    <div className="absolute top-3 left-3 z-20 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-lg animate-pulse">
                      <Play size={14} className="fill-white text-white ml-0.5" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col justify-end">
                    {ch.badge && (
                      <span className="self-start text-[9px] font-black tracking-widest uppercase bg-red-600 text-white px-2 py-0.5 rounded-full shadow-md mb-2">
                        {ch.badge}
                      </span>
                    )}
                    <h4 className="text-white font-black text-sm md:text-base leading-tight drop-shadow-lg mb-1">{ch.name}</h4>
                    <p className="text-xs font-semibold text-slate-300 drop-shadow flex items-center gap-1 line-clamp-1">
                       <span className="opacity-70">{categories.find(c=>c.id === ch.category)?.icon}</span> {ch.desc}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SCHEDULE */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-amber-400" size={20}/>
            <h2 className="text-2xl font-black text-white">Upcoming Matches</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {schedule.map((s, i) => (
              <div
                key={i}
                className={`relative px-5 py-4 rounded-2xl border backdrop-blur-sm transition-all ${
                  s.live
                    ? "bg-gradient-to-br from-red-600/10 to-orange-600/5 border-red-500/30"
                    : "bg-[#0a0f1c] border-white/5 hover:border-white/10"
                }`}
              >
                {s.live && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 px-2.5 py-1 rounded-full shadow-inner">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    <span className="text-[9px] font-black text-red-400 tracking-wider">LIVE</span>
                  </div>
                )}
                <div className="text-3xl mb-3 opacity-90">{s.sport}</div>
                <p className="text-white font-black text-base leading-tight mb-1 truncate">{s.match}</p>
                <p className="text-xs font-semibold text-indigo-300 mb-3 truncate hover:text-indigo-200 cursor-pointer">{s.channel}</p>
                <div className="flex items-center justify-between">
                  <p className={`text-[10px] uppercase tracking-widest font-bold ${s.live ? "text-red-400" : "text-slate-500"}`}>
                    {s.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MOVIES & CINEMA */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Film className="text-pink-400" size={24} /> Cineplex Servers
            </h2>
            <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
              <span className="text-xs font-bold text-slate-300 tracking-wider">AD-FREE ZONE</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                href: "https://www.cineby.gd/",
                title: "CineBy Premium",
                badge: "FAST • 4K",
                badgeColor: "bg-gradient-to-r from-pink-600 to-rose-500",
                desc: "Explore a massive library of Hollywood & Bollywood blockbusters.",
                img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000",
                border: "hover:border-pink-500/50",
              },
              {
                href: "https://himovies.sx/",
                title: "HiMovies Stream",
                badge: "LATEST SHOWS",
                badgeColor: "bg-gradient-to-r from-violet-600 to-fuchsia-600",
                desc: "Uninterrupted anime, TV shows, and international cinema hub.",
                img: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000",
                border: "hover:border-violet-500/50",
              },
            ].map((m, i) => (
              <a
                key={i}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative h-48 sm:h-64 rounded-3xl overflow-hidden border border-white/5 ${m.border} transition-all duration-500 block`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/60 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80" />
                <img
                  src={m.img}
                  alt={m.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                
                <div className="absolute inset-x-0 bottom-0 z-20 p-6 flex items-end justify-between">
                  <div className="pr-4">
                     <span className={`${m.badgeColor} text-white tracking-widest text-[9px] font-black px-3 py-1 rounded-full shadow-lg mb-3 inline-block`}>
                      {m.badge}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-none drop-shadow-xl">{m.title}</h3>
                    <p className="text-slate-300 text-xs sm:text-sm font-medium drop-shadow-md max-w-sm line-clamp-2 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shrink-0 group-hover:bg-white text-white group-hover:text-black transition-all duration-300 transform group-hover:translate-x-1 shadow-2xl">
                    <ChevronRight size={20} className="font-bold" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* SEO SECTION */}
        <section className="mt-20 border-t border-white/5 pt-12 pb-8">
          <div className="max-w-4xl opacity-80 backdrop-blur-sm rounded-3xl bg-white/[0.02] border border-white/5 p-8 md:p-10">
            <h2 className="text-2xl font-black text-white mb-5">
              Watch Live Cricket, Football & Sports Free in Nepal 🏏⚽
            </h2>
            <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-cyan-400">Tikajoshi Live Sports</strong> is Nepal's ultimate zero-cost platform to watch <strong className="text-slate-200">live IPL cricket streams, Premier League football, NBA matchups, and F1 races</strong> — absolutely free in brilliant HD.
              </p>
              <p className="leading-relaxed">
                Catch <strong className="text-slate-200">Star Sports 1 live coverage</strong> for IPL 2025 blockbusters, Willow Cricket for ICC international tours, and beIN Sports / HD servers for Champions League nights. No credit cards, no subscriptions, no forced VPNs. Only immediate access.
              </p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 my-6">
                {[
                  "Cricbuzz HD Server",
                  "Star Sports Hindi (IPL)",
                  "Willow Cricket Network",
                  "beIN Sports Live",
                  "Premier League VIP",
                  "NBA Live Pass HD",
                  "Sky Sports F1 Broadcast",
                  "NTV & Kantipur Live",
                ].map((ch, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-slate-300 bg-black/40 border border-white/5 px-3.5 py-2.5 rounded-xl text-left">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Zap size={10} className="text-emerald-400" />
                    </div>
                    {ch}
                  </div>
                ))}
              </div>

              <p className="leading-relaxed">
                <strong className="text-slate-200 border-b border-white/20 pb-0.5">IPL 2025 Nepal मा free हेर्ने तरिका:</strong> Select the <strong className="text-white">Cricket</strong> tab above, click on "Star Sports 1 Hindi" or "Cricbuzz HD", and instantly load the live player. We do not require any application installs logic—everything runs purely on the browser.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}