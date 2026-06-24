import { MetadataRoute } from 'next';
import { client } from '@/sanity/client';
import fs from 'fs';
import path from 'path';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.tikajoshi.com.np';

  // Base static routes
  const staticRoutes = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/study`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/study/ioe`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/study/loksewa`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/study/neb`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/study/license`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/tools`, priority: 0.8, changeFrequency: 'weekly' as const },
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

  // Dynamic tools discovery
  const toolRoutes: MetadataRoute.Sitemap = [];
  try {
    const toolsDir = path.join(process.cwd(), 'app', 'tools');
    if (fs.existsSync(toolsDir)) {
      const files = fs.readdirSync(toolsDir);
      files.forEach((file) => {
        const pagePath = path.join(toolsDir, file, 'page.tsx');
        if (fs.existsSync(pagePath)) {
          toolRoutes.push({
            url: `${baseUrl}/tools/${file}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          });
        }
      });
    }
  } catch (e) {
    console.error('Sitemap: tools scan failed', e);
  }

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

  // Dynamic blog post pages from Sanity & Fallback store
  const blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await client.fetch(
      `*[_type == "post"]{ "slug": slug.current, _updatedAt }`
    );
    posts.forEach((post: any) => {
      blogRoutes.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post._updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      });
    });
  } catch (e) {
    console.error('Sitemap: post fetch failed', e);
  }

  // Scan local blogs database fallback
  try {
    const localDbPath = path.join(process.cwd(), 'lib', 'db', 'blogs.json');
    if (fs.existsSync(localDbPath)) {
      const content = fs.readFileSync(localDbPath, 'utf-8');
      const localPosts = JSON.parse(content);
      if (Array.isArray(localPosts)) {
        localPosts.forEach((post: any) => {
          const url = `${baseUrl}/blog/${post.slug}`;
          if (!blogRoutes.some((r) => r.url === url)) {
            blogRoutes.push({
              url,
              lastModified: new Date(post.publishedAt || Date.now()),
              changeFrequency: 'weekly' as const,
              priority: 0.8,
            });
          }
        });
      }
    }
  } catch (e) {
    console.error('Sitemap: local fallback check failed', e);
  }

  return [...staticRoutes, ...toolRoutes, ...vehicleRoutes, ...blogRoutes];
}
