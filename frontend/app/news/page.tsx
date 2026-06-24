"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ExternalLink, Globe, TrendingUp, Tv, Facebook } from "lucide-react";

// Data Arrays
const nepaliNews = [
  { name: "Routine of Nepal Banda", url: "https://www.facebook.com/officialroutineofnepalbanda", color: "bg-[#1877F2]", desc: "Instant Updates", icon: <Facebook className="text-white"/> },
  { name: "OnlineKhabar", url: "https://www.onlinekhabar.com/", color: "bg-green-600", desc: "No. 1 Portal", icon: <Globe className="text-white"/> },
  { name: "Ekantipur", url: "https://ekantipur.com/", color: "bg-blue-700", desc: "Kantipur Daily", icon: <TrendingUp className="text-white"/> },
  { name: "Setopati", url: "https://www.setopati.com/", color: "bg-white border", desc: "Digital Daily", icon: <Globe className="text-black"/>, textBlack: true },
  { name: "Ratopati", url: "https://www.ratopati.com/", color: "bg-red-600", desc: "Current Affairs", icon: <TrendingUp className="text-white"/> },
  { name: "TechPana", url: "https://www.techpana.com/", color: "bg-indigo-600", desc: "Tech News", icon: <Globe className="text-white"/> }
];

const internationalNews = [
  { name: "BBC News", url: "https://www.bbc.com/news", color: "bg-red-700", desc: "Global News" },
  { name: "CNN", url: "https://edition.cnn.com/", color: "bg-red-600", desc: "Breaking News" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/", color: "bg-orange-600", desc: "Middle East & World" },
  { name: "Times of India", url: "https://timesofindia.indiatimes.com/", color: "bg-blue-800", desc: "Top Indian News" },
  { name: "The Verge", url: "https://www.theverge.com/", color: "bg-purple-600", desc: "Tech & Science" }
];

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">News Dashboard</h1>
          <p className="text-slate-400">Nepal's Top Portals & International Updates</p>
        </div>

        {/* 1. NEPALI NEWS GRID */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Globe className="text-blue-500"/> National Updates</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {nepaliNews.map((portal, i) => (
            <Link key={i} href={portal.url} target="_blank" className="bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 transition group flex flex-col">
              <div className={`h-12 ${portal.color} flex items-center justify-center`}>
                {portal.icon}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between text-center">
                <div>
                  <h3 className="font-bold text-lg mb-1">{portal.name}</h3>
                  <p className="text-xs text-slate-500">{portal.desc}</p>
                </div>
                <div className="mt-3 text-xs font-bold text-blue-400 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
                   Read Now <ExternalLink size={12}/>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 2. INTERNATIONAL NEWS */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Tv className="text-red-500"/> International & India</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {internationalNews.map((news, i) => (
            <Link key={i} href={news.url} target="_blank" className="bg-[#1e293b] p-3 rounded-lg border border-slate-700 hover:bg-slate-800 transition flex items-center gap-3">
               <div className={`w-2 h-8 ${news.color} rounded-full`}></div>
               <div>
                 <h3 className="font-bold text-sm">{news.name}</h3>
                 <p className="text-[10px] text-slate-500">{news.desc}</p>
               </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}