import { NextResponse } from "next/server";
import { parse } from "node-html-parser";

export const dynamic = "force-dynamic";

// In-memory cache for fundamentals: { [symbol]: { data, timestamp } }
const fundamentalsCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_MS = 60 * 60 * 1000; // 1 hour

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol")?.toUpperCase();

    if (!symbol) {
      return NextResponse.json({ success: false, error: "Missing symbol parameter" }, { status: 400 });
    }

    // Check memory cache
    const cached = fundamentalsCache[symbol];
    if (cached && Date.now() - cached.timestamp < CACHE_MS) {
      return NextResponse.json({ success: true, symbol, ...cached.data, cached: true });
    }

    // Fetch Merolagani company detail page
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://merolagani.com/CompanyDetail.aspx?symbol=${encodeURIComponent(symbol)}`, {
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "text/html" },
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Merolagani returned status ${res.status}`);
    }

    const html = await res.text();
    const root = parse(html);

    let eps: number | null = null;
    let pe: number | null = null;
    let bookValue: number | null = null;
    let high52: number | null = null;
    let low52: number | null = null;

    // Parse tables or labels in HTML
    const rows = root.querySelectorAll("tr");
    for (const row of rows) {
      const th = row.querySelector("th")?.text.trim() || "";
      const td = row.querySelector("td")?.text.trim() || "";

      if (th.includes("52 Weeks High/Low") || th.includes("52 Week")) {
        const parts = td.split("-").map((p) => parseFloat(p.replace(/,/g, "").trim()));
        if (parts.length >= 2) {
          high52 = parts[0] || null;
          low52 = parts[1] || null;
        }
      } else if (th.includes("EPS") && !th.includes("Diluted")) {
        const val = parseFloat(td.replace(/,/g, "").trim());
        if (!isNaN(val)) eps = val;
      } else if (th.includes("P/E Ratio")) {
        const val = parseFloat(td.replace(/,/g, "").trim());
        if (!isNaN(val)) pe = val;
      } else if (th.includes("Book Value")) {
        const val = parseFloat(td.replace(/,/g, "").trim());
        if (!isNaN(val)) bookValue = val;
      }
    }

    // Secondary fallback search if th/td table matching missed something
    if (high52 === null || eps === null || pe === null || bookValue === null) {
      const text = root.text;
      if (high52 === null) {
        const m = text.match(/52\s*Weeks?\s*High\/Low\s*:?\s*([\d,.]+)\s*-\s*([\d,.]+)/i);
        if (m) {
          high52 = parseFloat(m[1].replace(/,/g, ""));
          low52 = parseFloat(m[2].replace(/,/g, ""));
        }
      }
      if (eps === null) {
        const m = text.match(/EPS\s*:?\s*([\d,.]+)/i);
        if (m) eps = parseFloat(m[1].replace(/,/g, ""));
      }
      if (pe === null) {
        const m = text.match(/P\/E\s*Ratio\s*:?\s*([\d,.]+)/i);
        if (m) pe = parseFloat(m[1].replace(/,/g, ""));
      }
      if (bookValue === null) {
        const m = text.match(/Book\s*Value\s*:?\s*([\d,.]+)/i);
        if (m) bookValue = parseFloat(m[1].replace(/,/g, ""));
      }
    }

    const data = {
      eps,
      pe,
      bookValue,
      high52,
      low52,
    };

    fundamentalsCache[symbol] = { data, timestamp: Date.now() };

    return NextResponse.json({
      success: true,
      symbol,
      ...data,
      cached: false,
    });
  } catch (error: any) {
    console.error(`Fundamentals fetch error for ${req.url}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch fundamentals" },
      { status: 500 }
    );
  }
}
