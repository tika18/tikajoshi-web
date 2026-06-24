import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Zap, TrendingUp } from "lucide-react";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Bike & Car Price in Nepal 2081 - Latest Vehicle Reviews | Tikajoshi",
  description:
    "Latest bike, scooter and car prices in Nepal 2081. Compare specs, features and reviews of Hero, Bajaj, Honda, Yamaha, TVS, Royal Enfield and electric vehicles.",
  keywords: [
    "bike price Nepal 2081",
    "car price Nepal",
    "Hero bike price Nepal",
    "Bajaj Pulsar price Nepal",
    "electric scooter Nepal",
    "vehicle review Nepal",
  ],
  alternates: { canonical: "https://www.tikajoshi.com.np/vehicles" },
};

async function getVehicles() {
  const query = `*[_type == "vehicle"] | order(_createdAt desc) {
    name,
    "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    price,
    type,
    brand
  }`;
  return await client.fetch(query, {}, { next: { revalidate: 30 } });
}

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <div className="min-h-screen bg-[#070c14] text-white">
      <Navbar />

      {/* HERO */}
      <div className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-violet-600/5 to-transparent pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-violet-600/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-xs font-bold text-blue-300 uppercase tracking-widest mb-6">
            🏍️ Nepal Vehicle Reviews
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Latest{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              Vehicles
            </span>
            {" "}Nepal
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
            Bike, Scooter र Car को latest price, specs र reviews — सबै एकै ठाउँमा।
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white/4 border border-white/8 px-4 py-2 rounded-full text-xs text-slate-400">
              <TrendingUp size={12} className="text-green-400" />
              {vehicles.length} Vehicles Listed
            </div>
            <div className="flex items-center gap-2 bg-white/4 border border-white/8 px-4 py-2 rounded-full text-xs text-slate-400">
              <Zap size={12} className="text-yellow-400" />
              Updated Daily
            </div>
          </div>
        </div>
      </div>

      {/* VEHICLE GRID */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">

        {vehicles.length === 0 ? (
          <div className="text-center py-24 bg-white/2 border border-dashed border-white/8 rounded-2xl">
            <div className="text-5xl mb-3">🏍️</div>
            <p className="text-slate-500 font-medium">No vehicles added yet.</p>
            <p className="text-slate-600 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle: any) => (
              <Link
                href={`/vehicles/${vehicle.slug}`}
                key={vehicle.slug}
                className="group relative bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-video relative overflow-hidden bg-white/5">
                  {vehicle.imageUrl ? (
                    <Image
                      src={vehicle.imageUrl}
                      alt={vehicle.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-4xl">
                      🏍️
                    </div>
                  )}
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur border border-white/10 text-white text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
                    {vehicle.type}
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                    {vehicle.brand}
                  </p>
                  <h2 className="text-lg font-black text-white mb-3 group-hover:text-blue-300 transition-colors leading-tight">
                    {vehicle.name}
                  </h2>
                  <div className="flex items-center justify-between pt-3 border-t border-white/6">
                    <span className="text-lg font-black text-green-400">
                      Rs. {Number(vehicle.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 group-hover:text-blue-400 transition-colors font-medium">
                      Read Review →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-16 p-6 bg-white/2 border border-white/6 rounded-2xl">
          <h2 className="text-lg font-black text-white mb-3">
            Nepal मा Bike र Car को Latest Price 2081 🏍️
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Tikajoshi मा Nepal को सबै popular bikes र cars को{" "}
            <strong className="text-slate-300">latest price, specifications र reviews</strong> पाउनुहुन्छ।
            Hero, Bajaj, Honda, Yamaha, TVS, Royal Enfield र electric vehicles सबैको
            detailed comparison — price list updated daily।
          </p>
        </div>
      </div>
    </div>
  );
}