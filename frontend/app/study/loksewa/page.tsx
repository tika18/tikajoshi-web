"use client";
import Navbar from "@/components/Navbar";
import { Building2, Award, Briefcase, FileText, Download } from "lucide-react";

export default function LoksewaPage() {
  const categories = [
    { title: "Nayab Subba (ना. सु.)", icon: <Building2 className="text-blue-400"/>, link: "#" },
    { title: "Kharidar (खरिदार)", icon: <Briefcase className="text-emerald-400"/>, link: "#" },
    { title: "Section Officer (अधिकृत)", icon: <Award className="text-purple-400"/>, link: "#" },
    { title: "NRB / Banking", icon: <Building2 className="text-yellow-400"/>, link: "#" },
    { title: "Mahila Bikas", icon: <FileText className="text-pink-400"/>, link: "#" },
    { title: "Health Services", icon: <FileText className="text-red-400"/>, link: "#" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <Navbar />
      <div className="max-w-6xl mx-auto py-24 px-6">
        
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Loksewa Aayog Preparation</h1>
            <p className="text-slate-400">Select your target exam to find notes, syllabus and old questions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
                <div key={i} className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl hover:border-blue-500/50 transition group cursor-pointer">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-slate-800 p-3 rounded-xl group-hover:scale-110 transition">{cat.icon}</div>
                        <h3 className="text-xl font-bold text-white">{cat.title}</h3>
                    </div>
                    
                    <div className="space-y-2">
                        {['Syllabus', 'First Paper (GK/IQ)', 'Second Paper', 'Old Questions'].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">
                                <span>{item}</span>
                                <Download size={14}/>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}