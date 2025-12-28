"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { User, ArrowRight, Zap, Mail, Lock, Loader2, Github } from "lucide-react";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSocialLogin = (provider: string) => {
    setLoading(true);
    // Simulation of Google/FB Login
    setTimeout(() => {
        login("Tikajoshi User"); // Auto login as User
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col relative overflow-hidden">
      <Navbar />
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-24 relative z-10">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 animate-in zoom-in duration-500">
              <Zap size={32} className="text-white fill-white"/>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Login to save your quiz progress & posts.</p>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
             <button onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center gap-2 bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G"/> Google
             </button>
             <button onClick={() => handleSocialLogin('Github')} className="flex items-center justify-center gap-2 bg-[#24292e] text-white py-3 rounded-xl font-bold hover:opacity-90 transition">
                <Github size={20}/> Github
             </button>
          </div>

          <div className="relative mb-8 text-center">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
             <span className="relative bg-[#0b1221] px-4 text-xs text-slate-500 font-bold uppercase tracking-wider">Or continue with username</span>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); login(name); }} className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Username</label>
                <div className="flex items-center bg-[#0f172a]/50 border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-blue-500/50 focus-within:bg-blue-500/5 transition">
                    <User size={20} className="text-slate-500 mr-3"/>
                    <input 
                    type="text" 
                    placeholder="Enter your name" 
                    className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-600 font-medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20 group">
              {loading ? <Loader2 className="animate-spin"/> : <>Login Now <ArrowRight size={18} className="group-hover:translate-x-1 transition"/></>}
            </button>
          </form>
          
          <p className="text-center text-xs text-slate-500 mt-6">By logging in, you agree to our Terms & Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}