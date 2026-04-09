"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import { BookOpen, FileText, Download, Loader2, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NEBPage() {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Query studyMaterial schema for class12
      const query = `*[_type == "studyMaterial" && category == "class12"] | order(_createdAt desc) {
        title,
        description,
        "fileUrl": file.asset->url
      }`;
      const results = await client.fetch(query);
      setDataList(results);
    } catch (error) {
      console.error("Error fetching NEB data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = dataList.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-200">
      <Navbar />
      
      <div className="bg-gradient-to-br from-green-600 to-teal-700 pt-32 pb-20 px-6 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Class 11 & 12 (NEB) Notes 📖</h1>
          <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto">Complete set of notes, solutions, and guides for Science and Management students.</p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
            <input 
              type="text" 
              placeholder="Search by subject (Physics, Math, Economics)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl py-4 pl-12 pr-4 outline-none shadow-2xl transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-16 px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <Loader2 className="animate-spin mb-4" size={40}/>
            <p className="font-bold tracking-widest uppercase text-xs">Loading Notes...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all flex flex-col group">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mb-6 group-hover:scale-110 transition">
                  <FileText size={24}/>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 leading-tight">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 flex-1">{item.description || "No description provided."}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <a 
                    href={item.fileUrl} 
                    target="_blank" 
                    className="flex items-center gap-2 text-xs font-black text-green-600 dark:text-green-400 uppercase tracking-widest hover:underline"
                  >
                    Download PDF <Download size={14}/>
                  </a>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <ArrowRight size={14}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="text-5xl mb-4">📭</div>
             <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No notes available yet</h3>
             <p className="text-slate-500">We are currently uploading Class 11 & 12 materials. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
