"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import { useAuth } from "@/context/AuthContext";
import { Plus, User, Heart, X, Share2, Camera, Loader2, Play, Tv } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ChillZone() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);

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
      <div className="max-w-7xl mx-auto pt-40 pb-20 px-4 md:px-6">
        
        {/* 1. HERO STREAMING SECTION (Big Cards) */}
        <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-black mb-2 text-white">Entertainment Hub 🍿</h1>
            <p className="text-slate-400 mb-8">Watch Live Sports, Movies & TV Channels for free.</p>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Live Cricket (Stadium Image) */}
                <a href="https://crichd.asia/cricket-live-streaming" target="_blank" className="relative h-64 rounded-3xl overflow-hidden group border border-blue-500/30">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-80 z-10"/>
                    <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000" className="w-full h-full object-cover group-hover:scale-110 transition duration-700"/>
                    <div className="absolute bottom-0 left-0 p-6 z-20">
                        <span className="bg-blue-600 text-xs font-bold px-2 py-1 rounded text-white mb-2 inline-block">LIVE SPORTS</span>
                        <h3 className="text-3xl font-black text-white">Cricket Live</h3>
                        <p className="text-blue-200 text-sm">Watch IPL & Nepal Matches</p>
                    </div>
                </a>

                {/* Live Football */}
                <a href="https://footballhd.su/" target="_blank" className="relative h-64 rounded-3xl overflow-hidden group border border-green-500/30">
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900 to-transparent opacity-80 z-10"/>
                    <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000" className="w-full h-full object-cover group-hover:scale-110 transition duration-700"/>
                    <div className="absolute bottom-0 left-0 p-6 z-20">
                         <span className="bg-green-600 text-xs font-bold px-2 py-1 rounded text-white mb-2 inline-block">HD STREAM</span>
                        <h3 className="text-3xl font-black text-white">Football Live</h3>
                        <p className="text-green-200 text-sm">Premier League & UCL</p>
                    </div>
                </a>

                {/* Live TV & Movies (Cinema Image) */}
                <div className="grid grid-rows-2 gap-4 h-64">
                    <a href="https://photocall.tv/" target="_blank" className="relative rounded-2xl overflow-hidden group border border-purple-500/30">
                        <div className="absolute inset-0 bg-purple-900/80 z-10 flex items-center justify-center gap-3">
                             <Tv size={32} className="text-white"/>
                             <div>
                                 <h3 className="text-xl font-bold text-white">Live TV Channels</h3>
                                 <p className="text-purple-200 text-xs">1000+ World Channels</p>
                             </div>
                        </div>
                    </a>
                    <a href="https://www.cineby.gd/" target="_blank" className="relative rounded-2xl overflow-hidden group border border-red-500/30">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-red-900/60 z-10"/>
                        <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000" className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition duration-500"/>
                        <div className="absolute inset-0 z-20 flex items-center justify-center gap-3">
                             <Play size={32} className="text-white fill-white"/>
                             <div className="text-white">
                                 <h3 className="text-xl font-bold">Movies & Series</h3>
                                 <p className="text-red-100 text-xs">Latest Hollywood / Bollywood</p>
                             </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>

        {/* 2. COMMUNITY POSTS */}
        <div className="flex justify-between items-center mb-6 border-t border-slate-800 pt-10">
            <h2 className="text-2xl font-bold">Community Posts</h2>
            <Link href={user ? "/chill-zone/create" : "/login"} className="bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition">
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
                            <h2 className="text-2xl font-bold mb-4">{selectedPost.title}</h2>
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-6">{selectedPost.body}</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}