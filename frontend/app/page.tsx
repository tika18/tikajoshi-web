"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  Search, ArrowRight, Zap, GraduationCap, Building2, 
  Image as ImageIcon, FileText, UserSquare, ChevronRight, 
  Newspaper, MonitorPlay
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // SMART SEARCH DATABASE
  const searchData = [
    { keywords: ["pdf", "convert"], title: "Image to PDF Converter", link: "/tools/img-to-pdf", type: "Tool" },
    { keywords: ["merge", "pdf"], title: "Merge PDF Files", link: "/tools/merge-pdf", type: "Tool" },
    { keywords: ["image", "resize", "compress"], title: "Image Compressor", link: "/tools/compressor", type: "Tool" },
    { keywords: ["news", "ronb", "bbc"], title: "News & Updates", link: "/news", type: "News" },
    { keywords: ["cricket", "football", "live", "movie"], title: "Live Streaming & Movies", link: "/chill-zone", type: "Fun" },
    { keywords: ["result", "tu", "neb"], title: "Exam Results Hub", link: "/tools/tu-result", type: "Result" },
    { keywords: ["share", "nepse"], title: "Share Market Dashboard", link: "/market", type: "Market" },
  ];

  useEffect(() => {
    if (query.length > 1) {
      const filtered = searchData.filter(item => 
        item.keywords.some(k => k.includes(query.toLowerCase()))
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] text-slate-900 dark:text-white">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="pt-32 pb-10 px-6 text-center max-w-5xl mx-auto relative">
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[100px]"></div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          Tools for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Smart Students</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
          One platform for Engineering Notes, News, Live Sports & Tools.
        </p>

        {/* SEARCH BAR */}
        <div className="max-w-xl mx-auto relative mb-10 z-20">
          <div className="flex items-center bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-full shadow-xl px-4 py-3 focus-within:border-blue-500 transition">
            <Search className="text-slate-400 mr-3"/>
            <input 
              type="text" 
              placeholder="Search 'News', 'Cricket', 'Result'..." 
              className="w-full bg-transparent outline-none text-slate-900 dark:text-white"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl mt-2 overflow-hidden text-left z-50 border border-slate-200 dark:border-slate-700">
              {suggestions.map((item, i) => (
                <Link key={i} href={item.link} className="flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <span className="font-bold text-sm">{item.title}</span>
                  <ChevronRight size={16} className="text-slate-400"/>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* QUICK TOOLS GRID (Updated) */}
      <section className="px-6 max-w-7xl mx-auto mb-20">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Most Used</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {/* 1. Image Resizer */}
           <Link href="/tools/compressor" className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 hover:border-yellow-500/50 transition group text-center">
              <div className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-yellow-500 group-hover:scale-110 transition"><Zap size={24}/></div>
              <h3 className="font-bold text-slate-200">Image Resizer</h3>
              <p className="text-xs text-slate-500 mt-1">Compress Size</p>
           </Link>
           
           {/* 2. PDF Tools */}
           <Link href="/tools/img-to-pdf" className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 hover:border-red-500/50 transition group text-center">
              <div className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-red-500 group-hover:scale-110 transition"><FileText size={24}/></div>
              <h3 className="font-bold text-slate-200">PDF Tools</h3>
              <p className="text-xs text-slate-500 mt-1">Convert & Merge</p>
           </Link>

           {/* 3. News Hub (Replaced Date Converter) */}
           <Link href="/news" className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition group text-center">
              <div className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-500 group-hover:scale-110 transition"><Newspaper size={24}/></div>
              <h3 className="font-bold text-slate-200">News Hub</h3>
              <p className="text-xs text-slate-500 mt-1">RONB & International</p>
           </Link>

           {/* 4. Entertainment (Replaced Passport Photo in Main Grid) */}
           <Link href="/chill-zone" className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 hover:border-pink-500/50 transition group text-center">
              <div className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-pink-500 group-hover:scale-110 transition"><MonitorPlay size={24}/></div>
              <h3 className="font-bold text-slate-200">Chill Zone</h3>
              <p className="text-xs text-slate-500 mt-1">Live Sports & Movies</p>
           </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-10 text-center text-slate-500 text-sm">
         <p>© 2025 Tikajoshi Web. All rights reserved.</p>
      </footer>
    </div>
  );
}