"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Calculator, PieChart, Banknote, Percent } from "lucide-react";

export default function EMICalculator() {
  // Inputs
  const [totalPrice, setTotalPrice] = useState<number>(3500000); // Ex: 35 Lakh Car
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(50); // 50% Down
  const [rate, setRate] = useState<number>(12); // 12% Interest
  const [years, setYears] = useState<number>(5); // 5 Years

  // Calculations
  const downPaymentAmount = (totalPrice * downPaymentPercent) / 100;
  const loanAmount = totalPrice - downPaymentAmount;
  
  const monthlyRate = rate / 12 / 100;
  const months = years * 12;
  
  // EMI Formula
  const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayable = emi * months;
  const totalInterest = totalPayable - loanAmount;

  // Currency Formatter
  const fmt = (num: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(num);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <Navbar />
      <div className="max-w-5xl mx-auto py-24 px-6">
        <h1 className="text-3xl font-bold text-center text-white mb-8 flex items-center justify-center gap-2">
            <Calculator className="text-emerald-500"/> Advanced EMI Calculator
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-[#1e293b]/50 p-8 rounded-3xl border border-slate-700 space-y-6">
                
                {/* 1. Total Price */}
                <div>
                    <label className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                        Total Price (Vehicle/Home)
                        <span className="text-emerald-400">{fmt(totalPrice)}</span>
                    </label>
                    <input type="range" min="100000" max="20000000" step="50000" value={totalPrice} onChange={e => setTotalPrice(Number(e.target.value))} className="w-full accent-emerald-500 mb-2"/>
                    <div className="flex items-center bg-slate-800 rounded-lg px-3 border border-slate-600">
                        <Banknote size={16} className="text-slate-500"/>
                        <input type="number" value={totalPrice} onChange={e => setTotalPrice(Number(e.target.value))} className="w-full bg-transparent p-2 outline-none text-white font-mono"/>
                    </div>
                </div>

                {/* 2. Down Payment % */}
                <div>
                    <label className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                        Down Payment ({downPaymentPercent}%)
                        <span className="text-blue-400">{fmt(downPaymentAmount)}</span>
                    </label>
                    <input type="range" min="0" max="90" step="5" value={downPaymentPercent} onChange={e => setDownPaymentPercent(Number(e.target.value))} className="w-full accent-blue-500 mb-2"/>
                </div>

                {/* 3. Interest Rate */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-slate-400 mb-2">Interest (%)</label>
                        <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white outline-none"/>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-slate-400 mb-2">Years</label>
                        <input type="number" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white outline-none"/>
                    </div>
                </div>
            </div>

            {/* Result Section */}
            <div className="space-y-4">
                {/* EMI Box */}
                <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/30 p-8 rounded-3xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <p className="text-slate-400 font-bold mb-1 uppercase text-xs tracking-widest">Monthly EMI</p>
                    <p className="text-5xl font-black text-white">{fmt(emi)}</p>
                </div>

                {/* Breakdown */}
                <div className="bg-[#1e293b]/50 p-6 rounded-3xl border border-slate-700">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><PieChart size={16}/> Payment Breakdown</h3>
                    
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Total Price</span>
                            <span className="font-bold text-white">{fmt(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-blue-400">
                            <span>- Down Payment ({downPaymentPercent}%)</span>
                            <span className="font-bold"> {fmt(downPaymentAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-700 pt-2 text-emerald-400">
                            <span>= Loan Amount</span>
                            <span className="font-bold">{fmt(loanAmount)}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span className="text-slate-400">Total Interest to Pay</span>
                            <span className="font-bold text-yellow-500">{fmt(totalInterest)}</span>
                        </div>
                         <div className="flex justify-between pt-2 font-bold text-white">
                            <span className="text-slate-400">Total Cost (Price + Interest)</span>
                            <span>{fmt(totalPrice + totalInterest)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}