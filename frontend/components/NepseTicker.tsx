"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface TickerIndex {
  value: string;
  change: string;
  pct: string;
  up: boolean;
}

interface Gainer {
  sym: string;
  ltp: number;
  chg: number;
}

interface TickerData {
  nepse: TickerIndex | null;
  turnover: string;
  gainers: Gainer[];
}

export default function NepseTicker() {
  const [data, setData] = useState<TickerData>({
    nepse: null,
    turnover: "",
    gainers: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchTickerData = async () => {
    try {
      const res = await fetch("/api/nepse");
      const json = await res.json();
      if (json.success && json.marketStats) {
        setData({
          nepse: json.marketStats.nepseIndex,
          turnover: json.marketStats.turnover || "",
          gainers: json.topGainers ? json.topGainers.slice(0, 5) : [],
        });
      }
    } catch (err) {
      console.error("Error fetching ticker data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickerData();
    const interval = setInterval(fetchTickerData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-950/80 border-b border-white/5 py-2.5 overflow-hidden flex items-center justify-center">
        <span className="text-slate-500 text-xs flex items-center gap-1.5">
          <RefreshCw size={11} className="animate-spin" /> Loading Live NEPSE Tape...
        </span>
      </div>
    );
  }

  const { nepse, turnover, gainers } = data;

  return (
    <div className="bg-slate-950/90 border-b border-white/5 py-2.5 overflow-hidden relative z-20 select-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">
        {/* Label */}
        <div className="shrink-0 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-black text-emerald-400 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live NEPSE
        </div>

        {/* Scrolling Tape Container */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex gap-12 whitespace-nowrap animate-marquee">
            {/* Ticker items */}
            {nepse && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">NEPSE Index:</span>
                <span className="text-xs font-black text-white">{nepse.value}</span>
                <span className={`text-[10px] font-bold flex items-center ${nepse.up ? "text-emerald-400" : "text-red-400"}`}>
                  {nepse.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {nepse.change} ({nepse.pct}%)
                </span>
              </div>
            )}

            {turnover && (
              <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                <span className="text-xs text-slate-400 font-medium">Turnover:</span>
                <span className="text-xs font-black text-white">Rs. {turnover}</span>
              </div>
            )}

            {gainers.length > 0 && (
              <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                <span className="text-xs text-slate-400 font-medium">Top Gainers:</span>
                {gainers.map((g) => (
                  <span key={g.sym} className="text-xs font-bold flex items-center gap-1 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">
                    <span className="text-slate-300">{g.sym}</span>
                    <span className="text-emerald-400">Rs. {g.ltp}</span>
                    <span className="text-[10px] text-emerald-500">+{g.chg}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
