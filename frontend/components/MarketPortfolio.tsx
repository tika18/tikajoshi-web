"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Edit3,
  PieChart as PieIcon,
  DollarSign,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  X,
  CheckCircle2,
  RefreshCw,
  Info,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export interface PortfolioItem {
  id: string;
  symbol: string;
  name?: string;
  sector?: string;
  units: number;
  buyPrice: number; // WACC
  buyDate?: string;
}

interface MarketPortfolioProps {
  liveStocks?: Array<{
    sym: string;
    ltp: number;
    chg: number;
    pChg: number;
    up?: boolean | null;
  }>;
}

const SECTOR_COLORS: Record<string, string> = {
  "Commercial Bank": "#10b981", // Emerald
  Hydropower: "#06b6d4", // Cyan
  Manufacturing: "#8b5cf6", // Violet
  "Development Bank": "#f59e0b", // Amber
  "Life Insurance": "#ec4899", // Pink
  "Microfinance": "#6366f1", // Indigo
  Finance: "#3b82f6", // Blue
  Others: "#64748b", // Slate
};

const COLOR_PALETTE = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#3b82f6", "#14b8a6", "#a855f7"];

// Known sector mappings
const SECTOR_MAP: Record<string, string> = {
  NABIL: "Commercial Bank", NICA: "Commercial Bank", GBIME: "Commercial Bank",
  ADBL: "Commercial Bank", SBI: "Commercial Bank", HBL: "Commercial Bank",
  NBL: "Commercial Bank", EBL: "Commercial Bank", MBL: "Commercial Bank",
  SANIMA: "Commercial Bank", KBL: "Commercial Bank", PRVU: "Commercial Bank",
  SHIVM: "Manufacturing", HDL: "Manufacturing", UNL: "Manufacturing",
  UPPER: "Hydropower", CHCL: "Hydropower", AKPL: "Hydropower", API: "Hydropower",
  CHILIME: "Hydropower", BPCL: "Hydropower", HDHPC: "Hydropower", SHPC: "Hydropower",
  NLIC: "Life Insurance", ALICL: "Life Insurance", LICN: "Life Insurance",
  CIT: "Others", NTC: "Others", NRIC: "Others", HRL: "Others",
  KSBBL: "Development Bank", GBBL: "Development Bank", EDBL: "Development Bank",
  ACLBSL: "Microfinance", CBBL: "Microfinance", DDBL: "Microfinance",
};

