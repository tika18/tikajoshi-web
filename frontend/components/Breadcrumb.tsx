"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumb() {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);

  if (pathNames.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap">
      <Link href="/" className="hover:text-primary flex items-center gap-1"><Home size={14}/> Home</Link>
      {pathNames.map((link, index) => {
        const href = `/${pathNames.slice(0, index + 1).join("/")}`;
        const itemLink = link[0].toUpperCase() + link.slice(1, link.length);
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight size={14} />
            <Link href={href} className={`hover:text-primary ${index === pathNames.length - 1 ? "font-bold text-foreground" : ""}`}>
              {itemLink.replace("-", " ")}
            </Link>
          </div>
        );
      })}
    </div>
  );
}