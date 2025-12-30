"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Apple, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); 
  const [appleLoading, setAppleLoading] = useState(false); 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if(!email) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 1500);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        // SAFE LOGIN: If email exists, split it for name, else use 'User'
        const safeName = email ? email.split('@')[0] : "User";
        login({ name: safeName, email: email });
        
        setLoading(false);
        router.push("/chill-zone");
    }, 1500);
  };

  // Simulate Google Login
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setTimeout(() => {
        login({ name: "Google User", email: "google@user.com" });
        setGoogleLoading(false);
        router.push("/chill-zone");
    }, 2000); 
  };

  // Simulate Apple Login
  const handleAppleLogin = () => {
    setAppleLoading(true);
    setTimeout(() => {
        login({ name: "Apple User", email: "apple@user.com" });
        setAppleLoading(false);
        router.push("/chill-zone");
    }, 2000); 
  };

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl h-[600px] rounded-3xl overflow-hidden flex shadow-2xl relative z-10">
        
        {/* Left Side */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-10 flex-col justify-between">
            <h2 className="text-3xl font-black text-white">Tikajoshi Web</h2>
            <p className="text-blue-100">Welcome to the student community.</p>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-white mb-2">{step === 1 ? "Welcome Back" : "Check Email"}</h1>
            <p className="text-slate-400 text-sm mb-8">{step === 1 ? "Login to access smart tools." : `OTP sent to ${email}`}</p>

            {step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-500" size={20}/>
                        <input type="email" required placeholder="name@example.com" className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-3 pl-12 text-white focus:border-blue-500 outline-none" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold flex justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin"/> : <>Continue <ArrowRight size={18}/></>}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerify} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-500" size={20}/>
                        <input type="text" required placeholder="123456" className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-3 pl-12 text-white text-lg tracking-widest" value={otp} onChange={(e) => setOtp(e.target.value)}/>
                    </div>
                    <button disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl font-bold flex justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin"/> : <>Verify & Login <CheckCircle size={18}/></>}
                    </button>
                </form>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4">
                <button onClick={handleGoogleLogin} disabled={googleLoading} className="flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-[#283548] py-3 rounded-xl border border-slate-700 text-white text-sm font-bold transition">
                    {googleLoading ? <Loader2 size={18} className="animate-spin"/> : <>Google</>}
                </button>
                <button onClick={handleAppleLogin} disabled={appleLoading} className="flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-[#283548] py-3 rounded-xl border border-slate-700 text-white text-sm font-bold transition">
                    {appleLoading ? <Loader2 size={18} className="animate-spin"/> : <><Apple size={20} /> Apple</>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}