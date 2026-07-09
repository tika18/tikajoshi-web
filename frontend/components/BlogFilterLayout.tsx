"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tag, Clock, Calendar, Search, Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  slug: string;
  imageUrl: string;
  readingTime: string;
}

interface BlogFilterLayoutProps {
  initialPosts: Post[];
}

const CATEGORIES = ["All", "NEPSE News", "Technical Analysis", "IPO Updates", "Vehicles & Tech"];

function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case "Technical Analysis":
      return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
    case "IPO Updates":
      return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    case "Vehicles & Tech":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    default: // NEPSE News
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  }
}

export default function BlogFilterLayout({ initialPosts }: BlogFilterLayoutProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "readingTime">("newest");

  // Filtering & Sorting logic
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...initialPosts];

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(q) || 
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q)
      );
    }

    // Sort posts
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    } else if (sortBy === "readingTime") {
      const getMins = (str: string) => parseInt(str.split(" ")[0]) || 0;
      result.sort((a, b) => getMins(b.readingTime) - getMins(a.readingTime));
    }

    return result;
  }, [initialPosts, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-8">
      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="bg-white/[0.015] backdrop-blur-md border border-white/[0.06] rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search articles by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#080d16] text-white rounded-2xl border border-white/[0.08] focus:border-violet-500/50 outline-none text-sm font-medium transition-all"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-end">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpDown size={14} /> Sort By:
          </span>
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {(["newest", "oldest", "readingTime"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortBy(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black capitalize transition-all ${
                  sortBy === mode
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {mode === "readingTime" ? "Reading Time" : mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 border shrink-0 ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-500 shadow-[0_4px_20px_rgba(124,58,237,0.3)] scale-[1.02]"
                : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── POSTS GRID ── */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredAndSortedPosts.map((post) => (
            <motion.div
              key={post._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col justify-between w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/20 hover:shadow-[0_20px_40px_-15px_rgba(115,96,242,0.12)]"
              >
                {/* Main Card Image */}
                <div className="relative aspect-[16/10] bg-white/5 overflow-hidden">
                  <Image
                    src={post.imageUrl || "/og-image.jpg"}
                    alt={post.title}
                    fill
                    className="object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
                  />
                  <span className={`absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${getCategoryBadgeClass(post.category)}`}>
                    <Tag size={9} />
                    {post.category}
                  </span>
                </div>

                {/* Card details */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5 text-[10px] text-slate-500 font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} className="text-violet-400" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} className="text-violet-400" />
                        {post.readingTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-violet-400 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-white transition-colors mt-4 uppercase tracking-wider font-bold">
                    Read Article →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAndSortedPosts.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
            <SlidersHorizontal className="mx-auto text-slate-600 mb-3" size={32} />
            <p className="text-slate-400 font-semibold text-base mb-1">No articles found</p>
            <p className="text-slate-600 text-xs">Try adjusting your filters or search query.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
