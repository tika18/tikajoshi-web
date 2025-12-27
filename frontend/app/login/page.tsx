"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { User, ArrowRight, Facebook, Mail, Github } from "lucide-react";

export default function LoginPage() {
  const [name, setName] = useState("");
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] flex flex-col text-slate-900 dark:text-white">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black mb-2">Welcome Back</h1>
            <p className="text-slate-500">Login to save your progress & quiz scores.</p>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 mb-6">
             <button className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 py-3 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                <Mail size={18}/> Google
             </button>
             <button className="flex items-center justify-center gap-2 bg-[#1877F2] text-white py-3 rounded-xl font-bold hover:opacity-90 transition">
                <Facebook size={18} fill="white"/> Facebook
             </button>
          </div>

          <div className="relative mb-6 text-center">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
             <span className="relative bg-white dark:bg-[#020817] px-4 text-xs text-slate-500 font-bold uppercase">Or use Username</span>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); login(name); }} className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center">
                <User size={18} className="text-slate-400 mr-3"/>
                <input className="bg-transparent border-none outline-none w-full font-medium" placeholder="Enter username..." value={name} onChange={(e) => setName(e.target.value)} required/>
            </div>
            <button className="w-full bg-primary text-white py-4 rounded-xl font-bold flex justify-center gap-2 hover:opacity-90 transition shadow-lg">
              Continue <ArrowRight size={18}/>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}