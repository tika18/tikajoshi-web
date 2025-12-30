"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { RefreshCcw, ArrowRightLeft, TrendingUp, Calculator } from "lucide-react";

export default function ForexPage() {
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Converter State
  const [amount, setAmount] = useState<number>(1);
  const [fromCurr, setFromCurr] = useState("USD");
  const [toCurr, setToCurr] = useState("NPR");
  const [result, setResult] = useState<number | null>(null);

  // Fetch API
  const fetchRates = async () => {
    setLoading(true);
    try {
      // Base is USD
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();
      setRates(data.rates);
    } catch (error) {
      console.error("Error fetching rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, []);

  // Conversion Logic
  useEffect(() => {
    if (rates) {
      const fromRate = rates[fromCurr];
      const toRate = rates[toCurr];
      const res = (amount / fromRate) * toRate;
      setResult(parseFloat(res.toFixed(2)));
    }
  }, [amount, fromCurr, toCurr, rates]);

  // Handle Swap
  const handleSwap = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  // Helper to get rate in NPR (e.g. 1 EUR = X NPR)
  const getNprRate = (curr: string) => {
    if(!rates) return 0;
    const usdToNpr = rates["NPR"];
    const usdToTarget = rates[curr];
    // Formula: 1 Unit = (1 / TargetRate) * NPRRate
    return ((1 / usdToTarget) * usdToNpr).toFixed(2);
  }

  const currencyList = ["NPR", "USD", "INR", "EUR", "GBP", "AUD", "CAD", "JPY", "QAR", "SAR", "MYR", "KRW", "AED"];
  const flags: any = { NPR: "🇳🇵", USD: "🇺🇸", INR: "🇮🇳", EUR: "🇪🇺", GBP: "🇬🇧", AUD: "🇦🇺", CAD: "🇨🇦", JPY: "🇯🇵", QAR: "🇶🇦", SAR: "🇸🇦", MYR: "🇲🇾", KRW: "🇰🇷", AED: "🇦🇪" };

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      <div className="pt-36 px-4 md:px-6 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Forex & Converter 💱</h1>
                <p className="text-slate-400 text-sm">Real-time exchange rates & calculation.</p>
            </div>
            <button onClick={fetchRates} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition text-sm font-bold">
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""}/> Refresh Rates
            </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            
            {/* 1. CURRENCY CONVERTER */}
            <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-3xl shadow-xl h-fit">
                <div className="flex items-center gap-2 mb-6 text-emerald-400 font-bold">
                    <Calculator size={20}/> <span>Currency Converter</span>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-500 uppercase font-bold ml-1">Amount</label>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xl font-bold focus:border-emerald-500 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 uppercase font-bold ml-1">From</label>
                            <select 
                                value={fromCurr} 
                                onChange={(e) => setFromCurr(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 font-bold"
                            >
                                {currencyList.map(c => <option key={c} value={c}>{flags[c]} {c}</option>)}
                            </select>
                        </div>
                        
                        <button onClick={handleSwap} className="bg-slate-800 p-3 rounded-full mt-5 hover:bg-slate-700 transition">
                             <ArrowRightLeft className="text-emerald-400" size={18}/>
                        </button>

                        <div className="flex-1">
                            <label className="text-xs text-slate-500 uppercase font-bold ml-1">To</label>
                            <select 
                                value={toCurr} 
                                onChange={(e) => setToCurr(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 font-bold"
                            >
                                {currencyList.map(c => <option key={c} value={c}>{flags[c]} {c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl text-center mt-4">
                        <p className="text-slate-400 text-sm mb-1">{amount} {fromCurr} =</p>
                        <p className="text-3xl font-black text-emerald-400">{result?.toLocaleString()} <span className="text-lg">{toCurr}</span></p>
                    </div>
                </div>
            </div>

            {/* 2. LIVE RATES TABLE (Relative to NPR) */}
            <div className="bg-[#1e293b] border border-slate-700 rounded-3xl overflow-hidden">
                <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-slate-300">Market Rates (vs NPR)</span>
                    <TrendingUp size={16} className="text-green-500"/>
                </div>
                
                <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-10 text-center text-slate-500">Loading live rates...</div>
                    ) : (
                        currencyList.filter(c => c !== 'NPR').map((curr) => (
                            <div key={curr} className="flex justify-between items-center p-4 border-b border-slate-800 hover:bg-slate-800/50 transition">
                                <div className="flex items-center gap-3 font-bold">
                                    <span className="text-2xl">{flags[curr]}</span> 
                                    <div>
                                        <p>{curr}</p>
                                        <p className="text-[10px] text-slate-500">Foreign Unit</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-lg text-emerald-400">Rs. {getNprRate(curr)}</p>
                                    <p className="text-[10px] text-slate-500">Per 1 {curr}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}