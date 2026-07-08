import { client } from "@/sanity/client";
import Navbar from "@/components/Navbar";
import HeroSearch from "@/components/HeroSearch";
import NepseTicker from "@/components/NepseTicker";
import Link from "next/link";
import Image from "next/image";
import fs from "fs";
import path from "path";
import {
  Zap, GraduationCap, FileText,
  BookOpen, ArrowRight, Clock,
  TrendingUp, Sparkles, Calendar, Tag, ArrowUpRight
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tikajoshi - Nepal's Premium Share Market, Tools & Blog Hub",
  description:
    "Real-time NEPSE updates, live stock market news, upcoming IPO trackers, professional web tools, and educational libraries — all in one place.",
  alternates: { canonical: "https://www.tikajoshi.com.np" },
};

async function getFeaturedVehicles() {
  const query = `*[_type == "vehicle"] | order(_createdAt desc)[0..3] {
    name, "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    price, type, brand
  }`;
  try {
    return await client.fetch(query, {}, { next: { revalidate: 30 } });
  } catch (e) {
    console.error("Sanity vehicles fetch error:", e);
    return [];
  }
}

// Calculate reading time helper
function calculateReadingTime(text: string): string {
  if (!text) return "2 min read";
  const words = text.trim().split(/\s+/).length;
  const time = Math.max(1, Math.ceil(words / 200));
  return `${time} min read`;
}

const MOCK_BLOGS = [
  {
    _id: "mock1",
    title: "NEPSE Index Surges as Commercial Banks Decrease Interest Rates",
    excerpt: "The Nepal Stock Exchange witnessed a strong bullish momentum today, gainers leading the chart as commercial banks announced lower lending rates for the upcoming quarter.",
    category: "NEPSE News",
    publishedAt: new Date().toISOString(),
    slug: "nepse-surges-interest-rates-decrease",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop",
    readingTime: "3 min read"
  },
  {
    _id: "mock2",
    title: "Technical Analysis: NEPSE Chart Patterns & Support Levels",
    excerpt: "A deep dive into the daily chart of NEPSE, analyzing the double bottom breakout, moving averages, and critical support and resistance levels for retail investors.",
    category: "Technical Analysis",
    publishedAt: new Date().toISOString(),
    slug: "technical-analysis-nepse-chart-patterns",
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop",
    readingTime: "5 min read"
  },
  {
    _id: "mock3",
    title: "Upcoming Hydropower & Insurance IPOs to Watch in 2082",
    excerpt: "With multiple insurance and hydropower companies getting approval from SEBON, we review the financials of upcoming IPOs and which ones are worth your investment.",
    category: "IPO Updates",
    publishedAt: new Date().toISOString(),
    slug: "upcoming-hydropower-ipos-watch",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
    readingTime: "4 min read"
  }
];

async function getFeaturedBlogs() {
  let posts: any[] = [];
  
  // 1. Try Sanity CMS
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    try {
      const query = `*[_type == "post" && targetPage == "market"] | order(publishedAt desc)[0..2] {
        _id, title, excerpt, metaDescription, category, publishedAt, body,
        "slug": slug.current,
        "imageUrl": mainImage.asset->url
      }`;
      const data = await client.fetch(query);
      if (Array.isArray(data)) {
        posts = data.map(p => {
          // Extract text from portableText body to estimate reading time
          let bodyText = "";
          if (Array.isArray(p.body)) {
            bodyText = p.body
              .filter((block: any) => block._type === "block" && block.children)
              .map((block: any) => block.children.map((c: any) => c.text).join(" "))
              .join(" ");
          } else if (typeof p.body === "string") {
            bodyText = p.body;
          }
          return {
            _id: p._id,
            title: p.title,
            excerpt: p.metaDescription || p.excerpt || "",
            category: p.category || "NEPSE News",
            publishedAt: p.publishedAt,
            slug: p.slug,
            imageUrl: p.imageUrl,
            readingTime: calculateReadingTime(bodyText)
          };
        });
      }
    } catch (e) {
      console.error("Sanity error on homepage:", e);
    }
  }

  // 2. Try Local Fallback JSON
  try {
    const localDbPath = path.join(process.cwd(), "lib", "db", "blogs.json");
    if (fs.existsSync(localDbPath)) {
      const content = fs.readFileSync(localDbPath, "utf-8");
      const localPosts = JSON.parse(content);
      if (Array.isArray(localPosts)) {
        localPosts.forEach((lp: any) => {
          if (lp.targetPage === "market" && !posts.some(p => p.slug === lp.slug)) {
            posts.push({
              _id: lp.id,
              title: lp.title,
              excerpt: lp.metaDescription || lp.excerpt || "",
              category: lp.category || "NEPSE News",
              publishedAt: lp.publishedAt,
              slug: lp.slug,
              imageUrl: lp.imageUrl,
              readingTime: calculateReadingTime(lp.body)
            });
          }
        });
      }
    }
  } catch (e) {
    console.error("Local JSON error on homepage:", e);
  }

  // Sort by date desc
  posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  return posts.length > 0 ? posts.slice(0, 3) : MOCK_BLOGS;
}