export default function MarketPortfolio({ liveStocks = [] }: MarketPortfolioProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formSymbol, setFormSymbol] = useState("");
  const [formUnits, setFormUnits] = useState("");
  const [formBuyPrice, setFormBuyPrice] = useState("");
  const [formBuyDate, setFormBuyDate] = useState(new Date().toISOString().split("T")[0]);

  // Sync state
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "offline">("synced");

  // Mount check for recharts hydration
  useEffect(() => {
    setIsMounted(true);
    loadPortfolio();
  }, []);

  // 1. Load Portfolio from API with LocalStorage fallback
  const loadPortfolio = async () => {
    try {
      const res = await fetch("/api/portfolio");
      const json = await res.json();
      if (json.success && Array.isArray(json.portfolio)) {
        setItems(json.portfolio);
        localStorage.setItem("nepse_user_portfolio", JSON.stringify(json.portfolio));
        return;
      }
    } catch (e) {
      console.warn("API portfolio load error, falling back to LocalStorage:", e);
    }

    // LocalStorage Fallback
    const localData = localStorage.getItem("nepse_user_portfolio");
    if (localData) {
      try {
        setItems(JSON.parse(localData));
      } catch (err) {}
    } else {
      // Default Initial Sample Portfolio
      const sample: PortfolioItem[] = [
        { id: "p1", symbol: "NABIL", units: 250, buyPrice: 520, sector: "Commercial Bank", buyDate: "2025-10-15" },
        { id: "p2", symbol: "SHIVM", units: 150, buyPrice: 490, sector: "Manufacturing", buyDate: "2025-11-20" },
        { id: "p3", symbol: "UPPER", units: 400, buyPrice: 210, sector: "Hydropower", buyDate: "2026-01-10" },
        { id: "p4", symbol: "NICA", units: 200, buyPrice: 450, sector: "Commercial Bank", buyDate: "2026-02-01" },
      ];
      setItems(sample);
    }
  };

  // 2. Save Portfolio to API & LocalStorage
  const savePortfolio = async (newItems: PortfolioItem[]) => {
    setItems(newItems);
    localStorage.setItem("nepse_user_portfolio", JSON.stringify(newItems));
    setSyncStatus("saving");

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio: newItems }),
      });
      if (res.ok) {
        setSyncStatus("synced");
      } else {
        setSyncStatus("offline");
      }
    } catch (e) {
      setSyncStatus("offline");
    }
  };

  // Build live lookup map
  const stockMap = useMemo(() => {
    const map: Record<string, { ltp: number; chg: number; pChg: number }> = {};
    liveStocks.forEach((s) => {
      map[s.sym.toUpperCase()] = { ltp: s.ltp, chg: s.chg, pChg: s.pChg };
    });
    return map;
  }, [liveStocks]);

  // Compute calculated holdings
  const calculatedHoldings = useMemo(() => {
    return items.map((item) => {
      const sym = item.symbol.toUpperCase();
      const liveData = stockMap[sym];
      const ltp = liveData?.ltp ?? item.buyPrice;
      const chg = liveData?.chg ?? 0;
      const pChg = liveData?.pChg ?? 0;

      const totalCost = item.units * item.buyPrice;
      const currentValue = item.units * ltp;
      const profitLoss = currentValue - totalCost;
      const profitLossPct = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
      const dayGainLoss = item.units * chg;

      const sector = item.sector || SECTOR_MAP[sym] || "Others";

      return {
        ...item,
        symbol: sym,
        sector,
        ltp,
        chg,
        pChg,
        totalCost,
        currentValue,
        profitLoss,
        profitLossPct,
        dayGainLoss,
      };
    });
  }, [items, stockMap]);

  // Overall Portfolio Aggregates
  const totals = useMemo(() => {
    let totalCost = 0;
    let currentValue = 0;
    let dayGainLoss = 0;

    calculatedHoldings.forEach((h) => {
      totalCost += h.totalCost;
      currentValue += h.currentValue;
      dayGainLoss += h.dayGainLoss;
    });

    const totalPL = currentValue - totalCost;
    const totalPLPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

    return {
      totalCost,
      currentValue,
      totalPL,
      totalPLPct,
      dayGainLoss,
      stockCount: items.length,
    };
  }, [calculatedHoldings, items]);

  // Sector Diversification Data for Recharts
  const sectorChartData = useMemo(() => {
    const sectors: Record<string, number> = {};
    calculatedHoldings.forEach((h) => {
      sectors[h.sector] = (sectors[h.sector] || 0) + h.currentValue;
    });

    return Object.entries(sectors).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [calculatedHoldings]);

  // Add / Edit Transaction Handlers
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormSymbol("");
    setFormUnits("");
    setFormBuyPrice("");
    setFormBuyDate(new Date().toISOString().split("T")[0]);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: PortfolioItem) => {
    setEditingId(item.id);
    setFormSymbol(item.symbol);
    setFormUnits(String(item.units));
    setFormBuyPrice(String(item.buyPrice));
    setFormBuyDate(item.buyDate || new Date().toISOString().split("T")[0]);
    setShowAddModal(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = formSymbol.trim().toUpperCase();
    const units = parseInt(formUnits, 10);
    const buyPrice = parseFloat(formBuyPrice);

    if (!sym || isNaN(units) || units <= 0 || isNaN(buyPrice) || buyPrice <= 0) {
      alert("Please enter a valid symbol, positive units, and buy price (WACC).");
      return;
    }

    const sector = SECTOR_MAP[sym] || "Others";

    if (editingId) {
      // Update existing
      const updated = items.map((it) =>
        it.id === editingId
          ? { ...it, symbol: sym, units, buyPrice, sector, buyDate: formBuyDate }
          : it
      );
      savePortfolio(updated);
    } else {
      // Create new
      const newItem: PortfolioItem = {
        id: `p-${Date.now()}`,
        symbol: sym,
        units,
        buyPrice,
        sector,
        buyDate: formBuyDate,
      };
      savePortfolio([newItem, ...items]);
    }

    setShowAddModal(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to remove this stock from your portfolio?")) {
      const filtered = items.filter((it) => it.id !== id);
      savePortfolio(filtered);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── PORTFOLIO OVERVIEW HEADER WIDGET ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#0c1926] to-[#07111a] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={14} className="text-emerald-400" /> Total Net Worth
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
              {totals.stockCount} Stocks
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            NPR {totals.currentValue.toLocaleString("en-NP", { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>Total Invested:</span>
            <span className="font-semibold text-slate-200">
              NPR {totals.totalCost.toLocaleString("en-NP", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Overall Profit / Loss */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-5 shadow-lg ${
            totals.totalPL >= 0
              ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-[#0a1816] to-[#061214] shadow-emerald-500/5"
              : "border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-[#180a0f] to-[#120609] shadow-rose-500/5"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className={totals.totalPL >= 0 ? "text-emerald-400" : "text-rose-400"} /> Total P/L (WACC)
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                totals.totalPL >= 0
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}
            >
              {totals.totalPL >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {totals.totalPLPct >= 0 ? "+" : ""}
              {totals.totalPLPct.toFixed(2)}%
            </span>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              totals.totalPL >= 0 ? "text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]" : "text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]"
            }`}
          >
            {totals.totalPL >= 0 ? "+" : ""}NPR {totals.totalPL.toLocaleString("en-NP", { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Overall Unrealized Gain / Loss</div>
        </div>

        {/* Today's Gain / Loss */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a111a] p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" /> Today&apos;s Gain/Loss
            </span>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              totals.dayGainLoss >= 0 ? "text-cyan-400" : "text-amber-400"
            }`}
          >
            {totals.dayGainLoss >= 0 ? "+" : ""}NPR {totals.dayGainLoss.toLocaleString("en-NP", { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Based on today&apos;s live market prices</div>
        </div>

        {/* Quick Add Action Card */}
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-5 flex flex-col justify-between hover:bg-white/[0.04] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Portfolio Sync</span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              {syncStatus === "synced" && <CheckCircle2 size={12} className="text-emerald-400" />}
              {syncStatus === "saving" && <RefreshCw size={12} className="animate-spin text-cyan-400" />}
              {syncStatus === "synced" ? "Saved to Cloud" : "Local Sync Active"}
            </span>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" /> Add New Stock
          </button>
        </div>
      </div>

      {/* ── HOLDINGS TABLE & DIVERSIFICATION CHART ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0c1522] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-emerald-400" />
              <h3 className="font-black text-white text-lg">My Stock Holdings</h3>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <Plus size={14} /> Add Transaction
            </button>
          </div>

          {calculatedHoldings.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl">
              <Briefcase size={32} className="mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-400">No stocks in your portfolio yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Add your stock transactions (WACC & Units) to start tracking daily P/L.</p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus size={14} /> Add First Stock
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Symbol</th>
                    <th className="py-3 px-3">Units</th>
                    <th className="py-3 px-3">WACC</th>
                    <th className="py-3 px-3">LTP</th>
                    <th className="py-3 px-3">Current Value</th>
                    <th className="py-3 px-3 text-right">P/L (NPR & %)</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {calculatedHoldings.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-black text-white">
                        <div className="flex flex-col">
                          <span>{item.symbol}</span>
                          <span className="text-[9px] text-slate-500 font-normal">{item.sector}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-bold">{item.units.toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-400">Rs. {item.buyPrice.toLocaleString()}</td>
                      <td className="py-3 px-3 font-bold text-white">
                        Rs. {item.ltp.toLocaleString()}
                        {item.chg !== 0 && (
                          <span className={`text-[10px] ml-1 ${item.chg > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            ({item.chg > 0 ? "+" : ""}{item.pChg.toFixed(1)}%)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-200">
                        Rs. {item.currentValue.toLocaleString("en-NP", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3 px-3 text-right font-black">
                        <div className={`flex flex-col items-end ${item.profitLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          <span>{item.profitLoss >= 0 ? "+" : ""}Rs. {item.profitLoss.toLocaleString("en-NP", { maximumFractionDigits: 0 })}</span>
                          <span className="text-[10px] font-bold">
                            ({item.profitLossPct >= 0 ? "+" : ""}{item.profitLossPct.toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
                            title="Edit Transaction"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete Stock"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sector Diversification Chart (1 Col) */}
        <div className="bg-[#0c1522] border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieIcon size={18} className="text-cyan-400" />
              <h3 className="font-black text-white text-base">Sector Allocation</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Portfolio diversification breakdown by industry sector:
            </p>

            {isMounted && sectorChartData.length > 0 ? (
              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sectorChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={SECTOR_COLORS[entry.name] || COLOR_PALETTE[index % COLOR_PALETTE.length]}
                          stroke="rgba(0,0,0,0.5)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, "Value"]}
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px", color: "#fff" }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                      formatter={(value) => <span className="text-slate-300 font-semibold">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No sector data available
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 flex items-center gap-2 text-[10px] text-slate-500">
            <Info size={12} className="text-cyan-400 shrink-0" />
            <span>Prices are updated automatically via NEPSE live tape feeds.</span>
          </div>
        </div>
      </div>

      {/* ── ADD / EDIT TRANSACTION MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#0d1826] border border-slate-700 rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingId ? "Edit Stock Holding" : "Add Stock Transaction"}
                  </h3>
                  <p className="text-xs text-slate-400">Enter stock symbol, total units, and WACC buy price.</p>
                </div>
              </div>

              <form onSubmit={handleSaveTransaction} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Stock Symbol (e.g. NABIL, SHIVM)
                  </label>
                  <input
                    type="text"
                    required
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value.toUpperCase())}
                    placeholder="NABIL"
                    className="w-full bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white font-bold uppercase tracking-wider outline-none transition"
                  />
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {["NABIL", "SHIVM", "UPPER", "NICA", "GBIME"].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => setFormSymbol(sym)}
                        className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 font-bold transition"
                      >
                        +{sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Quantity (Units)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formUnits}
                      onChange={(e) => setFormUnits(e.target.value)}
                      placeholder="100"
                      className="w-full bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Buy Price / WACC (Rs)
                    </label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      min="1"
                      value={formBuyPrice}
                      onChange={(e) => setFormBuyPrice(e.target.value)}
                      placeholder="450.0"
                      className="w-full bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Buy Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formBuyDate}
                    onChange={(e) => setFormBuyDate(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white font-medium outline-none transition"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-emerald-600/20"
                  >
                    {editingId ? "Update Holding" : "Save Holding"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
