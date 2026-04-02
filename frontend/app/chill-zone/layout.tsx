import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IPL Live Stream Free Nepal 2025 - Star Sports HD | Tikajoshi",
  description:
    "Watch IPL 2025 FREE in Nepal! Star Sports 1 live, Cricbuzz HD, Premier League, NBA live stream. No VPN needed. 15+ HD channels - Cricket, Football, F1, Nepali TV. Click & Watch Now!",
  keywords: [
    "IPL live stream free Nepal",
    "star sports 1 live Nepal",
    "IPL 2025 free watch Nepal",
    "live cricket stream Nepal free",
    "Premier League live Nepal",
    "NBA live stream free",
    "Cricbuzz live HD stream",
    "live sports Nepal free",
    "chill zone tikajoshi",
    "formula 1 live stream free",
  ],
  alternates: { canonical: "https://www.tikajoshi.com.np/chill-zone" },
  openGraph: {
    title: "IPL Live Stream Free Nepal 2025 - 15+ HD Channels",
    description: "Star Sports, Cricbuzz HD, beIN Sports, NBA, F1 - सबै FREE। No VPN needed!",
    url: "https://www.tikajoshi.com.np/chill-zone",
  },
};

export default function ChillLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}