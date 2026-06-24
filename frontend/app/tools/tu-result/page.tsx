"use client";
import Navbar from "@/components/Navbar";
import { ExternalLink, GraduationCap, Building2, BookOpen, Stethoscope, Trees, Tractor } from "lucide-react";
import Link from "next/link";

export default function ResultHub() {
  const categories = [
    {
      title: "University Exams (TU)",
      items: [
        { name: "TU Exam Result (4 Yrs)", desc: "BBS, BA, B.Ed Results", url: "https://result.tuexam.edu.np/?fbclid=IwZXh0bgNhZW0CMTEAAR2m5NdbQdcnfZyzompJZ6eyChwTPcm-" },
        { name: "CMAT Application/Status", desc: "Management Admission", url: "https://www.tudoms.org/cmat/status" },
      ]
    },
    {
      title: "Engineering & Technical",
      items: [
        { name: "IOE Exam Result", desc: "Engineering Semesters", url: "http://exam.ioe.edu.np/" },
        { name: "IOE Entrance Score", desc: "Entrance Score Card", url: "https://entrance.ioe.edu.np/Students/Review" },
        { name: "NEC License", desc: "Engineering Council", url: "https://register.nec.gov.np/" },
      ]
    },
    {
      title: "School Level (NEB/SEE)",
      items: [
        { name: "NEB Result", desc: "Class 11 & 12 (NTC)", url: "https://neb.ntc.net.np/" },
        { name: "SEE Result", desc: "Class 10 Results", url: "https://see.ntc.net.np/" },
      ]
    },
    {
      title: "Agriculture & Forestry",
      items: [
        { name: "Forestry (IOF)", desc: "News & Notices", url: "https://iof.edu.np/news" },
        { name: "Agriculture (AFU)", desc: "AFU Results & Notice", url: "https://www.afu.edu.np/" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-6xl mx-auto py-24 px-6">
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-primary">Home</Link> / 
            <Link href="/tools" className="hover:text-primary">Tools</Link> / 
            <span className="text-primary font-bold">Results</span>
        </div>

        <div className="text-center mb-16">
            <div className="inline-block p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
                <GraduationCap size={40} className="text-blue-600 dark:text-blue-400"/>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">Exam Results Portal</h1>
            <p className="text-slate-500 max-w-2xl mx-auto">Direct links to all official result publishing sites in Nepal. Check IOE, TU, NEB, and NEC results instantly.</p>
        </div>

        <div className="grid gap-12">
            {categories.map((cat, idx) => (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-4" style={{animationDelay: `${idx * 100}ms`}}>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                        {idx === 0 ? <Building2 className="text-blue-500"/> : 
                         idx === 1 ? <Stethoscope className="text-red-500"/> :
                         idx === 2 ? <BookOpen className="text-green-500"/> : 
                         <Tractor className="text-yellow-500"/>} 
                        {cat.title}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cat.items.map((item, i) => (
                            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="group bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl hover:border-primary hover:shadow-lg transition flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg group-hover:text-primary transition">{item.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                </div>
                                <ExternalLink size={18} className="text-slate-400 group-hover:text-primary transition"/>
                            </a>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}