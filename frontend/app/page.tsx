import { client } from "@/sanity/client";
import Navbar from "@/components/Navbar";
import HeroSearch from "@/components/HeroSearch";
import Link from "next/link";
import Image from "next/image";
import {
  Zap, GraduationCap, Building2, FileText,
  MonitorPlay, BookOpen, Mic, ArrowRight,
  TrendingUp, Shield, Globe, Sparkles
} from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Tikajoshi - Nepal's #1 Student & Professional Hub",
  description:
    "Free IOE notes, Loksewa prep, NEPSE live, TU results, IPL live stream, vehicle reviews — सबै एकै ठाउँमा।",
  alternates: { canonical: "https://www.tikajoshi.com.np" },
};

async function getFeaturedVehicles() {
  const query = `*[_type == "vehicle"] | order(_createdAt desc)[0..3] {
    name, "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    price, type, brand
  }`;
  return await client.fetch(query, {}, { next: { revalidate: 30 } });
}

export default async function Home() {
  const vehicles = await getFeaturedVehicles();

  return (
    <div className="min-h-screen bg-[#050810] text-white overflow-x-hidden">
      <Navbar />

      {/* ── AURORA BACKGROUND ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[30%] w-[500px] h-[500px] rounded-full bg-cyan-600/5 blur-[120px]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      </div>

      {/* ── HERO ── */}
      <div className="relative z-10">
        <HeroSearch />
      </div>

      {/* ── STATS BAR ── */}
      <div className="relative z-10 border-y border-white/6 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
            {[
              { label: "Free Tools", value: "15+", icon: "⚡" },
              { label: "Live Channels", value: "15+", icon: "📺" },
              { label: "Students Helped", value: "10K+", icon: "🎓" },
              { label: "Always Free", value: "100%", icon: "🔓" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <p className="text-lg font-black text-white leading-none">{s.value}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TOOLS SECTION ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-300 uppercase tracking-widest mb-6">
            <Sparkles size={12} /> Smart Tools
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Everything you need.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              All free.
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Professional-grade tools built for Nepali students and professionals.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              href: "/tools/voice-to-text",
              icon: <Mic size={22} />,
              title: "Voice AI",
              desc: "Speak to transcribe notes, check results naturally.",
              color: "violet",
              glow: "group-hover:shadow-violet-500/20",
              border: "group-hover:border-violet-500/40",
              iconBg: "bg-violet-500/10 text-violet-400",
              badge: "AI",
            },
            {
              href: "/tools/img-to-pdf",
              icon: <FileText size={22} />,
              title: "PDF Studio",
              desc: "Merge, convert and compress documents instantly.",
              color: "blue",
              glow: "group-hover:shadow-blue-500/20",
              border: "group-hover:border-blue-500/40",
              iconBg: "bg-blue-500/10 text-blue-400",
              badge: null,
            },
            {
              href: "/tools/compressor",
              icon: <Zap size={22} />,
              title: "Compressor",
              desc: "Reduce image size without losing quality.",
              color: "yellow",
              glow: "group-hover:shadow-yellow-500/20",
              border: "group-hover:border-yellow-500/40",
              iconBg: "bg-yellow-500/10 text-yellow-400",
              badge: null,
            },
            {
              href: "/chill-zone",
              icon: <MonitorPlay size={22} />,
              title: "Live Sports",
              desc: "IPL, EPL, NBA, F1 — 15+ HD channels free.",
              color: "red",
              glow: "group-hover:shadow-red-500/20",
              border: "group-hover:border-red-500/40",
              iconBg: "bg-red-500/10 text-red-400",
              badge: "LIVE",
            },
          ].map((tool, i) => (
            <Link
              key={i}
              href={tool.href}
              className={`group relative bg-white/[0.03] border border-white/8 ${tool.border} rounded-2xl p-6 hover:-translate-y-1 hover:shadow-2xl ${tool.glow} transition-all duration-300 overflow-hidden`}
            >
              {/* Glow bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                {tool.badge && (
                  <span className="absolute top-0 right-0 text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
                    {tool.badge}
                  </span>
                )}
                <div className={`w-12 h-12 rounded-xl ${tool.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="text-base font-black text-white mb-2">{tool.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                  {tool.desc}
                </p>
                <div className="flex items-center gap-1 mt-4 text-xs font-bold text-slate-600 group-hover:text-white transition-colors">
                  Open Tool <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* All tools link */}
        <div className="text-center mt-8">
          <Link href="/tools" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition font-medium">
            View all tools <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── FEATURED VEHICLES ── */}
      <section className="relative z-10 border-y border-white/6 bg-white/[0.015] py-24">
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

          {vehicles.length === 0 ? (
            <div className="text-center py-16 bg-white/2 border border-dashed border-white/8 rounded-2xl">
              <p className="text-slate-500">🏍️ Vehicles loading...</p>
            </div>
          ) : (
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
          )}
        </div>
      </section>

      {/* ── STUDY + RESULTS ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-24">
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

      {/* ── MARKET SECTION ── */}
      <section className="relative z-10 border-t border-white/6 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-24">
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/market"
              className="group md:col-span-2 relative bg-white/[0.03] border border-white/8 hover:border-cyan-500/30 p-8 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-[100px] group-hover:bg-cyan-500/10 transition duration-700" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-300 uppercase tracking-widest mb-6">
                  📈 Live Market
                </div>
                <h3 className="text-3xl font-black text-white mb-3">NEPSE Live</h3>
                <p className="text-slate-400 text-sm mb-6">Real-time NEPSE chart, share prices, forex rates र stock market analysis।</p>
                <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
                  View Market <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            <Link href="/news"
              className="group relative bg-white/[0.03] border border-white/8 hover:border-violet-500/30 p-8 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-[80px] group-hover:bg-violet-500/10 transition duration-700" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-300 uppercase tracking-widest mb-6">
                  📰 Latest
                </div>
                <h3 className="text-3xl font-black text-white mb-3">News Hub</h3>
                <p className="text-slate-400 text-sm mb-6">Nepal र world को latest news updates।</p>
                <div className="flex items-center gap-2 text-sm font-bold text-violet-400">
                  Read News <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-24">
        <div className="relative bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-cyan-600/10 border border-white/10 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
              Start for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                free.
              </span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of Nepali students using Tikajoshi every day. No signup required.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/study"
                className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white rounded-full font-bold text-sm transition shadow-lg shadow-violet-500/20">
                Explore Study Hub →
              </Link>
              <Link href="/chill-zone"
                className="px-8 py-3.5 bg-white/8 hover:bg-white/12 border border-white/12 text-white rounded-full font-bold text-sm transition">
                Watch Live Sports 🏏
              </Link>
            </div>
          </div>
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