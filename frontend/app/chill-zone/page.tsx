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
  X, Loader2, Film, Trophy
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";


  // 🏏 CRICKET
  // ── CHANNELS — Bigyann verified links ──
const channels =[
  // 1. Cricket Live HD
  {
    id: "ntv-live-hd", category: "cricket", name: "Cricket HD Live",
    url: "https://ntv.cx/embed?t=RnBicEVST3ZWdWxIOTdKVHE4MlUydFlKR00weWtLd1orQ21LeUtTNTVuQ2ZSOVpWRUt3R2FuTzVUcTRscnMwNWVVdmRseklzWDB3azJhTzR0Ukd0bnU2MkF1eWdYSU9Mbk1GaGJNODlzd1JwRllxZlVOaTdlSzQ4Wmd5dTJWbkc~",
    desc: "Main Event Live · Ads Free", badge: "LIVE HD",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Star_Sports_1_HD.png/1200px-Star_Sports_1_HD.png",
  },
  // 2. Willow HD
  {
    id: "willow", category: "cricket", name: "Willow HD",
    url: "https://ntv.cx/embed?t=TVhpbmcyU0I1MVc3V3RtQm9STU1JRnllbnVSbkttVUtvZFcyNlNNSDJ3VnVMWjU4V3hHeDc3Mk5Nc2J5bjhLb3JlZ0ZsTDdMNjM1bUZlbXN5MnFBRXRxT0dROVdNNTBFbTR1K25zWmxYbm5TOGZWa3F2ZVFkdDY1SGU2a3ZLKzlvQmVMblI1OXVZLzN0QlcyNk5iNUdRPT0~",
    desc: "ICC Matches · USA Official", badge: "HD",
    img: "https://upload.wikimedia.org/wikipedia/en/2/29/Willow_TV_logo.png",
  },
  // 3. IPL Premium 
  {
    id: "ipl-hd", category: "cricket", name: "IPL Premium",
    url: "https://w2.sportzsonline.click/channels/hd/hd1.php",
    desc: "Tata IPL Live · Ads Free", badge: "IPL",
    img: "https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Indian_Premier_League_Official_Logo.svg/1200px-Indian_Premier_League_Official_Logo.svg.png",
  },
  // 4. Tamilgun
  {
    id: "star-hindi", category: "cricket", name: "Tamilgun",
    url: "https://newcdn.tamils.click/live/tracks-v1a1/mono.m3u8",
    desc: "Hindi/Tamil Live Streams", badge: "HINDI",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Star_Sports_Hindi_1.png/1200px-Star_Sports_Hindi_1.png",
  },
  // 5. Live IPL (Alternative)
  {
    id: "ipl-live-site", category: "cricket", name: "Live IPL Embed",
    url: "https://player3.spirituallifewell.com/embed/639305398530cf2344470acffe884463?rel=0&modestbranding=1",
    desc: "Direct Player Link", badge: "ALT",
    img: "https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Indian_Premier_League_Official_Logo.svg/1200px-Indian_Premier_League_Official_Logo.svg.png",
  },
  // 6. Star Sports 1
  {
    id: "star1", category: "cricket", name: "Star Sports 1",
    url: "https://crichd.one/stream.php?id=starsp1",
    desc: "India Cricket Matches", badge: "HD",
    img: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Star_Sports_Logo.svg/1200px-Star_Sports_Logo.svg.png",
  },
  // 7. Cricbuzz HD
  {
    id: "cricbuzz", category: "cricket", name: "Cricbuzz HD",
    url: "https://playerado.top/embed2.php?id=osncric&v=su",
    desc: "Premium HD Stream", badge: "HD",
    img: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Cricbuzz_Logo.png",
  },
  {
    id: "ten", category: "cricket", name: "Ten Sports",
    url: "https://crichd.one/stream.php?id=tensp",
    desc: "Pakistan Cricket", badge: null,
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Ten_Sports_logo.svg/1200px-Ten_Sports_logo.svg.png",
  },
  // ⚽ FOOTBALL — Bigyann verified
  {
    id: "manutd-leeds", category: "football", name: "Football HD 1",
    url: "https://live5.msrktz.app/live/78905744.m3u8",
    desc: "EPL Live · Ads Free", badge: "EPL",
    img: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png",
  },
  {
    id: "ucl-stream", category: "football", name: "UCL Live",
    url: "https://live5.msrktz.app/live/97312754.m3u8",
    desc: "Champions League", badge: "UCL",
    img: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/UEFA_Champions_League_logo_2.svg/1200px-UEFA_Champions_League_logo_2.svg.png",
  },
  {
    id: "bein", category: "football", name: "beIN Sports",
    url: "https://crichd.one/stream.php?id=bein1",
    desc: "LaLiga · Serie A", badge: null,
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/BeIN_Sports_France_logo.svg/1200px-BeIN_Sports_France_logo.svg.png",
  },
  {
    id: "espn-fc", category: "football", name: "ESPN FC",
    url: "https://crichd.one/stream.php?id=espnfc",
    desc: "Global Football", badge: null,
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_logo.svg/1200px-ESPN_logo.svg.png",
  },
  // 🏀 NBA
  {
    id: "nba-tv", category: "nba", name: "NBA TV Live",
    url: "https://istreameast.app/v4",
    desc: "NBA Playoffs · Finals", badge: "NBA",
    img: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/1200px-National_Basketball_Association_logo.svg.png",
  },
  {
    id: "espn-nba", category: "nba", name: "ESPN NBA",
    url: "https://istreameast.app/v5",
    desc: "Playoffs Coverage", badge: null,
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_logo.svg/1200px-ESPN_logo.svg.png",
  },
  // 🏎️ MOTOR-SPORTS
  {
    id: "f1-sky", category: "motorsports", name: "Sky Sports F1",
    url: "https://istreameast.app/v6",
    desc: "Formula 1 Grand Prix", badge: "F1",
    img: "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Sky_Sports_F1_logo.svg/1200px-Sky_Sports_F1_logo.svg.png",
  },
  // 🎯 OTHERS
  {
    id: "ufc", category: "others", name: "UFC Fight Night",
    url: "https://ww1.sportszonline.click/channels/hd/hd2.php",
    desc: "MMA Live · Ads Free", badge: "UFC",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UFC_Logo.svg/1200px-UFC_Logo.svg.png",
  },
];


