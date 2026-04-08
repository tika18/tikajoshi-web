import { client } from "@/sanity/client";
import Navbar from "@/components/Navbar";
import HeroSearch from "@/components/HeroSearch";
import Link from "next/link";
import Image from "next/image";
import {
  Zap, GraduationCap, Building2,
  FileText, MonitorPlay, ChevronRight,
  BookOpen, Mic, LayoutGrid, PlaySquare,
  Search, ArrowRight, Gauge
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tikajoshi - The Ultimate Student & Professional Hub",
  description:
    "The premier platform for engineering notes, university results, real-time share market data, vehicle comparisons, and AI productivity tools.",
  alternates: {
    canonical: "https://www.tikajoshi.com.np",
  },
};

// Data Fetching for Vehicles (SEO Friendly)
async function getFeaturedVehicles() {
  const query = `*[_type == "vehicle"] | order(_createdAt desc)[0..3] {
    name,
    "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    price,
    type,
    brand
  }`;
  return await client.fetch(query);
}

export default async function Home() {
  const vehicles = await getFeaturedVehicles();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans transition-colors duration-300">
      <Navbar />

      {/* GLOBAL BACKGROUND EFFECTS (Minimal Premium) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[20%] w-[1000px] h-[1000px] rounded-full bg-white/[0.015] blur-[100px]"></div>
      </div>

      {/* 1. HERO SECTION */}
      <div className="relative z-10 border-b border-white/[0.04] bg-gradient-to-b from-transparent to-white/[0.01]">
        <HeroSearch />
      </div>

      {/* 2. MAIN TOOLS GRID (Requested Linear/Vercel Layout) */}
      <section className="px-4 md:px-8 max-w-[1280px] mx-auto py-24 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            <LayoutGrid size={12} /> Explore Platform
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-foreground mb-4">
            Master your productivity.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            A comprehensive suite of tools built for optimal performance. Write, manage, convert, and stream—all meticulously crafted.
          </p>
        </div>

        {/* 4 Square Premium Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Tool 1: Voice AI */}
          <Link href="/tools/voice-to-text" className="group bg-card border border-border hover:border-primary/50 p-8 rounded-[24px] relative overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-foreground/5 border border-border flex items-center justify-center mb-12 group-hover:scale-110 group-hover:bg-foreground text-muted-foreground group-hover:text-background transition-all duration-300">
                <Mic size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground tracking-tight mb-2">Voice AI</h3>
              <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                Advanced voice recognition engineered to seamlessly transcribe your spoken words into structured digital notes.
              </p>
            </div>
          </Link>

          {/* Tool 2: PDF Tools */}
          <Link href="/tools/img-to-pdf" className="group bg-card border border-border hover:border-primary/50 p-8 rounded-[24px] relative overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-foreground/5 border border-border flex items-center justify-center mb-12 group-hover:scale-110 group-hover:bg-foreground text-muted-foreground group-hover:text-background transition-all duration-300">
                <FileText size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground tracking-tight mb-2">PDF Studio</h3>
              <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                Professional grade document manipulation. Merge, convert, and compress standard PDF files rapidly in your browser.
              </p>
            </div>
          </Link>

          {/* Tool 3: Image Compressor */}
          <Link href="/tools/compressor" className="group bg-card border border-border hover:border-primary/50 p-8 rounded-[24px] relative overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-foreground/5 border border-border flex items-center justify-center mb-12 group-hover:scale-110 group-hover:bg-foreground text-muted-foreground group-hover:text-background transition-all duration-300">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground tracking-tight mb-2">Compressor</h3>
              <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                Intelligent image compression algorithms to dramatically reduce file sizes while maintaining absolute visual fidelity.
              </p>
            </div>
          </Link>

          {/* Tool 4: Live Sports */}
          <Link href="/chill-zone" className="group bg-card border border-border hover:border-primary/50 p-8 rounded-[24px] relative overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-foreground/5 border border-border flex items-center justify-center mb-12 group-hover:scale-110 group-hover:bg-foreground text-muted-foreground group-hover:text-background transition-all duration-300">
                <PlaySquare size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground tracking-tight mb-2">Live Sports</h3>
              <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                High-definition live streaming for global sports coverage including Cricket, EPL, and NBA feeds. Zero commercial interruptions.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. PREMIUM VEHICLES SECTION */}
      <section className="py-24 relative z-20 border-y border-border bg-muted/30">
        <div className="px-4 md:px-8 max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter text-foreground mb-3">
                Precision Engineered.
              </h2>
              <p className="text-muted-foreground text-base">
                Explore the latest specifications, pricing, and high-fidelity representations of top-tier vehicles available right now.
              </p>
            </div>
            <Link href="/vehicles" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/80 transition-all group shrink-0">
              Explore Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {vehicles.length > 0 ? (
              vehicles.map((vehicle: any) => (
                <Link
                  href={`/vehicles/${vehicle.slug}`}
                  key={vehicle.slug}
                  className="group block bg-card border border-border hover:border-border/80 rounded-[24px] overflow-hidden transition-all duration-300"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10 opacity-80"></div>
                    {vehicle.imageUrl ? (
                      <Image
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        fill
                        className="object-cover group-hover:scale-[1.03] opacity-80 group-hover:opacity-100 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">Image Unavailable</div>
                    )}
                    
                    <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A0A0A0]">{vehicle.brand}</span>
                    </div>
                  </div>

                   <div className="p-6 relative z-20 -mt-4">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {vehicle.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-4 tracking-tight line-clamp-1">
                      {vehicle.name}
                    </h3>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Base MSRP</p>
                        <p className="text-base font-semibold text-foreground tracking-tight">Rs. {vehicle.price}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background text-muted-foreground transition-all">
                        <ArrowRight size={14} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white/[0.02] border border-white/[0.04] rounded-3xl">
                 <p className="text-slate-400 text-sm">Vehicle catalog currently synchronizing.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. STUDY RESOURCES SECTION */}
      <section className="px-4 md:px-8 max-w-[1280px] mx-auto py-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-10 rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition duration-700"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-foreground border border-border text-background rounded-2xl flex items-center justify-center mb-8">
                <BookOpen size={24} />
              </div>
              <h2 className="text-3xl font-semibold tracking-tighter text-foreground mb-4">Academic Library.</h2>
              <p className="text-muted-foreground text-base mb-10 leading-relaxed max-w-sm">
                Access a highly structured repository of university documents, syllabus mapping, previous examination papers, and preparation guides.
              </p>
              <Link href="/study" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground/80 transition">
                Access Library <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="bg-card border border-border p-10 rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition duration-700"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-foreground border border-border text-background rounded-2xl flex items-center justify-center mb-8">
                <GraduationCap size={24} />
              </div>
              <h2 className="text-3xl font-semibold tracking-tighter text-foreground mb-4">Examination Results.</h2>
              <p className="text-muted-foreground text-base mb-10 leading-relaxed max-w-sm">
                Instantly retrieve and verify your performance metrics for National Board and University Level standardized testing.
              </p>
              <Link href="/tools/tu-result" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground/80 transition">
                Check Results <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-16 text-center bg-background">
        <h3 className="text-lg font-bold text-foreground tracking-tight mb-2">tikajoshi.</h3>
        <p className="text-muted-foreground text-xs font-medium">
          © {new Date().getFullYear()} Tikajoshi Web. All rights reserved.
        </p>
      </footer>
    </div>
  );
}