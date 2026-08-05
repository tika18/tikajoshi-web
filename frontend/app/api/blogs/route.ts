import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetPage = searchParams.get("targetPage");
    const categoryParam = searchParams.get("category");
    const featuredParam = searchParams.get("featured");

    let posts: any[] = [];

    // 1. Try Sanity CMS
    if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      try {
        const sanityClient = createClient({
          projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID.trim(),
          dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production",
          useCdn: false,
          apiVersion: "2024-01-01",
        });

        let query = `*[_type == "post"] | order(publishedAt desc)[0..30] {
          _id, title, excerpt, metaDescription, keywords, targetPage, publishedAt, category, isFeatured, featured, language, body,
          "slug": slug.current,
          "imageUrl": mainImage.asset->url
        }`;

        posts = await sanityClient.fetch(query);
      } catch (e) {
        console.error("Sanity blogs fetch error:", e);
      }
    }

    // 2. Fetch from Local Fallback JSON Database if present
    try {
      const localDbPath = path.join(process.cwd(), "lib", "db", "blogs.json");
      if (fs.existsSync(localDbPath)) {
        const content = fs.readFileSync(localDbPath, "utf-8");
        const localPosts = JSON.parse(content);
        if (Array.isArray(localPosts)) {
          localPosts.forEach((lp: any) => {
            if (!posts.some((p) => p.slug === lp.slug)) {
              posts.push({
                _id: lp.id || lp._id,
                title: lp.title,
                excerpt: lp.excerpt || lp.metaDescription,
                metaDescription: lp.metaDescription,
                keywords: Array.isArray(lp.keywords) ? lp.keywords.join(", ") : lp.keywords,
                targetPage: lp.targetPage,
                publishedAt: lp.publishedAt || new Date().toISOString(),
                slug: lp.slug,
                imageUrl: lp.imageUrl,
                category: lp.category || "General",
                isFeatured: lp.isFeatured || lp.featured || false,
                language: lp.language || "en",
                body: lp.body,
              });
            }
          });
        }
      }
    } catch (e) {
      console.error("Local blogs fallback fetch error:", e);
    }

    // Sort combined posts by published date desc
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // 3. Apply Filters
    let filtered = [...posts];

    if (featuredParam === "true") {
      const featuredPosts = filtered.filter((p) => p.isFeatured === true || p.featured === true);
      // If specific featured flag exists, use them; otherwise fallback to latest published posts
      filtered = featuredPosts.length > 0 ? featuredPosts : filtered.slice(0, 5);
    }

    if (targetPage) {
      const cleanTarget = targetPage.toLowerCase().replace(/^\//, "");
      if (cleanTarget === "market") {
        const marketCategories = ["market", "share market", "nepse news", "technical analysis", "ipo updates", "nepse"];
        filtered = filtered.filter((p) => {
          const tp = (p.targetPage || "").toLowerCase().replace(/^\//, "");
          const cat = (p.category || "").toLowerCase();
          return tp === "market" || marketCategories.some((mc) => cat.includes(mc));
        });
      } else {
        filtered = filtered.filter((p) => (p.targetPage || "").toLowerCase().replace(/^\//, "") === cleanTarget);
      }
    }

    if (categoryParam) {
      const catLower = categoryParam.toLowerCase();
      filtered = filtered.filter((p) => (p.category || "").toLowerCase().includes(catLower));
    }

    return NextResponse.json({ success: true, posts: filtered, total: filtered.length });
  } catch (error: any) {
    console.error("Blogs endpoint error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
