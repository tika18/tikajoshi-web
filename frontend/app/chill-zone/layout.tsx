import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IPL Live Stream Free Nepal 2026 - Star Sports, JioStar HD | Tikajoshi",
  description:
    "Watch IPL 2026 live FREE in Nepal! Star Sports 1 live stream, JioStar HD, Cricbuzz HD, Premier League, NBA, Formula 1 — 15+ channels. No VPN needed. Click & Watch!",
  keywords: [
    "IPL live stream free Nepal",
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
    title: "IPL Live Free Nepal - Star Sports, JioStar HD | Tikajoshi",
    description: "IPL 2025, Star Sports, Formula 1 — FREE। No VPN needed!",
    url: "https://www.tikajoshi.com.np/chill-zone",
  },
};

export default function ChillLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}