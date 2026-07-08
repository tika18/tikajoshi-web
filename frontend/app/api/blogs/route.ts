import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetPage = searchParams.get("targetPage");

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

        let query = `*[_type == "post"] | order(publishedAt desc)[0..20] {
          _id, title, excerpt, metaDescription, keywords, targetPage, publishedAt, category, body,
          "slug": slug.current,
          "imageUrl": mainImage.asset->url
        }`;

        if (targetPage) {
          query = `*[_type == "post" && targetPage == $targetPage] | order(publishedAt desc)[0..20] {
            _id, title, excerpt, metaDescription, keywords, targetPage, publishedAt, category, body,
            "slug": slug.current,
            "imageUrl": mainImage.asset->url
          }`;
        }

        posts = await sanityClient.fetch(query, targetPage ? { targetPage } : {});
      } catch (e) {
        console.error("Sanity blogs fetch error:", e);
      }
    }

    // 2. Fetch from Local Fallback JSON Database and merge/use if Sanity is offline/empty
    try {
      const localDbPath = path.join(process.cwd(), "lib", "db", "blogs.json");
      if (fs.existsSync(localDbPath)) {
        const content = fs.readFileSync(localDbPath, "utf-8");
        let localPosts = JSON.parse(content);
        if (Array.isArray(localPosts)) {
          if (targetPage) {
            localPosts = localPosts.filter((p: any) => p.targetPage === targetPage);
          }
          
          // Merge local posts ensuring no duplicates by slug
          localPosts.forEach((lp: any) => {
            if (!posts.some(p => p.slug === lp.slug)) {
              posts.push({
                _id: lp.id,
                title: lp.title,
                excerpt: lp.excerpt || lp.metaDescription,
                metaDescription: lp.metaDescription,
                keywords: lp.keywords?.join(", "),
                targetPage: lp.targetPage,
                publishedAt: lp.publishedAt,
                slug: lp.slug,
                imageUrl: lp.imageUrl,
                category: lp.category || "NEPSE News",
                body: lp.body
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

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error("Blogs endpoint error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
