"use client";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/Breadcrumb";
import { TrendingUp, ExternalLink, BarChart3 } from "lucide-react";

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto py-24 px-6">
        <Breadcrumb /> {/* Added Navigation History */}
        
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                    <TrendingUp className="text-green-500"/> Share Market
                </h1>
                <p className="text-muted-foreground">Live NEPSE Charts & Analytics</p>
            </div>
            <div className="flex gap-2">
                <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded text-xs font-bold animate-pulse">Market Open</span>
            </div>
        </div>

        {/* NEPSE Alpha Chart (Working) */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl mb-10 h-[650px] relative">
            <iframe 
                src="https://nepsealpha.com/trading/chart" 
                className="w-full h-full border-none"
                title="NEPSE Chart"
            ></iframe>
            {/* Watermark Cover (Optional Trick) */}
            <div className="absolute bottom-0 right-0 bg-card px-4 py-1 text-xs text-muted-foreground">Data by NEPSE Alpha</div>
        </div>

        {/* Useful Links */}
        <div className="grid md:grid-cols-4 gap-4">
            {[
                { name: "IPO Result", link: "https://iporesult.cdsc.com.np/", icon: "🎉" },
                { name: "Mero Share", link: "https://meroshare.cdsc.com.np/", icon: "📱" },
                { name: "Today's Price", link: "https://www.sharesansar.com/today-share-price", icon: "💰" },
                { name: "Market Depth", link: "https://www.nepalstock.com/market-depth", icon: "📊" },
            ].map((item, i) => (
                <a key={i} href={item.link} target="_blank" className="p-4 bg-card border border-border rounded-xl hover:border-green-500 hover:bg-green-500/5 transition flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-bold">{item.name}</span>
                    </div>
                    <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition"/>
                </a>
            ))}
        </div>
      </div>
    </div>
  );
}