"use client";
// app/admin/page.tsx
// Simple admin dashboard — auto-post buttons + status

import { useState } from "react";
import { Zap, BookOpen, Car, RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";

type JobResult = {
  type: string;
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

const CRON_SECRET = process.env.NEXT_PUBLIC_CRON_SECRET || "";

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Record<string, JobResult>>({
    vehicle: { type: "vehicle", status: "idle", message: "" },
    blog: { type: "blog", status: "idle", message: "" },
  });

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

  const StatusIcon = ({ status }: { status: JobResult["status"] }) => {
    if (status === "loading") return <Loader2 size={16} className="animate-spin text-blue-400" />;
    if (status === "success") return <CheckCircle size={16} className="text-emerald-400" />;
    if (status === "error") return <XCircle size={16} className="text-red-400" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#050810] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-2">Admin Dashboard</h1>
        <p className="text-slate-500 mb-10 text-sm">Manual triggers for auto-content generation</p>

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

        {/* Stats */}
        <div className="mt-8 p-4 bg-white/[0.02] border border-white/6 rounded-xl text-xs text-slate-500">
          <p className="font-bold text-slate-400 mb-2">Auto-Schedule Summary</p>
          <div className="grid grid-cols-2 gap-2">
            <span>🚗 Vehicles: 6am, 12pm, 6pm (3 posts/run)</span>
            <span>📝 Blog: 7am, 1pm, 7pm (1 post/run)</span>
            <span>🔒 Protected by CRON_SECRET</span>
            <span>🤖 Gemini AI + Pexels HD</span>
          </div>
        </div>
      </div>
    </div>
  );
}