import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Tikajoshi",
  description:
    "Tikajoshi लाई contact गर्नुस् — suggestions, bug reports, notes request। Email वा WhatsApp बाट।",
  alternates: {
    canonical: "https://www.tikajoshi.com.np/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}