import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = 'https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=1';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    throw new Error("NRB API Failed");

  } catch (error) {
    // Fallback Data (Data when API fails)
    const fallbackRates = [
      { currency: { iso3: "USD", name: "US Dollar", unit: 1 }, buy: "134.50", sell: "135.10" },
      { currency: { iso3: "EUR", name: "Euro", unit: 1 }, buy: "145.20", sell: "145.85" },
      { currency: { iso3: "GBP", name: "Pound Sterling", unit: 1 }, buy: "170.50", sell: "171.25" },
      { currency: { iso3: "AUD", name: "Australian Dollar", unit: 1 }, buy: "88.40", sell: "88.90" },
      { currency: { iso3: "JPY", name: "Japanese Yen", unit: 10 }, buy: "9.15", sell: "9.20" },
      { currency: { iso3: "KRW", name: "South Korean Won", unit: 100 }, buy: "9.80", sell: "9.85" },
      { currency: { iso3: "INR", name: "Indian Rupee", unit: 100 }, buy: "160.00", sell: "160.15" },
      { currency: { iso3: "AED", name: "UAE Dirham", unit: 1 }, buy: "36.60", sell: "36.75" },
      { currency: { iso3: "QAR", name: "Qatari Riyal", unit: 1 }, buy: "36.80", sell: "36.95" },
      { currency: { iso3: "SAR", name: "Saudi Riyal", unit: 1 }, buy: "35.85", sell: "36.00" },
      { currency: { iso3: "MYR", name: "Malaysian Ringgit", unit: 1 }, buy: "28.40", sell: "28.55" },
    ];

    return NextResponse.json({ 
      data: { payload: [{ date: "Backup Data", rates: fallbackRates }] } 
    });
  }
}