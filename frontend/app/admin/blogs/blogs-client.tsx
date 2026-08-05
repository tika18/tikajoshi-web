// frontend/app/admin/blogs/blogs-client.tsx
"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePost, bulkDeletePosts, bulkPublishPosts } from "@/actions/sanity";
import { useToast } from "@/components/Toast";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckSquare,
  Square,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  Globe,
  Bot,
  X,
} from "lucide-react";

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  _createdAt: string;
  _updatedAt: string;
  imageUrl?: string;
  status: "published" | "draft" | "scheduled";
}

export default function BlogsClient({ initialPosts }: { initialPosts: Post[] }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "scheduled">("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "title-asc">("date-desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null); // tracks row-level loading

  // AI Blog Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLang, setAiLang] = useState<"en" | "ne" | "romanized">("en");
  const [aiTopic, setAiTopic] = useState("");
  const [aiCategory, setAiCategory] = useState("Market");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStep, setAiStep] = useState<string | null>(null);

  const pageSize = 8;

  // 1. Filtering & Sorting
  const processedPosts = useMemo(() => {
    let result = [...posts];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.publishedAt || b._createdAt).getTime() - new Date(a.publishedAt || a._createdAt).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.publishedAt || a._createdAt).getTime() - new Date(b.publishedAt || b._createdAt).getTime();
      }
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [posts, searchQuery, statusFilter, sortBy]);

  // 2. Pagination
  const totalPages = Math.ceil(processedPosts.length / pageSize) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedPosts.slice(start, start + pageSize);
  }, [processedPosts, currentPage]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  // 3. Selection Helpers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedPosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedPosts.map((p) => p._id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // 4. Operations
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setActionId(id);
    const toastId = toast("Deleting blog...", "loading");

    const res = await deletePost(id);
    setActionId(null);

    startTransition(() => {
      if (res.success) {
        toast("Blog deleted successfully", "success");
        setPosts((prev) => prev.filter((p) => p._id !== id));
        setSelectedIds((prev) => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        });
        router.refresh();
      } else {
        toast(res.error || "Failed to delete blog", "error");
      }
    });
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!confirm(`Are you sure you want to delete ${count} selected post(s)?`)) return;

    const toastId = toast(`Deleting ${count} post(s)...`, "loading");
    const idsArray = Array.from(selectedIds);

    const res = await bulkDeletePosts(idsArray);

    startTransition(() => {
      if (res.success) {
        toast(`${count} post(s) deleted successfully`, "success");
        setPosts((prev) => prev.filter((p) => !selectedIds.has(p._id)));
        setSelectedIds(new Set());
        router.refresh();
      } else {
        toast(res.error || "Bulk delete failed", "error");
      }
    });
  };

  const handleBulkPublishState = async (publish: boolean) => {
    const count = selectedIds.size;
    const toastId = toast(`${publish ? "Publishing" : "Unpublishing"} ${count} post(s)...`, "loading");
    const idsArray = Array.from(selectedIds);

    const res = await bulkPublishPosts(idsArray, publish);

    startTransition(() => {
      if (res.success) {
        toast(`${count} post(s) updated successfully`, "success");
        
        // Update local state statuses
        const updatedPosts = posts.map((post) => {
          if (selectedIds.has(post._id)) {
            const now = new Date().toISOString();
            return {
              ...post,
              publishedAt: publish ? now : "",
              status: publish ? ("published" as const) : ("draft" as const),
            };
          }
          return post;
        });
        setPosts(updatedPosts);
        setSelectedIds(new Set());
        router.refresh();
      } else {
        toast(res.error || "Bulk update failed", "error");
      }
    });
  };

  const handleGenerateAiBlog = async () => {
    setAiGenerating(true);
    setAiStep("1. Connecting to Gemini AI...");

    try {
      const res = await fetch("/api/auto-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic.trim() || undefined,
          lang: aiLang,
          category: aiCategory,
          targetPage: aiCategory.toLowerCase().includes("market") ? "market" : "general",
          secret: "tikajoshi-auto-blog-password",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast(`Generated and published: "${data.title}"`, "success");
        setShowAiModal(false);
        setAiTopic("");

        // Add newly generated post to top of list
        const newPost: Post = {
          _id: data.slug || `ai-${Date.now()}`,
          title: data.title,
          slug: data.slug,
          excerpt: data.topic || "",
          publishedAt: new Date().toISOString(),
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
          imageUrl: data.imageUrl,
          status: "published",
        };
        setPosts((prev) => [newPost, ...prev]);
        router.refresh();
      } else {
        toast(data.error || "Failed to generate blog", "error");
      }
    } catch (err: any) {
      toast(err.message || "AI blog generation failed", "error");
    } finally {
      setAiGenerating(false);
      setAiStep(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Content Manager</h1>
          <p className="text-xs text-slate-500 mt-1">Publish, schedule, search and edit blog content</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 border border-emerald-400/20 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/10"
          >
            <Sparkles size={15} /> AI Auto Blog Generator
          </button>
          <Link
            href="/admin/blogs/new"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10"
          >
            <Plus size={15} /> Write New Post
          </Link>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-[#05090f]/75 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search by title, slug, or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/60 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl px-2.5 py-1.5">
            <Filter size={12} className="text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-[#080d14]">All Statuses</option>
              <option value="published" className="bg-[#080d14]">Published</option>
              <option value="draft" className="bg-[#080d14]">Drafts</option>
              <option value="scheduled" className="bg-[#080d14]">Scheduled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl px-2.5 py-1.5">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold outline-none cursor-pointer pr-1"
            >
              <option value="date-desc" className="bg-[#080d14]">Latest First</option>
              <option value="date-asc" className="bg-[#080d14]">Oldest First</option>
              <option value="title-asc" className="bg-[#080d14]">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#080d14]/90 backdrop-blur-xl border border-indigo-500/25 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-40 animate-fade-up">
          <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">
            {selectedIds.size} post(s) selected
          </span>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkPublishState(true)}
              disabled={isPending}
              className="px-3 py-1.5 bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold transition flex items-center gap-1 disabled:opacity-50"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkPublishState(false)}
              disabled={isPending}
              className="px-3 py-1.5 bg-yellow-600/25 hover:bg-yellow-600/40 border border-yellow-500/30 text-yellow-300 rounded-lg text-[10px] font-bold transition flex items-center gap-1 disabled:opacity-50"
            >
              Unpublish
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg text-[10px] font-bold transition flex items-center gap-1 disabled:opacity-50"
            >
              <Trash2 size={10} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-[#05090f]/75 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] font-black uppercase tracking-wider text-slate-500 select-none">
                <th className="py-4 px-5 w-12 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-500 hover:text-slate-300 transition">
                    {selectedIds.size === paginatedPosts.length && paginatedPosts.length > 0 ? (
                      <CheckSquare size={14} className="text-indigo-400 mx-auto" />
                    ) : (
                      <Square size={14} className="mx-auto" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4 w-16">Cover</th>
                <th className="py-4 px-4 min-w-[200px]">Title</th>
                <th className="py-4 px-4">Slug</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-5 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {paginatedPosts.map((post) => {
                const isSelected = selectedIds.has(post._id);
                const isLoading = actionId === post._id;

                return (
                  <tr
                    key={post._id}
                    className={`hover:bg-white/[0.01] transition-all duration-150 ${
                      isSelected ? "bg-indigo-600/[0.02]" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => toggleSelect(post._id)}
                        className="text-slate-500 hover:text-slate-300 transition"
                      >
                        {isSelected ? (
                          <CheckSquare size={14} className="text-indigo-400 mx-auto" />
                        ) : (
                          <Square size={14} className="mx-auto" />
                        )}
                      </button>
                    </td>

                    {/* Image */}
                    <td className="py-3.5 px-4">
                      <div className="w-10 h-10 bg-white/5 rounded-lg overflow-hidden border border-white/5 relative flex items-center justify-center font-bold text-sm">
                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt="" className="object-cover w-full h-full" />
                        ) : (
                          "📄"
                        )}
                      </div>
                    </td>

                    {/* Title & Excerpt */}
                    <td className="py-3.5 px-4 pr-6 min-w-[200px]">
                      <span className="font-bold text-white block truncate max-w-sm" title={post.title}>
                        {post.title}
                      </span>
                      {post.excerpt && (
                        <span className="text-[10px] text-slate-500 block truncate max-w-xs mt-0.5">
                          {post.excerpt}
                        </span>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                      /{post.slug || "no-slug"}
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full ${
                          post.status === "published"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : post.status === "scheduled"
                            ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                            : "bg-slate-500/10 border border-slate-500/20 text-slate-400"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(post.publishedAt || post._createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/blogs/${post._id}/edit`}
                          className="p-1.5 bg-white/[0.03] hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded-lg transition"
                          title="Edit Post"
                        >
                          <Edit2 size={12} />
                        </Link>
                        {post.status === "published" && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white/[0.03] hover:bg-cyan-600/10 border border-white/5 hover:border-cyan-500/20 text-slate-400 hover:text-cyan-400 rounded-lg transition"
                            title="View Live Blog"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(post._id, post.title)}
                          disabled={isLoading || isPending}
                          className="p-1.5 bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition disabled:opacity-50"
                          title="Delete Post"
                        >
                          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {processedPosts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    No blogs found. Try writing a new post or updating your filters!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-white/[0.01] border-t border-white/5 px-6 py-4 flex items-center justify-between">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, processedPosts.length)} of {processedPosts.length} blogs
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-slate-400 rounded-lg disabled:opacity-30 disabled:hover:bg-white/[0.03] transition"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold px-3 py-1 bg-white/[0.03] border border-white/5 rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-slate-400 rounded-lg disabled:opacity-30 disabled:hover:bg-white/[0.03] transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* AI Auto Blog Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0b101b] border border-emerald-500/25 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">AI Auto Blog Generator</h3>
                  <p className="text-xs text-slate-400">Generate & publish SEO-optimized articles with Gemini AI</p>
                </div>
              </div>
              <button
                onClick={() => !aiGenerating && setShowAiModal(false)}
                disabled={aiGenerating}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="space-y-4">
              {/* 1. Language Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Language Choice
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiLang("en")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      aiLang === "en"
                        ? "bg-emerald-600 text-white border-emerald-400/40 shadow-lg shadow-emerald-600/20"
                        : "bg-white/[0.03] text-slate-400 border-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>🇬🇧 English</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiLang("ne")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      aiLang === "ne"
                        ? "bg-emerald-600 text-white border-emerald-400/40 shadow-lg shadow-emerald-600/20"
                        : "bg-white/[0.03] text-slate-400 border-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>🇳🇵 Nepali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiLang("romanized")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      aiLang === "romanized"
                        ? "bg-emerald-600 text-white border-emerald-400/40 shadow-lg shadow-emerald-600/20"
                        : "bg-white/[0.03] text-slate-400 border-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>Romanized</span>
                  </button>
                </div>
              </div>

              {/* 2. Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Target Category
                </label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="Market">Market (NEPSE News, Stock Analysis)</option>
                  <option value="Technology">Technology & AI Tools</option>
                  <option value="Education">Education & Exam Preparation</option>
                  <option value="Vehicles">Vehicles & Automotive</option>
                  <option value="Lifestyle">Lifestyle & Career</option>
                </select>
              </div>

              {/* 3. Custom Topic (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Blog Topic <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. NEPSE Live Trading Strategies & Technical Analysis 2025"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Leave blank to auto-select an unposted trending topic!
                </p>
              </div>

              {/* Status Step Display */}
              {aiStep && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 text-xs flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin shrink-0" />
                  <span>{aiStep}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  disabled={aiGenerating}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAiBlog}
                  disabled={aiGenerating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Generate & Publish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
