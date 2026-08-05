import { NextResponse } from "next/server";
import { parse } from "node-html-parser";
import { adminDb } from "@/lib/firebase-admin";
import { ServerValue } from "firebase-admin/database";
import { readHistoryDB, writeHistoryDB, appendDailyOHLC } from "@/lib/nepse-history";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ──────────────────────────────────────────────────────
   Server-side caching
   ────────────────────────────────────────────────────── */
let cachedData: any = null;
let lastFetchTime = 0;
const CACHE_MS = 20 * 1000; // 20 seconds

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/* ──────────────────────────────────────────────────────
   Known sector mappings for NEPSE stocks
   ────────────────────────────────────────────────────── */
const SECTOR_MAP: Record<string, string> = {
  // Commercial Banks
  NABIL: "Commercial Bank", NICA: "Commercial Bank", GBIME: "Commercial Bank",
  ADBL: "Commercial Bank", SBI: "Commercial Bank", HBL: "Commercial Bank",
  NBL: "Commercial Bank", EBL: "Commercial Bank", MBL: "Commercial Bank",
  SANIMA: "Commercial Bank", KBL: "Commercial Bank", PRVU: "Commercial Bank",
  SBL: "Commercial Bank", NIMB: "Commercial Bank", SCB: "Commercial Bank",
  PCBL: "Commercial Bank", NCCB: "Commercial Bank", CBL: "Commercial Bank",
  CZBIL: "Commercial Bank", LUBL: "Commercial Bank", BOKL: "Commercial Bank",
  MEGA: "Commercial Bank", NMB: "Commercial Bank",

  // Hydropower
  NHPC: "Hydropower", CHILIME: "Hydropower", CHCL: "Hydropower",
  BPCL: "Hydropower", UPPER: "Hydropower", KPCL: "Hydropower",
  SJCL: "Hydropower", AKPL: "Hydropower", API: "Hydropower",
  HDHPC: "Hydropower", RIDI: "Hydropower", UMRH: "Hydropower",
  DHPL: "Hydropower", SHPC: "Hydropower", SSHL: "Hydropower",
  NGPL: "Hydropower", HURJA: "Hydropower", RADHI: "Hydropower",
  MKJC: "Hydropower", UNHPL: "Hydropower", GHL: "Hydropower",
  GLH: "Hydropower", SPDL: "Hydropower", NYADI: "Hydropower",
  UPCL: "Hydropower", PMHPL: "Hydropower", MHNL: "Hydropower",
  HPPL: "Hydropower", CHL: "Hydropower", UMHL: "Hydropower",
  AHL: "Hydropower", AHPC: "Hydropower",

  // Development Banks
  KSBBL: "Development Bank", GBBL: "Development Bank", EDBL: "Development Bank",
  MDB: "Development Bank", SAPDBL: "Development Bank", MLBBL: "Development Bank",
  LBBL: "Development Bank", JBBL: "Development Bank", KRBL: "Development Bank",
  MNBBL: "Development Bank", SHINE: "Development Bank", NABBC: "Development Bank",

  // Microfinance
  ACLBSL: "Microfinance", CBBL: "Microfinance", DDBL: "Microfinance",
  FOWAD: "Microfinance", GILB: "Microfinance", GBLBS: "Microfinance",
  KLBSL: "Microfinance", LLBS: "Microfinance", MLBSL: "Microfinance",
  MKLB: "Microfinance", NSLB: "Microfinance", SMATA: "Microfinance",
  SLBSL: "Microfinance", SWBBL: "Microfinance", VLBS: "Microfinance",

  // Insurance
  NLIC: "Insurance", PLIC: "Insurance", ALICL: "Insurance",
  SICL: "Insurance", HGI: "Insurance", PRIN: "Insurance",
  LICN: "Insurance", NIL: "Insurance", NLG: "Insurance",
  IGI: "Insurance", SGIC: "Insurance", SIC: "Insurance",
  UIC: "Insurance", PIC: "Insurance",

  // Manufacturing
  UNL: "Manufacturing", NLO: "Manufacturing", BNT: "Manufacturing",
  HDL: "Manufacturing", SHIVM: "Manufacturing", RJM: "Manufacturing",
  JSM: "Manufacturing",

  // Hotels
  SHL: "Hotels", TRH: "Hotels", OHL: "Hotels", CGH: "Hotels",
  KDL: "Hotels",

  // Others / Investment
  HIDCL: "Investment", CHDC: "Investment", NTC: "Telecom",
  NIFRA: "Investment",
};

