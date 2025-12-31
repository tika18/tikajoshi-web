"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import { useAuth } from "@/context/AuthContext";
import { Plus, User, Heart, X, Share2, Camera, Loader2, Play, Tv, Film, Radio, ChevronRight, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- LIVE CHANNELS DATA ---
const channels = [
  {
    id: "willow",
    name: "Willow Cricket",
    url: "https://crichd.one/stream.php?id=willow",
    img: "https://images.unsplash.com/photo-1631194758628-71ec7c35137e?q=80&w=2000",
    desc: "ICC World Cup & USA Cricket"
  },
  {
    id: "star",
    name: "Star Sports 1",
    url: "https://crichd.one/stream.php?id=starsp1",
    img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000",
    desc: "IPL, India Cricket & Asia Cup"
  },
  {
    id: "ten",
    name: "Ten Sports",
    url: "https://crichd.one/stream.php?id=tensp",
    img: "https://images.unsplash.com/photo-1531415074968-055a44455887?q=80&w=2000",
    desc: "Pakistan & International Cricket"
  }
];

export default function ChillZone() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  
  // Player State
  const [activeChannel, setActiveChannel] = useState(channels[0]); // Default: Willow
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch Community Posts
  useEffect(() => {
    client.fetch(`*[_type == "chillPost"] | order(publishedAt desc) {
        _id, title, author, category, body,
        "images": images[].asset->url,
        publishedAt
    }`).then(data => { setPosts(data); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-36 pb-20 px-4 md:px-6">
        
        {/* HERO SECTION */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-4xl md:text-6xl font-black mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Chill Zone <span className="text-white">🍿</span>
                </h1>
                <p className="text-slate-400 text-lg">Live Sports, Movies & Community.</p>
            </div>
            
            {/* Quick Status */}
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Live Matches Available</span>
            </div>
        </div>

        {/* ========================================================
            1. LIVE SPORTS DASHBOARD (TV Style)
           ======================================================== */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16">
            
            {/* MAIN PLAYER (Left Side - Big) */}
            <div className="lg:col-span-2">
                <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-slate-700 shadow-2xl group">
                    
                    {!isPlaying ? (
                        /* --- COVER UI --- */
                        <div className="absolute inset-0 cursor-pointer" onClick={() => setIsPlaying(true)}>
                            {/* Dynamic Background */}
                            <img 
                                src={activeChannel.img} 
                                alt="Live Sports" 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-700"
                            />
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                            {/* Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center z-30">
                                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-2xl shadow-red-600/40 animate-pulse transition transform group-hover:scale-110">
                                    <Play size={32} className="fill-white"/> Watch {activeChannel.name}
                                </button>
                            </div>

                            {/* Top Badges */}
                            <div className="absolute top-6 right-6 z-30 flex gap-2">
                                <span className="bg-black/50 backdrop-blur border border-white/10 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                                    <Radio size={12} className="text-red-500"/> HD STREAM
                                </span>
                            </div>

                            {/* Bottom Info */}
                            <div className="absolute bottom-0 left-0 p-8 z-30 w-full">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Live Now</span>
                                    <span className="text-slate-300 text-xs font-mono uppercase tracking-widest">{activeChannel.name}</span>
                                </div>
                                <h3 className="text-3xl font-black text-white">{activeChannel.desc}</h3>
                            </div>
                        </div>
                    ) : (
                        /* --- IFRAME PLAYER --- */
                        <div className="w-full h-full relative bg-black">
                            <iframe 
                                src={activeChannel.url}
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                allowFullScreen={true}
                                className="w-full h-full"
                                allow="autoplay; encrypted-media"
                            ></iframe>
                            
                            {/* Close Button */}
                            <button 
                                onClick={() => setIsPlaying(false)}
                                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 p-2 rounded-full text-white z-50 transition shadow-lg"
                                title="Exit Player"
                            >
                                <X size={20}/>
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-slate-500 mt-3 text-center uppercase tracking-wider flex justify-center items-center gap-1">
                    <MonitorPlay size={12}/> Stream Source: CricHD • Use AdBlocker for best experience
                </p>
            </div>

            {/* CHANNEL SELECTOR (Right Side - List) */}
            <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 h-full flex flex-col">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Tv className="text-blue-500"/> Select Channel
                </h3>
                
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {channels.map((channel) => (
                        <div 
                            key={channel.id}
                            onClick={() => { setActiveChannel(channel); setIsPlaying(false); }}
                            className={`p-4 rounded-xl cursor-pointer transition border flex items-center gap-4 group ${
                                activeChannel.id === channel.id 
                                ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/20" 
                                : "bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-600"
                            }`}
                        >
                            <div className={`p-3 rounded-full ${activeChannel.id === channel.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400 group-hover:text-white"}`}>
                                <Play size={16} className={activeChannel.id === channel.id ? "fill-white" : ""}/>
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${activeChannel.id === channel.id ? "text-white" : "text-slate-300"}`}>{channel.name}</h4>
                                <p className={`text-[10px] ${activeChannel.id === channel.id ? "text-blue-100" : "text-slate-500"}`}>Click to Switch</p>
                            </div>
                            {activeChannel.id === channel.id && <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                        </div>
                    ))}

                    <div className="border-t border-slate-700 my-4"></div>

                    {/* Football Link */}
                    <a href="https://footballhd.su/" target="_blank" className="p-4 rounded-xl border border-green-900/30 bg-green-900/10 hover:bg-green-900/20 transition flex items-center gap-4 group">
                        <div className="bg-green-500/20 text-green-500 p-3 rounded-full"><Radio size={16}/></div>
                        <div>
                            <h4 className="font-bold text-sm text-green-400">Live Football</h4>
                            <p className="text-[10px] text-green-200/50">External Link</p>
                        </div>
                        <ChevronRight size={16} className="ml-auto text-green-500"/>
                    </a>
                </div>
            </div>
        </div>

        {/* ========================================================
            2. MOVIES & SERIES SECTION
           ======================================================== */}
        <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-600 p-2 rounded-lg"><Film className="text-white" size={24}/></div>
                <h2 className="text-3xl font-bold">Movies & TV Series</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                
                {/* 1. CineBy */}
                <a href="https://www.cineby.gd/" target="_blank" className="relative h-64 rounded-3xl overflow-hidden group border border-pink-500/30 shadow-lg">
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition z-10"/>
                    <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200" className="w-full h-full object-cover transition duration-700 group-hover:scale-110"/>
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-6">
                        <h3 className="text-4xl font-black text-white mb-2 tracking-tight">CineBy</h3>
                        <span className="bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">NO ADS • HD</span>
                        <p className="text-slate-200 mt-4 text-sm max-w-md">Watch latest Netflix, Amazon Prime & Hollywood movies for free.</p>
                    </div>
                </a>

                {/* 2. HiMovies (Alternative) */}
                <a href="https://himovies.sx/" target="_blank" className="relative h-64 rounded-3xl overflow-hidden group border border-purple-500/30 shadow-lg">
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition z-10"/>
                    <img src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1200" className="w-full h-full object-cover transition duration-700 group-hover:scale-110"/>
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-6">
                        <h3 className="text-4xl font-black text-white mb-2 tracking-tight">HiMovies</h3>
                        <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">FAST SERVER</span>
                        <p className="text-slate-200 mt-4 text-sm max-w-md">The best alternative for streaming TV Series & Cinema.</p>
                    </div>
                </a>

            </div>
        </div>

        {/* ========================================================
            3. COMMUNITY POSTS
           ======================================================== */}
        <div className="flex justify-between items-center mb-6 border-t border-slate-800 pt-10">
            <h2 className="text-2xl font-bold text-white">Student Community</h2>
            <Link href={user ? "/chill-zone/create" : "/login"} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition border border-slate-700">
                 {user ? <><Plus size={16}/> Create Post</> : <><User size={16}/> Login to Post</>}
            </Link>
        </div>
        
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-pink-500 w-10 h-10"/></div>
        ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {posts.map((post, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i} 
                        onClick={() => setSelectedPost(post)}
                        className="break-inside-avoid bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden hover:border-pink-500/50 transition group cursor-pointer hover:shadow-2xl hover:-translate-y-1 duration-300"
                    >
                        {post.images && post.images.length > 0 && (
                            <div className="relative">
                                <img src={post.images[0]} alt="Post" className="w-full h-auto object-cover"/>
                                {post.images.length > 1 && (
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs flex items-center gap-1 font-bold text-white">
                                        <Camera size={12}/> +{post.images.length - 1}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-slate-800 text-[10px] font-bold px-2 py-1 rounded text-pink-400 uppercase tracking-wide">{post.category}</span>
                                <span className="text-xs text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                    {post.author ? post.author[0].toUpperCase() : 'U'}
                                </div>
                                {post.author || "Anonymous"}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}

        {/* MODAL */}
        <AnimatePresence>
            {selectedPost && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedPost(null)}
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#0f172a] border border-slate-700 w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-red-500 transition text-white">
                            <X size={20}/>
                        </button>
                        <div className="md:w-3/5 bg-black flex flex-col overflow-y-auto max-h-[40vh] md:max-h-full custom-scrollbar">
                            {selectedPost.images?.map((img: string, idx: number) => (
                                <img key={idx} src={img} className="w-full h-auto object-contain mb-2" />
                            ))}
                        </div>
                        <div className="md:w-2/5 p-6 md:p-8 flex flex-col h-full bg-[#1e293b] overflow-y-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-lg">
                                    {selectedPost.author ? selectedPost.author[0].toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h4 className="font-bold">{selectedPost.author || "Anonymous"}</h4>
                                    <p className="text-xs text-slate-400">{new Date(selectedPost.publishedAt).toDateString()}</p>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-4">{selectedPost.title}</h2>
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-6">{selectedPost.body}</p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-700 flex gap-4">
                                <button className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg hover:text-pink-500 transition font-bold text-sm"><Heart size={18}/> Like</button>
                                <button className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg hover:text-blue-500 transition font-bold text-sm"><Share2 size={18}/> Share</button>
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