import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Sports Scores, Match Schedules & Chill Zone | Tika Joshi",
  description:
    "Get real-time live sports score widgets, upcoming FIFA/Cricket match schedules, and interactive entertainment updates instantly.",
  keywords: [
    "IPL live stream free Nepal",
    "rcb vs dc live",
    "star sports 1 live Nepal",
    "JioStar live stream Nepal",
    "IPL 2026 free watch Nepal",
    "live cricket stream Nepal free",
    "star sports live Nepal free",
    "formula 1 live stream Nepal",
    "Premier League live Nepal free",
    "live sports Nepal 2026",
  ],
  alternates: { canonical: "https://www.tikajoshi.com.np/chill-zone" },
  openGraph: {
    title: "Live Sports Scores, Match Schedules & Chill Zone",
    description: "Get real-time live sports score widgets, upcoming FIFA/Cricket match schedules, and interactive entertainment updates instantly.",
    url: "https://www.tikajoshi.com.np/chill-zone",
    type: "website"
  },
};

export default function ChillLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Chill Zone - Live Sports & Entertainment",
    "url": "https://www.tikajoshi.com.np/chill-zone",
    "description": "Real-time live sports scores, match schedules, and interactive entertainment.",
    "applicationCategory": "SportsApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
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