const UPCOMING_IPOS = [
  { company: "Madhya Bhotekoshi Jalbidhyut", sector: "Hydropower", units: "1,500,000", price: "Rs. 100", openDate: "2026-07-10", closeDate: "2026-07-14", status: "Upcoming" },
  { company: "Ghorahi Cement Industry", sector: "Manufacturing", units: "2,000,000", price: "Rs. 435", openDate: "2026-07-05", closeDate: "2026-07-09", status: "Open" },
  { company: "Dish Media Network Ltd.", sector: "Others", units: "1,250,000", price: "Rs. 100", openDate: "2026-06-20", closeDate: "2026-06-24", status: "Closed" },
  { company: "Citizen Life Insurance", sector: "Insurance", units: "5,000,000", price: "Rs. 244", openDate: "2026-07-15", closeDate: "2026-07-19", status: "Upcoming" },
];

const CORE_HUBS = [
  {
    href: "/market",
    title: "NEPSE Market Portal",
    desc: "Real-time stock indices, live price list, advanced technical charts, WACC & SIP calculators.",
    icon: <TrendingUp size={24} />,
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:shadow-emerald-500/5",
    tag: "LIVE DATA"
  },
  {
    href: "/tools",
    title: "Smart Web Toolkit",
    desc: "Nepali date converter, passport photo cropper, image compressors, document converters, and bill calculators.",
    icon: <Zap size={24} />,
    color: "text-violet-400 border-violet-500/20 bg-violet-500/5 hover:border-violet-500/40 hover:shadow-violet-500/5",
    tag: "15+ TOOLS"
  },
  {
    href: "/blog",
    title: "Finance & Tech Blog",
    desc: "Daily stock market news, technical analysis updates, IPO notifications, and technology guides.",
    icon: <FileText size={24} />,
    color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40 hover:shadow-cyan-500/5",
    tag: "SEO INSIGHTS"
  }
];

// Helper to get Category Badge styles
function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case "Technical Analysis":
      return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
    case "IPO Updates":
      return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    case "Vehicles & Tech":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    default: // NEPSE News
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  }
}

