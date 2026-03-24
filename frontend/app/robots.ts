import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // ✅ यी pages Google ले index गर्नु हुँदैन
        disallow: [
          "/studio/",   // Sanity CMS - private
          "/login",     // Login page - user data
          "/api/",      // API routes - not for Google
        ],
      },
    ],
    sitemap: "https://www.tikajoshi.com.np/sitemap.xml",
  };
}