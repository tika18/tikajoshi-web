"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import { useAuth } from "@/context/AuthContext";
import { Plus, User, Heart, MessageCircle, Loader2, X, Share2, Camera } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ChillZone() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null); // For Modal

  useEffect(() => {
    client.fetch(`*[_type == "chillPost"] | order(publishedAt desc) {
        _id, title, author, category, body,
        "images": images[].asset->url,
        publishedAt
    }`).then(data => { setPosts(data); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto py-24 px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div>
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 mb-2">CHILL ZONE 🤘</h1>
                <p className="text-slate-400">The Student Community.</p>
            </div>
            <Link href={user ? "/chill-zone/create" : "/login"} className="bg-pink-600 hover:bg-pink-500 px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-pink-500/20 transition">
                {user ? <><Plus size={18}/> New Post</> : <><User size={18}/> Login to Post</>}
            </Link>
        </div>

        {/* Masonry Grid */}
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-pink-500 w-10 h-10"/></div>
        ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {posts.map((post, i) => (
                    <div 
                        key={i} 
                        onClick={() => setSelectedPost(post)}
                        className="break-inside-avoid bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden hover:border-pink-500/50 transition group cursor-pointer hover:shadow-2xl hover:-translate-y-1 duration-300"
                    >
                        {post.images && post.images.length > 0 && (
                            <div className="relative">
                                <img src={post.images[0]} alt="Post" className="w-full h-auto object-cover"/>
                                {post.images.length > 1 && (
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs flex items-center gap-1 font-bold">
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
                                    {post.author[0].toUpperCase()}
                                </div>
                                {post.author}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* FLOATING MODAL (POPUP) */}
        <AnimatePresence>
            {selectedPost && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedPost(null)}
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#0f172a] border border-slate-700 w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Left: Image Viewer (Scrollable if multiple) */}
                        <div className="md:w-3/5 bg-black flex flex-col overflow-y-auto max-h-[50vh] md:max-h-[90vh] custom-scrollbar">
                            {selectedPost.images?.map((img: string, idx: number) => (
                                <img key={idx} src={img} className="w-full h-auto object-contain" />
                            ))}
                            {!selectedPost.images && <div className="h-full flex items-center justify-center text-slate-500">No Image</div>}
                        </div>

                        {/* Right: Content */}
                        <div className="md:w-2/5 p-8 flex flex-col h-full bg-[#1e293b] relative">
                            <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
                                <X size={20}/>
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-lg">
                                    {selectedPost.author[0].toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold">{selectedPost.author}</h4>
                                    <p className="text-xs text-slate-400">{new Date(selectedPost.publishedAt).toDateString()}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2">
                                <h2 className="text-2xl font-bold mb-4">{selectedPost.title}</h2>
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedPost.body}</p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-700 flex gap-4">
                                <button className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg hover:text-pink-500 transition font-bold text-sm">
                                    <Heart size={18}/> Like
                                </button>
                                <button className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg hover:text-blue-500 transition font-bold text-sm">
                                    <Share2 size={18}/> Share
                                </button>
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