const categories = [
  { id: "all",        label: "All",         icon: "🔥", color: "from-orange-500 to-red-500" },
  { id: "cricket",    label: "Cricket",     icon: "🏏", color: "from-emerald-500 to-teal-500" },
  { id: "football",   label: "Football",    icon: "⚽", color: "from-blue-500 to-indigo-500" },
  { id: "nba",        label: "Basketball",  icon: "🏀", color: "from-orange-500 to-amber-500" },
  { id: "motorsports",label: "Motor-Sports",icon: "🏎️", color: "from-red-500 to-rose-500" },
  { id: "others",     label: "Others",      icon: "🎯", color: "from-purple-500 to-violet-500" },
];

interface ChatMsg {
  id: string; uid: string; name: string;
  initial: string; text: string; ts: number;
}

const avatarColors = [
  "from-orange-500 to-red-500",    "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",  "from-violet-500 to-purple-500",
  "from-pink-500 to-rose-500",     "from-amber-500 to-yellow-500",
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

  // Firebase chat
  useEffect(() => {
    const msgsRef = query(
      dbRef(db, "livechat/messages"),
      orderByChild("ts"), limitToLast(60)
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

  useEffect(() => {
    client.fetch(`*[_type == "chillPost"] | order(publishedAt desc) {
      _id, title, author, category, body,
      "images": images[].asset->url, publishedAt
    }`).then(d => { setPosts(d); setPostsLoading(false); })
      .catch(() => setPostsLoading(false));
  }, []);

  const sendMessage = async () => {
    const text = chatMsg.trim();
    if (!text || !user || sending) return;
    setSending(true);
    setChatMsg("");
    const name = user.displayName || user.email?.split("@")[0] || "User";
    await push(dbRef(db, "livechat/messages"), {
      uid: user.uid, name, initial: name[0].toUpperCase(),
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
      ref: iframeRef, key: activeChannel.id,
      width: "100%", height: "100%",
      frameBorder: "0" as const, scrolling: "no" as const,
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

  // Channels grouped by category for Bigyann-style sections
  const displayCategories = activeCat === "all"
    ? categories.filter(c => c.id !== "all")
    : categories.filter(c => c.id === activeCat);

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      <Navbar />
      <main className="max-w-[1500px] mx-auto pt-24 px-4 md:px-6 pb-24">

        {/* ── HEADER ── */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 px-3 py-1.5 rounded-full mb-4">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-orange-400 text-xs font-black uppercase tracking-widest">Live Now</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-2">
              <span className="text-white">Live Sports </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-rose-500">
                &amp; Movies
              </span>
              <span className="ml-3">🔥</span>
            </h1>
            <p className="text-slate-500 text-sm">
              {channels.length}+ HD Channels · IPL · EPL · NBA · F1 · UFC · Ads Free
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { icon: "📺", label: `${channels.length} Channels` },
              { icon: "⚡", label: "Free · HD" },
              { icon: "🚫", label: "No Ads" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/[0.04] border border-white/8 px-3 py-2 rounded-full text-xs text-slate-400 font-medium">
                <span>{s.icon}</span> {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── LIVE MATCHES ── */}
        <div className="mb-8">
          <LiveMatches />
        </div>

        {/* ── VIEW TOGGLE ── */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#1a1d24] border border-white/8 p-1.5 rounded-2xl flex gap-1">
            {[
              { id: "streams",  label: "Live Streams",    icon: "📺" },
              { id: "schedule", label: "Global Schedule",  icon: "📅" },
            ].map(v => (
              <button key={v.id}
                onClick={() => setActiveView(v.id as "streams" | "schedule")}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  activeView === v.id
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20"
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
            <div className="flex flex-col lg:flex-row gap-5 mb-10">

              {/* PLAYER */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/6 shadow-2xl shadow-black/80">
                  {renderPlayer()}
                  {showOverlay && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer bg-black/85 backdrop-blur-sm"
                      onClick={() => setShowOverlay(false)}>
                      <img src={activeChannel.img} alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay" />
                      {/* LIVE badge */}
                      <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 bg-orange-500 px-3 py-1.5 rounded-full text-xs font-black shadow-lg shadow-orange-500/40">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE HD
                      </div>
                      {/* Play button */}
                      <button className="relative z-30 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-2xl shadow-orange-500/40">
                        <Play size={34} className="text-white fill-white ml-1" />
                      </button>
                      {/* Channel info bottom */}
                      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 bg-gradient-to-t from-black to-transparent">
                        <div className="flex items-center gap-3">
                          <img src={activeChannel.img} alt=""
                            className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <div>
                            <h3 className="text-xl font-black text-white">{activeChannel.name}</h3>
                            <p className="text-xs text-slate-400">{activeChannel.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={handleRefresh}
                    className="flex items-center gap-2 bg-[#1a1d24] hover:bg-[#22252e] border border-white/8 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 transition">
                    <RefreshCw size={13} /> Refresh
                  </button>
                  <button onClick={() => iframeRef.current?.requestFullscreen()}
                    className="flex items-center gap-2 bg-[#1a1d24] hover:bg-[#22252e] border border-white/8 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 transition">
                    <Maximize size={13} /> Fullscreen
                  </button>
                  <a href={activeChannel.url} target="_blank" rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-2 bg-[#1a1d24] hover:bg-[#22252e] border border-white/8 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 transition">
                    Not working? Source <ExternalLink size={13} />
                  </a>
                </div>

                {/* Channel info + Reactions */}
                <div className="bg-[#1a1d24] border border-white/8 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={activeChannel.img} alt={activeChannel.name}
                      className="w-12 h-12 object-contain rounded-xl bg-black/40 p-2 border border-white/8"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div>
                      <h2 className="text-lg font-black text-white">{activeChannel.name} — Ads Free</h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="bg-orange-500/15 border border-orange-500/25 text-orange-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                          {activeChannel.category}
                        </span>
                        {activeChannel.badge && (
                          <span className="bg-white/6 border border-white/10 text-slate-300 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                            {activeChannel.badge}
                          </span>
                        )}
                      </div>
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
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/8 px-3 py-2 rounded-xl transition group">
                        <span className="group-hover:scale-125 transition-transform">{r.emoji}</span>
                        <span className="text-xs font-bold text-slate-300">{reactions[r.key]}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => navigator.share?.({ title: activeChannel.name, url: window.location.href })}
                      className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition shadow-lg shadow-orange-500/20">
                      <Share2 size={13} /> Share Stream
                    </button>
                  </div>
                </div>
              </div>

              {/* CHAT */}
              <div className="w-full lg:w-[380px] shrink-0 h-[620px] flex flex-col bg-[#111318] border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2 bg-[#1a1d24]">
                  <MessageSquare size={15} className="text-orange-400" />
                  <span className="font-black text-white text-sm uppercase tracking-wider">Live Discussion</span>
                  <span className="ml-auto flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full text-[10px] font-black text-orange-400">
                    <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" /> LIVE
                  </span>
                </div>

                <div className="p-4 border-b border-white/6 bg-[#0d0f14]">
                  {user ? (
                    <div className="space-y-2">
                      <textarea
                        value={chatMsg}
                        onChange={e => setChatMsg(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Share your thoughts... (Enter to send)"
                        maxLength={300} rows={2}
                        className="w-full bg-[#1a1d24] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-orange-500/40 transition resize-none"
                      />
                      <button onClick={sendMessage}
                        disabled={!chatMsg.trim() || sending}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 disabled:opacity-40 text-white py-2.5 rounded-xl font-black text-xs tracking-widest uppercase transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                        <Send size={12} /> Post Comment
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-xs text-slate-500 mb-3">Login to join the live discussion</p>
                      <Link href="/login"
                        className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition">
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
                            ? "bg-orange-600/20 border border-orange-500/20 rounded-tr-none"
                            : "bg-white/5 border border-white/8 rounded-tl-none"
                        }`}>
                          {msg.text}
                        </p>
                        <button className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-orange-400 mt-1 transition">
                          <ThumbsUp size={10} /> Like
                        </button>
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>
              </div>
            </div>

            {/* ── CHANNEL CATALOG — BIGYANN STYLE ── */}
            <div className="mb-12">
              {/* Top bar: LIVE SPORTS + filters */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full shrink-0 shadow-lg shadow-orange-500/20">
                  <Trophy size={14} className="text-white" />
                  <span className="text-white text-xs font-black uppercase tracking-wider">Live Sports</span>
                </div>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all shrink-0 border ${
                      activeCat === cat.id
                        ? "bg-[#1a1d24] border-orange-500/50 text-orange-400"
                        : "bg-[#1a1d24] border-white/10 text-slate-500 hover:text-white hover:border-white/25"
                    }`}>
                    <span className="mr-1">{cat.icon}</span>{cat.label}
                  </button>
                ))}
              </div>

              {/* Sections by category — Bigyann style */}
              {displayCategories.map(cat => {
                const catChannels = channels.filter(ch => ch.category === cat.id);
                if (catChannels.length === 0) return null;
                return (
                  <div key={cat.id} className="mb-10">
                    {/* Section header */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
                      <h2 className="text-base font-black text-white uppercase tracking-widest">
                        {cat.icon} {cat.label}
                      </h2>
                      <span className="bg-[#1a1d24] border border-white/10 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        {catChannels.length} channels
                      </span>
                    </div>

                    {/* Channel cards — Bigyann logo style */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {catChannels.map(ch => (
                        <button key={ch.id} onClick={() => switchChannel(ch)}
                          className={`relative group text-left rounded-2xl overflow-hidden transition-all duration-300 border bg-[#111318] ${
                            activeChannel.id === ch.id
                              ? "border-orange-500/60 ring-2 ring-orange-500/20 shadow-lg shadow-orange-500/10"
                              : "border-white/8 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                          }`}>

                          {/* Logo area */}
                          <div className="aspect-square relative flex items-center justify-center p-5 bg-[#0d0f14]">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden transition-all ${
                              activeChannel.id === ch.id ? "bg-orange-500/15" : "bg-white/5 group-hover:bg-white/8"
                            }`}>
                              <img src={ch.img} alt={ch.name}
                                className="w-12 h-12 object-contain"
                                onError={e => {
                                  const t = e.target as HTMLImageElement;
                                  t.style.display = "none";
                                  t.parentElement!.innerHTML = `<span class="text-2xl">${cat.icon}</span>`;
                                }}
                              />
                            </div>

                            {/* Watching indicator */}
                            {activeChannel.id === ch.id && (
                              <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500 px-2 py-0.5 rounded-full">
                                <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                                <span className="text-[8px] font-black text-white">LIVE</span>
                              </div>
                            )}
                            {ch.badge && (
                              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase">
                                {ch.badge}
                              </div>
                            )}
                          </div>

                          {/* Name + status */}
                          <div className="px-3 py-2.5 border-t border-white/6">
                            <p className={`text-xs font-bold truncate transition-colors ${
                              activeChannel.id === ch.id
                                ? "text-orange-400"
                                : "text-white group-hover:text-orange-300"
                            }`}>
                              {ch.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {activeChannel.id === ch.id ? (
                                <>
                                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                                  <span className="text-[9px] text-orange-400 font-bold uppercase">Watching</span>
                                </>
                              ) : (
                                <span className="text-[9px] text-slate-600 truncate">{ch.desc}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── MOVIES & SERIES ── */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full" />
                <h2 className="text-base font-black text-white uppercase tracking-widest">🎬 Movies &amp; Series</h2>
                <span className="text-xs text-slate-600 bg-[#1a1d24] border border-white/8 px-3 py-1 rounded-full ml-auto font-bold">
                  Free · No Subscription
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    href: "https://www.cineby.gd/", title: "CineBy", badge: "NO ADS • HD",
                    border: "border-pink-500/20", glow: "hover:shadow-pink-500/10",
                    img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000",
                    desc: "Latest Netflix, Hollywood & Bollywood movies free.",
                  },
                  {
                    href: "https://himovies.sx/", title: "HiMovies", badge: "FAST SERVER",
                    border: "border-violet-500/20", glow: "hover:shadow-violet-500/10",
                    img: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000",
                    desc: "Best for TV Series, Anime & International Cinema.",
                  },
                ].map((m, i) => (
                  <a key={i} href={m.href} target="_blank" rel="noopener noreferrer"
                    className={`relative h-52 rounded-2xl overflow-hidden group border ${m.border} hover:shadow-2xl ${m.glow} transition-all duration-500`}>
                    <div className="absolute inset-0 bg-black/65 group-hover:bg-black/45 transition z-10" />
                    <img src={m.img} alt={m.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-6">
                      <h3 className="text-3xl font-black text-white mb-2">{m.title}</h3>
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full mb-2">{m.badge}</span>
                      <p className="text-slate-200 text-xs">{m.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* ── SEO BLOCK ── */}
            <div className="mb-12 p-6 bg-[#111318] border border-white/6 rounded-2xl">
              <h2 className="text-base font-black text-white mb-3">
                Watch Live Cricket, Football &amp; Sports Free in Nepal 🏏⚽
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Tikajoshi Chill Zone — Nepal को best platform for{" "}
                <strong className="text-slate-300">live IPL cricket free</strong>, Premier League,
                NBA basketball, Formula 1 र UFC. No VPN, no subscription needed. Ads free!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["IPL Live HD Nepal","Star Sports 1 Live","Premier League Stream","NBA Live Free",
                  "beIN Sports Nepal","Sky F1 Stream","UFC Fight Live","Cricbuzz HD Nepal"].map((ch, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-500 bg-white/3 border border-white/6 px-3 py-2 rounded-lg">
                    <span className="text-orange-400">✓</span> {ch}
                  </div>
                ))}
              </div>
            </div>

            {/* ── COMMUNITY POSTS ── */}
            <div className="border-t border-white/6 pt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-pink-500 rounded-full" />
                <h2 className="text-base font-black text-white uppercase tracking-widest">Student Community</h2>
                <Link href={user ? "/chill-zone/create" : "/login"}
                  className="ml-auto flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg hover:opacity-90 transition">
                  {user ? <><Plus size={13} /> Create Post</> : <><User size={13} /> Login to Post</>}
                </Link>
              </div>

              {postsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-orange-500 w-7 h-7" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-14 bg-[#111318] border border-dashed border-white/8 rounded-2xl">
                  <div className="text-5xl mb-3">🍿</div>
                  <p className="text-slate-500 font-medium">No posts yet — be the first!</p>
                  <Link href={user ? "/chill-zone/create" : "/login"}
                    className="inline-block mt-4 text-sm font-bold text-orange-400 hover:text-orange-300">
                    Create a post →
                  </Link>
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
                  {posts.map((post, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      onClick={() => setSelectedPost(post)}
                      className="break-inside-avoid bg-[#111318] border border-white/8 rounded-2xl overflow-hidden hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                      {post.images?.[0] && (
                        <img src={post.images[0]} alt={post.title} className="w-full h-auto object-cover" />
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20 uppercase">
                            {post.category}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-orange-300 transition">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white">
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
          <div className="bg-[#111318] border border-white/8 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/8 bg-[#1a1d24]">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
                <h2 className="text-base font-black text-white uppercase tracking-wider">Live Sports Schedule</h2>
              </div>
              <p className="text-slate-500 text-xs mt-1 ml-4">Real-time cricket data from CricAPI</p>
            </div>
            <div className="p-6">
              <LiveMatches />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-t border-white/6">
              {[
                { title: "Today's Big Games",  desc: "IPL, Premier League, NBA — links updated 30 min before kickoff." },
                { title: "Streaming Tips",     desc: "High-speed internet recommended. Click Refresh if stream freezes." },
                { title: "No Ads Policy",      desc: "Ad-free streams. Support us by sharing tikajoshi.com.np!" },
              ].map((c, i) => (
                <div key={i} className="bg-[#1a1d24] border border-white/8 rounded-2xl p-5">
                  <h3 className="text-xs font-black text-orange-400 uppercase tracking-wider mb-2">{c.title}</h3>
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
              className="bg-[#111318] border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/60 backdrop-blur rounded-full hover:bg-orange-600 transition border border-white/10">
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
              <div className="md:w-2/5 p-6 md:p-8 bg-[#111318] border-l border-white/8 flex flex-col overflow-y-auto">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20 uppercase self-start mb-3">
                  {selectedPost.category}
                </span>
                <h2 className="text-xl font-black text-white mb-4">{selectedPost.title}</h2>
                <div className="flex items-center gap-2 mb-5 pb-5 border-b border-white/8">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-xs font-black">
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