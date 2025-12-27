"use client";

import { useState } from "react";
// @ts-ignore
import NepaliDate from "nepali-date-converter";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, ArrowDown } from "lucide-react";

export default function DateConverter() {
  const { t } = useLanguage(); // Language Hook
  const [bsYear, setBsYear] = useState(2081);
  const [bsMonth, setBsMonth] = useState(1);
  const [bsDay, setBsDay] = useState(1);
  const [adResult, setAdResult] = useState("");

  const convertToAD = () => {
    try {
      const nepaliDate = new NepaliDate(bsYear, bsMonth - 1, bsDay);
      const jsDate = nepaliDate.toJsDate();
      setAdResult(jsDate.toDateString());
    } catch (e) {
      setAdResult(t("Invalid Date!", "गलत मिति!"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-xl mx-auto py-16 px-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <Calendar size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
                {t("Date Converter", "मिति कन्भर्टर")}
            </h1>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">
                {t("Year", "वर्ष")}
              </label>
              <input type="number" value={bsYear} onChange={e => setBsYear(Number(e.target.value))} className="border-slate-200 bg-slate-50 p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700" placeholder="2081" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">
                {t("Month", "महिना")}
              </label>
              <select value={bsMonth} onChange={e => setBsMonth(Number(e.target.value))} className="border-slate-200 bg-slate-50 p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700">
                {[...Array(12)].map((_, i) => <option key={i} value={i+1}>{i+1}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">
                {t("Day", "गते")}
              </label>
              <input type="number" value={bsDay} onChange={e => setBsDay(Number(e.target.value))} className="border-slate-200 bg-slate-50 p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700" placeholder="1" />
            </div>
          </div>

          <button onClick={convertToAD} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
            {t("Convert to AD", "अंग्रेजी मिति हेर्नुहोस्")} <ArrowDown size={20} />
          </button>

          {adResult && (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center animate-in fade-in slide-in-from-bottom-2">
              <p className="text-emerald-600 font-medium mb-1">{t("English Date", "अंग्रेजी मिति")}</p>
              <p className="text-3xl font-bold text-slate-800">{adResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}