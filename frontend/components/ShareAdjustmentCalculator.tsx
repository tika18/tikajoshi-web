"use client";
import { useState } from "react";
import { TrendingUp } from "lucide-react";

export default function ShareAdjustmentCalculator() {
  const [marketPrice, setMarketPrice] = useState<number | "">("");
  const [bonusPercent, setBonusPercent] = useState<number | "">("");
  const [rightPercent, setRightPercent] = useState<number | "">("");
  const [rightPremium, setRightPremium] = useState<number>(0);

  const calculateAdjustment = () => {
    const mp = Number(marketPrice) || 0;
    const bp = Number(bonusPercent) || 0;
    const rp = Number(rightPercent) || 0;
    const premium = Number(rightPremium) || 0;
    
    // Par value is generally 100 for NEPSE
    const parValue = 100;
    const paidForRight = parValue + premium;

    if (mp === 0) return 0;

    // Standard Ex-Price Formula used in NEPSE:
    // Ex-Price = (Market Price + (Right Share % / 100) * Paid For Right) / (1 + (Bonus % / 100) + (Right % / 100))
    const exPrice = (mp + (rp / 100) * paidForRight) / (1 + (bp / 100) + (rp / 100));
    
    return exPrice;
  };

  const exPrice = calculateAdjustment();

  return (
    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-5 sm:p-6 w-full h-full flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={18} className="text-orange-400" />
        <h3 className="font-black text-white text-base sm:text-lg">Bonus/Right Adjustment</h3>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-center">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Market Price Before Book Close (Rs)</label>
          <input
            type="number"
            min="0"
            value={marketPrice}
            onChange={(e) => setMarketPrice(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="e.g. 500"
            className="w-full bg-slate-800/80 text-white text-sm px-4 py-2.5 rounded-xl border border-slate-700/50 focus:border-orange-500/50 outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Bonus Share (%)</label>
            <input
              type="number"
              min="0"
              value={bonusPercent}
              onChange={(e) => setBonusPercent(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 10"
              className="w-full bg-slate-800/80 text-white text-sm px-4 py-2.5 rounded-xl border border-slate-700/50 focus:border-emerald-500/50 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Right Share (%)</label>
            <input
              type="number"
              min="0"
              value={rightPercent}
              onChange={(e) => setRightPercent(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 50"
              className="w-full bg-slate-800/80 text-white text-sm px-4 py-2.5 rounded-xl border border-slate-700/50 focus:border-cyan-500/50 outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Right Share Premium (Rs) - Default 0</label>
          <input
            type="number"
            min="0"
            value={rightPremium}
            onChange={(e) => setRightPremium(Number(e.target.value))}
            placeholder="e.g. 0"
            className="w-full bg-slate-800/80 text-white text-sm px-4 py-2.5 rounded-xl border border-slate-700/50 focus:border-violet-500/50 outline-none transition-colors"
          />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
          <div className="text-xs text-slate-400 mb-1">Adjusted Ex-Price</div>
          <div className="text-3xl font-black text-orange-400">
            Rs {exPrice > 0 ? exPrice.toFixed(2) : "0.00"}
          </div>
        </div>
      </div>
    </div>
  );
}
