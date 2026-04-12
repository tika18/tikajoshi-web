"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import {
  Building2, Award, Briefcase, FileText,
  Download, Loader2, Search, Zap, BookOpen, GraduationCap
} from "lucide-react";

export default function LoksewaPage() {
  const [activeCategory, setActiveCategory] = useState("kharidar");
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "kharidar", title: "Kharidar (खरिदार)",        icon: <Briefcase size={18}/>, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { id: "nasu",     title: "Nayab Subba (ना. सु.)",    icon: <Building2 size={18}/>, color: "text-blue-400",    bg: "bg-blue-500/10"    },
    { id: "officer",  title: "Section Officer (अधिकृत)", icon: <Award size={18}/>,     color: "text-violet-400",  bg: "bg-violet-500/10"  },
    { id: "banking",  title: "Banking (NRB/RBB)",         icon: <Building2 size={18}/>, color: "text-yellow-400",  bg: "bg-yellow-500/10"  },
    { id: "security", title: "Security (Police/Army)",    icon: <Zap size={18}/>,       color: "text-orange-400",  bg: "bg-orange-500/10"  },
  ];

  useEffect(() => { fetchData(); }, [activeCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = `*[_type == "loksewaResource" && category == "${activeCategory}"] {
        title, type, "fileUrl": file.asset->url
      }`;
      const results = await client.fetch(q);
      setDataList(results);
    } catch (err) {
      console.error("Loksewa fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = dataList.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const materialsByType = (type: string) =>
    filteredData.filter(item => item.type === type);

  return (
    <div className="min-h-screen bg-[#070c14] text-white">
      <Navbar />

      {/* HERO */}
      <div className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/15 via-indigo-600/8 to-transparent pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-600/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-indigo-600/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-xs font-bold text-blue-300 uppercase tracking-widest mb-6">
            🇳🇵 Loksewa Aayog
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Loksewa{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Preparation
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg mb-8 max-w-xl mx-auto">
            Free Syllabus, Notes र Old Questions — Kharidar देखि Officer Level सम्म।
          </p>
          <div className="relative max-w-xl mx-auto">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-blue-500/40 transition">
              <Search size={18} className="text-slate-500 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search materials (e.g. GK, IQ, Paper 2)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-white w-full placeholder:text-slate-600 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto pb-24 px-4 md:px-8 flex flex-col lg:flex-row gap-8">

        {/* SIDEBAR */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-24 bg-white/3 border border-white/8 rounded-2xl p-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">
              Target Exam
            </p>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all text-left border ${
                    activeCategory === cat.id
                      ? `bg-white/8 border-white/12 ${cat.color}`
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent"
                  }`}
                >
                  <span className={`p-1.5 rounded-lg ${cat.bg}`}>{cat.icon}</span>
                  {cat.title.split(" (")[0]}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-600">
              <Loader2 className="animate-spin mb-4" size={36} />
              <p className="text-xs font-bold uppercase tracking-widest">Fetching Resources...</p>
            </div>
          ) : (
            <div className="space-y-8">

              {/* Active Header */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${categories.find(c => c.id === activeCategory)?.bg}`}>
                  {categories.find(c => c.id === activeCategory)?.icon}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    {categories.find(c => c.id === activeCategory)?.title}
                  </h2>
                  <p className="text-xs text-slate-500">{filteredData.length} materials found</p>
                </div>
              </div>

              {/* Materials Grid */}
              <div className="grid md:grid-cols-3 gap-5">
                {[
                  { id: "notes",     title: "Preparation Notes", icon: <FileText size={20} className="text-emerald-400"/>,    color: "border-emerald-500/20 hover:border-emerald-500/40", badge: "bg-emerald-500/10 text-emerald-300" },
                  { id: "questions", title: "Old Questions",      icon: <GraduationCap size={20} className="text-red-400"/>,   color: "border-red-500/20 hover:border-red-500/40",         badge: "bg-red-500/10 text-red-300"       },
                  { id: "syllabus",  title: "Exam Syllabus",      icon: <BookOpen size={20} className="text-blue-400"/>,       color: "border-blue-500/20 hover:border-blue-500/40",       badge: "bg-blue-500/10 text-blue-300"     },
                ].map(type => {
                  const items = materialsByType(type.id);
                  return (
                    <div key={type.id} className={`bg-white/3 border ${type.color} rounded-2xl p-5 flex flex-col transition-all`}>
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/6">
                        <div className="p-2 bg-white/5 rounded-xl">{type.icon}</div>
                        <div>
                          <h3 className="text-sm font-black text-white">{type.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${type.badge}`}>
                            {items.length} files
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {items.length > 0 ? items.map((item, idx) => (
                          <a key={idx} href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl bg-white/4 hover:bg-white/8 border border-white/5 hover:border-white/10 transition group">
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white transition truncate mr-2">
                              {item.title}
                            </span>
                            <Download size={13} className="text-slate-600 group-hover:text-blue-400 transition shrink-0" />
                          </a>
                        )) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/8 rounded-xl">
                            <p className="text-slate-600 text-xs font-medium">No {type.id} yet</p>
                            <p className="text-slate-700 text-[10px] mt-1">Coming soon...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty search state */}
              {filteredData.length === 0 && searchQuery && (
                <div className="text-center py-20 bg-white/2 border border-dashed border-white/8 rounded-2xl">
                  <div className="text-5xl mb-3">🔍</div>
                  <h3 className="text-lg font-bold text-white mb-2">No results found</h3>
                  <p className="text-slate-500 text-sm">Try a different keyword or select another category.</p>
                </div>
              )}

              {/* SEO */}
              <div className="p-6 bg-white/2 border border-white/6 rounded-2xl">
                <h2 className="text-lg font-black text-white mb-3">
                  Loksewa Aayog Preparation 2081 — Free Materials Nepal 🇳🇵
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Free Loksewa preparation materials — Kharidar, Nayab Subba, Section Officer, NRB Banking र Police/Army exams को
                  <strong className="text-slate-300"> syllabus, notes र old questions</strong> — सबै free download।
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}