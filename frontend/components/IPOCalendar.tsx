"use client";

import React, { useState, useEffect } from "react";
import { Calendar, RefreshCw, Layers, ArrowUpRight } from "lucide-react";

export interface IpoItem {
  company: string;
  symbol?: string;
  sector?: string;
  type?: string;
  units?: string;
  price?: string;
  openDate?: string;
  closeDate?: string;
  issueManager?: string;
  status: "Open" | "Upcoming" | "Closed" | string;
}

export default function IPOCalendar() {
  const [ipos, setIpos] = useState<IpoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");

  const fetchIpos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nepse/ipo");
      const json = await res.json();
      if (json.success && Array.isArray(json.ipos)) {
        setIpos(json.ipos);
        setSource(json.source || "");
      }
    } catch (e) {
      console.error("Failed to fetch IPO data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpos();
  }, []);

  return (
    <div className="border border-white/[0.08] bg-gradient-to-br from-white/[0.02] to-white/[0.005] rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] hover:border-emerald-500/20 transition-all duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="text-emerald-400" size={20} />
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">Upcoming & Active IPO Tracker</h3>
            {source && (
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Source: {source}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchIpos}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Refresh IPO Data"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-emerald-400" : ""} />
          </button>
          <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            Live Updates
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Sector / Type</th>
              <th className="py-3 px-4">Total Units</th>
              <th className="py-3 px-4">Issue Price</th>
              <th className="py-3 px-4">Dates</th>
              <th className="py-3 px-4">Issue Manager</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 bg-white/10 rounded w-36" /></td>
                  <td className="py-4 px-4"><div className="h-3 bg-white/10 rounded w-20" /></td>
                  <td className="py-4 px-4"><div className="h-3 bg-white/10 rounded w-20" /></td>
                  <td className="py-4 px-4"><div className="h-3 bg-white/10 rounded w-16" /></td>
                  <td className="py-4 px-4"><div className="h-3 bg-white/10 rounded w-24" /></td>
                  <td className="py-4 px-4"><div className="h-3 bg-white/10 rounded w-28" /></td>
                  <td className="py-4 px-4"><div className="h-5 bg-white/10 rounded-full w-16 mx-auto" /></td>
                </tr>
              ))
            ) : ipos.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 text-xs font-semibold">
                  No active IPO notifications found. Check back daily.
                </td>
              </tr>
            ) : (
              ipos.map((ipo, idx) => (
                <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 px-4 font-bold text-white text-xs sm:text-sm">
                    <div className="flex flex-col">
                      <span>{ipo.company}</span>
                      {ipo.symbol && <span className="text-[10px] text-slate-500 font-mono">{ipo.symbol}</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-xs">
                    <div className="flex flex-col">
                      <span>{ipo.sector || "General"}</span>
                      <span className="text-[10px] text-emerald-400/80 font-bold">{ipo.type || "IPO"}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-300 text-xs font-semibold">{ipo.units || "1,500,000"}</td>
                  <td className="py-4 px-4 font-mono text-emerald-400 text-xs font-bold">{ipo.price || "Rs. 100"}</td>
                  <td className="py-4 px-4 text-xs text-slate-400 leading-tight font-medium">
                    <div>Open: {ipo.openDate || "TBA"}</div>
                    <div>Close: {ipo.closeDate || "TBA"}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-xs font-medium">{ipo.issueManager || "Merchant Bank"}</td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        ipo.status === "Open"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : ipo.status === "Upcoming"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {ipo.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
