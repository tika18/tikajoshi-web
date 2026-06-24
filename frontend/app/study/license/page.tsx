"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import { Award, FileText, Download, Loader2, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LicensePage() {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = `*[_type == "studyMaterial" && category == "license"] | order(_createdAt desc) {
        title,
        description,
        "fileUrl": file.asset->url
      }`;
      const results = await client.fetch(query);
      setDataList(results);
    } catch (error) {
      console.error("Error fetching license data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = dataList.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] text-slate-900 dark:text-slate-200">
      <Navbar />
      
      <div className="max-w-6xl mx-auto py-32 px-6">
        <Link href="/study" className="flex items-center gap-2 text-sm text-slate-500 mb-8 hover:text-emerald-500 transition w-fit">
          <ArrowLeft size={16}/> Back to Hub
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2">License Exam Prep 🎖️</h1>
            <p className="text-slate-500">NEC, NMC, and Nursing License preparation materials.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input 
              type="text" 
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-50"><Loader2 className="animate-spin mb-4" size={32}/><p className="text-sm font-bold tracking-widest uppercase">Loading resources...</p></div>
        ) : filteredData.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item, idx) => (
              <div key={idx} className="bg-card border border-border p-6 rounded-2xl hover:border-emerald-500/50 transition shadow-sm flex flex-col">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit mb-4"><Award size={20}/></div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-1">{item.description}</p>
                <a 
                  href={item.fileUrl} 
                  target="_blank" 
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white rounded-xl text-center text-sm font-bold transition flex items-center justify-center gap-2"
                >
                  <Download size={14}/> Download PDF
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px]">
             <FileText className="mx-auto text-slate-300 mb-4" size={48}/>
             <p className="text-slate-500">No materials found in this section yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
