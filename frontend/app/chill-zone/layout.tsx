import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live IPL, Football & Movies Free | Chill Zone",
  description: "Watch live cricket (IPL, World Cup), live Football (Premier League, La Liga) HD stream for free in Nepal. Enjoy ad-free movies, web series, and join our student community discussion.",
  keywords: [
    "IPL live stream free 2024",
    "live cricket Nepal",
    "watch live football free",
    "Premier league live stream",
    "free movies online Nepal",
    "crichd live cricket",
    "star sports live free",
    "Nepali student community"
  ],
  alternates: {
    canonical: "https://www.tikajoshi.com.np/chill-zone",
  },
  openGraph: {
    title: "Chill Zone - HD Live Sports & Movies (100% Free)",
    description: "Catch the latest IPL match, Football games, and Hollywood/Netflix movies for free. Join the live chat now!",
    url: "https://www.tikajoshi.com.np/chill-zone",
    siteName: "Tika Joshi Web",
    images: [
      {
        url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200", // You can change this to your actual banner image
        width: 1200,
        height: 630,
        alt: "Live Sports Stream",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chill Zone - Live Sports & Movies",
    description: "Watch live cricket, football, and movies for free.",
  },
};

export default function ChillLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}