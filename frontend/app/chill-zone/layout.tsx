import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chill Zone - Live Sports, Movies & Community",
  description:
    "Watch live cricket, football, IPL, Premier League for free। Plus movies, series र student community posts।",
  keywords: [
    "live cricket Nepal",
    "IPL live stream free",
    "Premier League live",
    "free movies Nepal",
    "live sports stream Nepal",
  ],
  alternates: {
    canonical: "https://www.tikajoshi.com.np/chill-zone",
  },
  openGraph: {
    title: "Chill Zone - Live Sports & Movies Free",
    description: "Cricket, Football, Movies — सबै free।",
    url: "https://www.tikajoshi.com.np/chill-zone",
  },
};

export default function ChillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}