// frontend/app/vehicles/[slug]/page.tsx

import { client } from "@/sanity/client";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { Metadata } from "next";

// Dynamic SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const query = `*[_type == "vehicle" && slug.current == "${params.slug}"][0]{ seoTitle, seoDescription, name }`;
  const data = await client.fetch(query);
  
  return {
    title: data?.seoTitle || `${data?.name} Price in Nepal - Review`,
    description: data?.seoDescription || `Full specs and price of ${data?.name} in Nepal.`,
  };
}

async function getVehicle(slug: string) {
  const query = `*[_type == "vehicle" && slug.current == "${slug}"][0]{
    name,
    "imageUrl": mainImage.asset->url,
    price,
    type,
    brand,
    mileage,
    engine,
    features,
    description
  }`;
  return await client.fetch(query);
}

export default async function VehicleDetail({ params }: { params: { slug: string } }) {
  const vehicle = await getVehicle(params.slug);

  if (!vehicle) return <div className="text-center py-20">Vehicle not found</div>;

  return (
    <div className="min-h-screen py-12 px-4 bg-background">
      <div className="max-w-5xl mx-auto bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
        {/* Header Image */}
        <div className="relative h-[40vh] md:h-[60vh] w-full">
          {vehicle.imageUrl && (
            <Image 
              src={vehicle.imageUrl} 
              alt={vehicle.name} 
              fill 
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
            <div className="p-8 text-white">
              <span className="bg-primary px-3 py-1 rounded-full text-sm font-bold mb-2 inline-block">
                {vehicle.brand}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-2">{vehicle.name}</h1>
              <p className="text-2xl font-semibold text-green-400">Rs. {vehicle.price}</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left: Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h3 className="text-2xl font-bold text-primary">Overview</h3>
              {vehicle.description && <PortableText value={vehicle.description} />}
            </div>
          </div>

          {/* Right: Specs Card */}
          <div className="lg:col-span-1">
            <div className="bg-muted/50 p-6 rounded-2xl border border-border sticky top-24">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">Quick Specs</h3>
              <ul className="space-y-4">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Engine/Battery</span>
                  <span className="font-semibold">{vehicle.engine || "N/A"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Mileage/Range</span>
                  <span className="font-semibold">{vehicle.mileage || "N/A"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-semibold capitalize">{vehicle.type}</span>
                </li>
              </ul>

              <h3 className="text-xl font-bold mt-8 mb-4 border-b pb-2">Key Features</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {vehicle.features?.map((feature: string, i: number) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}