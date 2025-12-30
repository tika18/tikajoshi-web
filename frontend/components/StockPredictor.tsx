"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Activity, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

type StockSignal = {
  symbol: string;
  price: number;
  rsi: number;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  prediction: "STRONG BUY" | "BUY" | "HOLD" | "SELL";
  confidence: number;
};

// Popular NEPSE Stocks for Suggestion
const nepseStocks = ["NABIL", "NICA", "HIDCL", "SHIVM", "UPPER", "API", "GBIME", "NTC", "CIT", "HDL", "NLIC", "ALICL"];

const StockPredictor = () => {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StockSignal | null>(null);

  const analyzeStock = () => {
    if (!symbol) return;
    setLoading(true);
    setResult(null);

    // AI SIMULATION
    setTimeout(() => {
      // Generate somewhat realistic data
      const mockPrice = Math.floor(Math.random() * (2500 - 180) + 180);
      const mockRSI = Math.floor(Math.random() * (85 - 25) + 25); 
      
      let prediction: StockSignal["prediction"] = "HOLD";
      let sentiment: StockSignal["sentiment"] = "Neutral";
      
      // Technical Logic
      if (mockRSI < 32) {
        prediction = "STRONG BUY";
        sentiment = "Bullish";
      } else if (mockRSI > 68) {
        prediction = "SELL";
        sentiment = "Bearish";
      } else if (mockRSI >= 32 && mockRSI <= 45) {
        prediction = "BUY";
        sentiment = "Bullish";
      }

      setResult({
        symbol: symbol.toUpperCase(),
        price: mockPrice,
        rsi: mockRSI,
        sentiment: sentiment,
        prediction: prediction,
        confidence: Math.floor(Math.random() * (96 - 72) + 72), 
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-1">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-0"></div>

        <div className="relative z-10 text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold mb-4 border border-blue-500/20">
            <Activity size={16} /> Beta AI Algorithm
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2">NEPSE Predictor AI</h2>
          <p className="text-slate-400">Enter a symbol (e.g., NABIL) to see AI technical analysis.</p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-lg mx-auto mb-10 z-20">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                    list="stock-list"
                    type="text"
                    placeholder="Search Symbol (e.g. HIDCL)..."
                    className="w-full pl-6 pr-4 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-blue-500 outline-none transition-all uppercase font-bold tracking-wider shadow-inner"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && analyzeStock()}
                    />
                    <datalist id="stock-list">
                        {nepseStocks.map(s => <option key={s} value={s} />)}
                    </datalist>
                </div>
                <button
                    onClick={analyzeStock}
                    disabled={loading || !symbol}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-8 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                    {loading ? "..." : "GO"}
                </button>
            </div>
        </div>

        {/* Loading */}
        {loading && (
            <div className="text-center py-6">
                 <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
                    <div className="w-1/2 h-full bg-blue-500 animate-slide"></div>
                 </div>
                 <p className="text-xs text-blue-400 mt-2 font-mono">CALCULATING RSI & MACD...</p>
            </div>
        )}

        {/* Result Card */}
        {result && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 border-b border-slate-700/50 pb-6">
              <div className="text-center md:text-left">
                <h3 className="text-5xl font-black text-white tracking-tighter">{result.symbol}</h3>
                <p className="text-slate-400 font-mono mt-1">LTP: Rs. {result.price}</p>
              </div>
              
              <div className={`px-8 py-4 rounded-2xl text-center ${
                  result.prediction === 'SELL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                  result.prediction === 'HOLD' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                <p className="text-xs font-bold opacity-80 mb-1 tracking-widest">AI SIGNAL</p>
                <p className="text-3xl font-black">{result.prediction}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-800">
                <p className="text-xs text-slate-500 mb-2 font-bold uppercase">RSI (14)</p>
                <p className={`text-2xl font-bold ${result.rsi > 70 ? 'text-red-400' : result.rsi < 30 ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {result.rsi}
                </p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-800">
                <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Sentiment</p>
                <div className="flex justify-center">
                    {result.sentiment === 'Bullish' ? <TrendingUp className="text-emerald-500"/> : <TrendingDown className="text-red-500"/>}
                </div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-800">
                <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Confidence</p>
                <p className="text-2xl font-bold text-yellow-400">{result.confidence}%</p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2 justify-center text-[10px] text-slate-500 uppercase tracking-widest">
                <AlertCircle size={12} />
                <span>Not Financial Advice • Educational Purpose Only</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StockPredictor;