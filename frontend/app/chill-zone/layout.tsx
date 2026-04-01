import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watch Live Sports & Movies Free in Nepal | HD Stream IPL, EPL, NBA",
  description:
    "Watch IPL 2025, Premier League football, NBA, & F1 live streaming free in Nepal. Enjoy 100% free HD sports channels like Star Sports 1 Hindi, Willow Cricket, beIN Sports & ad-free movies without VPN or subscription.",
  keywords: [
    "live sports stream Nepal",
    "IPL 2025 live free",
    "watch live cricket Nepal",
    "Premier League live stream free",
    "Star Sports 1 Hindi live link",
    "Cricbuzz hd stream free",
    "NBA live HD free Nepal",
    "watch movies free online Nepal",
    "live F1 stream free",
    "beIN sports free link",
    "free live football match Nepal",
    "Nepali live TV online",
    "tika joshi live sports",
    "chill zone gaming cinema"
  ],
  alternates: {
    canonical: "https://www.tikajoshi.com.np/chill-zone",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Watch Live Sports & Movies Free in Nepal | HD Stream IPL, EPL",
    description: "Watch live cricket, football, F1, and NBA instantly. Zero subscription, pure 1080p HD streams for Nepal.",
    url: "https://www.tikajoshi.com.np/chill-zone",
    siteName: "Tikajoshi Chill Zone",
    images: [
      {
        url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200", 
        width: 1200,
        height: 630,
        alt: "Live Sports Streaming Free in Nepal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch Live Sports & Movies Free in Nepal | HD Stream",
    description: "Catch IPL 2025, EPL, and NBA totally free without any VPN or login. HD streaming server enabled.",
    images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200"],
  },
  authors: [{ name: "Tika Joshi" }],
};

export default function ChillLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}