"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  Search, Zap, GraduationCap, Building2, 
  FileText, ChevronRight, Newspaper, MonitorPlay,
  BookOpen, Wrench, Files, BarChart3
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

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
      
      {/* HERO SECTION (Common) */}
      <section className="pt-32 pb-6 px-6 text-center max-w-5xl mx-auto relative">
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[100px]"></div>

        <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight">
          Tools for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Smart Students</span>
        </h1>
        
        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative mb-8 z-20">
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

      {/* =========================================================
          MOBILE ONLY SECTION (Screenshot Style Grid)
          (Visible on md:hidden only)
      ========================================================== */}
      <section className="px-4 max-w-7xl mx-auto mb-10 md:hidden relative z-10">
        
        {/* Top 3 Main Grid (Swapped Share Market with Chill Zone) */}
        <div className="grid grid-cols-3 gap-3 mb-6">
            <Link href="/study" className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-4 rounded-2xl active:scale-95 transition flex flex-col items-center justify-center text-center">
                <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl mb-2"><BookOpen size={20}/></div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Study Hub</span>
            </Link>
            
            <Link href="/tools" className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-4 rounded-2xl active:scale-95 transition flex flex-col items-center justify-center text-center">
                <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-3 rounded-xl mb-2"><Wrench size={20}/></div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Smart Tools</span>
            </Link>

            {/* Changed to Chill Zone as requested */}
            <Link href="/chill-zone" className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 p-4 rounded-2xl active:scale-95 transition flex flex-col items-center justify-center text-center">
                <div className="bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 p-3 rounded-xl mb-2"><MonitorPlay size={20}/></div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Chill Zone</span>
            </Link>
        </div>

        {/* Quick Tools Grid (Swapped Items) */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Access</p>
        <div className="grid grid-cols-2 gap-3">
           {/* 1. Image Resizer */}
           <Link href="/tools/compressor" className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm hover:border-blue-500/50 transition flex flex-col items-center text-center gap-2 active:scale-95">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl shadow-inner text-yellow-500"><Zap size={24}/></div>
                <div><span className="font-bold text-xs block">Image Resizer</span><span className="text-[10px] text-slate-500">Compress Size</span></div>
           </Link>
           
           {/* 2. PDF to Image */}
           <Link href="/tools/pdf-to-img" className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm hover:border-blue-500/50 transition flex flex-col items-center text-center gap-2 active:scale-95">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl shadow-inner text-red-500"><FileText size={24}/></div>
                <div><span className="font-bold text-xs block">PDF to Image</span><span className="text-[10px] text-slate-500">Convert Pages</span></div>
           </Link>

           {/* 3. News Hub (Replaced Date Converter) */}
           <Link href="/news" className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm hover:border-blue-500/50 transition flex flex-col items-center text-center gap-2 active:scale-95">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl shadow-inner text-blue-500"><Newspaper size={24}/></div>
                <div><span className="font-bold text-xs block">News Hub</span><span className="text-[10px] text-slate-500">Daily Updates</span></div>
           </Link>

           {/* 4. Merge PDF (Replaced Passport Photo) */}
           <Link href="/tools/merge-pdf" className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm hover:border-blue-500/50 transition flex flex-col items-center text-center gap-2 active:scale-95">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl shadow-inner text-emerald-500"><Files size={24}/></div>
                <div><span className="font-bold text-xs block">Merge PDF</span><span className="text-[10px] text-slate-500">Combine Files</span></div>
           </Link>
        </div>
      </section>

      {/* =========================================================
          DESKTOP ONLY SECTION (Standard Layout)
          (Visible on md:block only)
      ========================================================== */}
      <section className="px-6 max-w-7xl mx-auto mb-20 hidden md:block">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Most Used Tools</p>
        <div className="grid grid-cols-4 gap-4">
           {/* Desktop Standard Tools */}
           <Link href="/tools/compressor" className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 hover:border-yellow-500/50 transition group text-center hover:-translate-y-1 duration-300">
              <div className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-yellow-500 group-hover:scale-110 transition"><Zap size={24}/></div>
              <h3 className="font-bold text-slate-200">Image Resizer</h3>
              <p className="text-xs text-slate-500 mt-1">Compress Size</p>
           </Link>
           
           <Link href="/tools/img-to-pdf" className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 hover:border-red-500/50 transition group text-center hover:-translate-y-1 duration-300">
              <div className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-red-500 group-hover:scale-110 transition"><FileText size={24}/></div>
              <h3 className="font-bold text-slate-200">PDF Tools</h3>
              <p className="text-xs text-slate-500 mt-1">Convert & Merge</p>
           </Link>

           <Link href="/news" className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition group text-center hover:-translate-y-1 duration-300">
              <div className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-500 group-hover:scale-110 transition"><Newspaper size={24}/></div>
              <h3 className="font-bold text-slate-200">News Hub</h3>
              <p className="text-xs text-slate-500 mt-1">Daily Updates</p>
           </Link>

           <Link href="/chill-zone" className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 hover:border-pink-500/50 transition group text-center hover:-translate-y-1 duration-300">
              <div className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-pink-500 group-hover:scale-110 transition"><MonitorPlay size={24}/></div>
              <h3 className="font-bold text-slate-200">Chill Zone</h3>
              <p className="text-xs text-slate-500 mt-1">Live Sports & Movies</p>
           </Link>
        </div>

        {/* Desktop Extra Sections */}
        <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="bg-gradient-to-br from-blue-900/10 to-indigo-900/10 border border-blue-500/20 p-8 rounded-3xl relative overflow-hidden hover:shadow-2xl transition">
               <div className="flex items-center gap-3 mb-4"><div className="bg-blue-600 text-white p-2.5 rounded-xl"><GraduationCap/></div><h2 className="text-2xl font-bold">Result Hub</h2></div>
               <p className="text-slate-400 mb-8">Check results for IOE, TU, NEB, SEE and License exams instantly.</p>
               <Link href="/tools/tu-result" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition">Check Now</Link>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/10 to-teal-900/10 border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden hover:shadow-2xl transition">
               <div className="flex items-center gap-3 mb-4"><div className="bg-emerald-600 text-white p-2.5 rounded-xl"><Building2/></div><h2 className="text-2xl font-bold">Study Library</h2></div>
               <p className="text-slate-400 mb-8">Download Engineering Notes, Syllabus, Old Questions, and Loksewa Prep.</p>
               <Link href="/study" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition">Start Reading</Link>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 text-center text-slate-500 text-sm">
         <p>© 2025 Tikajoshi Web. All rights reserved.</p>
      </footer>
    </div>
  );
}