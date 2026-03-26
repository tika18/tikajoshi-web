import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
// Context Imports
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext"; // यो नयाँ थपिएको हो

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tikajoshi - Nepal's #1 Student Utility Hub",
  description: "Engineering Notes, Loksewa Prep, Share Market & Tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} bg-background text-foreground antialiased`}>
        
        {/* 1. सबभन्दा बाहिर Theme (Dark Mode) */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          
          {/* 2. त्यसभित्र Auth (Login System) - यो नयाँ थपियो */}
          <AuthProvider>
            
            {/* 3. त्यसभित्र Language (Nepali/English) */}
            <LanguageProvider>
              {children}
            </LanguageProvider>

          </AuthProvider>

        </ThemeProvider>
      </body>
    </html>
  );
}