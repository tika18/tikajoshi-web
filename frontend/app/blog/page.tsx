// app/blog/page.tsx
import { client } from "@/sanity/client";
import Navbar from "@/components/Navbar";
import BlogFilterLayout from "@/components/BlogFilterLayout";
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Premium Finance & Tech Blog — Tikajoshi",
  description: "Nepali share market news, NEPSE technical analysis, upcoming IPO updates, and vehicle tech reviews.",
};

// Calculate reading time helper
function calculateReadingTime(text: string): string {
  if (!text) return "2 min read";
  const words = text.trim().split(/\s+/).length;
  const time = Math.max(1, Math.ceil(words / 200));
  return `${time} min read`;
}

async function getPosts() {
  let posts: any[] = [];
  
  // 1. Try Sanity CMS
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    try {
      const query = `*[_type == "post"] | order(publishedAt desc) {
        _id, title, excerpt, category, publishedAt, body,
        "slug": slug.current,
        "imageUrl": mainImage.asset->url
      }`;
      const data = await client.fetch(query);
      if (Array.isArray(data)) {
        posts = data.map(p => {
          let bodyText = "";
          if (Array.isArray(p.body)) {
            bodyText = p.body
              .filter((block: any) => block._type === "block" && block.children)
              .map((block: any) => block.children.map((c: any) => c.text).join(" "))
              .join(" ");
          } else if (typeof p.body === "string") {
            bodyText = p.body;
          }
          return {
            _id: p._id,
            title: p.title,
            excerpt: p.excerpt || "",
            category: p.category || "NEPSE News",
            publishedAt: p.publishedAt,
            slug: p.slug,
            imageUrl: p.imageUrl,
            readingTime: calculateReadingTime(bodyText)
          };
        });
      }
    } catch (e) {
      console.error("Sanity blogs fetch error:", e);
    }
  }

  // 2. Try Local Fallback JSON Database
  try {
    const localDbPath = path.join(process.cwd(), "lib", "db", "blogs.json");
    if (fs.existsSync(localDbPath)) {
      const content = fs.readFileSync(localDbPath, "utf-8");
      const localPosts = JSON.parse(content);
      if (Array.isArray(localPosts)) {
        localPosts.forEach((lp: any) => {
          if (!posts.some(p => p.slug === lp.slug)) {
            posts.push({
              _id: lp.id,
              title: lp.title,
              excerpt: lp.excerpt || lp.metaDescription || "",
              category: lp.category || "NEPSE News",
              publishedAt: lp.publishedAt,
              slug: lp.slug,
              imageUrl: lp.imageUrl,
              readingTime: calculateReadingTime(lp.body)
            });
          }
        });
      }
    }
  } catch (e) {
    console.error("Local blogs fallback error:", e);
  }

  // Sort by date desc
  posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  return posts;
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-[#020409] text-white selection:bg-violet-500/30 overflow-x-hidden">
      <Navbar />

      {/* ── HEADER ── */}
      <div className="relative pt-32 pb-16 px-4 max-w-6xl mx-auto z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] max-w-[400px] max-h-[400px] rounded-full bg-violet-700/8 blur-[90px] pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-300 uppercase tracking-widest mb-6">
          <BookOpen size={13} className="text-violet-400" /> Premium Reading
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-none">
          Market & Tech{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            Insights
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-xl font-light leading-relaxed">
          Daily stock analysis, technical NEPSE updates, upcoming IPO reports, and technology reviews.
        </p>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-4 pb-20 z-10 relative">
        <BlogFilterLayout initialPosts={posts} />
      </div>

      {/* ── SEO CONTEXT FOOTER ── */}
      <section className="border-t border-white/[0.06] bg-white/[0.005] py-16 mt-12 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">
            Market Guide & Educational Framework
          </h4>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-light">
            Keeping up with the <span className="text-white font-medium">‘nepali share market’</span> or reading a reliable <span className="text-white font-medium">‘share market in nepal’</span> analysis blog can make all the difference in your trading journey. We bring you real-time charting analysis, broker volume updates, and step-by-step guides for Mero Share, SEBON approvals, and trading strategy formulation.
          </p>
        </div>
      </section>
    </div>
  );
}