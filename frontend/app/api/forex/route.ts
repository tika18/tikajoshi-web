import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://www.nrb.org.np/api/forex/v1/app-rate", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) throw new Error("Failed to fetch NRB rates");

    const data = await res.json();
    return NextResponse.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      rates: data,
    });
  } catch (error) {
    console.error("Forex API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rates" },
      { status: 500 }
    );
  }
}