import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NEPSE Live Chart Today, Market Depth & Share Market Nepal | Tika Joshi",
  description:
    "Get real-time NEPSE live trading charts, live market depth, floor-sheets, and instant IPO update alerts. Analyze Nepal stock market today for free.",
  keywords: [
    "NEPSE live today",
    "nepal share market today",
    "nepal stock market live 2083",
    "NEPSE live trading today",
    "nepal stock exchange today",
    "share market nepal live",
    "nepse today price",
    "IPO result nepal",
  ],
  alternates: { canonical: "https://www.tikajoshi.com.np/market" },
  openGraph: {
    title: "NEPSE Live Chart Today, Market Depth & Share Market Nepal",
    description: "Get real-time NEPSE live trading charts, live market depth, floor-sheets, and instant IPO update alerts. Analyze Nepal stock market today for free.",
    url: "https://www.tikajoshi.com.np/market",
    type: "website"
  },
};

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "NEPSE Live Market & Tools",
    "url": "https://www.tikajoshi.com.np/market",
    "description": "Real-time NEPSE live trading charts, market depth, and financial calculators.",
    "applicationCategory": "FinanceApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "mainEntity": {
      "@type": "FinancialProduct",
      "name": "Nepal Stock Exchange Live Data"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}