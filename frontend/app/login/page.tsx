"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Mail, Lock, User, ArrowRight, Loader2,
  Eye, EyeOff, GraduationCap, CheckCircle,
  KeyRound, RefreshCw
} from "lucide-react";
import Link from "next/link";

type Mode = "login" | "register" | "reset";
type Step = "form" | "otp";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useAuth();

  const [mode, setMode]         = useState<Mode>("login");
  const [step, setStep]         = useState<Step>("form");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [otp, setOtp]           = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const errMap: Record<string, string> = {
    "auth/user-not-found":        "No account with this email.",
    "auth/wrong-password":        "Wrong password.",
    "auth/email-already-in-use":  "Email already registered — please login.",
    "auth/weak-password":         "Password needs 6+ characters.",
    "auth/invalid-email":         "Invalid email address.",
    "auth/invalid-credential":    "Invalid email or password.",
    "auth/too-many-requests":     "Too many attempts. Try later.",
    "auth/network-request-failed":"Network error. Check your connection.",
  };

  // ─── Send OTP ──────────────────────────────────────────────
  const sendOtp = async () => {
    if (!email) { setError("Enter your email first."); return; }
    setError(""); setOtpSending(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`📧 OTP sent to ${email}`);
      setStep("otp");
    } catch (e: any) {
      setError(e.message || "Failed to send OTP.");
    } finally {
      setOtpSending(false);
    }
  };

  // ─── Verify OTP then register ──────────────────────────────
  const verifyOtpAndRegister = async () => {
    if (otp.length !== 6) { setError("Enter the 6-digit OTP."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // OTP verified — create account
      await registerWithEmail(email, password, name);
      setSuccess("✅ Account created! You can now sign in.");
      setMode("login"); setStep("form"); setOtp(""); setPassword("");
    } catch (e: any) {
      setError(e.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Login submit ──────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError(errMap[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Reset Password ─────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Enter your email so we can send a reset link."); return; }
    setError(""); setLoading(true);
    try {
      await resetPassword(email);
      setSuccess("If that email is registered, you will receive a reset link shortly.");
    } catch (err: any) {
      setError(errMap[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Google ───────────────────────────────────────────────
  const handleGoogle = async () => {
    setGLoading(true); setError("");
    try { await loginWithGoogle(); }
    catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user")
        setError("Google login failed. Try again.");
    } finally { setGLoading(false); }
  };

  const switchMode = (m: Mode) => {
    setMode(m); setStep("form"); setError(""); setSuccess(""); setOtp("");
  };

  return (
    <div className="min-h-screen bg-[#040810] flex items-center justify-center p-4 relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        <div className="rounded-2xl overflow-hidden flex shadow-2xl shadow-black/60 min-h-[600px] border border-white/[0.07]">

          {/* ── LEFT PANEL ── */}
          <div className="hidden md:flex w-5/12 flex-col justify-between p-10 relative overflow-hidden bg-[#070e1c]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-violet-900/40 to-cyan-900/30" />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">tikajoshi</span>
              </div>
              <h2 className="text-3xl font-black text-white leading-tight mb-3">
                Nepal&apos;s #1<br />Student Hub
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                IOE Notes · Loksewa Prep · Live Sports · Share Market · Smart Tools
              </p>
            </div>

            <div className="relative z-10 space-y-2.5">
              {[
                { icon: "🎓", text: "Free IOE & Loksewa Notes" },
                { icon: "📺", text: "Live IPL & Sports Streaming" },
                { icon: "📈", text: "NEPSE Live Market Data" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.06] border border-white/[0.07] rounded-xl px-4 py-2.5">
                  <span className="text-base">{f.icon}</span>
                  <span className="text-slate-300 text-sm font-medium">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT FORM ── */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-center bg-[#060b15]">

            {/* Mode tabs */}
            <div className="flex bg-white/[0.04] rounded-xl p-1 mb-8 border border-white/[0.06]">
              {(["login", "register"] as Mode[]).filter(m => m !== "reset").map(m => (
                <button key={m} onClick={() => switchMode(m)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    mode === m
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-slate-300"
                  }`}>
                  {m === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <h1 className="text-2xl font-black text-white mb-1">
              {mode === "login" ? "Welcome back 👋" : mode === "reset" ? "Reset Password 🔑" : step === "otp" ? "Verify your email 📧" : "Join Tikajoshi 🎉"}
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              {mode === "login" ? "Sign in to access all features." : mode === "reset" ? "We'll send you an email to reset your password." : step === "otp" ? `Enter the 6-digit code sent to ${email}` : "Create your free account."}
            </p>

            {/* Alerts */}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-start gap-2">
                <CheckCircle size={15} className="shrink-0 mt-0.5" /> <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                ⚠️ {error}
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <InputField icon={<Mail size={15} />} type="email" placeholder="name@example.com"
                  value={email} onChange={setEmail} />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={15} /></span>
                  <input type={showPass ? "text" : "password"} placeholder="Password"
                    value={password} onChange={e => setPassword(e.target.value)} required
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3.5 pl-11 pr-11 text-white text-sm placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => switchMode("reset")} className="text-xs font-bold tracking-wide text-indigo-400 hover:text-indigo-300 transition">
                    Forgot Password?
                  </button>
                </div>
                <SubmitBtn loading={loading} label="Sign In" />
              </form>
            )}

            {/* ── RESET FORM ── */}
            {mode === "reset" && (
              <form onSubmit={handleReset} className="space-y-4">
                <InputField icon={<Mail size={15} />} type="email" placeholder="name@example.com"
                  value={email} onChange={setEmail} />
                <SubmitBtn loading={loading} label="Send Reset Link" />
                <div className="text-center pt-2">
                  <button type="button" onClick={() => switchMode("login")} className="text-sm font-medium text-slate-400 hover:text-white transition">
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* ── REGISTER — STEP 1: FORM ── */}
            {mode === "register" && step === "form" && (
              <div className="space-y-4">
                <InputField icon={<User size={15} />} type="text" placeholder="Your full name"
                  value={name} onChange={setName} />
                <InputField icon={<Mail size={15} />} type="email" placeholder="name@example.com"
                  value={email} onChange={setEmail} />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={15} /></span>
                  <input type={showPass ? "text" : "password"} placeholder="Password (6+ characters)"
                    value={password} onChange={e => setPassword(e.target.value)} required
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3.5 pl-11 pr-11 text-white text-sm placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button onClick={() => {
                  if (!name.trim()) { setError("Name is required."); return; }
                  if (password.length < 6) { setError("Password needs 6+ characters."); return; }
                  setError(""); sendOtp();
                }}
                  disabled={otpSending}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition">
                  {otpSending ? <Loader2 size={18} className="animate-spin" /> : <><Mail size={16} /> Send Verification Code</>}
                </button>
              </div>
            )}

            {/* ── REGISTER — STEP 2: OTP ── */}
            {mode === "register" && step === "otp" && (
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><KeyRound size={15} /></span>
                  <input
                    type="text" inputMode="numeric" maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition tracking-[0.3em] text-center font-bold text-lg"
                  />
                </div>
                <button onClick={verifyOtpAndRegister} disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={16} /> Verify & Create Account</>}
                </button>
                <button onClick={() => { setStep("form"); setOtp(""); setError(""); setSuccess(""); }}
                  className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition py-2">
                  <RefreshCw size={12} /> Change email or resend OTP
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-slate-700 font-medium">OR</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Google */}
            <button onClick={handleGoogle} disabled={gLoading}
              className="w-full flex items-center justify-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white py-3.5 rounded-xl font-bold text-sm transition">
              {gLoading ? <Loader2 size={18} className="animate-spin" /> : (
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

            {/* Forgot password */}
            {mode === "login" && (
              <p className="text-center text-xs text-slate-600 mt-4">
                Forgot password?{" "}
                <button onClick={async () => {
                  if (!email) { setError("Enter your email first."); return; }
                  const { sendPasswordResetEmail } = await import("firebase/auth");
                  const { auth } = await import("@/lib/firebase");
                  try {
                    await sendPasswordResetEmail(auth, email);
                    setSuccess("✅ Password reset email sent!");
                  } catch { setError("Failed to send reset email."); }
                }} className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Reset it
                </button>
              </p>
            )}

            <p className="text-center text-xs text-slate-700 mt-4">
              By continuing, you agree to{" "}
              <Link href="/contact" className="text-indigo-400 hover:text-indigo-300">Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────
function InputField({ icon, type, placeholder, value, onChange }: {
  icon: React.ReactNode; type: string; placeholder: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition" />
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition">
      {loading ? <Loader2 size={18} className="animate-spin" /> : <>{label} <ArrowRight size={15} /></>}
    </button>
  );
}