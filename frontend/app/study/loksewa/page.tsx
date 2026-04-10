"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import { Building2, Award, Briefcase, FileText, Download, Loader2, ChevronRight, Search, Zap, BookOpen, GraduationCap } from "lucide-react";

export default function LoksewaPage() {
  const [activeCategory, setActiveCategory] = useState("kharidar");
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "kharidar", title: "Kharidar (खरिदार)", icon: <Briefcase size={18}/>, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "nasu", title: "Nayab Subba (ना. सु.)", icon: <Building2 size={18}/>, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "officer", title: "Section Officer (अधिकृत)", icon: <Award size={18}/>, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "banking", title: "Banking (NRB/RBB)", icon: <Building2 size={18}/>, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { id: "security", title: "Security (Police/Army)", icon: <Zap size={18}/>, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  useEffect(() => {
    fetchData();
  }, [activeCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch both specific resources and generic studyMaterials for this category
      const query = `*[_type == "loksewaResource" && category == "${activeCategory}"] {
        title,
        type,
        "fileUrl": file.asset->url
      }`;
      const results = await client.fetch(query);
      console.log("Sanity Loksewa Data:", results);
      setDataList(results);
    } catch (error) {
      console.error("Error fetching loksewa data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = dataList.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const materialsByType = (type: string) => filteredData.filter(item => item.type === type);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-600 to-indigo-700 pt-32 pb-20 px-6 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Loksewa Preparation Hub 🇳🇵</h1>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Access Syllabus, Notes, and Old Questions for all Loksewa Aayog competitive exams for FREE.</p>
          
          <div className="relative max-w-xl mx-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20}/>
            <input 
              type="text" 
              placeholder="Search materials (e.g. GK, IQ, Paper 2)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl py-4 pl-12 pr-4 outline-none border-2 border-transparent focus:border-white/20 shadow-2xl transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-6 flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar Navigation */}
        <aside className="lg:w-72 shrink-0">
          <div className="sticky top-24 space-y-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Target Exam</h3>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  activeCategory === cat.id 
                    ? `bg-white dark:bg-slate-800 shadow-lg ${cat.color} border border-slate-200 dark:border-slate-700` 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <span className={`p-1.5 rounded-lg ${activeCategory === cat.id ? cat.bg : 'bg-slate-200 dark:bg-slate-800'}`}>
                  {cat.icon}
                </span>
                {cat.title.split(' (')[0]}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-50">
              <Loader2 className="animate-spin mb-4" size={40}/>
              <p className="font-bold tracking-widest uppercase text-xs">Fetching Resources...</p>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Categorized Material Grid */}
              <div className="grid md:grid-cols-3 gap-8 text-center sm:text-left">
                {[
                  { id: 'notes', title: 'Preparation Notes', icon: <FileText className="text-emerald-500"/>, bg: 'bg-emerald-500/5' },
                  { id: 'questions', title: 'Old Question Bank', icon: <GraduationCap className="text-red-500"/>, bg: 'bg-red-500/5' },
                  { id: 'syllabus', title: 'Exam Syllabus', icon: <BookOpen className="text-blue-500"/>, bg: 'bg-blue-500/5' },
                ].map((type) => {
                  const items = materialsByType(type.id);
                  return (
                    <div key={type.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`p-3 rounded-2xl ${type.bg}`}>{type.icon}</div>
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">{type.title}</h3>
                      </div>

                      <div className="flex-1 space-y-3">
                        {items.length > 0 ? (
                          items.map((item, idx) => (
                            <a 
                              href={item.fileUrl} 
                              target="_blank" 
                              key={idx} 
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition group"
                            >
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate mr-2">{item.title}</span>
                              <Download size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0"/>
                            </a>
                          ))
                        ) : (
                          <div className="py-10 text-center opacity-30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest">No {type.id} found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary message if empty */}
              {filteredData.length === 0 && !loading && (
                <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No materials match your search</h3>
                  <p className="text-slate-500">Try a different keyword or select another category.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}