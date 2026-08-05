/**
 * NEPSE Historical OHLC Storage Utility
 * ─────────────────────────────────────
 * SERVER-SIDE ONLY — uses Node.js `fs`. Never import from client components.
 *
 * Data lives in: lib/cache/nepse-history.json
 * Format: { [SYMBOL]: OHLCEntry[] }  (sorted ascending by date, capped at MAX_DAYS)
 */
import fs from "fs";
import path from "path";
import { OHLCEntry, DataSufficiency, getDataSufficiency } from "./technical-analysis";

export { type OHLCEntry, type DataSufficiency, getDataSufficiency };

const CACHE_DIR = path.join(process.cwd(), "lib", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "nepse-history.json");
export const MAX_DAYS = 300;

export type HistoryDB = Record<string, OHLCEntry[]>;

/* ── I/O ────────────────────────────────────────────────── */
export function readHistoryDB(): HistoryDB {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    if (!fs.existsSync(CACHE_FILE)) return {};
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8")) as HistoryDB;
  } catch {
    return {};
  }
}

export function writeHistoryDB(db: HistoryDB): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(db), "utf-8");
  } catch (e) {
    console.error("nepse-history: write failed:", e);
  }
}

/**
 * Append (or update same-day) one OHLC entry for a symbol.
 * Mutates `db` in-place — caller must call writeHistoryDB() when done.
 */
export function appendDailyOHLC(
  db: HistoryDB,
  symbol: string,
  entry: OHLCEntry
): void {
  if (!db[symbol]) db[symbol] = [];
  const idx = db[symbol].findIndex((e) => e.date === entry.date);
  if (idx >= 0) {
    db[symbol][idx] = entry; // overwrite same-day entry
  } else {
    db[symbol].push(entry);
    db[symbol].sort((a, b) => a.date.localeCompare(b.date));
    if (db[symbol].length > MAX_DAYS) db[symbol] = db[symbol].slice(-MAX_DAYS);
  }
}
