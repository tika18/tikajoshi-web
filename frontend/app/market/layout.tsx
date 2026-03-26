import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nepal Share Market - NEPSE Live Price & Forex",
  description:
    "NEPSE live share price, Nepal Stock Exchange updates, forex rates, र share market analysis — daily updated।",
  keywords: [
    "NEPSE live price",
    "Nepal share market today",
    "forex rate Nepal",
    "share market Nepal 2081",
    "stock price Nepal",
  ],
  alternates: {
    canonical: "https://www.tikajoshi.com.np/market",
  },
  openGraph: {
    title: "Nepal Share Market - NEPSE Live",
    description: "NEPSE live price, forex rates — daily updated।",
    url: "https://www.tikajoshi.com.np/market",
  },
};

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}