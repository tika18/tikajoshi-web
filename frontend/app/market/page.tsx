"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import StockPredictor from "@/components/StockPredictor";
import {
  TrendingUp, TrendingDown, ExternalLink, Maximize2, X,
  Star, RefreshCw, Calculator, DollarSign, BarChart2,
  ArrowUpRight, ArrowDownRight, Info, Zap, Globe,
  Loader2, WifiOff, Clock, Calendar
} from "lucide-react";
import NepaliDate from "nepali-date-converter";

/* ─────────────── TYPES ─────────────── */
interface StockRow {
  sym: string;
  name: string;
  ltp: number;
  chg: number;
  vol: string;
  turnover?: string;
  prevClose?: number;
}

interface MarketStats {
  nepseIndex: { value: string; change: string; pct: string; up: boolean };
  sensitiveIndex: { value: string; change: string; pct: string; up: boolean };
  floatIndex: { value: string; change: string; pct: string; up: boolean };
  turnover: string;
  totalTrades: string;
  totalCompanies: string;
}

interface SectorRow {
  sector: string;
  chg: number;
  value?: number;
  pointChg?: number;
  turnover?: string;
}

interface NepseData {
  success: boolean;
  live: boolean;
  timestamp: string;
  marketStats: MarketStats;
  stocks: StockRow[];
  allStocks: StockRow[];
  sectors: SectorRow[];
  topGainers: StockRow[];
  topLosers: StockRow[];
}

/* ─────────────── STATIC DATA ─────────────── */
const FOREX_PAIRS = [
  { code: "USD", name: "US Dollar",     flag: "🇺🇸" },
  { code: "EUR", name: "Euro",          flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "INR", name: "Indian Rupee",  flag: "🇮🇳" },
  { code: "AED", name: "UAE Dirham",    flag: "🇦🇪" },
  { code: "QAR", name: "Qatar Riyal",   flag: "🇶🇦" },
  { code: "AUD", name: "Australian $",  flag: "🇦🇺" },
  { code: "CNY", name: "Chinese Yuan",  flag: "🇨🇳" },
];

const QUICK_LINKS = [
  { name: "Market Depth",      link: "https://www.nepalstock.com/market-depth",           color: "border-blue-500/30",   icon: "📊" },
  { name: "Today's Price",     link: "https://www.sharesansar.com/today-share-price",     color: "border-purple-500/30", icon: "💰" },
  { name: "Live Floor Sheet",  link: "https://www.nepalstock.com/floorsheet",             color: "border-orange-500/30", icon: "📋" },
  { name: "Broker List",       link: "https://www.nepalstock.com/broker",                 color: "border-cyan-500/30",   icon: "🏦" },
  { name: "CDSC / DEMAT",      link: "https://cdsc.com.np/",                              color: "border-pink-500/30",   icon: "🔐" },
  { name: "Sharesansar",       link: "https://www.sharesansar.com/",                      color: "border-emerald-500/30",icon: "🌐" },
];

const SEO_KEYWORDS = [
  "NEPSE Live Price", "Nepal Stock Exchange", "Share Market Nepal",
  "IPO Result Check", "Mero Share Nepal", "Forex Rate Nepal",
  "Nepal Share Market 2082", "NEPSE Index Today", "NEPSE Floorsheet",
  "Top Gainers Nepal", "Nepal Market Depth", "CDSC Nepal",
];

const SECTOR_COLORS = [
  "bg-emerald-500", "bg-cyan-500", "bg-violet-500", "bg-orange-500",
  "bg-blue-500", "bg-pink-500", "bg-amber-500", "bg-red-500",
  "bg-lime-500", "bg-indigo-500", "bg-teal-500", "bg-rose-500",
];

