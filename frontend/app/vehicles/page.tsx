// frontend/app/vehicles/page.tsx

import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

// SEO
export const metadata: Metadata = {
  title: "Vehicle Reviews & Prices in Nepal | Tika Joshi",
  description: "Latest bikes, scooters, and cars price in Nepal. Read detailed reviews, specs, and features.",
};

// Data Fetching
async function getVehicles() {
  const query = `*[_type == "vehicle"] | order(_createdAt desc) {
    name,
    "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    price,
    type,
    brand
  }`;
  return await client.fetch(query);
}

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-16 bg-background">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Latest Vehicle Reviews
        </h1>
        <p className="text-muted-foreground mb-10 text-lg">
          Check out the latest prices and features of bikes and cars in Nepal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle: any) => (
            <Link 
              href={`/vehicles/${vehicle.slug}`} 
              key={vehicle.slug}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-video relative overflow-hidden">
                {vehicle.imageUrl ? (
                  <Image
                    src={vehicle.imageUrl}
                    alt={vehicle.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
                )}
                <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full uppercase font-bold">
                  {vehicle.type}
                </div>
              </div>
              
              <div className="p-5">
                <p className="text-sm text-accent font-semibold uppercase tracking-wide mb-1">
                  {vehicle.brand}
                </p>
                <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {vehicle.name}
                </h2>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    Rs. {vehicle.price}
                  </span>
                  <span className="text-sm text-muted-foreground">Read Review →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}