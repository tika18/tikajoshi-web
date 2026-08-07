import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PORTFOLIO_DB_DIR = path.join(process.cwd(), "lib", "db");
const PORTFOLIO_DB_PATH = path.join(PORTFOLIO_DB_DIR, "portfolio.json");

// Default initial sample portfolio so users get instant visual feedback
const INITIAL_PORTFOLIO = [
  {
    id: "p1",
    symbol: "NABIL",
    name: "Nabil Bank Limited",
    sector: "Commercial Bank",
    units: 250,
    buyPrice: 520,
    buyDate: "2025-10-15",
  },
  {
    id: "p2",
    symbol: "SHIVM",
    name: "Shivam Cements Limited",
    sector: "Manufacturing",
    units: 150,
    buyPrice: 490,
    buyDate: "2025-11-20",
  },
  {
    id: "p3",
    symbol: "UPPER",
    name: "Upper Tamakoshi Hydropower",
    sector: "Hydropower",
    units: 400,
    buyPrice: 210,
    buyDate: "2026-01-10",
  },
  {
    id: "p4",
    symbol: "NICA",
    name: "NIC Asia Bank Limited",
    sector: "Commercial Bank",
    units: 200,
    buyPrice: 450,
    buyDate: "2026-02-01",
  },
];

function ensureDbExists() {
  if (!fs.existsSync(PORTFOLIO_DB_DIR)) {
    fs.mkdirSync(PORTFOLIO_DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(PORTFOLIO_DB_PATH)) {
    fs.writeFileSync(PORTFOLIO_DB_PATH, JSON.stringify(INITIAL_PORTFOLIO, null, 2), "utf-8");
  }
}

export async function GET() {
  try {
    ensureDbExists();
    const fileData = fs.readFileSync(PORTFOLIO_DB_PATH, "utf-8");
    const portfolio = JSON.parse(fileData);
    return NextResponse.json({ success: true, portfolio });
  } catch (err: any) {
    console.error("Error reading portfolio DB:", err);
    return NextResponse.json({ success: true, portfolio: INITIAL_PORTFOLIO });
  }
}

export async function POST(req: Request) {
  try {
    ensureDbExists();
    const body = await req.json();
    if (!body || !Array.isArray(body.portfolio)) {
      return NextResponse.json({ success: false, error: "Invalid portfolio payload" }, { status: 400 });
    }

    fs.writeFileSync(PORTFOLIO_DB_PATH, JSON.stringify(body.portfolio, null, 2), "utf-8");
    return NextResponse.json({ success: true, portfolio: body.portfolio });
  } catch (err: any) {
    console.error("Error saving portfolio DB:", err);
    return NextResponse.json({ success: false, error: "Failed to save portfolio" }, { status: 500 });
  }
}
