"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import Link from "next/link";
import { 
  Search, ArrowRight, Zap, GraduationCap, Building2, TrendingUp, 
  Image as ImageIcon, FileText, Calendar, UserSquare, ChevronRight, 
  Calculator, BookOpen, Wrench, BarChart3
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [featuredPost, setFeaturedPost] = useState<any>(null);
  const router = useRouter();

  // 1. SMART SEARCH DATABASE
  const searchData = [
    { keywords: ["pdf", "convert", "merge", "image to pdf"], title: "Image to PDF Converter", link: "/tools/img-to-pdf", type: "Tool" },
    { keywords: ["pdf to img", "pdf to jpg", "split"], title: "PDF to Image Converter", link: "/tools/pdf-to-img", type: "Tool" },
    { keywords: ["image", "resize", "compress", "photo", "size"], title: "Image Compressor", link: "/tools/compressor", type: "Tool" },
    { keywords: ["passport", "rahadani", "photo", "maker"], title: "Passport Photo Maker", link: "/tools/passport-photo", type: "Tool" },
    { keywords: ["date", "miti", "convert", "bs", "ad", "nepali date"], title: "Date Converter", link: "/tools/date-converter", type: "Tool" },
    { keywords: ["emi", "loan", "calculator", "interest"], title: "EMI Calculator", link: "/tools/emi-calculator", type: "Tool" },
    { keywords: ["question", "old", "note", "syllabus", "ioe", "engineering"], title: "IOE Engineering Resources", link: "/study/ioe", type: "Study" },
    { keywords: ["loksewa", "kharidar", "subba", "gk", "psc"], title: "Loksewa Preparation", link: "/study/loksewa", type: "Study" },
    { keywords: ["result", "tu", "neb", "see", "published", "exam"], title: "Exam Results Hub", link: "/tools/tu-result", type: "Result" },
    { keywords: ["share", "market", "nepse", "ipo", "price"], title: "Share Market Dashboard", link: "/market", type: "Market" },
  ];

  // Search Logic
  useEffect(() => {
    if (query.length > 1) {
      const filtered = searchData.filter(item => 
        item.keywords.some(k => k.includes(query.toLowerCase())) || 
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Fetch Featured Post
  useEffect(() => {
    client.fetch(`*[_type == "chillPost"] | order(publishedAt desc)[0]{
      title, category, "img": images[0].asset->url, publishedAt, author
    }`).then(data => setFeaturedPost(data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section className="pt-28 md:pt-40 pb-8 px-4 md:px-6 max-w-5xl mx-auto text-center relative">
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[90px] pointer-events-none"></div>

        <h1 className="text-4xl md:text-7xl font-black mb-4 md:mb-6 tracking-tight relative z-10">
          Tools for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Smart Students</span>
        </h1>
        <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto relative z-10">
          Engineering Notes, Loksewa Prep, Exam Results & Daily Utilities.
        </p>

        {/* SMART SEARCH BAR */}
        <div className="max-w-xl mx-auto relative mb-6 z-20">
          <div className="relative flex items-center bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl focus-within:border-blue-500 transition group">
            <Search className="ml-4 text-slate-400 group-focus-within:text-blue-500 transition"/>
            <input 
              type="text" 
              placeholder="Search 'Result', 'Notes'..." 
              className="w-full bg-transparent border-none outline-none px-4 py-3 md:py-4 text-base md:text-lg text-slate-900 dark:text-white placeholder:text-slate-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery("")} className="mr-4 text-slate-400 hover:text-red-500 font-bold">✕</button>
            )}
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl mt-2 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 z-50">
              {suggestions.map((item, i) => (
                <Link key={i} href={item.link} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                      item.type === 'Tool' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      item.type === 'Result' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                      item.type === 'Study' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-slate-100 text-slate-600'
                    }`}>{item.type}</span>
                    <span className="font-medium text-sm md:text-base">{item.title}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400"/>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. MAIN CATEGORIES (MOBILE ONLY 📱) */}
      {/* md:hidden ले यसलाई डेस्कटपमा लुकाउँछ */}
      <section className="px-4 max-w-7xl mx-auto relative z-10 mb-8 md:hidden">
        <div className="grid grid-cols-3 gap-3">
            <Link href="/study" className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-4 rounded-2xl active:scale-95 transition flex flex-col items-center justify-center text-center">
                <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl mb-2"><BookOpen size={20}/></div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Study Hub</span>
            </Link>
            
            <Link href="/tools" className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-4 rounded-2xl active:scale-95 transition flex flex-col items-center justify-center text-center">
                <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-3 rounded-xl mb-2"><Wrench size={20}/></div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Smart Tools</span>
            </Link>

            <Link href="/market" className="bg-gradient-to-br from-green-500/10 to-lime-500/10 border border-green-500/20 p-4 rounded-2xl active:scale-95 transition flex flex-col items-center justify-center text-center">
                <div className="bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-xl mb-2"><BarChart3 size={20}/></div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Share Market</span>
            </Link>
        </div>
      </section>

      {/* 3. MOST USED TOOLS (Visible on both, but optimized grid) */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto relative z-10 mb-16">
        <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">Quick Tools</h3>
            <Link href="/tools" className="text-xs text-blue-500 font-bold md:hidden">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
           {[
             { name: "Image Resizer", icon: <Zap size={24} className="text-yellow-500"/>, link: "/tools/compressor", desc: "Compress Size" },
             { name: "PDF to Image", icon: <FileText size={24} className="text-red-500"/>, link: "/tools/pdf-to-img", desc: "Convert Pages" },
             { name: "Date Converter", icon: <Calendar size={24} className="text-blue-500"/>, link: "/tools/date-converter", desc: "BS ↔ AD" },
             { name: "Passport Photo", icon: <UserSquare size={24} className="text-emerald-500"/>, link: "/tools/passport-photo", desc: "Auto Crop" },
           ].map((t, i) => (
             <Link key={i} href={t.link} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-4 md:p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500/50 transition flex flex-col items-center text-center gap-2 group active:scale-95">
                <div className="bg-slate-50 dark:bg-slate-800 p-2 md:p-3 rounded-xl group-hover:scale-110 transition shadow-inner">{t.icon}</div>
                <div>
                    <span className="font-bold text-xs md:text-sm block group-hover:text-blue-500 transition">{t.name}</span>
                    <span className="text-[10px] md:text-xs text-slate-500 hidden md:block">{t.desc}</span>
                </div>
             </Link>
           ))}
        </div>
      </section>

      {/* 4. RESULT & STUDY SECTION (Desktop Focus) */}
      {/* Mobile मा यो अलि तल आउँछ, किनकि माथि नै सर्टकट छ */}
      <section className="py-10 md:py-20 px-4 md:px-6 max-w-7xl mx-auto">
         <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-500/20 p-6 md:p-8 rounded-3xl relative overflow-hidden group hover:shadow-2xl transition duration-500">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg"><GraduationCap/></div>
                     <h2 className="text-xl md:text-2xl font-bold">Result Hub</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 md:mb-8 text-sm md:text-base leading-relaxed">
                     Check results for IOE, TU, NEB, SEE and License exams instantly from official sources.
                  </p>
                  <Link href="/tools/tu-result" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/30 text-sm md:text-base">
                     Check Now <ArrowRight size={18}/>
                  </Link>
               </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-500/20 p-6 md:p-8 rounded-3xl relative overflow-hidden group hover:shadow-2xl transition duration-500">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg"><Building2/></div>
                     <h2 className="text-xl md:text-2xl font-bold">Study Library</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 md:mb-8 text-sm md:text-base leading-relaxed">
                     Download Engineering Notes, Syllabus, Old Questions, and Loksewa Preparation materials.
                  </p>
                  <div className="flex flex-wrap gap-3">
                     <Link href="/study/ioe" className="px-4 md:px-5 py-2 md:py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs md:text-sm font-bold border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 hover:text-emerald-500 transition shadow-sm">Engineering</Link>
                     <Link href="/study/loksewa" className="px-4 md:px-5 py-2 md:py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs md:text-sm font-bold border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 hover:text-emerald-500 transition shadow-sm">Loksewa</Link>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#020817] border-t border-slate-200 dark:border-slate-800 py-10 px-6 text-center">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p className="font-medium">© 2025 Tikajoshi</p>
            <div className="flex gap-6 font-bold">
               <Link href="/contact" className="hover:text-blue-500">Contact</Link>
               <Link href="/study" className="hover:text-blue-500">Study</Link>
               <Link href="/market" className="hover:text-blue-500">Market</Link>
            </div>
         </div>
      </footer>
    </div>
  );
}