/* ──────────────────────────────────────────────────────
   Scrape TODAY'S SHARE PRICES from ShareSansar

   ShareSansar table columns (verified from HTML):
   0: S.No         7: LTP           14: Trans.
   1: Symbol       8: Close - LTP   15: Diff
   2: Conf.        9: Close - LTP%  16: Range
   3: Open        10: VWAP          17: Diff %
   4: High        11: Vol           18: Range %
   5: Low         12: Prev. Close   19: VWAP %
   6: Close       13: Turnover      ...
   ────────────────────────────────────────────────────── */
async function scrapeStocks() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch("https://www.sharesansar.com/today-share-price", {
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "text/html" },
      cache: "no-store",
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`ShareSansar status ${res.status}`);
    const html = await res.text();
    const root = parse(html);

    const stocks: any[] = [];
    const rows = root.querySelectorAll("table.table tbody tr");

    for (const row of rows) {
      const tds = row.querySelectorAll("td");
      if (tds.length < 18) continue;

      // Symbol is inside an <a> tag in td[1]
      const symLink = tds[1]?.querySelector("a");
      const sym = symLink ? symLink.text.trim() : tds[1]?.text?.trim() || "";

      const open     = parseNumber(tds[3]?.text);
      const high     = parseNumber(tds[4]?.text);
      const low      = parseNumber(tds[5]?.text);
      const ltp      = parseNumber(tds[7]?.text);
      const close    = parseNumber(tds[6]?.text);
      const vwap     = parseNumber(tds[10]?.text);
      const vol      = tds[11]?.text?.trim() || "0";
      const prevClose = parseNumber(tds[12]?.text);
      const turnover  = tds[13]?.text?.trim() || "0";
      const diff      = parseNumber(tds[15]?.text);
      const diffPct   = parseNumber(tds[17]?.text);

      if (!sym || sym.length > 15 || sym === "Symbol") continue;

      const effectiveLtp = ltp || close;
      const effectivePrevClose = prevClose || (effectiveLtp - diff);
      const effectiveChgPct =
        diffPct ||
        (effectivePrevClose > 0
          ? ((effectiveLtp - effectivePrevClose) / effectivePrevClose) * 100
          : 0);

      stocks.push({
        sym,
        name: sym,
        ltp: effectiveLtp,
        chg: +effectiveChgPct.toFixed(2),
        diff,
        vol,
        turnover,
        prevClose: effectivePrevClose,
        open: open || effectiveLtp,
        high: high || effectiveLtp,
        low: low || effectiveLtp,
        vwap: vwap || effectiveLtp,
        sector: SECTOR_MAP[sym] || "Others",
      });
    }

    // Extract page summary text
    let totalTurnover = "";
    let totalShares = "";
    let totalCompanies = "";
    let sourceTimestamp = "";
    let sourceDate = "";

    const pageText = root.text;
    const turnoverMatch = pageText.match(
      /Total Turnover\s*:\s*Rs\s*([\d,]+(?:\.\d+)?)/i
    );
    const sharesMatch = pageText.match(
      /Total Traded Shares\s*:\s*([\d,]+(?:\.\d+)?)/i
    );
    const companiesMatch = pageText.match(
      /Total number of Compa\w*:\s*(\d+)/i
    );
    const dateMatch =
      pageText.match(/As of\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})/i) ||
      pageText.match(/As of\s*[:\-]?\s*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i) ||
      pageText.match(/([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})\s*(?:AD|A\.D\.)?/i);
    const timeMatch = pageText.match(/(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i);

    if (turnoverMatch) totalTurnover = turnoverMatch[1];
    if (sharesMatch) totalShares = sharesMatch[1];
    if (companiesMatch) totalCompanies = companiesMatch[1];
    if (dateMatch) sourceDate = dateMatch[1].trim();
    if (timeMatch) sourceTimestamp = timeMatch[1].trim();

    return { stocks, totalTurnover, totalShares, totalCompanies, sourceDate, sourceTimestamp };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Stock scrape failed:", err);
    return null;
  }
}

/* ──────────────────────────────────────────────────────
   Helper to clean up sector names from ShareSansar
   ────────────────────────────────────────────────────── */
