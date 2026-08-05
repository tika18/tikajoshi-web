"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Activity, AlertCircle, TrendingUp, TrendingDown, Layers, ShieldCheck, Database, BarChart3, Info } from "lucide-react";
import { performFullTechnicalAnalysis, TechnicalAnalysisResult } from "@/lib/technical-analysis";
import { OHLCEntry } from "@/lib/nepse-history";

interface StockPredictorProps {
  stocks?: any[];
  sectors?: any[];
}

interface FundamentalData {
  eps: number | null;
  pe: number | null;
  bookValue: number | null;
  high52: number | null;
  low52: number | null;
}

const nepseStocks = ["NABIL", "NICA", "HIDCL", "SHIVM", "UPPER", "API", "GBIME", "NTC", "CIT", "HDL", "NLIC", "ALICL"];

export default function StockPredictor({ stocks, sectors }: StockPredictorProps) {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TechnicalAnalysisResult | null>(null);
  const [fundamentals, setFundamentals] = useState<FundamentalData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const analyzeStock = async () => {
    if (!symbol) return;
    setLoading(true);
    setAnalysis(null);
    setFundamentals(null);
    setErrorMsg(null);

    const cleanSym = symbol.trim().toUpperCase();
    const liveStock = stocks?.find((s) => s.sym.toUpperCase() === cleanSym);

    try {
      // 1. Fetch real history
      const histRes = await fetch(`/api/nepse/history?symbol=${cleanSym}`);
      const histData = await histRes.json();
      const historyEntries: OHLCEntry[] = histData.success && Array.isArray(histData.history) ? histData.history : [];

      // Perform technical analysis calculation (works even with 0 or 1 day of history by leveraging liveStock)
      const res = performFullTechnicalAnalysis(cleanSym, historyEntries, liveStock);
      setAnalysis(res);

      // 2. Fetch fundamentals from Merolagani endpoint
      try {
        const fundRes = await fetch(`/api/nepse/fundamentals?symbol=${cleanSym}`);
        const fundData = await fundRes.json();
        if (fundData.success) {
          setFundamentals({
            eps: fundData.eps,
            pe: fundData.pe,
            bookValue: fundData.bookValue,
            high52: fundData.high52,
            low52: fundData.low52,
          });
        }
      } catch (fErr) {
        console.warn("Fundamentals fetch non-critical failure:", fErr);
      }
    } catch (err: any) {
      console.error("Predictor analysis error:", err);
      setErrorMsg("Unable to process technical analysis for this symbol.");
    } finally {
      setLoading(false);
    }
  };

  const currentSector = stocks?.find((s) => s.sym.toUpperCase() === symbol.trim().toUpperCase())?.sector;
  const sectorData = sectors?.find((s) => s.sector.toLowerCase() === currentSector?.toLowerCase());

  return (
    <div className="w-full max-w-5xl mx-auto p-1">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-3xl border border-slate-800/90 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold mb-3 border border-emerald-500/20">
            <ShieldCheck size={15} /> Real Technical & Fundamental Analysis
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">NEPSE Predictor AI</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Analyze any NEPSE symbol with real market depth, VWAP, pivot levels, and multi-indicator technical confluence.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-lg mx-auto mb-8 z-20">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                list="stock-list-predictor"
                type="text"
                placeholder="Search Symbol (e.g. NABIL, NICA, HIDCL)..."
                className="w-full pl-5 pr-4 py-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-white focus:border-emerald-500 outline-none transition-all uppercase font-bold tracking-wider text-sm shadow-inner"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyzeStock()}
              />
              <datalist id="stock-list-predictor">
                {nepseStocks.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <button
              onClick={analyzeStock}
              disabled={loading || !symbol.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white px-7 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              {loading ? <Activity size={16} className="animate-spin" /> : <Search size={16} />}
              <span>ANALYZE</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-xs text-center mb-6">
            {errorMsg}
          </div>
        )}

        {/* Analysis Result Display */}
        {analysis && !loading && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Stock Summary Header */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{analysis.symbol}</h3>
                  {currentSector && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-300 text-[11px] font-semibold">
                      {currentSector}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs font-mono mt-1">LTP: Rs. {analysis.price}</p>
              </div>

              {/* AI Signal Badge */}
              <div
                className={`px-6 py-3 rounded-2xl text-center border ${
                  analysis.overallSignal.includes("BUY")
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : analysis.overallSignal.includes("SELL")
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                <p className="text-[10px] font-bold tracking-widest opacity-80 uppercase mb-0.5">
                  Confluence AI Signal
                </p>
                <p className="text-xl sm:text-2xl font-black">{analysis.overallSignal}</p>
                <p className="text-[10px] opacity-75 mt-0.5">{analysis.confidence}% Model Confidence</p>
              </div>
            </div>

            {/* Rationale Bullet Points */}
            {analysis.signalRationale.length > 0 && (
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/80">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-emerald-400" /> Key Analysis Insights
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {analysis.signalRationale.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 1: TODAY'S MARKET SNAPSHOT (Phase 1 Real Data) */}
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity size={15} /> Today&apos;s Market Snapshot (Real Session Metrics)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">VWAP Price</p>
                  <p className="text-base font-black text-white">Rs. {analysis.vwapVal}</p>
                  <p className="text-[10px] font-semibold text-emerald-400 mt-1">{analysis.priceVsVwapSignal}</p>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Pivot Point</p>
                  <p className="text-base font-black text-white">Rs. {analysis.pivotPoint}</p>
                  <p className="text-[10px] text-slate-400 mt-1">S1: {analysis.support1} | R1: {analysis.resistance1}</p>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Daily Range %</p>
                  <p className="text-base font-black text-white">{analysis.dailyRangePct}%</p>
                  <p className="text-[10px] text-slate-400 mt-1">High - Low spread</p>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Sector Momentum</p>
                  <p className="text-base font-black text-white">
                    {sectorData ? `${sectorData.chg > 0 ? "+" : ""}${sectorData.chg}%` : "N/A"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{currentSector || "General Market"}</p>
                </div>
              </div>

              {/* Fundamental Ratios Row */}
              {fundamentals && (
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Fundamental Ratios (Merolagani Source)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">EPS (TTM)</p>
                      <p className="text-sm font-bold text-slate-200">
                        {fundamentals.eps !== null ? `Rs. ${fundamentals.eps}` : "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">P/E Ratio</p>
                      <p className="text-sm font-bold text-slate-200">
                        {fundamentals.pe !== null ? fundamentals.pe : "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Book Value</p>
                      <p className="text-sm font-bold text-slate-200">
                        {fundamentals.bookValue !== null ? `Rs. ${fundamentals.bookValue}` : "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">52-Wk Range</p>
                      <p className="text-xs font-bold text-slate-200">
                        {fundamentals.high52 && fundamentals.low52
                          ? `${fundamentals.high52} / ${fundamentals.low52}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: TECHNICAL ANALYSIS (Multi-Day Historical Indicators) */}
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={15} /> Technical Analysis Indicators
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Database size={13} className="text-slate-500" />
                  <span>
                    Historical Data: <strong className="text-white">{analysis.sufficiency.days}</strong> / 200 days
                  </span>
                </div>
              </div>

              {/* Data Sufficiency Warning / Progress if under 200 days */}
              {analysis.sufficiency.days < 200 && (
                <div className="mb-5 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs text-blue-300 font-semibold mb-2">
                    <span>Accumulating Real History Data</span>
                    <span>{Math.min(100, Math.round((analysis.sufficiency.days / 200) * 100))}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, (analysis.sufficiency.days / 200) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {analysis.sufficiency.days === 0
                      ? "First time querying this symbol. Daily OHLC data has begun accumulating automatically."
                      : `Currently stored ${analysis.sufficiency.days} day(s) of real OHLC history. Short-term indicators activate as days accumulate.`}
                  </p>
                </div>
              )}

              {/* Multi-day Indicator Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">RSI (14-period)</p>
                  {analysis.rsi14 !== null ? (
                    <p
                      className={`text-lg font-black ${
                        analysis.rsi14 < 30 ? "text-emerald-400" : analysis.rsi14 > 70 ? "text-rose-400" : "text-blue-400"
                      }`}
                    >
                      {analysis.rsi14}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic font-mono">Needs 15 days</p>
                  )}
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">MACD (12/26/9)</p>
                  {analysis.macd !== null ? (
                    <div>
                      <p className="text-sm font-bold text-white">Hist: {analysis.macd.histogram}</p>
                      <p className="text-[10px] text-slate-400">Line: {analysis.macd.macdLine}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic font-mono">Needs 35 days</p>
                  )}
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">20 EMA</p>
                  {analysis.ema20 !== null ? (
                    <p className="text-base font-black text-white">Rs. {analysis.ema20}</p>
                  ) : (
                    <p className="text-xs text-slate-500 italic font-mono">Needs 20 days</p>
                  )}
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">200 EMA Cross</p>
                  {analysis.crossSignal ? (
                    <p className="text-xs font-bold text-emerald-400">{analysis.crossSignal}</p>
                  ) : (
                    <p className="text-xs text-slate-500 italic font-mono">Needs 200 days</p>
                  )}
                </div>
              </div>

              {/* Additional Indicators Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Candlestick Pattern</p>
                  <p className="text-xs font-bold text-slate-300">
                    {analysis.candlestickPattern || "No distinct pattern"}
                  </p>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">ATR (Volatility)</p>
                  <p className="text-xs font-bold text-slate-300">
                    {analysis.atr14 !== null ? `Rs. ${analysis.atr14}` : "Needs 14 days"}
                  </p>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Market Structure</p>
                  <p className="text-xs font-bold text-slate-300">
                    {analysis.marketStructure || "Needs 15 days"}
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-center gap-2 justify-center text-[10px] text-slate-500 uppercase tracking-widest pt-2">
              <AlertCircle size={12} />
              <span>Not Financial Advice • Educational Technical Analysis Tool</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}