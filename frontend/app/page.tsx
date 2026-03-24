import { client } from "@/sanity/client";
import Navbar from "@/components/Navbar"; // Ensure you have this component
import HeroSearch from "@/components/HeroSearch"; // We just created this
import Link from "next/link";
import Image from "next/image";
import {
  Zap, GraduationCap, Building2,
  FileText, MonitorPlay,
  BookOpen, Mic
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tikajoshi - Nepal's Student & Professional Hub",
  description:
    "IOE Notes, Loksewa Prep, TU Results, Share Market, Vehicle Reviews - Nepal को best student platform।",
  alternates: {
    canonical: "https://www.tikajoshi.com.np",
  },
};

// Data Fetching for Vehicles (SEO Friendly)
async function getFeaturedVehicles() {
  const query = `*[_type == "vehicle"] | order(_createdAt desc)[0..5] {
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
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-violet-500/30 font-sans overflow-x-hidden">
      <Navbar />

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/20 blur-[120px] mix-blend-screen"></div>
      </div>

      {/* 1. HERO SECTION (With Search) */}
      <HeroSearch />

      {/* 2. MOBILE QUICK LINKS (Old Code) */}
      <section className="px-4 max-w-7xl mx-auto mb-10 md:hidden relative z-10">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link href="/study" className="glass-card p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center">
            <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-xl mb-2"><BookOpen size={20} /></div>
            <span className="font-bold text-xs text-slate-300">Study</span>
          </Link>
          <Link href="/tools/voice-to-text" className="glass-card p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center">
            <div className="bg-violet-500/20 text-violet-400 p-3 rounded-xl mb-2"><Mic size={20} /></div>
            <span className="font-bold text-xs text-slate-300">Voice AI</span>
          </Link>
          <Link href="/vehicles" className="glass-card p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-500/20 text-blue-400 p-3 rounded-xl mb-2"><Zap size={20} /></div>
            <span className="font-bold text-xs text-slate-300">Vehicles</span>
          </Link>
        </div>
      </section>

      {/* 3. MAIN TOOLS GRID (Old Code) */}
      <section className="px-6 max-w-7xl mx-auto mb-20 hidden md:block relative z-10">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Explore Tools</p>
        <div className="grid grid-cols-4 gap-6">
          <Link href="/tools/voice-to-text" className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-violet-500/50 transition group text-center hover:-translate-y-2 duration-300">
            <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-violet-400 group-hover:scale-110 group-hover:bg-violet-500/20 transition"><Mic size={28} /></div>
            <h3 className="font-bold text-white text-lg">Voice AI</h3>
            <p className="text-sm text-slate-500 mt-2">Speak to check results or write notes naturally.</p>
          </Link>

          <Link href="/tools/compressor" className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-yellow-500/50 transition group text-center hover:-translate-y-2 duration-300">
            <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-yellow-500 group-hover:scale-110 group-hover:bg-yellow-500/20 transition"><Zap size={28} /></div>
            <h3 className="font-bold text-white text-lg">Compressor</h3>
            <p className="text-sm text-slate-500 mt-2">Reduce image size without losing quality.</p>
          </Link>

          <Link href="/tools/img-to-pdf" className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-red-500/50 transition group text-center hover:-translate-y-2 duration-300">
            <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-red-500 group-hover:scale-110 group-hover:bg-red-500/20 transition"><FileText size={28} /></div>
            <h3 className="font-bold text-white text-lg">PDF Tools</h3>
            <p className="text-sm text-slate-500 mt-2">Convert, Merge and Manage documents.</p>
          </Link>

          <Link href="/chill-zone" className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-pink-500/50 transition group text-center hover:-translate-y-2 duration-300">
            <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-pink-500 group-hover:scale-110 group-hover:bg-pink-500/20 transition"><MonitorPlay size={28} /></div>
            <h3 className="font-bold text-white text-lg">Chill Zone</h3>
            <p className="text-sm text-slate-500 mt-2">Watch Live Sports & Movies for free.</p>
          </Link>
        </div>
      </section>

      {/* 4. NEW VEHICLE SECTION (Bigyann Style) - DAMI DESIGN */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#02040a] to-[#0f172a] relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  Featured Machines
                </span>
              </h2>
              <p className="text-gray-400">Compare specs, price and features of latest vehicles.</p>
            </div>
            <Link href="/vehicles" className="hidden md:block px-6 py-2 border border-blue-500/30 rounded-full text-blue-400 hover:bg-blue-500/10 transition">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.length > 0 ? (
              vehicles.map((vehicle: any) => (
                <Link
                  href={`/vehicles/${vehicle.slug}`}
                  key={vehicle.slug}
                  className="group relative bg-[#1e293b]/40 border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-gray-800">
                    {vehicle.imageUrl ? (
                      <Image
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                    )}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <span className="text-xs font-bold uppercase tracking-wider text-white">{vehicle.type}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-bold text-blue-400 uppercase mb-1">{vehicle.brand}</p>
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                      {vehicle.name}
                    </h3>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <p className="text-lg font-bold text-green-400">Rs. {vehicle.price}</p>
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <Zap size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-white/5 rounded-2xl border border-dashed border-gray-700">
                <p className="text-gray-400">No vehicles added yet. Check Sanity Studio.</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/vehicles" className="inline-block w-full py-3 border border-white/20 rounded-xl text-white">View All Vehicles</Link>
          </div>
        </div>
      </section>

      {/* 5. STUDY & RESULT HUB (Old Code - Preserved) */}
      <section className="px-6 max-w-7xl mx-auto py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#0f172a]/80 border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-blue-500/50 transition">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6"><div className="bg-blue-600/20 text-blue-400 p-3 rounded-2xl"><GraduationCap size={32} /></div><h2 className="text-3xl font-bold">Result Hub</h2></div>
              <p className="text-slate-400 mb-8 text-lg">Check results for IOE, TU, NEB, SEE and License exams instantly.</p>
              <Link href="/tools/tu-result" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition inline-block">Check Results</Link>
            </div>
          </div>

          <div className="bg-[#0f172a]/80 border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/50 transition">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] group-hover:bg-emerald-600/20 transition"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6"><div className="bg-emerald-600/20 text-emerald-400 p-3 rounded-2xl"><Building2 size={32} /></div><h2 className="text-3xl font-bold">Study Library</h2></div>
              <p className="text-slate-400 mb-8 text-lg">Engineering Notes, Syllabus, Old Questions, and Loksewa Prep materials.</p>
              <Link href="/study" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition inline-block">Start Reading</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black/20 py-12 text-center text-slate-500 text-sm relative z-10">
        <p>© 2025 Tikajoshi Web. All rights reserved.</p>
      </footer>
    </div>
  );
}