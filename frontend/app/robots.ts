import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/studio/",   // Sanity CMS interface
          "/login",     // Auth routes
          "/api/",      // Internal API routes
        ],
      },
    ],
    sitemap: "https://www.tikajoshi.com.np/sitemap.xml",
  };
}