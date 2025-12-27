"use client";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { BookOpen, Building2, GraduationCap, LayoutGrid, ArrowRight, Zap } from "lucide-react";

export default function StudyHub() {
  const sections = [
    { title: "Engineering (IOE)", icon: <Zap className="text-yellow-500"/>, desc: "Notes, Syllabus, Questions for TU/PU.", link: "/study/ioe", color: "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20" },
    { title: "Loksewa Aayog", icon: <Building2 className="text-red-500"/>, desc: "Kharidar, Nayab Subba, Officer Prep.", link: "/study/loksewa", color: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20" },
    { title: "NEB (+2)", icon: <BookOpen className="text-green-500"/>, desc: "Class 11 & 12 Science/Mgmt Notes.", link: "/study/neb", color: "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20" },
    { title: "License Exams", icon: <LayoutGrid className="text-blue-500"/>, desc: "NEC, NMC, Nursing License Prep.", link: "/study/license", color: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] text-slate-900 dark:text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto py-32 px-6">
        <h1 className="text-4xl font-black mb-4 text-center">Study Hub 📚</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-16 max-w-2xl mx-auto text-lg">Select your path and access thousands of free resources.</p>

        <div className="grid md:grid-cols-2 gap-8">
           {sections.map((s, i) => (
              <Link key={i} href={s.link} className={`relative p-8 rounded-3xl border transition-all hover:scale-[1.02] ${s.color}`}>
                 <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-white dark:bg-[#0f172a] rounded-2xl shadow-sm">{s.icon}</div>
                    <div className="p-2 bg-white/50 dark:bg-white/10 rounded-full"><ArrowRight size={20}/></div>
                 </div>
                 <h2 className="text-2xl font-bold mb-2">{s.title}</h2>
                 <p className="text-slate-600 dark:text-slate-300">{s.desc}</p>
              </Link>
           ))}
        </div>
      </div>
    </div>
  );
}