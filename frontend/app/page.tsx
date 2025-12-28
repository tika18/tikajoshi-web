"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import Link from "next/link";
import { 
  Search, ArrowRight, Zap, GraduationCap, Building2, TrendingUp, 
  Image as ImageIcon, FileText, Calendar, UserSquare, ChevronRight, Calculator, FileDown
} from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [featuredPost, setFeaturedPost] = useState<any>(null);
  const router = useRouter();

  // Search Data
  const searchData = [
    { keywords: ["pdf", "convert", "merge"], title: "Image to PDF Converter", link: "/tools/img-to-pdf", type: "Tool" },
    { keywords: ["pdf", "image", "jpg"], title: "PDF to Image Converter", link: "/tools/pdf-to-img", type: "Tool" },
    { keywords: ["image", "resize", "compress"], title: "Image Compressor", link: "/tools/compressor", type: "Tool" },
    { keywords: ["passport"], title: "Passport Photo Maker", link: "/tools/passport-photo", type: "Tool" },
    { keywords: ["date", "miti"], title: "Date Converter", link: "/tools/date-converter", type: "Tool" },
    { keywords: ["ioe", "engineering"], title: "IOE Resources", link: "/study/ioe", type: "Study" },
    { keywords: ["result"], title: "Result Hub", link: "/tools/tu-result", type: "Result" },
    { keywords: ["share"], title: "Share Market", link: "/market", type: "Market" },
  ];

  useEffect(() => {
    if (query.length > 1) {
      setSuggestions(searchData.filter(item => 
        item.keywords.some(k => k.includes(query.toLowerCase())) || 
        item.title.toLowerCase().includes(query.toLowerCase())
      ));
    } else { setSuggestions([]); }
  }, [query]);

  useEffect(() => {
    client.fetch(`*[_type == "chillPost"] | order(publishedAt desc)[0]{
      title, category, author, "img": images[0].asset->url, publishedAt
    }`).then(data => setFeaturedPost(data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center relative">
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[90px] pointer-events-none"></div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight relative z-10">
          Tools for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Smart Students</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto relative z-10">
          The ultimate platform for Engineering Notes, Loksewa Prep, Exam Results, and Daily Utilities.
        </p>

        {/* SEARCH */}
        <div className="max-w-xl mx-auto relative mb-12 z-20">
          <div className="relative flex items-center bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl focus-within:border-blue-500 transition group">
            <Search className="ml-4 text-slate-400 group-focus-within:text-blue-500 transition"/>
            <input 
              type="text" 
              placeholder="Search 'PDF', 'Result', 'Notes'..." 
              className="w-full bg-transparent border-none outline-none px-4 py-4 text-lg text-slate-900 dark:text-white placeholder:text-slate-500"
              value={query} onChange={(e) => setQuery(e.target.value)}
            />
            {query && <button onClick={() => setQuery("")} className="mr-4 text-slate-400 hover:text-red-500 font-bold">✕</button>}
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl mt-2 overflow-hidden text-left z-50">
              {suggestions.map((item, i) => (
                <Link key={i} href={item.link} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wider">{item.type}</span>
                    <span className="font-medium text-sm md:text-base">{item.title}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400"/>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. TOP TOOLS */}
      <section className="px-6 max-w-7xl mx-auto -mt-4 relative z-10">
        <h3 className="text-center text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Most Used Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { name: "Image Resizer", icon: <Zap size={24} className="text-yellow-500"/>, link: "/tools/compressor", desc: "Compress & Resize" },
             { name: "PDF to Image", icon: <FileText size={24} className="text-red-500"/>, link: "/tools/pdf-to-img", desc: "Convert Pages" },
             { name: "Date Converter", icon: <Calendar size={24} className="text-blue-500"/>, link: "/tools/date-converter", desc: "BS ↔ AD" },
             { name: "Passport Photo", icon: <UserSquare size={24} className="text-emerald-500"/>, link: "/tools/passport-photo", desc: "Make 35x45mm" },
           ].map((t, i) => (
             <Link key={i} href={t.link} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500/50 transition flex flex-col items-center text-center gap-2 group active:scale-95">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl group-hover:scale-110 transition shadow-inner">{t.icon}</div>
                <div>
                    <span className="font-bold text-sm block group-hover:text-blue-500 transition">{t.name}</span>
                    <span className="text-xs text-slate-500">{t.desc}</span>
                </div>
             </Link>
           ))}
        </div>
      </section>

      {/* 3. LATEST UPDATES (Featured Post - Improved Image Fit) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
         <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold">Latest Updates 📢</h2>
            <Link href="/chill-zone" className="text-blue-500 font-bold hover:underline">View All</Link>
         </div>

         <div className="grid md:grid-cols-2 gap-8">
            
            {/* FEATURED POST (Fixed Image Aspect Ratio) */}
            {featuredPost ? (
                <Link href="/chill-zone" className="group relative rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition duration-500 border border-slate-200 dark:border-slate-700 bg-slate-900 flex flex-col md:block h-auto md:h-80 aspect-[4/3] md:aspect-auto">
                    {featuredPost.img ? (
                       // Image fills the container properly now
                       <img src={featuredPost.img} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition duration-700"/>
                    ) : (
                       <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600"></div>
                    )}
                    
                    {/* Dark Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">Featured</span>
                            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full">{featuredPost.category}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2 group-hover:text-pink-400 transition line-clamp-2">{featuredPost.title}</h3>
                        <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                            <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold uppercase">{featuredPost.author[0]}</div>
                            <span>{featuredPost.author}</span> • <span>{new Date(featuredPost.publishedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </Link>
            ) : (
                <div className="h-80 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700">
                   No recent updates available.
                </div>
            )}

            {/* Static Card (Result Hub) */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-500/20 p-10 rounded-[2rem] relative overflow-hidden group hover:shadow-xl transition h-auto md:h-80">
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-600 text-white p-3 rounded-xl shadow-lg"><GraduationCap/></div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Exam Results</h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6">
                        Waiting for results? Check IOE, TU, NEB, SEE and License exam results instantly from official sources.
                    </p>
                  </div>
                  <Link href="/tools/tu-result" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-blue-500/30 w-fit">
                     Check Now <ArrowRight size={18}/>
                  </Link>
               </div>
               <div className="absolute right-[-30px] bottom-[-30px] opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110 dark:invert pointer-events-none">
                  <GraduationCap size={200} />
               </div>
            </div>

         </div>
      </section>

      {/* Footer (Same as before) */}
      <footer className="bg-white dark:bg-[#020817] border-t border-slate-200 dark:border-slate-800 py-12 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
               <div className="font-black text-xl mb-2 flex items-center justify-center md:justify-start gap-2">
                  <div className="bg-slate-900 dark:bg-white text-white dark:text-black p-1 rounded">TJ</div>
                  Tikajoshi
               </div>
               <p className="text-slate-500 text-sm">Empowering Nepali Students with Technology.</p>
            </div>
            <div className="flex gap-8 text-sm font-bold text-slate-600 dark:text-slate-400">
               <Link href="/contact" className="hover:text-blue-500 transition">Contact</Link>
               <Link href="/study" className="hover:text-blue-500 transition">Study</Link>
               <Link href="/market" className="hover:text-blue-500 transition">Market</Link>
            </div>
         </div>
      </footer>
      {/* 3. LATEST UPDATES (Updated Card) */}
<section className="py-20 px-6 max-w-7xl mx-auto">
    {/* ... Header part same ... */}
    
    <div className="grid md:grid-cols-2 gap-8">
        
        {/* Featured Post Card */}
        {featuredPost ? (
            <Link href="/chill-zone" className="group relative w-full h-[400px] rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition duration-500 border border-slate-200 dark:border-slate-800">
                {featuredPost.img ? (
                    <img 
                        src={featuredPost.img} 
                        alt="Featured" 
                        className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black"></div>
                )}
                
                {/* Gradient Overlay for Text Visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>

                <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-pink-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                            Featured
                        </span>
                        <span className="bg-white/20 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                            {featuredPost.category}
                        </span>
                    </div>
                    
                    <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3 line-clamp-2 group-hover:text-pink-400 transition">
                        {featuredPost.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                            {featuredPost.author[0].toUpperCase()}
                        </div>
                        <span>{featuredPost.author}</span>
                        <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                        <span>{new Date(featuredPost.publishedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </Link>
        ) : (
            <div className="h-[400px] rounded-[2.5rem] bg-slate-100 dark:bg-[#1e293b] flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700">
                <p>No featured posts yet.</p>
            </div>
        )}

        {/* ... (Result Card remains same) ... */}
    </div>
</section>
    </div>
  );
}