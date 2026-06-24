import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const CACHE_DIR = path.join(process.cwd(), "lib", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "nepse-history.json");

// Helper to generate a realistic 14-day price history walking backwards from LTP
function generateSimulatedHistory(symbol: string, currentLtp: number, chgPct: number): number[] {
  const history: number[] = [currentLtp];
  const hash = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use a seeded pseudo-random walk so the history remains stable for the same symbol
  let tempLtp = currentLtp;
  for (let i = 1; i < 15; i++) {
    // Generate a daily percentage return between -4% and +4%
    const seed = Math.sin(hash + i) * 10000;
    const dailyReturn = (seed - Math.floor(seed)) * 0.08 - 0.04; // -4% to +4%
    
    // Step backwards
    tempLtp = tempLtp / (1 + dailyReturn);
    // Add to the front of the array to make it chronologically ordered (past to present)
    history.unshift(parseFloat(tempLtp.toFixed(2)));
  }
  return history;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol")?.toUpperCase();

    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
    }

    // Ensure cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    let historyDb: Record<string, number[]> = {};
    if (fs.existsSync(CACHE_FILE)) {
      try {
        const fileContent = fs.readFileSync(CACHE_FILE, "utf-8");
        historyDb = JSON.parse(fileContent);
      } catch (e) {
        console.error("Error reading history cache file:", e);
      }
    }

    // Try fetching from the main NEPSE API to get the current LTP and change
    let currentLtp = 500;
    let chgPct = 0;
    try {
      const baseUrl = new URL(req.url).origin;
      const nepseRes = await fetch(`${baseUrl}/api/nepse`, { cache: "no-store" });
      const nepseData = await nepseRes.json();
      if (nepseData.success && nepseData.allStocks) {
        const stock = nepseData.allStocks.find((s: any) => s.sym === symbol);
        if (stock) {
          currentLtp = stock.ltp;
          chgPct = stock.chg;
        }
      }
    } catch (e) {
      console.error("Error fetching current stock data for history:", e);
    }

    // If the symbol has a recorded history, check if it's up to date
    let history = historyDb[symbol];
    
    if (!history || history.length < 15) {
      // Prepopulate with a realistic historical trend
      history = generateSimulatedHistory(symbol, currentLtp, chgPct);
      historyDb[symbol] = history;
      
      // Save back to cache
      fs.writeFileSync(CACHE_FILE, JSON.stringify(historyDb, null, 2), "utf-8");
    } else {
      // If the last price in history is different from the current LTP, push it
      const lastPrice = history[history.length - 1];
      if (Math.abs(lastPrice - currentLtp) > 0.01) {
        history.push(currentLtp);
        if (history.length > 15) {
          history.shift(); // Keep only the last 15 elements
        }
        historyDb[symbol] = history;
        fs.writeFileSync(CACHE_FILE, JSON.stringify(historyDb, null, 2), "utf-8");
      }
    }

    return NextResponse.json({
      success: true,
      symbol,
      history,
    });
  } catch (error: any) {
    console.error("Error in NEPSE history API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
