// app/admin/page.tsx
// Advanced admin dashboard — auto-post triggers + manual SEO publisher

import { useState, useEffect } from "react";
import { Zap, BookOpen, Car, RefreshCw, CheckCircle, XCircle, Loader2, FileText, Globe, Key, Compass } from "lucide-react";

type JobResult = {
  type: string;
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

const CRON_SECRET = process.env.NEXT_PUBLIC_CRON_SECRET || "";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"auto" | "manual">("auto");

  // Auto-post triggers state
  const [jobs, setJobs] = useState<Record<string, JobResult>>({
    vehicle: { type: "vehicle", status: "idle", message: "" },
    blog: { type: "blog", status: "idle", message: "" },
  });

  // Manual publisher state
  const [title, setTitle] = useState("");
  const [richTextBody, setRichTextBody] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [targetPage, setTargetPage] = useState("study");
  const [featuredImage, setFeaturedImage] = useState("");
  
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && activeTab === "manual") {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  }, [title, activeTab]);

  const trigger = async (type: "vehicle" | "blog", count = 1) => {
    setJobs((prev) => ({
      ...prev,
      [type]: { ...prev[type], status: "loading", message: "Running..." },
    }));

    try {
      const url =
        type === "vehicle"
          ? `/api/auto-vehicle?count=${count}&secret=${CRON_SECRET}`
          : `/api/auto-blog?secret=${CRON_SECRET}`;

      const res = await fetch(url);
      const data = await res.json();

      setJobs((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          status: data.success ? "success" : "error",
          message: data.success
            ? type === "vehicle"
              ? `✅ ${data.posted} vehicles posted: ${data.results?.map((r: any) => r.name).join(", ")}`
              : `✅ Blog posted: "${data.title}"`
            : `❌ ${data.error || data.error_details}`,
        },
      }));
    } catch (err: any) {
      setJobs((prev) => ({
        ...prev,
        [type]: { ...prev[type], status: "error", message: `❌ ${err.message}` },
      }));
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !richTextBody) {
      setPublishStatus({ type: "error", msg: "Title and Body are required." });
      return;
    }
    if (metaDescription.length > 160) {
      setPublishStatus({ type: "error", msg: "Meta description exceeds 160 characters limit." });
      return;
    }

    setPublishing(true);
    setPublishStatus(null);

    try {
      const res = await fetch("/api/blog/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          richTextBody,
          featuredImage,
          slug,
          metaDescription,
          keywords,
          targetPage
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setPublishStatus({
          type: "success",
          msg: `🎉 Success! Published blog post: "${data.post.title}". Sanity sync: ${data.sanityPublished ? "YES" : "NO (local fallback active)"}`
        });
        // Clear fields on success
        setTitle("");
        setRichTextBody("");
        setSlug("");
        setMetaDescription("");
        setKeywords("");
        setFeaturedImage("");
      } else {
        throw new Error(data.error || "Failed to publish post.");
      }
    } catch (err: any) {
      setPublishStatus({ type: "error", msg: `❌ Error: ${err.message}` });
    } finally {
      setPublishing(false);
    }
  };

  const StatusIcon = ({ status }: { status: JobResult["status"] }) => {
    if (status === "loading") return <Loader2 size={16} className="animate-spin text-blue-400" />;
    if (status === "success") return <CheckCircle size={16} className="text-emerald-400" />;
    if (status === "error") return <XCircle size={16} className="text-red-400" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#050810] text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Admin Dashboard</h1>
        <p className="text-slate-500 mb-8 text-sm">Automated triggers and dynamic manual publisher CMS</p>

        {/* Tab Selector */}
        <div className="flex gap-2 bg-white/[0.03] border border-white/10 p-1.5 rounded-xl mb-8 max-w-md">
          <button
            onClick={() => setActiveTab("auto")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
              activeTab === "auto" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <RefreshCw size={14} /> Auto Triggers
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
              activeTab === "manual" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText size={14} /> Manual Publisher
          </button>
        </div>

        {activeTab === "auto" ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vehicle Auto-Post */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Car size={22} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Vehicle Auto-Post</h2>
                  <p className="text-xs text-slate-500">Gemini AI + Pexels HD photos</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-xs text-slate-500">Cron: 6am, 12pm, 6pm daily (3 posts)</p>
                <p className="text-xs text-slate-500">Covers: Bikes, Scooters, Cars, EVs, Sports, Adventure</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => trigger("vehicle", n)}
                    disabled={jobs.vehicle.status === "loading"}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-bold transition disabled:opacity-50"
                  >
                    {jobs.vehicle.status === "loading" && n === 1 ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Zap size={12} />
                    )}
                    Post {n}
                  </button>
                ))}
              </div>

              {jobs.vehicle.message && (
                <div
                  className={`mt-4 p-3 rounded-xl text-xs font-mono flex items-start gap-2 ${
                    jobs.vehicle.status === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                      : "bg-red-500/10 border border-red-500/20 text-red-300"
                  }`}
                >
                  <StatusIcon status={jobs.vehicle.status} />
                  <span className="break-all">{jobs.vehicle.message}</span>
                </div>
              )}
            </div>

            {/* Blog Auto-Post */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-violet-500/10 rounded-xl">
                  <BookOpen size={22} className="text-violet-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Blog Auto-Post</h2>
                  <p className="text-xs text-slate-500">Nepal-focused topics</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-xs text-slate-500">Cron: 7am, 1pm, 7pm daily</p>
                <p className="text-xs text-slate-500">Topics: Tech, Finance, Career, Education, Lifestyle</p>
              </div>

              <button
                onClick={() => trigger("blog")}
                disabled={jobs.blog.status === "loading"}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 text-violet-300 rounded-lg text-xs font-bold transition disabled:opacity-50"
              >
                {jobs.blog.status === "loading" ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RefreshCw size={12} />
                )}
                Trigger Now
              </button>

              {jobs.blog.message && (
                <div
                  className={`mt-4 p-3 rounded-xl text-xs font-mono flex items-start gap-2 ${
                    jobs.blog.status === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                      : "bg-red-500/10 border border-red-500/20 text-red-300"
                  }`}
                >
                  <StatusIcon status={jobs.blog.status} />
                  <span className="break-all">{jobs.blog.message}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Manual Publisher Form */
          <form onSubmit={handlePublish} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold border-b border-white/10 pb-3 flex items-center gap-2">
              <FileText size={18} className="text-violet-400" /> Manual SEO Blog Publisher
            </h2>

            {publishStatus && (
              <div
                className={`p-4 rounded-xl text-xs font-bold ${
                  publishStatus.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/25 text-red-400"
                }`}
              >
                {publishStatus.msg}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase mb-2">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to Invest in NEPSE Today"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none transition"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase mb-2">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="how-to-invest-in-nepse-today"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none font-mono transition"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Featured Image */}
              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase mb-2">Featured Image URL / Keyword</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search query (e.g. stock-chart) or image link"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-violet-500 outline-none transition"
                  />
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              {/* Placement Select */}
              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase mb-2">Target Page Placement</label>
                <div className="relative">
                  <select
                    value={targetPage}
                    onChange={(e) => setTargetPage(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-violet-500 outline-none appearance-none cursor-pointer transition"
                  >
                    <option value="market">Share Market Page (/market)</option>
                    <option value="vehicle">Vehicles Page (/vehicles)</option>
                    <option value="tools">Tools Directory (/tools)</option>
                    <option value="study">Study Resources (/study)</option>
                  </select>
                  <Compass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Rich Text Body */}
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase mb-2">Body (HTML & Rich Text Scanner Active) *</label>
              <textarea
                required
                rows={10}
                placeholder="Write your article. Type keyword triggers like NEPSE, IOE, Loksewa, Forex, or vehicle to automatically link them to their respective portal routes."
                value={richTextBody}
                onChange={(e) => setRichTextBody(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none transition resize-y font-sans leading-relaxed"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Meta Description */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs text-slate-400 font-bold uppercase">Meta Description</label>
                  <span className={`text-[10px] font-bold ${metaDescription.length > 160 ? "text-red-400" : "text-slate-500"}`}>
                    {metaDescription.length} / 160
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Summarize the article in less than 160 characters for search engines."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className={`w-full bg-slate-900 border rounded-xl px-4 py-3 text-sm outline-none transition resize-none ${
                    metaDescription.length > 160 ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-violet-500"
                  }`}
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase mb-2 flex items-center gap-1">
                  <Key size={12} /> Keywords (Comma-separated)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. share market, NEPSE trading, Nepal IPO tips"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none transition resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              {publishing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Publishing Post...
                </>
              ) : (
                "Publish Article"
              )}
            </button>
          </form>
        )}

        {/* Stats */}
        <div className="mt-8 p-4 bg-white/[0.02] border border-white/6 rounded-xl text-xs text-slate-500">
          <p className="font-bold text-slate-400 mb-2">CMS System Configuration</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <span>🚗 Auto-Post: Gemini AI + Pexels API active</span>
            <span>📝 Manual-Post: Smart link injector mapping active</span>
            <span>🌐 Sanity: {process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? "Configured" : "Offline fallback"}</span>
            <span>🔒 Protection: CRON_SECRET check enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}