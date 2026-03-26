"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import { useAuth } from "@/context/AuthContext";
import { Plus, User, Heart, Share2, Play, Tv, VolumeX, MessageSquare, Send, Film, MonitorPlay, X, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- LIVE CHANNELS CONFIGURATION (NEW HD LINK ADDED) ---
const channels = [
  { 
    id: "cricbuzz-hd", 
    category: "cricket", 
    name: "Cricbuzz Live HD 🔥", 
    url: "https://playerado.top/embed2.php?id=osncric&v=su", 
    desc: "Full HD Premium Stream", 
    img: "https://images.unsplash.com/photo-1531415074968-055a44455887?q=80&w=1200" 
  },
  { 
    id: "star", 
    category: "cricket", 
    name: "Star Sports 1 (IPL)", 
    url: "https://crichd.one/stream.php?id=starsp1", 
    desc: "IPL & India Cricket", 
    img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200" 
  },
  { 
    id: "willow", 
    category: "cricket", 
    name: "Willow Cricket", 
    url: "https://crichd.one/stream.php?id=willow", 
    desc: "ICC Matches", 
    img: "https://images.unsplash.com/photo-1631194758628-71ec7c35137e?q=80&w=1200" 
  },
  { 
    id: "football-main", 
    category: "football", 
    name: "Live Football HD", 
    url: "https://istreameast.app/v17", 
    desc: "Premier League", 
    img: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1200" 
  },
  { 
    id: "ten", 
    category: "cricket", 
    name: "Ten Sports", 
    url: "https://crichd.one/stream.php?id=tensp", 
    desc: "Pakistan Cricket", 
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

  useEffect(() => {
    client.fetch(`*[_type == "chillPost"] | order(publishedAt desc) {
        _id, title, author, category, body,
        "images": images[].asset->url,
        publishedAt
    }`).then(data => { setPosts(data); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  const switchChannel = (channel: any) => {
    setActiveChannel(channel);
    setShowOverlay(true); 
  };

  return (
    <div className="min-h-screen bg-[#0b101a] text-white">
      <Navbar />
      <div className="max-w-[1400px] mx-auto pt-24 md:pt-32 pb-20 px-4 md:px-6">
        
        {/* HEADER */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl md:text-5xl font-black mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                  Live Action 🔥
                </h1>
                <p className="text-slate-400 text-sm md:text-base">Watch Free HD Streams & Chat with Friends</p>
            </div>
        </div>

        {/* TRENDING CHANNELS (Horizontal Scroll) */}
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-4 mb-6">
            <div className="flex items-center gap-2 bg-red-600/20 text-red-500 font-bold px-4 py-2 rounded-full border border-red-500/30 whitespace-nowrap">
                <Tv size={18} /> TRENDING NOW
            </div>
            {channels.map((channel) => (
                <button 
                    key={channel.id}
                    onClick={() => switchChannel(channel)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold border transition-all whitespace-nowrap ${
                        activeChannel.id === channel.id 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] text-white" 
                        : "bg-[#161e2c] border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                >
                    {activeChannel.id === channel.id && <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>}
                    {channel.name}
                </button>
            ))}
        </div>

        {/* ========================================================
            1. LIVE PLAYER & CHAT SECTION
           ======================================================== */}
        <div className="grid lg:grid-cols-10 gap-6 mb-16">
            
            {/* MAIN PLAYER (Left Side - 70%) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
                    <iframe 
                        key={activeChannel.id} 
                        src={activeChannel.url}
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        allowFullScreen={true}
                        className="w-full h-full relative z-10"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    ></iframe>

                    {/* OVERLAY UI */}
                    {showOverlay && (
                        <div 
                            className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center cursor-pointer backdrop-blur-sm transition-all duration-500 group-hover:bg-black/60"
                            onClick={() => setShowOverlay(false)}
                        >
                            <img src={activeChannel.img} className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
                            <button className="relative z-30 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse transition transform scale-105 text-lg border-2 border-red-400/50">
                                <Play size={24} className="fill-white"/> CLICK TO PLAY & UNMUTE
                            </button>
                            <div className="absolute top-4 right-4 bg-red-600 px-3 py-1 rounded text-xs font-bold shadow-lg flex items-center gap-2 z-30">
                                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span> LIVE HD
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Info & Source */}
                <div className="flex justify-between items-center bg-[#161e2c] p-3 rounded-xl border border-slate-800 flex-wrap gap-2">
                    <div>
                        <h2 className="text-lg font-bold text-white">{activeChannel.name}</h2>
                        <span className="text-xs text-slate-400 flex items-center gap-1"><MonitorPlay size={14}/> Extracted Stream</span>
                    </div>
                    <a href={activeChannel.url} target="_blank" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 px-4 py-2 rounded-lg transition border border-blue-500/20">
                        Source Link <ExternalLink size={14}/>
                    </a>
                </div>
            </div>

            {/* LIVE DISCUSSION CHAT (Right Side - 30%) */}
            <div className="lg:col-span-3 bg-[#131b28] border border-slate-800 rounded-2xl flex flex-col h-[500px] lg:h-full overflow-hidden shadow-xl">
                <div className="bg-[#1a2332] p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="text-blue-500" size={20}/>
                        <h3 className="font-bold text-white">Live Discussion</h3>
                    </div>
                    <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-1 rounded animate-pulse">LIVE</span>
                </div>
                
                {/* Chat Messages Area (Static for now, next step: Firebase) */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">A</div>
                        <div>
                            <span className="text-xs text-slate-400 font-bold">Admin <span className="text-[10px] ml-1 text-slate-500">Just now</span></span>
                            <p className="text-sm text-slate-200 bg-slate-800 p-2.5 rounded-r-xl rounded-bl-xl mt-1 border border-slate-700 shadow-sm">Welcome to the chill zone! Stream buffering? Try refreshing.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">U</div>
                        <div>
                            <span className="text-xs text-slate-400 font-bold">User123 <span className="text-[10px] ml-1 text-slate-500">1 min ago</span></span>
                            <p className="text-sm text-slate-200 bg-slate-800 p-2.5 rounded-r-xl rounded-bl-xl mt-1 border border-slate-700 shadow-sm">HD quality is amazing today 🔥</p>
                        </div>
                    </div>
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-[#1a2332] border-t border-slate-800">
                    {user ? (
                        <div className="flex gap-2 relative">
                            <input type="text" placeholder="Share your thoughts..." className="w-full bg-[#0b101a] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition pr-12 text-white"/>
                            <button className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white w-10 rounded-lg flex items-center justify-center transition shadow-lg shadow-blue-500/30">
                                <Send size={16}/>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                            <p className="text-xs text-slate-400 mb-2">You must be logged in to chat.</p>
                            <Link href="/login" className="text-sm font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-4 py-1.5 rounded-full inline-block">Login Here</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* ========================================================
            2. MOVIES & SERIES
           ======================================================== */}
        <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-600 p-2 rounded-lg shadow-lg shadow-pink-500/20"><Film className="text-white" size={20}/></div>
                <h2 className="text-2xl font-bold">Movies & Series</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <a href="https://www.cineby.gd/" target="_blank" className="relative h-48 md:h-64 rounded-2xl md:rounded-3xl overflow-hidden group border border-pink-500/30 shadow-lg block">
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition z-10"/>
                    <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000" className="w-full h-full object-cover transition duration-700 group-hover:scale-110"/>
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-6">
                        <h3 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">CineBy</h3>
                        <span className="bg-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">NO ADS • HD</span>
                        <p className="text-slate-200 mt-2 text-xs md:text-sm drop-shadow-md">Watch latest Netflix & Hollywood movies.</p>
                    </div>
                </a>

                <a href="https://himovies.sx/" target="_blank" className="relative h-48 md:h-64 rounded-2xl md:rounded-3xl overflow-hidden group border border-purple-500/30 shadow-lg block">
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition z-10"/>
                    <img src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000" className="w-full h-full object-cover transition duration-700 group-hover:scale-110"/>
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-6">
                        <h3 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">HiMovies</h3>
                        <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">FAST SERVER</span>
                        <p className="text-slate-200 mt-2 text-xs md:text-sm drop-shadow-md">Best alternative for TV Series & Cinema.</p>
                    </div>
                </a>
            </div>
        </div>

        {/* ========================================================
            3. COMMUNITY POSTS
           ======================================================== */}
        <div className="flex justify-between items-center mb-6 border-t border-slate-800 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <User className="text-blue-500" size={24}/> Student Community
            </h2>
            <Link href={user ? "/chill-zone/create" : "/login"} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 transition shadow-lg shadow-blue-500/20">
                 {user ? <><Plus size={16}/> Create Post</> : <><User size={16}/> Login to Post</>}
            </Link>
        </div>
        
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 w-8 h-8"/></div>
        ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {posts.map((post, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i} 
                        onClick={() => setSelectedPost(post)}
                        className="break-inside-avoid bg-[#161e2c] border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition group cursor-pointer hover:shadow-2xl hover:-translate-y-1 duration-300"
                    >
                        {post.images && post.images.length > 0 && (
                            <div className="relative">
                                <img src={post.images[0]} alt="Post" className="w-full h-auto object-cover border-b border-slate-800"/>
                            </div>
                        )}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-slate-800 text-[10px] font-bold px-2 py-1 rounded text-blue-400 uppercase tracking-wide border border-slate-700">{post.category}</span>
                                <span className="text-[10px] text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-sm md:text-base font-bold mb-3 text-white line-clamp-2 group-hover:text-blue-400 transition">{post.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                                    {post.author ? post.author[0].toUpperCase() : 'U'}
                                </div>
                                <span className="font-medium">{post.author || "Anonymous"}</span>
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
                    className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                    onClick={() => setSelectedPost(null)}
                >
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-[#0f172a] border border-slate-700 w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur rounded-full hover:bg-red-500 transition text-white border border-white/10">
                            <X size={20}/>
                        </button>
                        
                        {/* Modal Image Side */}
                        <div className="md:w-3/5 bg-[#0b101a] flex flex-col overflow-y-auto max-h-[40vh] md:max-h-full custom-scrollbar justify-center border-r border-slate-800">
                            {selectedPost.images?.length > 0 ? selectedPost.images.map((img: string, idx: number) => (
                                <img key={idx} src={img} className="w-full h-auto object-contain" />
                            )) : (
                                <div className="flex items-center justify-center h-full text-slate-600"><Film size={48} className="opacity-20"/></div>
                            )}
                        </div>
                        
                        {/* Modal Text Side */}
                        <div className="md:w-2/5 p-6 md:p-8 flex flex-col h-full bg-[#161e2c] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border border-blue-500/20">{selectedPost.category}</span>
                                <span className="text-xs text-slate-500">{new Date(selectedPost.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white leading-tight">{selectedPost.title}</h2>
                            
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner">
                                    {selectedPost.author ? selectedPost.author[0].toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{selectedPost.author || "Anonymous"}</p>
                                    <p className="text-[10px] text-slate-500">Student Member</p>
                                </div>
                            </div>

                            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed mb-6 flex-1">{selectedPost.body}</p>
                            
                            <div className="mt-auto pt-4 flex gap-4">
                                <button className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-pink-600 hover:text-white px-4 py-3 rounded-xl transition font-bold text-xs text-slate-300 border border-slate-700 hover:border-pink-500"><Heart size={18}/> Like</button>
                                <button className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-blue-600 hover:text-white px-4 py-3 rounded-xl transition font-bold text-xs text-slate-300 border border-slate-700 hover:border-blue-500"><Share2 size={18}/> Share</button>
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