import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IOE Notes Free Download Nepal 2081 - Loksewa Prep | Tikajoshi",
  description:
    "Free IOE engineering notes, Loksewa preparation 2081, NEB class 11-12 notes, SEE materials. TU syllabus, old questions free download Nepal.",
  keywords: [
    "IOE notes free download Nepal",
    "Loksewa preparation 2081",
    "NEB notes class 11 12 free",
    "engineering notes Nepal free",
    "TU notes Nepal",
    "SEE preparation Nepal",
    "license exam preparation Nepal",
    "Loksewa Aayog 2081",
  ],
  alternates: { canonical: "https://www.tikajoshi.com.np/study" },
  openGraph: {
    title: "Free IOE Notes & Loksewa Prep Nepal 2081",
    description: "IOE notes, Loksewa prep, NEB notes — सबै free download।",
    url: "https://www.tikajoshi.com.np/study",
  },
};

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}