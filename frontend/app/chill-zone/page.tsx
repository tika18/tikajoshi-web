"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import { useAuth } from "@/context/AuthContext";
import { Plus, User, Heart, Share2, Play, Tv, VolumeX, Radio, Film, MonitorPlay, X, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- LIVE CHANNELS CONFIGURATION ---
const channels = [
  {
    id: "willow",
    category: "cricket",
    name: "Willow Cricket",
    url: "https://crichd.one/stream.php?id=willow",
    desc: "ICC World Cup & USA Cricket",
    img: "https://images.unsplash.com/photo-1631194758628-71ec7c35137e?q=80&w=1200"
  },
  {
    id: "football-main",
    category: "football",
    name: "Live Football HD",
    // NOTE: If this link fails, try: https://v2.sportsonline.so/channels/pt/sporttv1.php
    url: "https://istreameast.app/v17", 
    desc: "Premier League / La Liga",
    img: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1200"
  },
  {
    id: "star",
    category: "cricket",
    name: "Star Sports 1",
    url: "https://crichd.one/stream.php?id=starsp1",
    desc: "IPL, India Cricket & Asia Cup",
    img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200"
  },
  {
    id: "ten",
    category: "cricket",
    name: "Ten Sports",
    url: "https://crichd.one/stream.php?id=tensp",
    desc: "Pakistan & International Cricket",
    img: "https://images.unsplash.com/photo-1531415074968-055a44455887?q=80&w=1200"
  }
];

export default function ChillZone() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  
  // Player State
  const [activeChannel, setActiveChannel] = useState(channels[0]); 
  const [showOverlay, setShowOverlay] = useState(true); 

  // Fetch Community Posts
  useEffect(() => {
    client.fetch(`*[_type == "chillPost"] | order(publishedAt desc) {
        _id, title, author, category, body,
        "images": images[].asset->url,
        publishedAt
    }`).then(data => { setPosts(data); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  // Switch Channel Function
  const switchChannel = (channel: any) => {
    setActiveChannel(channel);
    setShowOverlay(true); 
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-24 md:pt-36 pb-20 px-4 md:px-6">
        
        {/* HERO HEADER */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl md:text-5xl font-black mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Chill Zone <span className="text-white">🍿</span>
                </h1>
                <p className="text-slate-400 text-sm md:text-lg">Live Sports, Movies & Community.</p>
            </div>
            
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Live Streaming</span>
            </div>
        </div>

        {/* ========================================================
            1. LIVE PLAYER SECTION
           ======================================================== */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
            
            {/* MAIN PLAYER (Left Side) */}
            <div className="lg:col-span-2 flex flex-col gap-3">
                <div className="relative w-full aspect-video bg-black rounded-xl md:rounded-3xl overflow-hidden border border-slate-700 shadow-2xl group">
                    
                    {/* IFRAME (Sandbox Removed for CricHD support) */}
                    <iframe 
                        key={activeChannel.id} 
                        src={activeChannel.url}
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        allowFullScreen={true}
                        className="w-full h-full relative z-10"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        // FIX: Removed 'sandbox' attribute to let CricHD play
                    ></iframe>

                    {/* OVERLAY UI (Click to Unmute / Watch) */}
                    {showOverlay && (
                        <div 
                            className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center cursor-pointer backdrop-blur-[2px] transition-all duration-500 group-hover:bg-black/40"
                            onClick={() => setShowOverlay(false)}
                        >
                            <img 
                                src={activeChannel.img} 
                                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
                            />

                            <button className="relative z-30 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-2xl shadow-orange-500/40 animate-bounce transition transform scale-110">
                                <VolumeX size={24} className="fill-white"/> Click to Unmute
                            </button>
                            
                            <div className="absolute top-4 right-4 bg-red-600 px-3 py-1 rounded text-xs font-bold shadow-lg flex items-center gap-2 z-30">
                                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span> LIVE
                            </div>

                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-left z-30">
                                <h3 className="text-xl md:text-3xl font-black text-white">{activeChannel.name}</h3>
                                <p className="text-slate-300 text-xs md:text-sm mt-1">{activeChannel.desc}</p>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Info Text & Fallback Button */}
                <div className="flex justify-between items-center text-xs text-slate-500 px-2 flex-wrap gap-2">
                    <span className="flex items-center gap-1 uppercase tracking-wider"><MonitorPlay size={12}/> Source: External Stream</span>
                    
                    {/* Fallback Button if blocked */}
                    <a 
                        href={activeChannel.url} 
                        target="_blank" 
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold bg-blue-900/20 px-2 py-1 rounded"
                    >
                        Not working? Watch on Source <ExternalLink size={12}/>
                    </a>
                </div>
            </div>

            {/* CHANNEL LIST (Right Side) */}
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl md:rounded-3xl p-4 md:p-6 h-full flex flex-col max-h-[500px] lg:max-h-auto">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 sticky top-0 bg-[#1e293b] z-10 pb-2 border-b border-slate-700">
                    <Tv className="text-blue-500"/> Live Channels
                </h3>
                
                <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {channels.map((channel) => (
                        <div 
                            key={channel.id}
                            onClick={() => switchChannel(channel)}
                            className={`p-3 rounded-xl cursor-pointer transition border flex items-center gap-3 group ${
                                activeChannel.id === channel.id 
                                ? "bg-blue-600 border-blue-500 shadow-lg" 
                                : "bg-slate-900/50 border-slate-800 hover:bg-slate-800"
                            }`}
                        >
                            <div className={`p-2 rounded-full ${activeChannel.id === channel.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                                {channel.category === 'football' ? <Radio size={16}/> : <Play size={16}/>}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-bold text-sm ${activeChannel.id === channel.id ? "text-white" : "text-slate-300"}`}>{channel.name}</h4>
                                <p className={`text-[10px] ${activeChannel.id === channel.id ? "text-blue-100" : "text-slate-500"}`}>
                                    {activeChannel.id === channel.id ? "Playing Now..." : "Click to Watch"}
                                </p>
                            </div>
                            {activeChannel.id === channel.id && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* ========================================================
            2. MOVIES & SERIES
           ======================================================== */}
        <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-600 p-2 rounded-lg"><Film className="text-white" size={20}/></div>
                <h2 className="text-2xl font-bold">Movies & Series</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <a href="https://www.cineby.gd/" target="_blank" className="relative h-48 md:h-64 rounded-2xl md:rounded-3xl overflow-hidden group border border-pink-500/30 shadow-lg">
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition z-10"/>
                    <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000" className="w-full h-full object-cover transition duration-700 group-hover:scale-110"/>
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-6">
                        <h3 className="text-3xl md:text-4xl font-black text-white mb-2">CineBy</h3>
                        <span className="bg-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">NO ADS • HD</span>
                        <p className="text-slate-200 mt-2 text-xs md:text-sm">Watch latest Netflix & Hollywood movies.</p>
                    </div>
                </a>

                <a href="https://himovies.sx/" target="_blank" className="relative h-48 md:h-64 rounded-2xl md:rounded-3xl overflow-hidden group border border-purple-500/30 shadow-lg">
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition z-10"/>
                    <img src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000" className="w-full h-full object-cover transition duration-700 group-hover:scale-110"/>
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-6">
                        <h3 className="text-3xl md:text-4xl font-black text-white mb-2">HiMovies</h3>
                        <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">FAST SERVER</span>
                        <p className="text-slate-200 mt-2 text-xs md:text-sm">Best alternative for TV Series & Cinema.</p>
                    </div>
                </a>
            </div>
        </div>

        {/* ========================================================
            3. COMMUNITY POSTS
           ======================================================== */}
        <div className="flex justify-between items-center mb-6 border-t border-slate-800 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white">Student Community</h2>
            <Link href={user ? "/chill-zone/create" : "/login"} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 transition border border-slate-700">
                 {user ? <><Plus size={16}/> Create Post</> : <><User size={16}/> Login to Post</>}
            </Link>
        </div>
        
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-pink-500 w-8 h-8"/></div>
        ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {posts.map((post, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i} 
                        onClick={() => setSelectedPost(post)}
                        className="break-inside-avoid bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden hover:border-pink-500/50 transition group cursor-pointer hover:shadow-2xl hover:-translate-y-1 duration-300"
                    >
                        {post.images && post.images.length > 0 && (
                            <div className="relative">
                                <img src={post.images[0]} alt="Post" className="w-full h-auto object-cover"/>
                            </div>
                        )}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-slate-800 text-[10px] font-bold px-2 py-1 rounded text-pink-400 uppercase tracking-wide">{post.category}</span>
                                <span className="text-[10px] text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-sm md:text-base font-bold mb-2 line-clamp-2">{post.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                                    {post.author ? post.author[0].toUpperCase() : 'U'}
                                </div>
                                {post.author || "Anonymous"}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}

        {/* MODAL (Post View) */}
        <AnimatePresence>
            {selectedPost && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedPost(null)}
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#0f172a] border border-slate-700 w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => setSelectedPost(null)} className="absolute top-3 right-3 z-10 p-2 bg-black/50 rounded-full hover:bg-red-500 transition text-white">
                            <X size={18}/>
                        </button>
                        <div className="md:w-3/5 bg-black flex flex-col overflow-y-auto max-h-[40vh] md:max-h-full custom-scrollbar justify-center">
                            {selectedPost.images?.map((img: string, idx: number) => (
                                <img key={idx} src={img} className="w-full h-auto object-contain" />
                            ))}
                        </div>
                        <div className="md:w-2/5 p-6 flex flex-col h-full bg-[#1e293b] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">{selectedPost.title}</h2>
                            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed mb-6">{selectedPost.body}</p>
                            <div className="mt-auto pt-4 border-t border-slate-700 flex gap-4">
                                <button className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg hover:text-pink-500 transition font-bold text-xs"><Heart size={16}/> Like</button>
                                <button className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg hover:text-blue-500 transition font-bold text-xs"><Share2 size={16}/> Share</button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}