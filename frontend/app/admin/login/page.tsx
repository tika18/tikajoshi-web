// frontend/app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { loginAdmin } from "@/actions/adminAuth";
import { Lock, User, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await loginAdmin(null, formData);
      if (res.success) {
        // Use clean full-page load redirection to refresh cookies and clear states
        window.location.href = "/admin";
      } else {
        setError(res.error || "Login failed");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Client login error:", err);
      setError(err.message || "An unexpected error occurred during login.");
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Aurora / Ambient Lights */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />

      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ 
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", 
          backgroundSize: "32px 32px" 
        }} 
      />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        {/* Glow behind the box */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-cyan-500/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        
        <div className="relative bg-[#080d14]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-500/15 p-3 rounded-xl border border-indigo-500/30 mb-4 shadow-inner glow-indigo">
              <ShieldCheck size={28} className="text-indigo-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Gate</h1>
            <p className="text-xs text-slate-500 mt-1">Authorized personnel only</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 pl-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="admin"
                  disabled={loading}
                  className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/60 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 pl-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/60 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