function cleanSectorName(raw: string): string {
  return raw
    .replace(" SubIndex", "")
    .replace(" Index", "")
    .replace(" Sub Index", "")
    .replace(" And ", " & ")
    .trim();
}

/* ──────────────────────────────────────────────────────
   Scrape LIVE INDICES & SECTORS from ShareSansar
   ────────────────────────────────────────────────────── */
async function scrapeMarketIndicesAndSectors() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch("https://www.sharesansar.com/market", {
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "text/html" },
      cache: "no-store",
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Market page status ${res.status}`);
    const html = await res.text();
    const root = parse(html);
    const tables = root.querySelectorAll("table");
    
    // Parse indices from Table #0
    const firstTable = tables[0];
    let nepseIndex = null;
    let sensitiveIndex = null;
    let floatIndex = null;

    if (firstTable) {
      const rows = firstTable.querySelectorAll("tr");
      rows.forEach((row) => {
        const tds = row.querySelectorAll("td");
        if (tds.length < 7) return;

        const name = tds[0].text.trim();
        const value = tds[4].text.trim();
        const change = tds[5].text.trim();
        const pct = tds[6].text.trim().replace("%", "");

        const isUp = parseFloat(change) >= 0;

        if (name === "NEPSE Index") {
          nepseIndex = { value, change, pct: Math.abs(parseFloat(pct)).toFixed(2), up: isUp };
        } else if (name === "Sensitive Index") {
          sensitiveIndex = { value, change, pct: Math.abs(parseFloat(pct)).toFixed(2), up: isUp };
        } else if (name === "Float Index") {
          floatIndex = { value, change, pct: Math.abs(parseFloat(pct)).toFixed(2), up: isUp };
        }
      });
    }

    // Parse sectors from Table #3
    const sectorTable = tables[3];
    const sectors: any[] = [];
    if (sectorTable) {
      const rows = sectorTable.querySelectorAll("tr");
      rows.forEach((row) => {
        const tds = row.querySelectorAll("td");
        if (tds.length < 7) return;

        const rawName = tds[0].text.trim();
        const value = parseFloat(tds[4].text.replace(/,/g, "")) || 0;
        const pointChg = parseFloat(tds[5].text.replace(/,/g, "")) || 0;
        const pctText = tds[6].text.trim().replace("%", "");
        const chg = parseFloat(pctText) || 0;
        const turnover = tds[7].text.trim();

        sectors.push({
          sector: cleanSectorName(rawName),
          chg,
          value,
          pointChg,
          turnover
        });
      });
    }

    return { nepseIndex, sensitiveIndex, floatIndex, sectors };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Index/Sector scrape failed:", err);
    return null;
  }
}

/* ──────────────────────────────────────────────────────
   Backup API with fast-fail timeout (3 seconds)
   ────────────────────────────────────────────────────── */
async function fetchBackupAPI() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch("https://nepseapi.surajrimal.dev/Summary", {
      signal: controller.signal,
      headers: { "User-Agent": UA },
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Backup API status ${res.status}`);
    }

    const data = await res.json();
    if (data && data.nepseIndex) {
      return data;
    }
    throw new Error("Invalid data format from backup API");
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("Backup API fetch failed:", err);
    return null;
  }
}

/* ──────────────────────────────────────────────────────
   Compute market stats from stock data
   ────────────────────────────────────────────────────── */
function computeMarketStats(stocks: any[], totalTurnover: string, totalShares: string, totalCompanies: string) {
  const avgChg = stocks.length > 0
    ? stocks.reduce((sum, s) => sum + s.chg, 0) / stocks.length
    : 0;

  const totalTurn = stocks.reduce((sum, s) => {
    return sum + (parseFloat(s.turnover?.replace(/,/g, "") || "0") || 0);
  }, 0);

  const totalVol = stocks.reduce((sum, s) => {
    return sum + (parseFloat(s.vol?.replace(/,/g, "") || "0") || 0);
  }, 0);

  return {
    turnover: totalTurnover ? formatTurnover(totalTurnover) : formatTurnover(totalTurn.toString()),
    totalTrades: totalShares || totalVol.toLocaleString("en-NP"),
    totalCompanies: totalCompanies || stocks.length.toString(),
    avgChg: +avgChg.toFixed(2),
  };
}

