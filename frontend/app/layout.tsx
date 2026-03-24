import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  // ✅ Title Template - हरेक page ले " | Tikajoshi" automatically पाउँछ
  title: {
    default: "Tikajoshi - Nepal's Student & Professional Hub",
    template: "%s | Tikajoshi",
  },

  // ✅ Description - 150-160 characters, Nepali keywords भित्र
  description:
    "Nepal को best platform for IOE notes, Loksewa prep, Share Market, TU results, vehicle reviews, and smart tools. Students देखि professionals सम्म सबैको लागि।",

  // ✅ Keywords - Google हेर्छ
  keywords: [
    "IOE notes Nepal",
    "Loksewa preparation",
    "TU result 2081",
    "Nepal share market",
    "SEE result",
    "NEB notes",
    "Nepal vehicle price",
    "tikajoshi",
  ],

  // ✅ Canonical URL - duplicate content रोक्छ
  metadataBase: new URL("https://www.tikajoshi.com.np"),
  alternates: {
    canonical: "/",
  },

  // ✅ OpenGraph - Facebook, WhatsApp, LinkedIn share preview
  openGraph: {
    type: "website",
    locale: "ne_NP",
    url: "https://www.tikajoshi.com.np",
    siteName: "Tikajoshi",
    title: "Tikajoshi - Nepal's Student & Professional Hub",
    description:
      "IOE Notes, Loksewa Prep, Share Market, TU Results, Vehicle Reviews - सबै एकै ठाउँमा।",
    images: [
      {
        url: "/og-image.jpg", // 1200x630px image — हामी पछि बनाउँछौं
        width: 1200,
        height: 630,
        alt: "Tikajoshi - Nepal Student Hub",
      },
    ],
  },

  // ✅ Twitter/X Card
  twitter: {
    card: "summary_large_image",
    title: "Tikajoshi - Nepal's Student & Professional Hub",
    description:
      "IOE Notes, Loksewa Prep, Share Market, TU Results - सबै एकै ठाउँमा।",
    images: ["/og-image.jpg"],
  },

  // ✅ Google ले index गरोस्
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },

  // ✅ Site Verification (Google Search Console को लागि - पछि add गर्छौं)
  // verification: {
  //   google: "YOUR_GOOGLE_VERIFICATION_CODE",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ne" suppressHydrationWarning>
      <body
        className={`${font.className} bg-background text-foreground antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}