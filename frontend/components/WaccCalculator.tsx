"use client";
import { useState, useEffect } from "react";
import { Calculator, HelpCircle, RefreshCw, ArrowRightLeft } from "lucide-react";

export default function WaccCalculator() {
  const [txType, setTxType] = useState<"buy" | "sell">("buy");
  const [purchaseType, setPurchaseType] = useState<"ipo" | "secondary">("secondary");
  const [qty, setQty] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [waccBase, setWaccBase] = useState<number | "">("");
  const [cgtRate, setCgtRate] = useState<number>(5.0);

  // Outputs
  const [shareValue, setShareValue] = useState(0);
  const [brokerCommission, setBrokerCommission] = useState(0);
  const [sebonFee, setSebonFee] = useState(0);
  const [dpCharge, setDpCharge] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [profit, setProfit] = useState<number | null>(null);
  const [cgtAmount, setCgtAmount] = useState(0);
  const [netProfit, setNetProfit] = useState(0);

  const getBrokerRate = (amount: number): number => {
    if (purchaseType === "ipo") return 0;
    if (amount <= 50000) return 0.0036;
    if (amount <= 500000) return 0.0033;
    if (amount <= 2000000) return 0.0031;
    if (amount <= 10000000) return 0.0027;
    return 0.0024;
  };

  useEffect(() => {
    const q = Number(qty) || 0;
    const p = Number(price) || 0;
    const rawVal = q * p;

    if (q === 0 || p === 0) {
      setShareValue(0);
      setBrokerCommission(0);
      setSebonFee(0);
      setDpCharge(0);
      setNetAmount(0);
      setUnitCost(0);
      setProfit(null);
      setCgtAmount(0);
      setNetProfit(0);
      return;
    }

    setShareValue(rawVal);

    if (txType === "buy") {
      const broker = purchaseType === "ipo" ? 0 : rawVal * getBrokerRate(rawVal);
      const sebon = purchaseType === "ipo" ? 0 : rawVal * 0.00015; // 0.015%
      const dp = purchaseType === "ipo" ? 0 : 25; // Rs 25 DP charge usually on buying as well (secondary)
      const net = rawVal + broker + sebon + dp;
      
      setBrokerCommission(broker);
      setSebonFee(sebon);
      setDpCharge(dp);
      setNetAmount(net);
      setUnitCost(net / q);
      setProfit(null);
      setCgtAmount(0);
      setNetProfit(0);
    } else {
      // Sell
      const broker = rawVal * getBrokerRate(rawVal);
      const sebon = rawVal * 0.00015;
      const dp = 25; // DP charge is always Rs 25 on sell
      const net = rawVal - broker - sebon - dp;

      setBrokerCommission(broker);
      setSebonFee(sebon);
      setDpCharge(dp);
      setNetAmount(net);
      setUnitCost(0);

      // Profit/Loss calculation if purchase price is provided
      const basePrice = Number(waccBase) || 0;
      if (basePrice > 0) {
        const totalCost = basePrice * q;
        const rawProfit = net - totalCost;
        const tax = rawProfit > 0 ? rawProfit * (cgtRate / 100) : 0;
        
        setProfit(rawProfit);
        setCgtAmount(tax);
        setNetProfit(rawProfit - tax);
      } else {
        setProfit(null);
        setCgtAmount(0);
        setNetProfit(0);
      }
    }
  }, [txType, purchaseType, qty, price, waccBase, cgtRate]);

  const fmt = (val: number) => "Rs " + parseFloat(val.toFixed(2)).toLocaleString("en-NP");

  return (
    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-5 sm:p-6 w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Calculator size={18} className="text-emerald-400" />
          <h3 className="font-black text-white text-base sm:text-lg">NEPSE WACC & Broker Fee</h3>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setTxType("buy")}
            className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase transition-all ${
              txType === "buy" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setTxType("sell")}
            className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase transition-all ${
              txType === "sell" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 flex-1">
        {/* Form Controls */}
        <div className="space-y-4">
          {/* Purchase Type */}
          {txType === "buy" && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Purchase Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPurchaseType("secondary")}
                  className={`py-2 text-xs font-bold border rounded-xl transition ${
                    purchaseType === "secondary"
                      ? "bg-violet-600/10 border-violet-500 text-violet-400"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Secondary Market
                </button>
                <button
                  type="button"
                  onClick={() => setPurchaseType("ipo")}
                  className={`py-2 text-xs font-bold border rounded-xl transition ${
                    purchaseType === "ipo"
                      ? "bg-violet-600/10 border-violet-500 text-violet-400"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  IPO / FPO
                </button>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Quantity (Kitta)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 100"
              value={qty}
              onChange={(e) => setQty(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
              {txType === "buy" ? "Purchase Price (Rs)" : "Selling Price (Rs)"}
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 250"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
            />
          </div>

          {/* CGT & WACC input for Sell */}
          {txType === "sell" && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Purchase Cost / WACC (Rs)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 180"
                  value={waccBase}
                  onChange={(e) => setWaccBase(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Capital Gain Tax (CGT)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCgtRate(5.0)}
                    className={`py-2 text-xs font-bold border rounded-xl transition ${
                      cgtRate === 5.0
                        ? "bg-rose-500/10 border-rose-500 text-rose-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    5% (Long Term)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCgtRate(7.5)}
                    className={`py-2 text-xs font-bold border rounded-xl transition ${
                      cgtRate === 7.5
                        ? "bg-rose-500/10 border-rose-500 text-rose-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    7.5% (Short Term)
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Outputs Panel */}
        <div className="bg-[#050810] border border-slate-800 rounded-2xl p-4 flex flex-col justify-center space-y-4.5">
          <div className="text-center pb-3 border-b border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              {txType === "buy" ? "Total Payable Amount" : "Net Receivable Amount"}
            </div>
            <div className={`text-2xl font-black mt-1 ${txType === "buy" ? "text-emerald-400" : "text-rose-400"}`}>
              {fmt(netAmount)}
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Share Amount</span>
              <span className="font-bold text-white">{fmt(shareValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Broker Commission</span>
              <span className="font-bold text-white">{fmt(brokerCommission)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SEBON Fee (0.015%)</span>
              <span className="font-bold text-white">{fmt(sebonFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">DP Charge</span>
              <span className="font-bold text-white">{fmt(dpCharge)}</span>
            </div>

            {txType === "buy" && unitCost > 0 && (
              <div className="flex justify-between border-t border-slate-800/85 pt-2.5">
                <span className="text-emerald-400 font-bold">Effective WACC / Share</span>
                <span className="font-black text-emerald-400">{fmt(unitCost)}</span>
              </div>
            )}

            {txType === "sell" && profit !== null && (
              <div className="border-t border-slate-800/85 pt-2.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Profit/Loss</span>
                  <span className={`font-bold ${profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {fmt(profit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CGT ({cgtRate}%)</span>
                  <span className="font-bold text-white">{fmt(cgtAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-850 pt-2 font-bold text-sm">
                  <span className={netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}>Net Profit/Loss</span>
                  <span className={netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}>{fmt(netProfit)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 mt-4 text-center">
        * Calculation based on SEBON broker transaction commission slab rates updated for 2082/2083.
      </p>
    </div>
  );
}
