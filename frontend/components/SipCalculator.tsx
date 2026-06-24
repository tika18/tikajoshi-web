"use client";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calculator } from "lucide-react";

export default function SipCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  const calculateSip = () => {
    const monthlyRate = expectedReturnRate / 12 / 100;
    const months = timePeriod * 12;
    const totalInvestment = monthlyInvestment * months;
    
    // Future Value formula for SIP
    const futureValue =
      monthlyInvestment *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);

    const wealthGained = futureValue - totalInvestment;

    return {
      totalInvestment: Math.round(totalInvestment),
      wealthGained: Math.round(wealthGained),
      futureValue: Math.round(futureValue),
    };
  };

  const results = calculateSip();

  const chartData = useMemo(() => {
    const data = [];
    const monthlyRate = expectedReturnRate / 12 / 100;
    for (let i = 1; i <= timePeriod; i++) {
      const months = i * 12;
      const invested = monthlyInvestment * months;
      const fv =
        monthlyInvestment *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate);
      data.push({
        year: `Year ${i}`,
        Invested: Math.round(invested),
        Returns: Math.round(fv),
      });
    }
    return data;
  }, [monthlyInvestment, expectedReturnRate, timePeriod]);

  const fmt = (n: number) => "Rs " + n.toLocaleString("en-NP");

  return (
    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-5 sm:p-6 w-full h-full flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <Calculator size={18} className="text-emerald-400" />
        <h3 className="font-black text-white text-base sm:text-lg">SIP Calculator</h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Input Section */}
        <div className="space-y-4 lg:w-1/2 flex flex-col justify-center">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Monthly Investment</span>
              <span className="text-white font-bold">{fmt(monthlyInvestment)}</span>
            </div>
            <input
              type="range"
              min={500}
              max={100000}
              step={500}
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(+e.target.value)}
              className="w-full accent-emerald-500 h-1.5 rounded-full"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>500</span>
              <span>1L</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Expected Return Rate</span>
              <span className="text-white font-bold">{expectedReturnRate}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={0.5}
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(+e.target.value)}
              className="w-full accent-cyan-500 h-1.5 rounded-full"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Time Period</span>
              <span className="text-white font-bold">{timePeriod} years</span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={timePeriod}
              onChange={(e) => setTimePeriod(+e.target.value)}
              className="w-full accent-violet-500 h-1.5 rounded-full"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>1 yr</span>
              <span>40 yr</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/[0.06]">
              <div className="text-sm sm:text-base font-black text-slate-300">
                {fmt(results.totalInvestment)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 leading-tight">Total Invested</div>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/[0.06]">
              <div className="text-sm sm:text-base font-black text-emerald-400">
                {fmt(results.wealthGained)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 leading-tight">Wealth Gained</div>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-3 text-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <div className="text-sm sm:text-base font-black text-white">
                {fmt(results.futureValue)}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 leading-tight font-bold">Future Value</div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="lg:w-1/2 h-64 lg:h-auto min-h-[250px] w-full bg-slate-900/30 rounded-xl p-2 sm:p-4 border border-slate-700/30">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={10} tickMargin={10} />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickFormatter={(val) => `Rs ${val > 1000000 ? (val / 1000000).toFixed(1) + 'M' : val > 1000 ? (val / 1000).toFixed(0) + 'K' : val}`}
                width={50}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                labelStyle={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}
                formatter={(value: number) => ["Rs " + value.toLocaleString("en-NP"), undefined]}
              />
              <Legend wrapperStyle={{ fontSize: "11px", marginTop: "10px" }} />
              <Line type="monotone" dataKey="Invested" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Returns" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