/* ──────────────────────────────────────────────────────
   FALLBACK DATA
   Note: These index and sector values are updated as of today (market close indices ~2684.33).
   They serve as a temporary placeholder when both live scraping and Firebase RTDB are completely empty/unreachable.
   ────────────────────────────────────────────────────── */
const FALLBACK = {
  stocks: [
    { sym: "NABIL", name: "Nabil Bank", ltp: 1234.5, chg: 2.3, vol: "12,450", prevClose: 1206.8 },
    { sym: "NTC", name: "Nepal Telecom", ltp: 850.0, chg: -1.1, vol: "8,230", prevClose: 859.4 },
    { sym: "NICA", name: "NIC Asia Bank", ltp: 610.2, chg: 3.5, vol: "21,700", prevClose: 589.3 },
    { sym: "PRVU", name: "Prabhu Bank", ltp: 320.8, chg: -0.8, vol: "5,100", prevClose: 323.4 },
    { sym: "HIDCL", name: "HIDCL", ltp: 278.4, chg: 1.2, vol: "34,500", prevClose: 275.1 },
    { sym: "CHCL", name: "Chilime", ltp: 540.0, chg: 0.6, vol: "9,800", prevClose: 536.8 },
    { sym: "UPPER", name: "Upper Tamakoshi", ltp: 188.6, chg: -2.4, vol: "45,200", prevClose: 193.2 },
    { sym: "GBIME", name: "Global IME", ltp: 265.1, chg: 1.8, vol: "18,600", prevClose: 260.4 },
    { sym: "SANIMA", name: "Sanima Bank", ltp: 298.7, chg: 0.3, vol: "7,300", prevClose: 297.8 },
    { sym: "ADBL", name: "Agri Dev Bank", ltp: 395.0, chg: -1.6, vol: "11,900", prevClose: 401.4 },
  ],
  sectors: [
    { sector: "Banking", chg: 0.26 },
    { sector: "Development Bank", chg: 0.23 },
    { sector: "Finance", chg: -0.29 },
    { sector: "Hotels & Tourism", chg: 0.01 },
    { sector: "HydroPower", chg: 0 },
    { sector: "Investment", chg: -0.1 },
    { sector: "Life Insurance", chg: 0.09 },
    { sector: "Manufacturing & Processing", chg: -0.57 },
    { sector: "Microfinance", chg: 0.3 },
    { sector: "Mutual Fund", chg: 0.49 },
    { sector: "Non Life Insurance", chg: 0.3 },
    { sector: "Others", chg: -0.83 },
    { sector: "Trading", chg: -0.93 },
  ],
  marketStats: {
    nepseIndex: { value: "2,684.33", change: "-1.20", pct: "0.04", up: false },
    sensitiveIndex: { value: "470.63", change: "+0.49", pct: "0.10", up: true },
    floatIndex: { value: "184.73", change: "+0.14", pct: "0.07", up: true },
    turnover: "4.57B",
    totalTrades: "63,648",
    totalCompanies: "349",
  },
};

/* ──────────────────────────────────────────────────────
   MAIN GET HANDLER
   ────────────────────────────────────────────────────── */