export default async function Home() {
  const vehicles = await getFeaturedVehicles();
  const blogs = await getFeaturedBlogs();

  return (
    <div className="min-h-screen text-white overflow-x-hidden bg-[#020409]">
      <Navbar />

      {/* ── HERO ── */}
      <div className="relative z-10">
        <HeroSearch />
      </div>

      {/* ── LIVE NEPSE TAPE/TICKER ── */}
      <NepseTicker />

      {/* ── UPCOMING IPOS WIDGET (AT TOP OF BODY) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-10">
        <div className="border border-white/8 bg-white/[0.015] rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-emerald-400" size={20} />
              <h3 className="text-xl sm:text-2xl font-black text-white">Upcoming & Active IPO Tracker</h3>
            </div>
            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              Live Updates
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Total Units</th>
                  <th className="py-3 px-4">Issue Price</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {UPCOMING_IPOS.map((ipo, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-4 font-bold text-white text-xs sm:text-sm">{ipo.company}</td>
                    <td className="py-4 px-4 text-slate-400 text-xs">{ipo.sector}</td>
                    <td className="py-4 px-4 text-slate-300 text-xs">{ipo.units}</td>
                    <td className="py-4 px-4 font-mono text-emerald-400 text-xs">{ipo.price}</td>
                    <td className="py-4 px-4 text-xs text-slate-400 leading-tight">
                      <div>Open: {ipo.openDate}</div>
                      <div>Close: {ipo.closeDate}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        ipo.status === "Open" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        ipo.status === "Upcoming" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {ipo.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CORE HUBS GRID ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black uppercase tracking-wider text-slate-400 flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-violet-400" /> Core Portals & Directories
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CORE_HUBS.map((hub, i) => (
            <Link
              key={i}
              href={hub.href}
              className={`group relative border rounded-2xl p-6 transition-all duration-300 ${hub.color}`}
            >
              <div className="absolute top-4 right-4 text-[9px] font-black px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                {hub.tag}
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                {hub.icon}
              </div>
              <h3 className="text-lg font-black mb-2 flex items-center gap-1">
                {hub.title} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {hub.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED BLOGS & NEWS (UPGRADED CLICKABLE CARDS TO /MARKET/[SLUG]) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-300 uppercase tracking-widest mb-4">
              📰 Market & Tech Insights
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Featured{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                Articles
              </span>
            </h2>
            <p className="text-slate-400 mt-2">Latest stock analysis, IPO guides, and technology reviews.</p>
          </div>
          <Link href="/market"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold transition group">
            All Articles <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              href={`/market/${blog.slug}`}
              className="group bg-white/[0.02] border border-white/8 hover:border-violet-500/30 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative aspect-[16/10] bg-white/5 overflow-hidden">
                <Image
                  src={blog.imageUrl || "/og-image.jpg"}
                  alt={blog.title}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
                />
                <span className={`absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${getCategoryBadgeClass(blog.category)}`}>
                  <Tag size={9} />
                  {blog.category}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-2 text-[10px] text-slate-500 font-bold">
                  <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} className="text-violet-400" />
                    {blog.readingTime}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-violet-400 transition-colors line-clamp-2 leading-snug">
                  {blog.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {blog.excerpt}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-white transition-colors mt-4 uppercase tracking-wider font-bold">
                  Read Article →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED VEHICLES ── */}
      {vehicles.length > 0 && (
        <section className="relative z-10 border-t border-white/6 bg-white/[0.015] py-24">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">
                  🏍️ Vehicles Nepal
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                  Latest{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                    Reviews
                  </span>
                </h2>
                <p className="text-slate-400 mt-2">Bike, scooter र car को latest price र specs Nepal मा।</p>
              </div>
              <Link href="/vehicles"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/8 border border-white/12 hover:bg-white/12 text-white text-sm font-bold transition shrink-0 group">
                View All <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vehicles.map((vehicle: any) => (
                <Link
                  href={`/vehicles/${vehicle.slug}`}
                  key={vehicle.slug}
                  className="group bg-white/[0.03] border border-white/8 hover:border-blue-500/30 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-white/5">
                    {vehicle.imageUrl ? (
                      <Image
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🏍️</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                      {vehicle.brand}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{vehicle.type}</p>
                    <h3 className="text-base font-black text-white mb-3 group-hover:text-blue-300 transition-colors">
                      {vehicle.name}
                    </h3>
                    <div className="flex items-center justify-between pt-3 border-t border-white/6">
                      <span className="text-base font-black text-green-400">
                        Rs. {Number(vehicle.price).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-600 group-hover:text-blue-400 transition-colors">
                        Review →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── STUDY + RESULTS ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-24 border-t border-white/6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-300 uppercase tracking-widest mb-6">
            📚 Study Hub
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Learn.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Grow.
            </span>
            {" "}Succeed.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Study Library */}
          <Link href="/study"
            className="group relative bg-white/[0.03] border border-white/8 hover:border-emerald-500/30 p-8 md:p-10 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] group-hover:bg-emerald-500/10 transition duration-700" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen size={26} />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Study Library</h3>
              <p className="text-slate-400 mb-6 leading-relaxed text-sm">
                IOE Engineering Notes, Loksewa Preparation, NEB Class 11-12, SEE materials र License exam prep — सबै free।
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["IOE Notes", "Loksewa", "NEB", "License"].map(tag => (
                  <span key={tag} className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 group-hover:gap-3 transition-all">
                Start Reading <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* Results Hub */}
          <Link href="/tools/tu-result"
            className="group relative bg-white/[0.03] border border-white/8 hover:border-blue-500/30 p-8 md:p-10 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] group-hover:bg-blue-500/10 transition duration-700" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap size={26} />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Result Hub</h3>
              <p className="text-slate-400 mb-6 leading-relaxed text-sm">
                TU, IOE, NEB, SEE र NEC License exam results — सबै official sites को direct links एकै ठाउँमा।
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["TU Result", "IOE Result", "NEB", "SEE"].map(tag => (
                  <span key={tag} className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:gap-3 transition-all">
                Check Results <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="text-white font-black text-lg mb-4">tikajoshi<span className="text-violet-400">.</span></h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Nepal's free platform for students and professionals.
              </p>
            </div>
            {[
              { title: "Study", links: [{ name: "IOE Notes", href: "/study/ioe" }, { name: "Loksewa", href: "/study/loksewa" }, { name: "NEB Notes", href: "/study/neb" }, { name: "License", href: "/study/license" }] },
              { title: "Tools", links: [{ name: "TU Result", href: "/tools/tu-result" }, { name: "Voice AI", href: "/tools/voice-to-text" }, { name: "PDF Tools", href: "/tools/img-to-pdf" }, { name: "QR Generator", href: "/tools/qr-generator" }] },
              { title: "Explore", links: [{ name: "Live Sports", href: "/chill-zone" }, { name: "NEPSE Market", href: "/market" }, { name: "Vehicles", href: "/vehicles" }, { name: "News", href: "/news" }] },
            ].map((col, i) => (
              <div key={i}>
                <h5 className="text-white font-bold text-sm mb-4">{col.title}</h5>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link href={link.href} className="text-slate-500 hover:text-white text-xs transition">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/6 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-xs">
              © {new Date().getFullYear()} Tikajoshi. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {[
                { name: "Contact", href: "/contact" },
                { name: "Privacy", href: "/contact" },
                { name: "Login", href: "/login" },
              ].map((l, i) => (
                <Link key={i} href={l.href} className="text-slate-600 hover:text-white text-xs transition">
                  {l.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}