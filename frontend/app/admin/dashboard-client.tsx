// frontend/app/admin/dashboard-client.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  FileEdit,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Image as ImageIcon,
  Settings as SettingsIcon,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";

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
  body?: any[];
}

export default function DashboardClient({ posts }: { posts: Post[] }) {
  // 1. Calculate Metrics
  const metrics = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === "published").length;
    const drafts = posts.filter((p) => p.status === "draft").length;
    const scheduled = posts.filter((p) => p.status === "scheduled").length;

    // Word counts and read time calculation
    let totalWords = 0;
    posts.forEach((p) => {
      if (p.body && Array.isArray(p.body)) {
        p.body.forEach((block: any) => {
          if (block._type === "block" && block.children) {
            block.children.forEach((span: any) => {
              if (span.text) {
                totalWords += span.text.split(/\s+/).length;
              }
            });
          }
        });
      }
    });

    const averageWords = total > 0 ? Math.round(totalWords / total) : 0;
    const averageReadTime = total > 0 ? Math.ceil((totalWords / total) / 200) : 0;

    return { total, published, drafts, scheduled, averageWords, averageReadTime };
  }, [posts]);

  // 2. Format Data for the SVG Charts
  // Publications by month
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentYear = now.getFullYear();

    const monthlyCounts = Array(12).fill(0);
    posts.forEach((p) => {
      const d = new Date(p.publishedAt || p._createdAt);
      if (d.getFullYear() === currentYear) {
        monthlyCounts[d.getMonth()] += 1;
      }
    });

    // Generate coordinates for SVG Line Chart
    // Width: 500, Height: 200. Max count is used to scale
    const maxVal = Math.max(...monthlyCounts, 3);
    const padding = 30;
    const chartHeight = 150;
    const chartWidth = 440;

    const points = monthlyCounts.map((val, idx) => {
      const x = padding + (idx * chartWidth) / 11;
      const y = padding + chartHeight - (val * chartHeight) / maxVal;
      return { x, y, val, month: months[idx] };
    });

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    // Generate area path for filling gradient
    const areaPath = total > 0
      ? `${linePath} L ${points[11].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`
      : "";

    return { points, linePath, areaPath, monthlyCounts, maxVal, padding, chartHeight };
  }, [posts, metrics.total]);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Title & Quick Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Overview</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time content diagnostics and analytics</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Posts</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{metrics.total}</p>
          <p className="text-[10px] text-slate-500 mt-2">All content records in Sanity</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Published</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <BookOpen size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{metrics.published}</p>
          <p className="text-[10px] text-emerald-500 mt-2">Live on tikajoshi.com.np</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Drafts / Scheduled</span>
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-400">
              <FileEdit size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{metrics.drafts + metrics.scheduled}</p>
          <p className="text-[10px] text-slate-500 mt-2">
            {metrics.drafts} drafts · {metrics.scheduled} scheduled
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Read Time</span>
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{metrics.averageReadTime} min</p>
          <p className="text-[10px] text-slate-500 mt-2">Average {metrics.averageWords} words per post</p>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Custom SVG Line Chart for Publications */}
        <div className="md:col-span-2 bg-[#05090f]/75 border border-white/5 p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold">Publications Activity</h3>
              <p className="text-[10px] text-slate-500">Monthly publication distribution of the current year</p>
            </div>
            <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 font-bold uppercase tracking-wider">
              {new Date().getFullYear()}
            </span>
          </div>

          {/* SVG Line Chart Container */}
          <div className="relative w-full h-[220px]">
            <svg viewBox="0 0 500 200" className="w-full h-full">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 1, 2, 3].map((g) => {
                const yVal = chartData.padding + (g * chartData.chartHeight) / 3;
                return (
                  <line
                    key={g}
                    x1="30"
                    y1={yVal}
                    x2="470"
                    y2={yVal}
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Shaded Area */}
              {chartData.areaPath && (
                <path d={chartData.areaPath} fill="url(#chartGrad)" />
              )}

              {/* Smooth Path Line */}
              {chartData.linePath && (
                <motion.path
                  d={chartData.linePath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              )}

              {/* Highlight Nodes */}
              {chartData.points.map((p, i) => (
                <g key={i} className="group/node">
                  {p.val > 0 && (
                    <>
                      <circle cx={p.x} cy={p.y} r="6" fill="#020408" stroke="#6366f1" strokeWidth="2" />
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill="#6366f1"
                        className="opacity-0 group-hover/node:opacity-100 transition duration-150"
                      />
                      {/* Custom mini-tooltip over node */}
                      <text
                        x={p.x}
                        y={p.y - 12}
                        textAnchor="middle"
                        fill="#a5b4fc"
                        fontSize="9"
                        fontWeight="black"
                        className="opacity-0 group-hover/node:opacity-100 transition duration-150 bg-[#080d14] px-1"
                      >
                        {p.val}
                      </text>
                    </>
                  )}
                </g>
              ))}

              {/* Month Labels */}
              {chartData.points.map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y="192"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.3)"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {p.month}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Quick Actions Shortcuts Column */}
        <div className="bg-[#05090f]/75 border border-white/5 p-6 rounded-2xl">
          <h3 className="text-sm font-bold mb-4">Quick Shortcuts</h3>
          <div className="flex flex-col gap-2">
            <Link
              href="/admin/blogs/new"
              className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 hover:bg-indigo-600/5 rounded-xl text-slate-300 hover:text-indigo-400 text-xs font-bold transition group"
            >
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:scale-105 transition">
                <PlusCircle size={14} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs">Write a New Blog</p>
                <p className="text-[10px] text-slate-500 font-medium">Create and publish content</p>
              </div>
              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
            </Link>

            <Link
              href="/admin/media"
              className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 hover:bg-cyan-600/5 rounded-xl text-slate-300 hover:text-cyan-400 text-xs font-bold transition group"
            >
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:scale-105 transition">
                <ImageIcon size={14} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs">Media Asset Library</p>
                <p className="text-[10px] text-slate-500 font-medium">Upload, alt-edit, search images</p>
              </div>
              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 hover:border-purple-500/20 hover:bg-purple-600/5 rounded-xl text-slate-300 hover:text-purple-400 text-xs font-bold transition group"
            >
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-105 transition">
                <SettingsIcon size={14} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs">Purge Cache & Health</p>
                <p className="text-[10px] text-slate-500 font-medium">Clear Next.js cache & verify link</p>
              </div>
              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Logs */}
      <div className="bg-[#05090f]/75 border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold">Recent Content Activity</h3>
            <p className="text-[10px] text-slate-500">List of latest blogs edited or created</p>
          </div>
          <Link href="/admin/blogs" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300">
            View All Blogs →
          </Link>
        </div>

        <div className="divide-y divide-white/5">
          {posts.slice(0, 5).map((post) => (
            <div key={post._id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-white/5 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center text-sm border border-white/5">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt="" className="object-cover w-full h-full" />
                  ) : (
                    "📝"
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate max-w-sm sm:max-w-md">{post.title}</h4>
                  <p className="text-[9px] text-slate-500 font-semibold tracking-wide flex items-center gap-1.5 mt-0.5">
                    <span>
                      {new Date(post.publishedAt || post._createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span
                      className={`uppercase text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-full ${
                        post.status === "published"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : post.status === "scheduled"
                          ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                          : "bg-slate-500/10 border border-slate-500/20 text-slate-400"
                      }`}
                    >
                      {post.status}
                    </span>
                  </p>
                </div>
              </div>

              <Link
                href={`/admin/blogs/${post._id}/edit`}
                className="px-3 py-1 bg-white/[0.04] hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded-lg text-[10px] font-bold transition shrink-0"
              >
                Edit
              </Link>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500">No recent activity. Create a blog post to begin!</div>
          )}
        </div>
      </div>
    </div>
  );
}
