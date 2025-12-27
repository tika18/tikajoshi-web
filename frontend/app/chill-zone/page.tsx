"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import { useAuth } from "@/context/AuthContext";
import { Plus, User, Camera, MessageCircle, Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ChillZone() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query with Multiple Images
    client.fetch(`*[_type == "chillPost"] | order(publishedAt desc) {
        title, author, category, isGuest,
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
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-2">CHILL ZONE 🤘</h1>
                <p className="text-slate-400">Share your rides, moments & experiences.</p>
            </div>
            
            {/* Create Button Logic */}
            {user ? (
                <Link href="/chill-zone/create" className="bg-pink-600 hover:bg-pink-500 px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-pink-500/20 transition">
                    <Plus size={18}/> New Post
                </Link>
            ) : (
                <Link href="/login" className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-full font-bold flex items-center gap-2 border border-slate-700 transition">
                    <User size={18}/> Login to Post
                </Link>
            )}
        </div>

        {/* Masonry Grid */}
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-pink-500"/></div>
        ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {posts.map((post, i) => (
                    <div key={i} className="break-inside-avoid bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden hover:border-pink-500/50 transition group">
                        
                        {/* Image Gallery (First Image) */}
                        {post.images && post.images.length > 0 && (
                            <div className="relative">
                                <img src={post.images[0]} alt="Post" className="w-full h-auto"/>
                                {post.images.length > 1 && (
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs flex items-center gap-1">
                                        <Camera size={12}/> +{post.images.length - 1}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-slate-800 text-xs font-bold px-2 py-1 rounded text-pink-400">{post.category}</span>
                                <span className="text-xs text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-4">{post.title}</h3>
                            
                            <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs">
                                        {post.author[0]}
                                    </div>
                                    <span className="text-sm text-slate-300">{post.author}</span>
                                </div>
                                <div className="flex gap-3 text-slate-500">
                                    <Heart size={18} className="hover:text-red-500 cursor-pointer transition"/>
                                    <MessageCircle size={18} className="hover:text-blue-500 cursor-pointer transition"/>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}