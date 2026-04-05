"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Mail, Lock, User, ArrowRight,
  Loader2, Eye, EyeOff, Chrome, GraduationCap
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
        await registerWithEmail(email, password, name);
      }
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/user-not-found":    "No account with this email.",
        "auth/wrong-password":    "Wrong password. Try again.",
        "auth/email-already-in-use": "Email already registered.",
        "auth/weak-password":     "Password must be 6+ characters.",
        "auth/invalid-email":     "Invalid email address.",
        "auth/invalid-credential": "Invalid email or password.",
      };
      setError(msg[err.code] || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGLoading(true);
    setError("");
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError("Google login failed. Try again.");
    } finally {
      setGLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070c14] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Aurora BG */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        <div className="glass-card rounded-3xl overflow-hidden flex shadow-2xl shadow-black/60 min-h-[580px]">

          {/* LEFT — Branding */}
          <div className="hidden md:flex w-5/12 relative flex-col justify-between p-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-600 opacity-90" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-white/20 backdrop-blur p-2.5 rounded-xl">
                  <GraduationCap size={22} className="text-white" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">tikajoshi</span>
              </div>
              <h2 className="text-3xl font-black text-white leading-tight mb-3">
                Nepal's #1<br />Student Hub
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                IOE Notes · Loksewa Prep · Live Sports · Share Market · Smart Tools
              </p>
            </div>

            <div className="relative z-10 space-y-3">
              {[
                { icon: "🎓", text: "Free IOE & Loksewa Notes" },
                { icon: "🏏", text: "Live IPL & Sports Streaming" },
                { icon: "📈", text: "NEPSE Live Market Data" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-white/90 text-sm font-medium">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-center bg-[#070c14]/80">

            {/* Mode Toggle */}
            <div className="flex bg-white/5 rounded-2xl p-1 mb-8 border border-white/8">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    mode === m
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {m === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <h1 className="text-2xl font-black text-white mb-1">
              {mode === "login" ? "Welcome back 👋" : "Join Tikajoshi 🎉"}
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              {mode === "login"
                ? "Sign in to access all features."
                : "Create your free account today."}
            </p>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                ⚠️ {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition"
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password (6+ characters)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-white text-sm placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-90 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {loading
                  ? <Loader2 size={18} className="animate-spin" />
                  : <>{mode === "login" ? "Sign In" : "Create Account"} <ArrowRight size={16} /></>
                }
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-slate-600 font-medium">OR</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogle}
              disabled={gLoading}
              className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white py-3.5 rounded-xl font-bold text-sm transition"
            >
              {gLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                    <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-600 mt-6">
              By continuing, you agree to Tikajoshi's{" "}
              <Link href="/contact" className="text-indigo-400 hover:text-indigo-300">Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}