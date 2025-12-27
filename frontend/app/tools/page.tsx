"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Search, Calendar, Image as ImageIcon, FileText, Scissors, 
  UserSquare, Calculator, Zap, Globe, FileDown, Layers, Lock, RefreshCw
} from "lucide-react";

export default function ToolsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // All Tools Data
  const categories = [
    {
      title: t("Most Popular", "धेरै खोजिने"),
      items: [
        { name: t("Date Converter", "मिति कन्भर्टर"), desc: "BS ↔ AD Converter", icon: <Calendar />, color: "text-blue-400", bg: "bg-blue-400/10", link: "/tools/date-converter", badge: "Hot" },
        { name: t("Passport Photo", "पासपोर्ट फोटो"), desc: "Make 35x45mm Photo", icon: <UserSquare />, color: "text-emerald-400", bg: "bg-emerald-400/10", link: "/tools/passport-photo", badge: "New" },
        { name: t("EMI Calculator", "EMI क्याल्कुलेटर"), desc: "Loan Interest Calc", icon: <Calculator />, color: "text-purple-400", bg: "bg-purple-400/10", link: "/tools/emi-calculator" },
        { name: t("Forex Live", "विनिमय दर"), desc: "Live Exchange Rates", icon: <Globe />, color: "text-cyan-400", bg: "bg-cyan-400/10", link: "/market/forex" },
      ]
    },
    {
      title: t("Image Tools", "फोटो टुल्स"),
      items: [
        { name: t("Image Compressor", "फोटो कम्प्रेसर"), desc: "Reduce Size (KB)", icon: <Zap />, color: "text-yellow-400", bg: "bg-yellow-400/10", link: "/tools/compressor" },
        { name: t("Format Converter", "फर्म्याट कन्भर्टर"), desc: "JPG ↔ PNG ↔ WEBP", icon: <RefreshCw />, color: "text-pink-400", bg: "bg-pink-400/10", link: "/tools/img-converter" },
        { name: t("Portrait to Landscape", "ल्याण्डस्केप मेकर"), desc: "AI Background Fill", icon: <Layers />, color: "text-indigo-400", bg: "bg-indigo-400/10", link: "/tools/img-resize" },
      ]
    },
    {
      title: t("PDF Tools", "PDF टुल्स"),
      items: [
        { name: t("Image to PDF", "फोटो देखि PDF"), desc: "Combine Photos to PDF", icon: <FileDown />, color: "text-orange-400", bg: "bg-orange-400/10", link: "/tools/img-to-pdf" },
        { name: t("PDF to Image", "PDF लाई फोटो"), desc: "Save PDF Pages as JPG", icon: <FileText />, color: "text-rose-400", bg: "bg-rose-400/10", link: "/tools/pdf-to-img" },
        // Placeholder for future tool
        { name: t("PDF Lock/Unlock", "PDF लक/अनलक"), desc: "Add or Remove Password", icon: <Lock />, color: "text-red-400", bg: "bg-red-400/10", link: "/tools/lock-pdf" },
      ]
    },
    {
      title: t("Calculators", "क्याल्कुलेटर"),
      items: [
        { name: t("Salary Tax", "ट्याक्स क्याल्कुलेटर"), desc: "Nepal Salary Tax", icon: <Calculator />, color: "text-teal-400", bg: "bg-teal-400/10", link: "/tools/salary-tax" },
        { name: t("NEA Bill", "बिजुली बिल"), desc: "Electricity Bill Calc", icon: <Zap />, color: "text-amber-400", bg: "bg-amber-400/10", link: "/tools/nea-bill" },
      ]
    }
  ];

  // Search Logic
  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-24">
        
        {/* Header & Search */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t("Explore Our Toolkit", "हाम्रो डिजिटल टुल्सहरु")}
          </h1>
          
          <div className="relative group">
             <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
             <div className="relative flex items-center bg-[#1e293b] border border-slate-700 focus-within:border-emerald-500 rounded-full px-6 py-4 shadow-xl transition-all">
                <Search className="text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder={t("Search for tools (e.g. PDF, Converter)...", "टुल्स खोज्नुहोस् (उदा: PDF, फोटो...)")} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-lg text-white placeholder:text-slate-500"
                />
             </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="space-y-16">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-8 w-1.5 bg-emerald-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-white">{cat.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {cat.items.map((tool, i) => (
                    <Link 
                      key={i} 
                      href={tool.link} 
                      className="group relative bg-[#1e293b]/40 border border-slate-700/50 p-6 rounded-2xl hover:bg-[#1e293b] hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Badge */}
                      {tool.badge && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {tool.badge}
                        </span>
                      )}

                      <div className={`w-14 h-14 ${tool.bg} ${tool.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                        {tool.icon}
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 mb-4">
                        {tool.desc}
                      </p>
                      
                      <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-wide">
                        {t("Open Tool", "खोल्नुहोस्")} <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="text-center py-20 opacity-50">
                <Search size={48} className="mx-auto mb-4"/>
                <p className="text-xl">No tools found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}