/* ─────────────── SKELETON COMPONENT ─────────────── */
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-white/[0.06] rounded-xl animate-pulse ${className}`} />;
}

/* ─────────────── EMI CALCULATOR ─────────────── */
function EmiCalculator() {
  const [loan,   setLoan]   = useState(1000000);
  const [rate,   setRate]   = useState(12);
  const [tenure, setTenure] = useState(5);

  const emi = (() => {
    const r = rate / 12 / 100;
    const n = tenure * 12;
    return r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  })();
  const total   = emi * tenure * 12;
  const interest = total - loan;

  const fmt = (n: number) =>
    "Rs " + Math.round(n).toLocaleString("en-NP");

  return (
    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <Calculator size={18} className="text-violet-400" />
        <h3 className="font-black text-white text-base sm:text-lg">EMI / Loan Calculator</h3>
      </div>

      <div className="space-y-4">
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Loan Amount</span>
            <span className="text-white font-bold">{fmt(loan)}</span>
          </div>
          <input type="range" min={100000} max={10000000} step={50000}
            value={loan} onChange={e => setLoan(+e.target.value)}
            className="w-full accent-violet-500 h-1.5 rounded-full" />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
            <span>1L</span><span>1Cr</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Annual Interest Rate</span>
            <span className="text-white font-bold">{rate}%</span>
          </div>
          <input type="range" min={4} max={24} step={0.5}
            value={rate} onChange={e => setRate(+e.target.value)}
            className="w-full accent-cyan-500 h-1.5 rounded-full" />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
            <span>4%</span><span>24%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Tenure</span>
            <span className="text-white font-bold">{tenure} years</span>
          </div>
          <input type="range" min={1} max={25} step={1}
            value={tenure} onChange={e => setTenure(+e.target.value)}
            className="w-full accent-emerald-500 h-1.5 rounded-full" />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
            <span>1 yr</span><span>25 yr</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Monthly EMI",    val: fmt(emi),      color: "text-violet-400" },
          { label: "Total Interest", val: fmt(interest), color: "text-orange-400" },
          { label: "Total Payable",  val: fmt(total),    color: "text-cyan-400"   },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/[0.06]">
            <div className={`text-sm sm:text-base font-black ${s.color}`}>{s.val}</div>
            <div className="text-[10px] text-slate-500 mt-1 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── FOREX WIDGET ─────────────── */
function ForexWidget() {
  const [rates, setRates]     = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState("");

  useEffect(() => {
    fetch("/api/forex")
      .then(r => r.json())
      .then(res => {
        if (res.success && Array.isArray(res.rates)) {
          const npr: Record<string, number> = {};
          res.rates.forEach((rateInfo: any) => {
            npr[rateInfo.iso3] = parseFloat(rateInfo.sell) / rateInfo.unit;
          });
          // Ensure INR is mapped properly in case API misses it
          if (!npr["INR"]) npr["INR"] = 1.6015;
          
          setRates(npr);
          setUpdated(new Date().toLocaleTimeString("en-NP", { hour: "2-digit", minute: "2-digit" }));
          setLoading(false);
        } else {
          throw new Error("Invalid API response format");
        }
      })
      .catch((err) => {
        console.error("Failed to load real forex, using fallback:", err);
        setRates({ USD: 132.5, EUR: 143.2, GBP: 167.8, INR: 1.60, AED: 36.1, QAR: 36.4, AUD: 87.3, CNY: 18.4 });
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-cyan-400" />
          <h3 className="font-black text-white text-base sm:text-lg">Forex Rate — NPR</h3>
        </div>
        {updated && (
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <RefreshCw size={9} /> {updated}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-9 bg-white/[0.04] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {FOREX_PAIRS.map(p => (
            <div key={p.code}
              className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-xl px-3 py-2.5 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{p.flag}</span>
                <div>
                  <div className="text-xs font-bold text-white">{p.code}</div>
                  <div className="text-[10px] text-slate-500 hidden sm:block">{p.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-black text-emerald-400">
                  Rs {rates[p.code] ? rates[p.code].toFixed(p.code === "INR" ? 3 : 2) : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-3 text-center">
        * Live mid-market rate. For reference only.
      </p>
    </div>
  );
}

/* ─────────────── MARKET STATUS & TIMING ─────────────── */
function MarketStatus() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const int = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(int);
  }, []);

  const npDate = new NepaliDate(now).format("DD MMMM YYYY");
  const timeStr = now.toLocaleTimeString("en-NP", { timeZone: "Asia/Kathmandu" });
  
  const day = now.getDay();
  const h = now.getHours();
  const m = now.getMinutes();
  
  let statusStr = "";
  let isClosed = false;

  // NEPSE logic: Closed Fri (5), Sat (6). Runs 11:00 to 15:00
  if (day === 5 || day === 6) {
    statusStr = `Market Closed (Opens Sunday 11:00 AM)`;
    isClosed = true;
  } else if (h < 11) {
    statusStr = `Market Opens in ${10 - h}h ${60 - m}m`;
    isClosed = true;
  } else if (h >= 15) {
    statusStr = `Market Closed for Today`;
    isClosed = true;
  } else {
    statusStr = `Market is OPEN - Closes in ${14 - h}h ${60 - m}m`;
  }

  return (
    <div className="flex flex-col items-end gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700 p-4 sm:px-6 sm:py-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="text-3xl sm:text-4xl font-black text-white tracking-wider font-mono drop-shadow-md">{timeStr}</div>
      <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-violet-400">
        <Calendar size={16} /> {npDate} BS
      </div>
      <div className={`mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isClosed ? "bg-rose-500/10 border border-rose-500/30 text-rose-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"}`}>
        <Clock size={14} /> {statusStr}
      </div>
    </div>
  );
}

/* ─────────────── STOCK TABLE (LIVE DATA) ─────────────── */
function StockTable({ stocks, loading, onStockClick }: { stocks: StockRow[]; loading: boolean; onStockClick?: (sym: string) => void }) {
  const [tab, setTab] = useState<"all" | "gainers" | "losers">("all");
  const [showCount, setShowCount] = useState(50);
  const [search, setSearch] = useState("");

  const filtered = stocks.filter(s => {
    if (search && !s.sym.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (tab === "gainers") return s.chg > 0;
    if (tab === "losers") return s.chg < 0;
    return true;
  });

  const visible = filtered.slice(0, showCount);

  return (
    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-700/50 gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-violet-400" />
            <h3 className="font-black text-white text-base sm:text-lg whitespace-nowrap">Market Watch</h3>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              placeholder="Search symbol..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowCount(10); }}
              className="w-full bg-slate-800/80 text-white text-xs px-3 py-2 pl-8 rounded-lg outline-none border border-slate-700/50 focus:border-violet-500/50 transition-colors"
            />
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
          <div className="flex gap-1 bg-white/[0.04] rounded-lg p-1">
            {(["all","gainers","losers"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setShowCount(10); }}
                className={`px-3 py-1 rounded-md text-[11px] font-bold capitalize transition-all ${
                  tab === t ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
              <th className="text-left px-5 sm:px-6 py-3 font-semibold">Symbol</th>
              <th className="text-right px-3 py-3 font-semibold">LTP</th>
              <th className="text-right px-3 py-3 font-semibold">Change</th>
              <th className="text-right px-3 py-3 font-semibold hidden sm:table-cell">Prev Close</th>
              <th className="text-right px-5 sm:px-6 py-3 font-semibold hidden md:table-cell">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              // Skeleton rows
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-5 sm:px-6 py-3.5"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-3 py-3.5"><Skeleton className="h-4 w-16 ml-auto" /></td>
                  <td className="px-3 py-3.5"><Skeleton className="h-4 w-14 ml-auto" /></td>
                  <td className="px-3 py-3.5 hidden sm:table-cell"><Skeleton className="h-4 w-16 ml-auto" /></td>
                  <td className="px-5 sm:px-6 py-3.5 hidden md:table-cell"><Skeleton className="h-4 w-14 ml-auto" /></td>
                </tr>
              ))
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-slate-500 py-8 text-sm">
                  No stocks in this category right now.
                </td>
              </tr>
            ) : (
              visible.map((s, i) => (
                <tr key={i} 
                    onClick={() => onStockClick?.(s.sym)}
                    className="hover:bg-white/[0.05] transition-colors group cursor-pointer"
                >
                  <td className="px-5 sm:px-6 py-3.5 group-hover:pl-7 transition-all">
                    <span className="font-black text-white text-sm flex items-center gap-2">
                       {s.sym}
                       <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-violet-400" />
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-right font-bold text-white">
                    {s.ltp?.toFixed(2)}
                  </td>
                  <td className={`px-3 py-3.5 text-right font-bold text-sm ${s.chg >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    <span className="inline-flex items-center gap-0.5 justify-end">
                      {s.chg >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {s.chg >= 0 ? "+" : ""}{s.chg?.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-right text-slate-400 text-xs hidden sm:table-cell">
                    {s.prevClose?.toFixed(2) || "—"}
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-right text-slate-500 text-xs hidden md:table-cell">
                    {s.vol || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Show More / Footer */}
      <div className="px-5 py-3 border-t border-slate-800 flex justify-between items-center">
        {filtered.length > showCount ? (
          <button
            onClick={() => setShowCount(prev => prev + 10)}
            className="text-[11px] text-violet-400 hover:text-violet-300 font-bold transition-colors"
          >
            Show more ({filtered.length - showCount} remaining)
          </button>
        ) : (
          <span className="text-[10px] text-slate-600">
            {stocks.length > 0 ? `${filtered.length} stocks shown` : "* Data from sharesansar.com"}
          </span>
        )}
        <a href="https://www.sharesansar.com/today-share-price" target="_blank"
          className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
          Full Market <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}

/* ─────────────── SECTOR PERFORMANCE (LIVE DATA) ─────────────── */
function SectorChart({ sectors, loading }: { sectors: SectorRow[]; loading: boolean }) {
  const max = sectors.length > 0
    ? Math.max(...sectors.map(s => Math.abs(s.chg)), 0.01)
    : 1;

  return (
    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <Zap size={18} className="text-amber-400" />
        <h3 className="font-black text-white text-base sm:text-lg">Sector Performance</h3>
      </div>
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-32 mb-2" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))
        ) : sectors.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No sector data available</p>
        ) : (
          sectors.map((s, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium truncate mr-2">{s.sector}</span>
                <span className={`font-bold shrink-0 ${s.chg >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {s.chg >= 0 ? "+" : ""}{s.chg?.toFixed(2)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${SECTOR_COLORS[i % SECTOR_COLORS.length]}`}
                  style={{ width: `${(Math.abs(s.chg) / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
export default function MarketPage() {
  const [fullScreen, setFullScreen] = useState(false);
  const [chartSymbol, setChartSymbol] = useState("NEPSE");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<NepseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    try {
      const res = await fetch("/api/nepse");
      const json: NepseData = await res.json();
      setData(json);
      setLastUpdated(
        new Date().toLocaleTimeString("en-NP", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch (err) {
      console.error("Failed to fetch NEPSE data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 3 minutes
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Track native fullscreen events
  useEffect(() => {
    const fn = () => setFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement && chartContainerRef.current) {
      chartContainerRef.current.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
  };

  // Build market stats display items
  const statsItems = data
    ? [
        {
          label: "NEPSE Index",
          value: data.marketStats.nepseIndex.value,
          change: `${data.marketStats.nepseIndex.change} (${data.marketStats.nepseIndex.pct}%)`,
          up: data.marketStats.nepseIndex.up,
        },
        {
          label: "Sensitive Idx",
          value: data.marketStats.sensitiveIndex.value,
          change: `${data.marketStats.sensitiveIndex.change} (${data.marketStats.sensitiveIndex.pct}%)`,
          up: data.marketStats.sensitiveIndex.up,
        },
        {
          label: "Float Index",
          value: data.marketStats.floatIndex.value,
          change: `${data.marketStats.floatIndex.change} (${data.marketStats.floatIndex.pct}%)`,
          up: data.marketStats.floatIndex.up,
        },
        { label: "Turnover",     value: `Rs ${data.marketStats.turnover}`, change: "Today", up: null as boolean | null },
        { label: "Traded Shares", value: data.marketStats.totalTrades,     change: "Shares", up: null as boolean | null },
        { label: "Companies",    value: data.marketStats.totalCompanies,   change: "Traded", up: null as boolean | null },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto py-20 sm:py-24 px-4 sm:px-6">

        {/* ── PAGE HERO ── */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {data?.live ? "Live Market Data" : "Market Data"}
              </div>
              {data?.live && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Real-time from ShareSansar
                </div>
              )}
              {data && !data.live && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-medium">
                  <WifiOff size={10} />
                  Fallback data
                </div>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
              NEPSE Share Market <span className="text-emerald-400">Live</span>
            </h1>
            
            <div className="flex items-center justify-between flex-wrap gap-3 max-w-2xl">
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                Nepal Stock Exchange live index, top stocks, forex rates, EMI calculator — सबै एकै ठाउँमा। Free, real-time, no login required.
              </p>
              
              <div className="flex items-center gap-3 mt-2 sm:mt-0">
                {lastUpdated && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock size={11} /> Updated: {lastUpdated}
                  </span>
                )}
                <button
                  onClick={() => fetchData(true)}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 active:scale-95 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50 disabled:opacity-50"
                >
                  <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>
          </div>
          
          <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
            <MarketStatus />
          </div>
        </div>

        {/* ── MARKET STATS STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#0d1520] border border-slate-700/40 rounded-xl px-4 py-3">
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          ) : (
            statsItems.map((s, i) => (
              <div key={i}
                className="bg-[#0d1520] border border-slate-700/40 rounded-xl px-4 py-3 hover:border-slate-600/60 transition-colors"
              >
                <div className="text-[11px] text-slate-500 mb-1 font-medium">{s.label}</div>
                <div className="text-base font-black text-white leading-none mb-1">{s.value}</div>
                <div className={`text-[11px] font-semibold ${
                  s.up === true ? "text-emerald-400" :
                  s.up === false ? "text-red-400" : "text-slate-500"
                }`}>
                  {s.up === true && "▲ "}{s.up === false && "▼ "}{s.change}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── IPO HIGHLIGHT ── */}
        <div className="bg-gradient-to-r from-emerald-900/35 to-blue-900/35 border border-emerald-500/25 p-5 sm:p-6 rounded-2xl mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-xl shrink-0">
              <Star fill="white" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">IPO / Mero Share</h2>
              <p className="text-emerald-300 text-sm mt-0.5">Apply for IPO र result check गर्नुस् — directly CDSC bata।</p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <a href="https://iporesult.cdsc.com.np/" target="_blank"
              className="flex-1 sm:flex-none text-center bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/30">
              Check IPO Result
            </a>
            <a href="https://meroshare.cdsc.com.np/" target="_blank"
              className="flex-1 sm:flex-none text-center bg-blue-600 hover:bg-blue-500 active:scale-95 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/30">
              Mero Share
            </a>
          </div>
        </div>

        {/* ── AI PREDICTOR ── */}
        <div className="mb-10">
          <StockPredictor stocks={data?.stocks || []} />
        </div>

        {/* ── LIVE CHART ── */}
        <div id="nepse-chart-view" className="mb-10 scroll-mt-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={26} /> {chartSymbol === "NEPSE" ? "NEPSE Live" : `${chartSymbol} `} Chart
              </h2>
              <p className="text-slate-400 text-sm mt-1">Real-time candlestick chart — nepsealpha.com powered</p>
            </div>
            
            <div className="flex items-center gap-3">
              {chartSymbol !== "NEPSE" && (
                <button onClick={() => setChartSymbol("NEPSE")}
                  className="flex items-center gap-2 text-sm bg-violet-600/20 text-violet-400 hover:bg-violet-600 hover:text-white active:scale-95 px-4 py-2 rounded-xl transition-all border border-violet-500/30">
                  <RefreshCw size={15} /> Back to NEPSE
                </button>
              )}
              <button 
                onClick={toggleFullScreen}
                className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 active:scale-95 px-4 py-2 rounded-xl transition-all border border-slate-700/50">
                <Maximize2 size={15} /> Full Screen
              </button>
            </div>
          </div>

          <div 
            ref={chartContainerRef}
            className={`bg-[#1e293b] border ${fullScreen ? "border-none" : "border-slate-700"} overflow-hidden shadow-2xl relative transition-all duration-300 ${
            fullScreen ? "w-full h-full bg-white p-0 m-0" : "rounded-3xl h-[480px] sm:h-[580px] lg:h-[700px]"
          }`}>
            {fullScreen && (
              <button onClick={toggleFullScreen}
                className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-full z-[110] hover:bg-red-500 shadow-2xl backdrop-blur-sm border border-red-400/30">
                <X size={24} />
              </button>
            )}
            <div className="w-full h-full relative bg-white">
              <iframe
                key={chartSymbol}
                src={`https://nepsealpha.com/trading/chart?symbol=${chartSymbol}`}
                className="absolute top-0 left-0 w-full h-full border-none pointer-events-auto"
                style={fullScreen ? undefined : { filter: "hue-rotate(180deg) invert(0.92) contrast(0.85)" }} // Keep dark theme only in non-fullscreen for better UI inside the panel
                title={`${chartSymbol} Live Chart`}
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* ── STOCK TABLE + SECTOR ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2">
            <StockTable
              stocks={data?.stocks || []}
              loading={loading}
              onStockClick={(sym) => {
                setChartSymbol(sym);
                document.getElementById('nepse-chart-view')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>
          <div>
            <SectorChart
              sectors={data?.sectors || []}
              loading={loading}
            />
          </div>
        </div>

        {/* ── TOP GAINERS / LOSERS ── */}
        {data && (data.topGainers.length > 0 || data.topLosers.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Top Gainers */}
            {data.topGainers.length > 0 && (
              <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowUpRight size={18} className="text-emerald-400" />
                  <h3 className="font-black text-white text-base sm:text-lg">Top Gainers 🚀</h3>
                </div>
                <div className="space-y-2">
                  {data.topGainers.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-xl px-3 py-2.5 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center justify-center">{i + 1}</span>
                        <span className="font-bold text-white text-sm">{s.sym}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{s.ltp?.toFixed(2)}</div>
                        <div className="text-[11px] font-bold text-emerald-400">+{s.chg?.toFixed(2)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Losers */}
            {data.topLosers.length > 0 && (
              <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowDownRight size={18} className="text-red-400" />
                  <h3 className="font-black text-white text-base sm:text-lg">Top Losers 📉</h3>
                </div>
                <div className="space-y-2">
                  {data.topLosers.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-xl px-3 py-2.5 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black flex items-center justify-center">{i + 1}</span>
                        <span className="font-bold text-white text-sm">{s.sym}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{s.ltp?.toFixed(2)}</div>
                        <div className="text-[11px] font-bold text-red-400">{s.chg?.toFixed(2)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TOOLS: EMI + FOREX ── */}
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-5 flex items-center gap-2">
            <DollarSign size={22} className="text-cyan-400" /> Financial Tools
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmiCalculator />
            <ForexWidget />
          </div>
        </div>

        {/* ── QUICK LINKS ── */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-5">Market Resources</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {QUICK_LINKS.map((item, i) => (
              <a key={i} href={item.link} target="_blank"
                className={`p-4 sm:p-5 bg-[#0d1520]/80 border ${item.color} rounded-2xl hover:bg-[#1a2535] active:scale-[0.98] transition-all group flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl leading-none">{item.icon}</span>
                  <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">
                    {item.name}
                  </span>
                </div>
                <ExternalLink size={15} className="text-slate-600 group-hover:text-white transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* ── SEO CONTENT BLOCK ── */}
        <section className="p-6 sm:p-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h2 className="text-lg sm:text-xl font-black text-white mb-2">
            NEPSE Live Share Market Today 2082 — Nepal&apos;s Best Stock Hub 📈
          </h2>
          <div className="text-slate-500 text-sm space-y-3 leading-relaxed">
            <p>
              <strong className="text-slate-300">Nepal Stock Exchange (NEPSE)</strong> को live share price,
              floor sheet, र market depth — Tikajoshi मा real-time update हुन्छ।
              आजको NEPSE index, top gainers, top losers, sector performance सबै एकै ठाउँमा — free मा।
            </p>
            <p>
              <strong className="text-slate-300">Nepal Share Market 2082</strong> मा invest गर्न चाहनुहुन्छ?
              NEPSE live chart, Mero Share IPO result check, forex exchange rates, र EMI / loan calculator —
              सबै tools यहाँ छन्। Register नगरी use गर्न सकिन्छ।
            </p>
            <p>
              <strong className="text-slate-300">IPO Apply गर्ने तरिका:</strong> Mero Share account खोल्नुस्,
              CDSC मा DEMAT account बनाउनुस्, अनि available IPO हरूमा apply गर्नुस्।
              Result directly यहाँ check गर्न सकिन्छ।
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/[0.05]">
              {SEO_KEYWORDS.map((k, i) => (
                <div key={i}
                  className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/[0.03] border border-white/[0.05] px-3 py-2 rounded-lg">
                  <span className="text-emerald-400 text-[10px]">✓</span> {k}
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}