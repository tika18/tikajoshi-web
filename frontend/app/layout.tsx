import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";

const font = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: {
    default: "Tikajoshi - The Ultimate Student & Professional Hub",
    template: "%s | Tikajoshi",
  },
  description:
    "The premier platform engineered for students and professionals. Access engineering notes, university results, live share market data, vehicle comparisons, and premium AI productivity tools.",
  keywords: [
    "IOE notes",
    "Loksewa preparation",
    "TU result checking",
    "NEPSE share market live",
    "SEE result",
    "AI Voice typing",
    "PDF tools",
    "Vehicle comparisons",
    "tikajoshi",
  ],
  metadataBase: new URL("https://www.tikajoshi.com.np"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.tikajoshi.com.np",
    siteName: "Tikajoshi",
    title: "Tikajoshi - The Ultimate Student & Professional Hub",
    description: "Access engineering notes, university results, live share market data, and premium AI tools.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tikajoshi Website Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tikajoshi - Student & Professional Hub",
    description: "Access engineered notes, live market data, and premium AI tools.",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_ID", // TODO: user can replace
    other: {
      "msvalidate.01": "YOUR_BING_WEBMASTER_ID", // TODO: user can replace
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} bg-background text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}