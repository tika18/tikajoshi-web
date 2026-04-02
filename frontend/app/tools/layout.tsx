import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online Tools - PDF, Image, QR Code, Voice AI",
  description:
    "Free online tools for Nepali students — PDF merge/convert, image compressor, QR generator, voice to text, TU result checker र थप।",
  keywords: [
    "free PDF tools Nepal",
    "image compressor online",
    "QR code generator Nepal",
    "TU result check",
    "voice to text Nepali",
    "Image compressor",
    "Image resize",
    
  ],
  alternates: {
    canonical: "https://www.tikajoshi.com.np/tools",
  },
  openGraph: {
    title: "Free Online Tools Nepal",
    description: "PDF, Image, QR, Voice AI — सबै tools free।",
    url: "https://www.tikajoshi.com.np/tools",
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}