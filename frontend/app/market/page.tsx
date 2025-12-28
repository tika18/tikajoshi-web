"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { TrendingUp, ExternalLink, Maximize2, X, Star } from "lucide-react";

export default function MarketPage() {
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto py-24 px-6">
        
        {/* IPO Highlight Section */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-blue-900/40 border border-emerald-500/30 p-6 rounded-2xl mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-emerald-500 p-3 rounded-xl animate-pulse"><Star fill="white" size={24}/></div>
                <div>
                    <h2 className="text-xl font-bold text-white">IPO / Mero Share</h2>
                    <p className="text-emerald-300 text-sm">Check results & apply for IPO instantly.</p>
                </div>
            </div>
            <div className="flex gap-3">
                <a href="https://iporesult.cdsc.com.np/" target="_blank" className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-lg font-bold text-sm transition shadow-lg">Check Result</a>
                <a href="https://meroshare.cdsc.com.np/" target="_blank" className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-lg font-bold text-sm transition shadow-lg">Mero Share</a>
            </div>
        </div>

        <div className="flex justify-between items-end mb-6">
            <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    <TrendingUp className="text-green-500"/> NEPSE Live Chart
                </h1>
                <p className="text-slate-400">Real-time market analysis.</p>
            </div>
            <button onClick={() => setFullScreen(true)} className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition">
                <Maximize2 size={16}/> Full Screen
            </button>
        </div>

        {/* Chart Container (Normal vs Fullscreen) */}
        <div className={`bg-[#1e293b] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative transition-all duration-300 ${fullScreen ? 'fixed inset-0 z-[100] rounded-none' : 'h-[600px]'}`}>
            
            {fullScreen && (
                <button onClick={() => setFullScreen(false)} className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full z-50 hover:bg-red-500 shadow-lg">
                    <X size={24}/>
                </button>
            )}

            <iframe 
                src="https://nepsealpha.com/trading/chart" 
                className="w-full h-full border-none bg-white"
                title="NEPSE Chart"
            ></iframe>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
                { name: "Market Depth", link: "https://www.nepalstock.com/market-depth", color: "border-blue-500/30" },
                { name: "Today's Price", link: "https://www.sharesansar.com/today-share-price", color: "border-purple-500/30" },
                { name: "Live Floor Sheet", link: "https://www.nepalstock.com/floorsheet", color: "border-orange-500/30" },
            ].map((item, i) => (
                <a key={i} href={item.link} target="_blank" className={`p-6 bg-[#1e293b]/50 border ${item.color} rounded-2xl hover:bg-[#1e293b] transition group flex justify-between items-center`}>
                    <span className="font-bold text-lg text-slate-200">{item.name}</span>
                    <ExternalLink size={18} className="text-slate-500 group-hover:text-white"/>
                </a>
            ))}
        </div>
      </div>
    </div>
  );
}