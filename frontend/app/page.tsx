"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import Link from "next/link";
import { 
  Search, ArrowRight, Zap, GraduationCap, Building2, TrendingUp, 
  Image as ImageIcon, FileText, Calendar, UserSquare, ChevronRight, ExternalLink 
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [featuredPost, setFeaturedPost] = useState<any>(null);
  const router = useRouter();

  // 1. SMART SEARCH DATABASE
  // यहाँ किवर्ड र लिंकको म्यापिङ गरिएको छ
  const searchData = [
    { keywords: ["pdf", "convert", "merge"], title: "PDF Tools (Image to PDF)", link: "/tools/img-to-pdf", type: "Tool" },
    { keywords: ["image", "resize", "compress", "photo"], title: "Image Compressor", link: "/tools/compressor", type: "Tool" },
    { keywords: ["passport", "size", "photo", "rahadani"], title: "Passport Photo Maker", link: "/tools/passport-photo", type: "Tool" },
    { keywords: ["date", "miti", "convert", "bs", "ad"], title: "Date Converter", link: "/tools/date-converter", type: "Tool" },
    { keywords: ["question", "old", "note", "syllabus", "engineering"], title: "IOE Engineering (Notes/Questions)", link: "/study/ioe", type: "Study" },
    { keywords: ["loksewa", "kharidar", "subba", "gk"], title: "Loksewa Preparation", link: "/study/loksewa", type: "Study" },
    { keywords: ["result", "tu", "neb", "see", "published"], title: "Exam Results Hub", link: "/tools/tu-result", type: "Result" },
    { keywords: ["share", "market", "nepse", "ipo"], title: "Share Market Dashboard", link: "/market", type: "Market" },
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

  // Fetch Latest Blog/Chill Post
  useEffect(() => {
    client.fetch(`*[_type == "chillPost"] | order(publishedAt desc)[0]{
      title, category, "img": images[0].asset->url, publishedAt
    }`).then(data => setFeaturedPost(data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      
      {/* 1. HERO SECTION WITH SMART SEARCH */}
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto text-center relative">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          Tools for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
            Smart Students
          </span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
          One platform for Engineering Notes, Loksewa Prep, Exam Results, and Daily Utilities.
        </p>

        {/* SMART SEARCH BAR */}
        <div className="max-w-xl mx-auto relative mb-12 z-20">
          <div className="relative flex items-center bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl focus-within:border-blue-500 transition">
            <Search className="ml-4 text-slate-400"/>
            <input 
              type="text" 
              placeholder="Try searching 'PDF', 'Result', 'Old Question'..." 
              className="w-full bg-transparent border-none outline-none px-4 py-4 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery("")} className="mr-4 text-slate-400 hover:text-red-500">✕</button>
            )}
          </div>

          {/* AUTOCOMPLETE DROPDOWN */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl mt-2 overflow-hidden text-left animate-in fade-in slide-in-from-top-2">
              {suggestions.map((item, i) => (
                <Link key={i} href={item.link} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      item.type === 'Tool' ? 'bg-blue-100 text-blue-600' :
                      item.type === 'Result' ? 'bg-green-100 text-green-600' :
                      item.type === 'Study' ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-600'
                    }`}>{item.type}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400"/>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. IMPORTANT TOOLS (Quick Access) */}
      <section className="px-6 max-w-7xl mx-auto -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { name: "Image Resizer", icon: <Zap className="text-yellow-500"/>, link: "/tools/compressor" },
             { name: "Date Converter", icon: <Calendar className="text-blue-500"/>, link: "/tools/date-converter" },
             { name: "Passport Photo", icon: <UserSquare className="text-emerald-500"/>, link: "/tools/passport-photo" },
             { name: "PDF Tools", icon: <FileText className="text-red-500"/>, link: "/tools/img-to-pdf" },
           ].map((t, i) => (
             <Link key={i} href={t.link} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-500/50 transition flex flex-col items-center text-center gap-3 group">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl group-hover:scale-110 transition">{t.icon}</div>
                <span className="font-bold text-sm">{t.name}</span>
             </Link>
           ))}
        </div>
      </section>

      {/* 3. RESULT & STUDY SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
         <div className="grid md:grid-cols-2 gap-8">
            
            {/* Exam Results Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-500/20 p-8 rounded-3xl relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="bg-blue-600 text-white p-2 rounded-lg"><GraduationCap/></div>
                     <h2 className="text-2xl font-bold">Exam Results</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                     Check results for IOE, TU, NEB, SEE and License exams instantly from official sources.
                  </p>
                  <Link href="/tools/tu-result" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/20">
                     Check Results <ArrowRight size={18}/>
                  </Link>
               </div>
               <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
                  <GraduationCap size={150} />
               </div>
            </div>

            {/* Study Materials Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="bg-emerald-600 text-white p-2 rounded-lg"><Building2/></div>
                     <h2 className="text-2xl font-bold">Study Library</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                     Download Engineering Notes, Loksewa Syllabus, and Old Question collections.
                  </p>
                  <div className="flex gap-3">
                     <Link href="/study/ioe" className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-bold border hover:border-emerald-500 transition">Engineering</Link>
                     <Link href="/study/loksewa" className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-bold border hover:border-emerald-500 transition">Loksewa</Link>
                  </div>
               </div>
               <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
                  <Building2 size={150} />
               </div>
            </div>

         </div>
      </section>

      {/* 4. FEATURED UPDATES / BLOG */}
      <section className="py-10 px-6 bg-slate-50 dark:bg-[#0b1120] border-t border-slate-200 dark:border-slate-800">
         <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
               <div>
                  <h2 className="text-3xl font-bold mb-2">Latest Updates 📢</h2>
                  <p className="text-slate-500">Tech news, student stories, and notices.</p>
               </div>
               <Link href="/chill-zone" className="text-blue-500 font-bold hover:underline">View All</Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               {/* Featured Post from Sanity */}
               {featuredPost ? (
                  <Link href="/chill-zone" className="group relative h-64 rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                     {featuredPost.img && (
                        <img src={featuredPost.img} alt="Cover" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                        <span className="bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded w-fit mb-2">{featuredPost.category}</span>
                        <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition">{featuredPost.title}</h3>
                        <p className="text-slate-300 text-sm mt-1">{new Date(featuredPost.publishedAt).toDateString()}</p>
                     </div>
                  </Link>
               ) : (
                  <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                     No recent updates
                  </div>
               )}

               {/* Static Notice Card */}
               <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-8 rounded-3xl">
                  <div className="flex items-center gap-3 mb-4 text-orange-500">
                     <TrendingUp/> <span className="font-bold uppercase tracking-widest text-xs">Trending Now</span>
                  </div>
                  <ul className="space-y-4">
                     <li>
                        <Link href="/market" className="block font-medium hover:text-blue-500 transition">
                           📈 NEPSE Index updated live today
                        </Link>
                     </li>
                     <li>
                        <Link href="/study/loksewa" className="block font-medium hover:text-blue-500 transition">
                           📝 New Kharidar Syllabus 2081 Added
                        </Link>
                     </li>
                     <li>
                        <Link href="/tools/compressor" className="block font-medium hover:text-blue-500 transition">
                           📸 Compress Photos for DV Lottery
                        </Link>
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#020817] border-t border-slate-200 dark:border-slate-800 py-12 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
               <div className="font-black text-xl mb-2">Tikajoshi</div>
               <p className="text-slate-500 text-sm">Empowering Nepali Students with Technology.</p>
            </div>
            <div className="flex gap-6 text-sm font-bold text-slate-600 dark:text-slate-400">
               <Link href="/contact" className="hover:text-blue-500">Contact</Link>
               <Link href="/about" className="hover:text-blue-500">About</Link>
               <Link href="/privacy" className="hover:text-blue-500">Privacy</Link>
            </div>
         </div>
      </footer>
    </div>
  );
}