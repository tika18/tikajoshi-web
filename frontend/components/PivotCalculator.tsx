"use client";
import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";

type PivotResult = {
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
};

export default function PivotCalculator() {
  const [calcType, setCalcType] = useState<"classic" | "woodie" | "fibonacci">("classic");
  const [high, setHigh] = useState<number | "">("");
  const [low, setLow] = useState<number | "">("");
  const [close, setClose] = useState<number | "">("");

  const [results, setResults] = useState<PivotResult | null>(null);

  useEffect(() => {
    const h = Number(high) || 0;
    const l = Number(low) || 0;
    const c = Number(close) || 0;

    if (h === 0 || l === 0 || c === 0 || h < l) {
      setResults(null);
      return;
    }

    let p = 0;
    let r1 = 0, r2 = 0, r3 = 0;
    let s1 = 0, s2 = 0, s3 = 0;

    const range = h - l;

    if (calcType === "classic") {
      p = (h + l + c) / 3;
      r1 = 2 * p - l;
      s1 = 2 * p - h;
      r2 = p + range;
      s2 = p - range;
      r3 = h + 2 * (p - l);
      s3 = l - 2 * (h - p);
    } else if (calcType === "woodie") {
      // Typically uses opening price in standard Woodie formulas,
      // but in standard high-low-close environments, Woodie formula is:
      p = (h + l + 2 * c) / 4;
      r1 = 2 * p - l;
      s1 = 2 * p - h;
      r2 = p + range;
      s2 = p - range;
      r3 = r1 + range;
      s3 = s1 - range;
    } else if (calcType === "fibonacci") {
      p = (h + l + c) / 3;
      r1 = p + 0.382 * range;
      s1 = p - 0.382 * range;
      r2 = p + 0.618 * range;
      s2 = p - 0.618 * range;
      r3 = p + 1.0 * range;
      s3 = p - 1.0 * range;
    }

    setResults({
      pivot: p,
      r1, r2, r3,
      s1, s2, s3,
    });
  }, [calcType, high, low, close]);

  const fmt = (val: number) => val.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-5 sm:p-6 w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Calculator size={18} className="text-amber-400" />
          <h3 className="font-black text-white text-base sm:text-lg">Technical Pivot Points</h3>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-0.5 self-start sm:self-auto">
          {(["classic", "woodie", "fibonacci"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setCalcType(t)}
              className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase transition-all ${
                calcType === t ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 flex-1">
        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 font-mono">High Price (Rs)</label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 845.50"
              value={high}
              onChange={(e) => setHigh(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 font-mono">Low Price (Rs)</label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 810.00"
              value={low}
              onChange={(e) => setLow(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 font-mono">Closing Price (Rs)</label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 830.00"
              value={close}
              onChange={(e) => setClose(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
            />
          </div>
        </div>

        {/* Outputs Grid */}
        <div className="bg-[#050810] border border-slate-850 rounded-2xl p-4 flex flex-col justify-center">
          {results ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-rose-400 pb-2 border-b border-slate-800/60">
                <span className="font-bold">Resistance 3 (R3)</span>
                <span className="font-black text-sm">{fmt(results.r3)}</span>
              </div>
              <div className="flex justify-between items-center text-rose-400/90 pb-2 border-b border-slate-800/40">
                <span className="font-bold">Resistance 2 (R2)</span>
                <span className="font-black text-sm">{fmt(results.r2)}</span>
              </div>
              <div className="flex justify-between items-center text-rose-400/80 pb-2 border-b border-slate-800/20">
                <span className="font-bold">Resistance 1 (R1)</span>
                <span className="font-black text-sm">{fmt(results.r1)}</span>
              </div>

              <div className="flex justify-between items-center bg-white/[0.03] px-3 py-2.5 rounded-xl border border-white/[0.04] text-amber-400 my-2">
                <span className="font-bold uppercase tracking-wider text-[11px]">Pivot Point (P)</span>
                <span className="font-black text-base">{fmt(results.pivot)}</span>
              </div>

              <div className="flex justify-between items-center text-emerald-400/80 pt-2 border-t border-slate-800/20">
                <span className="font-bold">Support 1 (S1)</span>
                <span className="font-black text-sm">{fmt(results.s1)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400/90 pt-2 border-t border-slate-800/40">
                <span className="font-bold">Support 2 (S2)</span>
                <span className="font-black text-sm">{fmt(results.s2)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400 pt-2 border-t border-slate-800/60">
                <span className="font-bold">Support 3 (S3)</span>
                <span className="font-black text-sm">{fmt(results.s3)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8 space-y-2">
              <Calculator size={32} className="mx-auto text-slate-700 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                Enter valid HLC prices
              </p>
              <p className="text-[10px] text-slate-600 max-w-[200px] mx-auto leading-relaxed">
                Ensure High is greater than Low and all fields are filled.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
