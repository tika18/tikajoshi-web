import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NEPSE Live Today 2083 - Nepal Share Market Price | Tikajoshi",
  description:
    "NEPSE live share price today 2083. Nepal stock exchange live trading, today's floor sheet, market depth, IPO result check र forex rates — real-time update।",
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
    title: "NEPSE Live Today 2083 - Nepal Share Market",
    description: "Nepal stock market live price, floor sheet, IPO result — real-time।",
    url: "https://www.tikajoshi.com.np/market",
  },
};

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}