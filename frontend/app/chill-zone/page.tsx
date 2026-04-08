"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  ref as dbRef, push, onValue, query,
  orderByChild, limitToLast, serverTimestamp
} from "firebase/database";
import {
  Play, Tv, ExternalLink, Send, Share2,
  MessageSquare, Maximize, VolumeX, RefreshCw, ThumbsUp, Heart, Star
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SofaScoreWidget from "@/components/SofaScoreWidget";

// ─── CHANNELS ────────────────────────────────────────────────
// ─── TRENDING MATCHES (Schedule Today) ──────────────────────
const trendingMatches = [
  { id: "ipl-rr-mi", title: "RR vs MI (Ads Free)", category: "IPL", status: "LIVE NOW",
    team1: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/This_is_the_logo_for_Rajasthan_Royals%2C_a_cricket_team_playing_in_the_IPL.png/1280px-This_is_the_logo_for_Rajasthan_Royals.png",
    team2: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/1200px-Mumbai_Indians_Logo.svg.png",
    url: "https://w2.sportzsonline.click/channels/hd/hd1.php" },
  { id: "ipl-rcb-csk", title: "RCB vs CSK (Hindi)", category: "IPL", status: "8:00 PM",
    team1: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Royal_Challengers_Bengaluru_Logo.svg/1200px-Royal_Challengers_Bengaluru_Logo.svg.png",
    team2: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png",
    url: "https://mut001.myturn1.top:8088/live/webcricn04/playlist.m3u8?vidictid=20550319506" },
  { id: "ucl-rm-bm", title: "Real Madrid vs Bayern", category: "UCL", status: "1:00 AM",
    team1: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png",
    team2: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
    url: "https://live5.msrktz.app/live/97312754.m3u8" },
  { id: "epl-ars-liv", title: "Arsenal vs Liverpool", category: "EPL", status: "LIVE NOW",
    team1: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png",
    team2: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png",
    url: "https://live5.msrktz.app/live/78905744.m3u8" }
];

const channels = [
  // CRICKET
  { id: "cricbuzz-hd", category: "CRICKET", name: "Cricbuzz HD 🔥",
    url: "https://playerado.top/embed2.php?id=osncric&v=su", desc: "Full HD Premium • Best Quality", badge: "HD", views: "3.2K LIVE", img: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Cricbuzz_Logo.png" },
  { id: "star1", category: "CRICKET", name: "Star Sports 1",
    url: "https://crichd.one/stream.php?id=starsp1", desc: "IPL & India Cricket", badge: "IPL", views: "1.9K LIVE", img: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Star_Sports_Logo.svg/1200px-Star_Sports_Logo.svg.png" },
  { id: "star-hindi", category: "CRICKET", name: "Star Sports Hindi",
    url: "https://newcdn.tamils.click/live/tracks-v1a1/mono.m3u8", desc: "IPL Hindi Commentary", badge: "HINDI", views: "4.5K LIVE", img: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Star_Sports_Logo.svg/1200px-Star_Sports_Logo.svg.png" },
  { id: "willow", category: "CRICKET", name: "Willow Cricket",
    url: "https://ntv.cx/embed?t=RnBicEVST3ZWdWxIOTdKVHE4MlUycy92eDUvdG80bjlEK3VWOU9rOFg5SHhMZnFZREY1TGpxQk9pSncxSmhncjQ5R0JVR3NGWW1oTWNONFNNOXhiWitVQlNtRWtmQ2h1R1RreFhwRWlKd3M9", desc: "US/Canada Cricket Broadcaster", badge: "LIVE", views: "850 LIVE", img: "https://upload.wikimedia.org/wikipedia/en/2/29/Willow_TV_logo.png" },
  { id: "ipl-hd", category: "CRICKET", name: "IPL Premium HD",
    url: "https://w2.sportzsonline.click/channels/hd/hd1.php", desc: "Tata IPL Live Feed", badge: "HD", views: "9.1K LIVE", img: "https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Indian_Premier_League_Official_Logo.svg/1200px-Indian_Premier_League_Official_Logo.svg.png" },
  // FOOTBALL
  { id: "football-premier", category: "FOOTBALL", name: "Premier League HD",
    url: "https://live5.msrktz.app/live/78905744.m3u8", desc: "EPL Premium Stream", badge: "EPL", views: "5.1K LIVE", img: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png" },
  { id: "bein", category: "FOOTBALL", name: "beIN Sports HD",
    url: "https://crichd.one/stream.php?id=bein1", desc: "Champions League & LaLiga", badge: "UCL", views: "2.3K LIVE", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/BeIN_Sports_France_logo.svg/1200px-BeIN_Sports_France_logo.svg.png" },
  { id: "espn-fc", category: "FOOTBALL", name: "ESPN FC",
    url: "https://crichd.one/stream.php?id=espnfc", desc: "Global Football Coverage", badge: "LIVE", views: "740 LIVE", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_logo.svg/1200px-ESPN_logo.svg.png" },
  // BASKETBALL
  { id: "nba-tv", category: "BASKETBALL", name: "NBA TV Live",
    url: "https://istreameast.app/v4", desc: "NBA Games & Highlights", badge: "NBA", views: "1.5K LIVE", img: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/1200px-National_Basketball_Association_logo.svg.png" },
  // MOTOR-SPORTS
  { id: "f1-sky", category: "MOTOR-SPORTS", name: "Sky Sports F1",
    url: "https://istreameast.app/v6", desc: "Formula 1 Grand Prix", badge: "F1", views: "3.8K LIVE", img: "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Sky_Sports_F1_logo.svg/1200px-Sky_Sports_F1_logo.svg.png" },
  // TV CHANNEL & OTHERS
  { id: "ufc", category: "OTHERS", name: "UFC Fight Night",
    url: "https://ww1.sportszonline.click/channels/hd/hd2.php", desc: "MMA Action LIVE", badge: "UFC", views: "4.8K LIVE", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UFC_Logo.svg/1200px-UFC_Logo.svg.png" },
];

const categories = ["ALL", "CRICKET", "FOOTBALL", "BASKETBALL", "MOTOR-SPORTS", "TV CHANNEL", "OTHERS"];

// ─── CHAT MESSAGE TYPE ────────────────────────────────────────
interface ChatMsg {
  id: string;
  uid: string;
  name: string;
  initial: string;
  text: string;
  ts: number;
}

export default function LiveTVPage() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [showOverlay, setShowOverlay] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeViewMode, setActiveViewMode] = useState<"PLAYER"|"SCHEDULE">("PLAYER");
  const [scheduleSport, setScheduleSport] = useState("cricket");
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [sending, setSending] = useState(false);
  
  // Fake reaction counters
  const [reactions, setReactions] = useState({ fire: 124, heart: 89, clap: 42, wow: 31 });

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ── Listen to Firebase chat ──────────────────────────────
  useEffect(() => {
    const msgsRef = query(
      dbRef(db, "livechat/messages"),
      orderByChild("ts"),
      limitToLast(60)
    );
    const unsub = onValue(msgsRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      const arr: ChatMsg[] = Object.entries(data).map(([id, v]: any) => ({
        id,
        uid: v.uid,
        name: v.name,
        initial: v.initial,
        text: v.text,
        ts: v.ts,
      }));
      arr.sort((a, b) => a.ts - b.ts);
      setMessages(arr);
    });
    return () => unsub();
  }, []);

  // ── Auto-scroll ──────────────────────────────────────────
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ─────────────────────────────────────────
  const sendMessage = async () => {
    const text = chatMsg.trim();
    if (!text || !user || sending) return;
    setSending(true);
    setChatMsg("");
    const displayName = user.displayName || user.email?.split("@")[0] || "User";
    await push(dbRef(db, "livechat/messages"), {
      uid: user.uid,
      name: displayName,
      initial: displayName[0].toUpperCase(),
      text,
      ts: serverTimestamp(),
    });
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const filteredChannels = activeCategory === "ALL"
    ? channels
    : channels.filter(c => c.category === activeCategory);

  const switchChannel = (ch: typeof channels[0]) => {
    setActiveChannel(ch);
    setShowOverlay(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = currentSrc;
      }, 100);
    }
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: activeChannel.name,
        text: "Watching Live Sports on Tikajoshi HD!",
        url: window.location.href,
      });
    } catch (e) {
      console.log("Share skipped", e);
    }
  };

  // ── Avatar colors ────────────────────────────────────────
  const avatarColors = [
    "from-red-500 to-orange-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-violet-500 to-purple-500",
  ];
  const colorFor = (uid: string) => avatarColors[uid.charCodeAt(0) % avatarColors.length];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans font-inter pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-[1500px] mx-auto pt-24 px-4 md:px-6">
        
        {/* ── TRENDING MATCHES TODAY ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-widest">Trending Today</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
            {trendingMatches.map(match => (
              <button 
                key={match.id}
                onClick={() => {
                  setActiveChannel({ id: match.id, category: match.category, name: match.title, url: match.url, desc: "Live Event", badge: "LIVE", views: "Trending", img: "" });
                  setShowOverlay(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-4 min-w-[280px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] p-3 rounded-xl transition-all shrink-0 snap-start group"
              >
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                  <img src={match.team1} alt="Team 1" className="w-8 h-8 object-contain" />
                  <span className="text-xs font-bold text-slate-500">VS</span>
                  <img src={match.team2} alt="Team 2" className="w-8 h-8 object-contain" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-black text-red-500 mb-0.5 uppercase">{match.status}</span>
                  <span className="block text-sm font-bold text-foreground group-hover:text-red-400 transition-colors">{match.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── TOP SEGMENTED CONTROL ── */}
        <div className="flex justify-center mb-10">
          <div className="bg-card border border-border p-1.5 rounded-2xl flex items-center gap-1 shadow-2xl">
            <button
              onClick={() => setActiveViewMode("PLAYER")}
              className={`px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 ${activeViewMode === "PLAYER" ? "bg-red-600 text-white shadow-lg shadow-red-600/30" : "text-muted-foreground hover:text-foreground"}`}
            >
              Live Streams
            </button>
            <button
              onClick={() => setActiveViewMode("SCHEDULE")}
              className={`px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 ${activeViewMode === "SCHEDULE" ? "bg-red-600 text-white shadow-lg shadow-red-600/30" : "text-muted-foreground hover:text-foreground"}`}
            >
              Global Schedule
            </button>
          </div>
        </div>

        {activeViewMode === "PLAYER" ? (
          <>
            {/* TWO COLUMN WIDE LAYOUT FOR PLAYER */}
            <div className="flex flex-col lg:flex-row gap-6 mb-12">
          
          {/* ── LEFT COLUMN: PLAYER & INFO (65%) ── */}
          <div className="flex-1 w-full flex flex-col">
            
            {/* Player Container */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden ring-1 ring-white/[0.08] shadow-2xl shadow-black/80">
              <div className="absolute top-4 left-4 z-30 inline-flex items-center gap-2 px-2.5 py-1 bg-red-600/90 backdrop-blur-md rounded-md border border-red-500/50">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-[10px] font-black tracking-widest text-white uppercase">Live Now</span>
              </div>

              {activeChannel.url.includes(".m3u8") ? (
                <iframe
                  ref={iframeRef}
                  key={activeChannel.id}
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style> body { margin: 0; background: #000; overflow: hidden; } video { width: 100vw; height: 100vh; object-fit: contain; } </style>
                        <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
                      </head>
                      <body>
                        <video id="video" controls autoplay playsinline></video>
                        <script>
                          var video = document.getElementById('video');
                          var videoSrc = '${activeChannel.url}';
                          if (Hls.isSupported()) {
                            var hls = new Hls({ maxBufferLength: 30 });
                            hls.loadSource(videoSrc);
                            hls.attachMedia(video);
                            hls.on(Hls.Events.MANIFEST_PARSED, function() { video.play(); });
                          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                            video.src = videoSrc;
                            video.addEventListener('loadedmetadata', function() { video.play(); });
                          }
                        </script>
                      </body>
                    </html>
                  `}
                  width="100%" height="100%"
                  frameBorder="0" scrolling="no" allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  className="w-full h-full relative bg-black object-contain"
                />
              ) : (
                <iframe
                  ref={iframeRef}
                  key={activeChannel.id}
                  src={activeChannel.url}
                  width="100%" height="100%"
                  frameBorder="0" scrolling="no" allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  className="w-full h-full relative bg-black object-contain"
                />
              )}

              {showOverlay && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer bg-black/80 backdrop-blur-sm transition-all"
                  onClick={() => setShowOverlay(false)}
                >
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <img src={activeChannel.img} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_40px_rgba(239,68,68,0.4)] z-30 relative group">
                    <Play size={36} className="ml-1.5 fill-white text-white group-hover:drop-shadow-md" />
                  </div>
                </div>
              )}
            </div>

            {/* Utility Bar */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button onClick={handleRefresh} className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-4 py-2.5 rounded-lg text-xs font-bold text-slate-300 transition-colors">
                <RefreshCw size={14} /> REFRESH
              </button>
              <button className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-4 py-2.5 rounded-lg text-xs font-bold text-slate-300 transition-colors">
                <VolumeX size={14} /> UNMUTE
              </button>
              <button onClick={handleFullscreen} className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-4 py-2.5 rounded-lg text-xs font-bold text-slate-300 transition-colors">
                <Maximize size={14} /> VIEW
              </button>
              <a href={activeChannel.url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-4 py-2.5 rounded-lg text-xs font-bold text-slate-300 transition-colors">
                EXTERNAL <ExternalLink size={14} />
              </a>
            </div>

            {/* Channel Info & Tags */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-6 border-b border-white/[0.06] mt-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">{activeChannel.name} — Ads free</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-[10px] px-2.5 py-1 rounded-md tracking-widest uppercase">
                    {activeChannel.category}
                  </span>
                  <span className="bg-white/5 border border-white/10 text-slate-300 font-bold text-[10px] px-2.5 py-1 rounded-md tracking-widest uppercase">
                    {activeChannel.views}
                  </span>
                  {activeChannel.badge && (
                    <span className="bg-white/5 border border-white/10 text-slate-300 font-bold text-[10px] px-2.5 py-1 rounded-md tracking-widest uppercase">
                      {activeChannel.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 bg-white/5 p-1.5 rounded-xl border border-white/10">
                <button onClick={handleShare} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 text-[#1877F2] transition"><Share2 size={20} /></button>
                <div className="w-px h-6 bg-white/10" />
                <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 text-[#25D366] transition"><MessageSquare size={20} /></button>
              </div>
            </div>

            {/* Reactions & Big Share Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">React:</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setReactions(r => ({...r, fire: r.fire+1}))} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition group">
                    <span className="group-hover:scale-125 transition-transform duration-300">🔥</span> <span className="text-xs font-bold text-slate-300">{reactions.fire}</span>
                  </button>
                  <button onClick={() => setReactions(r => ({...r, heart: r.heart+1}))} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition group">
                    <span className="group-hover:scale-125 transition-transform duration-300">❤️</span> <span className="text-xs font-bold text-slate-300">{reactions.heart}</span>
                  </button>
                  <button onClick={() => setReactions(r => ({...r, clap: r.clap+1}))} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition group">
                    <span className="group-hover:scale-125 transition-transform duration-300">👏</span> <span className="text-xs font-bold text-slate-300">{reactions.clap}</span>
                  </button>
                </div>
              </div>
              <button onClick={handleShare} className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs tracking-widest px-8 py-3.5 rounded-xl uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20">
                <Share2 size={16} /> Share Stream
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: CHAT (35%) ── */}
          <div className="w-full lg:w-[400px] shrink-0 h-[650px] flex flex-col bg-[#0f111a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
            
            <div className="bg-[#151822] border-b border-white/[0.08] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquare size={16} className="text-white" />
                <span className="font-bold text-white text-sm tracking-wider uppercase">Discussion Live</span>
              </div>
            </div>

            {/* Input Box (Top of chat like Bigyann) */}
            <div className="p-4 bg-[#0a0c10] border-b border-white/[0.04]">
               {user ? (
                <div className="space-y-3">
                  <textarea
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Share thoughts..."
                    maxLength={300}
                    rows={2}
                    className="w-full bg-[#151822] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-red-500/50 transition-colors resize-none custom-scrollbar"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!chatMsg.trim() || sending}
                    className="w-full bg-[#8c2a2a] hover:bg-[#a63232] disabled:opacity-50 text-white py-2.5 rounded-lg flex items-center justify-center font-bold text-[11px] tracking-widest uppercase transition-colors"
                  >
                    Post Comment
                  </button>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-slate-400 mb-3">Sign in to join the discussion</p>
                  <Link href="/login" className="inline-block bg-[#8c2a2a] hover:bg-[#a63232] px-6 py-2 rounded-lg text-[11px] font-bold text-white tracking-widest uppercase transition">
                    Log In
                  </Link>
                </div>
              )}
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar bg-[#0f111a]">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full opacity-30 gap-2">
                  <MessageSquare size={32} />
                  <p className="text-xs font-medium">No discussions yet</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colorFor(msg.uid)} flex items-center justify-center text-xs font-black shrink-0 shadow-lg`}>
                    {msg.initial}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{msg.name}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                         {msg.ts ? "Just Now" : ""}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-300 leading-relaxed font-medium break-words mb-2 pl-1">
                      {msg.text}
                    </p>
                    <div className="flex items-center gap-4 text-slate-500 pl-1">
                      <button className="text-[11px] font-bold hover:text-white transition flex items-center gap-1"><ThumbsUp size={12}/> Like</button>
                      <button className="text-[11px] font-bold hover:text-white transition">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

          </div>
        </div>

        {/* ── BOTTOM SECTION: CATEGORIES & THUMBNAILS ── */}
        <div className="mt-8 mb-20 bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-border pb-6">
            <h2 className="text-2xl font-bold tracking-tight inline-flex items-center gap-3 text-foreground">
              <Tv size={24} className="text-red-500" /> Channels Catalog
            </h2>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all ${
                    activeCategory === cat
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : "bg-transparent border border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredChannels.map(ch => (
              <button
                key={ch.id}
                onClick={() => switchChannel(ch)}
                className={`relative group rounded-2xl overflow-hidden transition-all duration-300 text-left outline-none ${
                  activeChannel.id === ch.id
                    ? "ring-2 ring-red-500 ring-offset-2 ring-offset-[#12141c]"
                    : "hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
                }`}
              >
                <div className="aspect-[16/10] relative w-full bg-[#1c1f2e] border-b border-white/[0.05]">
                  <img src={ch.img} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b14] via-[#0a0b14]/40 to-transparent opacity-80" />
                  
                  {activeChannel.id === ch.id && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                       <span className="bg-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Watching</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 z-20 bg-[#0a0b14]/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-200">
                      {ch.category}
                    </span>
                  </div>
                </div>
                <div className="bg-card p-4 relative z-10 border-t border-border">
                  <h4 className="text-foreground font-bold text-[13px] tracking-tight mb-1 truncate">{ch.name}</h4>
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider truncate">{ch.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
          </>
        ) : (
          <div className="flex flex-col gap-8 w-full max-w-[1200px] mx-auto">
            {/* Global Multi-Sport Aggregator Widget (SofaScore) */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[900px]">
              {/* Widget Header with Sub-tabs */}
              <div className="bg-card z-20 flex flex-col md:flex-row md:items-center px-6 py-4 border-b border-border gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <h2 className="text-lg font-black tracking-widest text-foreground uppercase">Live Sports Schedule</h2>
                </div>
                
                <div className="ml-auto flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: "cricket", label: "Cricket", icon: "🏏" },
                    { id: "football", label: "Football", icon: "⚽" },
                    { id: "basketball", label: "Basketball", icon: "🏀" },
                    { id: "tennis", label: "Tennis", icon: "🎾" },
                    { id: "motorsport", label: "F1/MotoGP", icon: "🏎️" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setScheduleSport(s.id)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 border ${
                        scheduleSport === s.id 
                          ? "bg-foreground text-background border-foreground" 
                          : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                      }`}
                    >
                      <span>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* The actual Widget */}
              <div className="flex-1 p-4 bg-[#0a0c10]">
                <SofaScoreWidget sport={scheduleSport} />
              </div>

              <div className="bg-muted/30 px-6 py-3 border-t border-border flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Real-time data powered by SofaScore API • Auto-Updates 
                </p>
                <Link href="/chill-zone" className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">
                  Refresh View
                </Link>
              </div>
            </div>
            
            {/* Professional Bottom Info card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border p-6 rounded-2xl">
                 <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Today's Big Games</h3>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Check the schedule to find channels for IPL, Premier League, and NBA playoffs. Links are updated 30 mins before kick-off.
                 </p>
              </div>
              <div className="bg-card border border-border p-6 rounded-2xl">
                 <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Live Streaming tips</h3>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   For best quality, use high-speed internet. If a stream freezes, click the refresh button above the player.
                 </p>
              </div>
              <div className="bg-card border border-border p-6 rounded-2xl">
                 <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">No Ads Policy</h3>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   We strive to keep our playback environment ad-free. Support us by sharing the website with your friends.
                 </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}