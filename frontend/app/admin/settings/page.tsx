// frontend/app/admin/settings/page.tsx
"use client";

import React, { useState, useTransition } from "react";
import { forceRevalidateAll } from "@/actions/cache";
import { testSanityConnection } from "@/actions/sanity";
import { generatePasswordHash } from "@/actions/adminAuth";
import { useToast } from "@/components/Toast";
import {
  RefreshCw,
  Database,
  Lock,
  KeyRound,
  Shield,
  Loader2,
  CheckCircle,
  Copy,
  Terminal,
  Activity,
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  
  // Cache Revalidation States
  const [revalidating, setRevalidating] = useState(false);
  
  // Connection Diagnostic States
  const [testingConnection, setTestingConnection] = useState(false);
  const [dbHealth, setDbHealth] = useState<any | null>(null);

  // Password Hash Tool States
  const [plainPassword, setPlainPassword] = useState("");
  const [generatedHash, setGeneratedHash] = useState("");
  const [hashing, setHashing] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // 1. Force Cache Revalidation
  const handlePurgeCache = async () => {
    setRevalidating(true);
    const toastId = toast("Purging edge cache paths...", "loading");
    
    const res = await forceRevalidateAll();
    setRevalidating(false);

    if (res.success) {
      toast(res.message || "Cache purged successfully", "success");
    } else {
      toast(res.error || "Cache purge failed", "error");
    }
  };

  // 2. Test Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    const toastId = toast("Pinging Sanity database...", "loading");

    const res = await testSanityConnection();
    setTestingConnection(false);

    if (res.success) {
      setDbHealth(res);
      toast("Connection test successful", "success");
    } else {
      setDbHealth({ success: false, error: res.error });
      toast(res.error || "Connection test failed", "error");
    }
  };

  // 3. Hash Generator
  const handleGenerateHash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plainPassword.trim()) {
      toast("Enter a password to hash", "info");
      return;
    }

    setHashing(true);
    const hash = await generatePasswordHash(plainPassword);
    setHashing(false);
    setGeneratedHash(hash);
    toast("Password hashed successfully", "success");
  };

  const handleCopyHash = () => {
    if (!generatedHash) return;
    navigator.clipboard.writeText(generatedHash);
    setCopiedHash(true);
    toast("Hash copied to clipboard", "success");
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage database integration, page cache controls, and credentials</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Cache and Diagnostics */}
        <div className="space-y-6">
          {/* Cache Control */}
          <div className="bg-[#05090f]/75 border border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <RefreshCw size={18} className={revalidating ? "animate-spin" : ""} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Edge Cache Control</h3>
                <p className="text-[10px] text-slate-500">Purge and rebuild ISR pages for tikajoshi.com.np</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              We automate cache revalidation during content edits. If you make manual schema adjustments or database updates, use this option to force-purge all edge caches immediately.
            </p>
            <button
              onClick={handlePurgeCache}
              disabled={revalidating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 active:scale-[0.98]"
            >
              {revalidating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Purge Entire Site Cache
            </button>
          </div>

          {/* Database Diagnostics */}
          <div className="bg-[#05090f]/75 border border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Sanity CMS Integration</h3>
                  <p className="text-[10px] text-slate-500">Query test and response latency diagnostic</p>
                </div>
              </div>
              
              <button
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-slate-300 rounded-xl text-[10px] font-bold transition flex items-center gap-1"
              >
                {testingConnection ? <Loader2 size={10} className="animate-spin" /> : <Activity size={10} />} Test Sync
              </button>
            </div>

            {dbHealth ? (
              dbHealth.success ? (
                <div className="space-y-3.5 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle size={14} /> Status: Connected & Synced
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 border-t border-emerald-500/10 pt-3">
                    <span>Project ID: <strong className="text-white">{dbHealth.projectId}</strong></span>
                    <span>Dataset: <strong className="text-white">{dbHealth.dataset}</strong></span>
                    <span>Query Latency: <strong className="text-white">{dbHealth.latency} ms</strong></span>
                    <span>API Version: <strong className="text-white">2024-01-01</strong></span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl text-left space-y-2">
                  <div className="text-red-400 text-xs font-bold">❌ Connection Sync Failed</div>
                  <p className="text-[10px] font-mono text-red-300/80 leading-relaxed break-all">
                    {dbHealth.error}
                  </p>
                </div>
              )
            ) : (
              <p className="text-xs text-slate-500">Run a test to view database details and connection latency.</p>
            )}
          </div>
        </div>

        {/* Right Column: Security Profile & Hashing Tool */}
        <div className="bg-[#05090f]/75 border border-white/5 p-6 rounded-2xl space-y-5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Security & Environment</h3>
              <p className="text-[10px] text-slate-500">Configure secure credentials for dashboard login</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Admin access is secured using hashed credentials matching your environment variables. Use this tool to generate the hashed equivalent of your desired password.
          </p>

          <form onSubmit={handleGenerateHash} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 pl-1">
                Raw Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  placeholder="Enter raw password..."
                  value={plainPassword}
                  onChange={(e) => setPlainPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder:text-slate-600 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={hashing}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-purple-600/10 active:scale-[0.98]"
            >
              {hashing ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />} Generate Secure Hash
            </button>
          </form>

          {/* Generated Hash Box */}
          {generatedHash && (
            <div className="space-y-2 pt-2 animate-scale-in">
              <label className="text-[10px] uppercase font-bold tracking-widest text-purple-400 pl-1">
                Copy Hash output
              </label>
              <div className="bg-[#080d14] border border-white/5 p-4 rounded-xl flex items-center justify-between gap-3 text-left">
                <div className="flex items-start gap-2.5 overflow-hidden">
                  <Terminal size={14} className="text-slate-500 shrink-0 mt-0.5" />
                  <span className="text-[10px] font-mono text-slate-300 break-all select-all font-semibold">
                    {generatedHash}
                  </span>
                </div>
                <button
                  onClick={handleCopyHash}
                  className="p-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-slate-400 hover:text-white rounded-lg transition shrink-0"
                  title="Copy to Clipboard"
                >
                  {copiedHash ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] text-slate-400 leading-relaxed">
                📢 <strong>Setup Instructions:</strong> Copy the generated SHA-256 hash value above and update the <code>ADMIN_PASSWORD_HASH</code> environment variable inside your <code>.env.local</code> (or Vercel dashboard).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
