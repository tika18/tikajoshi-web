import { MetadataRoute } from 'next';
import { client } from '@/sanity/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.tikajoshi.com.np';

  const staticRoutes = [
    { url: baseUrl, priority: 1, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/study`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/study/ioe`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/study/loksewa`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/study/neb`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/study/license`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/tools`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/tools/voice-to-text`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/tools/qr-generator`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/tools/merge-pdf`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/tools/tu-result`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/tools/compressor`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/tools/img-to-pdf`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/tools/emi-calculator`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/market`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/market/forex`, priority: 0.7, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/news`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/quiz`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/chill-zone`, priority: 0.6, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/vehicles`, priority: 0.6, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/contact`, priority: 0.4, changeFrequency: 'monthly' as const },
  ].map((route) => ({
    ...route,
    lastModified: new Date(),
  }));

  // Dynamic vehicle pages from Sanity
  let vehicleRoutes: MetadataRoute.Sitemap = [];
  try {
    const vehicles = await client.fetch(
      `*[_type == "vehicle"]{ "slug": slug.current, _updatedAt }`
    );
    vehicleRoutes = vehicles.map((vehicle: any) => ({
      url: `${baseUrl}/vehicles/${vehicle.slug}`,
      lastModified: new Date(vehicle._updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error('Sitemap: vehicle fetch failed', e);
  }

  return [...staticRoutes, ...vehicleRoutes];
}
