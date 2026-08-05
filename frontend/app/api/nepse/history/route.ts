import { NextResponse } from "next/server";
import { readHistoryDB } from "@/lib/nepse-history";
import { getDataSufficiency, OHLCEntry } from "@/lib/technical-analysis";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

function promiseTimeout<T>(promise: Promise<T>, ms: number, errorMsg = "Timed out"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMsg)), ms);
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol")?.toUpperCase();

    if (!symbol) {
      return NextResponse.json({ success: false, error: "Missing symbol parameter" }, { status: 400 });
    }

    let history: OHLCEntry[] = [];
    let source = "local-json";

    // 1. Try Firebase RTDB first
    if (adminDb) {
      try {
        const snapshot = await promiseTimeout(
          adminDb.ref(`marketHistory/${symbol}`).once("value"),
          2000,
          "Firebase history read timeout"
        );
        const val = snapshot.val();
        if (Array.isArray(val) && val.length > 0) {
          history = val;
          source = "firebase-rtdb";
        }
      } catch (fbErr) {
        console.warn(`Firebase RTDB history read failed for ${symbol}, falling back to local JSON:`, fbErr);
      }
    }

    // 2. Fallback to local JSON cache
    if (history.length === 0) {
      const db = readHistoryDB();
      history = db[symbol] || [];
      source = "local-json";
    }

    const sufficiency = getDataSufficiency(history);

    return NextResponse.json({
      success: true,
      symbol,
      source,
      history,
      count: history.length,
      sufficiency,
    });
  } catch (error: any) {
    console.error("Error in NEPSE history API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
