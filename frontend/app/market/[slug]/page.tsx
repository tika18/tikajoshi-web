import { client } from "@/sanity/client";
import Navbar from "@/components/Navbar";
import EngagementSection from "@/components/EngagementSection";
import Image from "next/image";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, User, ArrowLeft, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

interface LocalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  bodyHtml?: string;
  imageUrl: string;
  secondaryImages?: string[];
  category?: string;
  likes?: number;
  comments?: any[];
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  publishedAt: string;
}

// Fetch single post helper (Sanity CMS with Local fallback)
async function getPostData(slug: string): Promise<LocalPost | null> {
  // 1. Try Sanity
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    try {
      const query = `*[_type == "post" && slug.current == $slug][0]{
        _id, title, excerpt, publishedAt, body, category,
        "imageUrl": mainImage.asset->url,
        "secondaryImages": secondaryImages[] { asset->url },
        likes, comments, seoTitle, seoDescription, keywords
      }`;
      const post = await client.fetch(query, { slug });
      if (post) {
        return {
          id: post._id,
          title: post.title,
          slug: slug,
          excerpt: post.excerpt || "",
          body: typeof post.body === "string" ? post.body : "",
          imageUrl: post.imageUrl || "/og-image.jpg",
          secondaryImages: Array.isArray(post.secondaryImages) ? post.secondaryImages.map((img: any) => img.asset?.url).filter(Boolean) : [],
          category: post.category || "NEPSE News",
          likes: post.likes || 0,
          comments: post.comments || [],
          seoTitle: post.seoTitle || post.title,
          metaDescription: post.seoDescription || post.excerpt || "",
          keywords: typeof post.keywords === "string" ? post.keywords.split(",").map((k: string) => k.trim()) : [],
          publishedAt: post.publishedAt || new Date().toISOString(),
        };
      }
    } catch (e) {
      console.error("Sanity single post fetch error:", e);
    }
  }

  // 2. Local Fallback
  try {
    const localDbPath = path.join(process.cwd(), "lib", "db", "blogs.json");
    if (fs.existsSync(localDbPath)) {
      const content = fs.readFileSync(localDbPath, "utf-8");
      const posts = JSON.parse(content);
      if (Array.isArray(posts)) {
        const found = posts.find((p: any) => p.slug === slug);
        if (found) {
          return {
            id: found.id,
            title: found.title,
            slug: found.slug,
            excerpt: found.excerpt || "",
            body: found.body || "",
            bodyHtml: found.bodyHtml,
            imageUrl: found.imageUrl || "/og-image.jpg",
            secondaryImages: found.secondaryImages || [],
            category: found.category || "NEPSE News",
            likes: found.likes || 0,
            comments: found.comments || [],
            seoTitle: found.seoTitle || found.title,
            metaDescription: found.metaDescription || found.excerpt || "",
            keywords: found.keywords || [],
            publishedAt: found.publishedAt,
          };
        }
      }
    }
  } catch (e) {
    console.error("Local single post fetch error:", e);
  }

  return null;
}

// generateMetadata for Dynamic SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostData(params.slug);
  if (!post) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords?.join(", ") || "",
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [{ url: post.imageUrl }],
    },
  };
}

export default async function MarketBlogDetail({ params }: { params: { slug: string } }) {
  const post = await getPostData(params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />

      {/* Main Hero Header */}
      <div className="relative h-[45vh] w-full mt-16 overflow-hidden">
        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover opacity-35"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020817]/20 via-transparent to-[#020817]" />
        
        <div className="absolute bottom-0 inset-x-0 max-w-4xl mx-auto px-4 pb-8 flex flex-col justify-end h-full">
          <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 max-w-fit mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-md">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 flex-wrap text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-emerald-400" />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-cyan-400" />
              <span>By Tikajoshi Editorial</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 pb-24">
        {/* Navigation back */}
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors mb-8 font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={14} /> Back to NEPSE Market
        </Link>

        {/* Content & Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Article Content */}
            <article 
              className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed font-sans text-sm sm:text-base
                prose-headings:font-black prose-headings:text-white
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-p:mb-6 prose-strong:text-white prose-a:text-cyan-400"
            >
              {post.bodyHtml ? (
                <div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
              ) : (
                <div className="whitespace-pre-line">{post.body}</div>
              )}
            </article>

            {/* Secondary Images Gallery */}
            {post.secondaryImages && post.secondaryImages.length > 0 && (
              <div className="space-y-4 pt-8 border-t border-white/5">
                <h3 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wider">
                  <ImageIcon size={18} className="text-cyan-400" /> Additional Media Gallery
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {post.secondaryImages.map((img, i) => (
                    <div key={i} className="relative aspect-[16/10] bg-white/5 rounded-xl overflow-hidden border border-white/5 group">
                      <Image
                        src={img}
                        alt={`${post.title} gallery image ${i + 1}`}
                        fill
                        className="object-cover opacity-80 hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement Panel (Likes & Comments) */}
            <EngagementSection
              slug={post.slug}
              initialLikes={post.likes || 0}
              initialComments={post.comments || []}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/[0.015] border border-white/5 rounded-2xl p-6">
              <h4 className="font-black text-sm uppercase tracking-wider text-white mb-4 pb-2 border-b border-white/5">
                SEO Metadata Info
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                This page uses Dynamic HTML header injection for premium indexing.
              </p>
              
              <div className="space-y-3 text-[11px]">
                <div>
                  <span className="block text-slate-600 font-bold uppercase tracking-wider">SEO Title</span>
                  <span className="text-slate-400 font-mono select-all break-words">{post.seoTitle}</span>
                </div>
                <div>
                  <span className="block text-slate-600 font-bold uppercase tracking-wider">Meta Description</span>
                  <span className="text-slate-400 break-words leading-normal">{post.metaDescription}</span>
                </div>
                {post.keywords && post.keywords.length > 0 && (
                  <div>
                    <span className="block text-slate-600 font-bold uppercase tracking-wider">Keywords</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.keywords.map((kw, i) => (
                        <span key={i} className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-400 text-[10px]">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
