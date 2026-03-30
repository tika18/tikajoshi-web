import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Sports Free Nepal - Cricket, Football, NBA, F1",
  description:
    "Watch live IPL cricket, Premier League football, NBA basketball, Formula 1 free in Nepal। 15+ HD channels - Cricbuzz, Star Sports, beIN Sports, Sky F1 र Nepali TV।",
  keywords: [
    "live cricket Nepal free",
    "IPL live stream free",
    "Premier League live Nepal",
    "NBA live stream free",
    "live sports Nepal",
    "Cricbuzz live HD",
    "Star Sports live stream",
    "free movies Nepal",
  ],
  alternates: { canonical: "https://www.tikajoshi.com.np/chill-zone" },
  openGraph: {
    title: "Live Sports Free Nepal - 15+ Channels",
    description: "Cricket, Football, NBA, F1, Nepali TV - सबै free HD।",
    url: "https://www.tikajoshi.com.np/chill-zone",
  },
};

export default function ChillLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}