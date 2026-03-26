import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Materials Nepal - IOE, Loksewa, NEB Notes",
  description:
    "Free engineering notes, Loksewa preparation materials, NEB syllabus, SEE notes र license exam prep — सबै एकै ठाउँमा।",
  keywords: [
    "IOE notes Nepal",
    "Loksewa preparation 2081",
    "NEB notes class 11 12",
    "engineering notes free download",
    "TU notes Nepal",
  ],
  alternates: {
    canonical: "https://www.tikajoshi.com.np/study",
  },
  openGraph: {
    title: "Study Materials Nepal - IOE, Loksewa, NEB",
    description: "Free notes र materials — Engineering, Loksewa, NEB सबैको लागि।",
    url: "https://www.tikajoshi.com.np/study",
  },
};

export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}