export async function GET() {
  // Return cached data if fresh enough
  if (cachedData && Date.now() - lastFetchTime < CACHE_MS) {
    return NextResponse.json(cachedData);
  }

  try {
    // 1. Try Live Scrapes concurrently
    const [indexResult, stockResult] = await Promise.all([
      scrapeMarketIndicesAndSectors(),
      scrapeStocks(),
    ]);

    if (!indexResult || !indexResult.nepseIndex) {
      throw new Error("Failed to scrape live indices and sectors");
    }

    if (!stockResult || stockResult.stocks.length === 0) {
      throw new Error("Failed to scrape live stock data");
    }

    const allStocks = stockResult.stocks;

    // Compute top gainers and losers from the stock data
    const topGainers = [...allStocks]
      .filter(s => s.chg > 0)
      .sort((a, b) => b.chg - a.chg)
      .slice(0, 10);

    const topLosers = [...allStocks]
      .filter(s => s.chg < 0)
      .sort((a, b) => a.chg - b.chg)
      .slice(0, 10);

    // Top traded by volume
    const topTraded = [...allStocks]
      .sort((a, b) => {
        const aVol = parseFloat(a.vol?.replace(/,/g, "") || "0") || 0;
        const bVol = parseFloat(b.vol?.replace(/,/g, "") || "0") || 0;
        return bVol - aVol;
      })
      .slice(0, 20);

    // Compute market statistics
    const computedStats = computeMarketStats(
      allStocks,
      stockResult.totalTurnover,
      stockResult.totalShares,
      stockResult.totalCompanies
    );

    const marketStats = {
      nepseIndex: indexResult.nepseIndex,
      sensitiveIndex: indexResult.sensitiveIndex,
      floatIndex: indexResult.floatIndex,
      turnover: computedStats.turnover,
      totalTrades: computedStats.totalTrades,
      totalCompanies: computedStats.totalCompanies,
    };

    const sourceUpdatedText = [stockResult.sourceDate, stockResult.sourceTimestamp]
      .filter(Boolean)
      .join(" ");

    const data = {
      success: true,
      live: true,
      timestamp: new Date().toISOString(),
      sourceUpdatedText,
      source: "sharesansar",
      marketStats,
      stocks: topTraded,
      allStocks,
      sectors: indexResult.sectors,
      topGainers,
      topLosers,
    };

    cachedData = data;
    lastFetchTime = Date.now();

    // Record live OHLC entries into local nepse-history DB
    try {
      const todayStr = stockResult.sourceDate || new Date().toISOString().split("T")[0];
      const db = readHistoryDB();
      for (const s of allStocks) {
        const volNum = parseFloat(s.vol?.replace(/,/g, "") || "0") || 0;
        appendDailyOHLC(db, s.sym, {
          date: todayStr,
          open: s.open,
          high: s.high,
          low: s.low,
          close: s.ltp,
          volume: volNum,
          vwap: s.vwap,
        });
      }
      writeHistoryDB(db);
    } catch (histErr) {
      console.error("Failed to record daily OHLC history:", histErr);
    }

    // Write to Firebase RTDB as a persistent cache layer
    if (adminDb) {
      try {
        await promiseTimeout(
          adminDb.ref("marketSnapshot/latest").set({
            ...data,
            serverTimestamp: ServerValue.TIMESTAMP,
          }),
          2000,
          "Firebase set timed out"
        );
      } catch (dbErr) {
        console.error("Firebase RTDB set failed:", dbErr);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("NEPSE live scrape error:", error);

    // 2. Try Backup API (fast-fail)
    try {
      console.log("Attempting backup API fallback...");
      const backupResult = await fetchBackupAPI();
      if (backupResult) {
        console.log("Backup API returned data:", backupResult);
      }
    } catch (backupErr) {
      console.warn("Backup API failed:", backupErr);
    }

    // 3. Fallback to Firebase RTDB stale snapshot
    if (adminDb) {
      try {
        console.log("Attempting Firebase RTDB fallback...");
        const snapshot = await promiseTimeout(
          adminDb.ref("marketSnapshot/latest").once("value"),
          3000,
          "Firebase read timed out"
        );
        const val = snapshot.val();
        if (val) {
          return NextResponse.json({
            ...val,
            success: true,
            live: false,
            stale: true,
            source: "firebase-stale",
          });
        }
      } catch (dbErr) {
        console.error("Failed to fetch from Firebase RTDB fallback:", dbErr);
      }
    }

    // 4. Fallback to static FALLBACK (last resort only)
    console.log("Serving static FALLBACK as last resort...");
    return NextResponse.json({
      success: false,
      live: false,
      timestamp: new Date().toISOString(),
      source: "fallback",
      marketStats: FALLBACK.marketStats,
      stocks: FALLBACK.stocks,
      allStocks: FALLBACK.stocks,
      sectors: FALLBACK.sectors,
      topGainers: [],
      topLosers: [],
    });
  }
}

/* ──────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────── */
function formatTurnover(raw: string): string {
  const num = parseFloat(raw.replace(/,/g, ""));
  if (isNaN(num)) return raw;
  if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e7) return (num / 1e7).toFixed(1) + "Cr";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e5) return (num / 1e5).toFixed(1) + "L";
  return num.toLocaleString("en-NP");
}

function parseNumber(raw?: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/,/g, "").replace(/[^\d.-]/g, "").trim();
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatSigned(v: number): string {
  const fixed = Math.abs(v).toFixed(2);
  return `${v >= 0 ? "+" : "-"}${fixed}`;
}

function promiseTimeout<T>(promise: Promise<T>, ms: number, errorMsg = "Operation timed out"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMsg));
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}
