// app/blog/[slug]/page.tsx
import { client } from "@/sanity/client";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";

interface LocalPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string | any[];
  bodyHtml?: string;
  imageUrl?: string;
  publishedAt: string;
  seoDescription?: string;
}

async function getPostData(slug: string): Promise<LocalPost | null> {
  // 1. Try Sanity
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    try {
      const post = await client.fetch(
        `*[_type == "post" && slug.current == $slug][0]{
          title, excerpt, publishedAt, body, seoDescription,
          "imageUrl": mainImage.asset->url
        }`,
        { slug }
      );
      if (post) {
        return {
          title: post.title,
          slug,
          excerpt: post.excerpt || "",
          body: post.body || "",
          imageUrl: post.imageUrl,
          publishedAt: post.publishedAt || new Date().toISOString(),
          seoDescription: post.seoDescription
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
            title: found.title,
            slug: found.slug,
            excerpt: found.excerpt || "",
            body: found.body || "",
            bodyHtml: found.bodyHtml,
            imageUrl: found.imageUrl,
            publishedAt: found.publishedAt,
            seoDescription: found.metaDescription
          };
        }
      }
    }
  } catch (e) {
    console.error("Local single post fetch error:", e);
  }

  return null;
}

async function getRelatedData(currentSlug: string): Promise<any[]> {
  // 1. Try Sanity
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    try {
      const related = await client.fetch(
        `*[_type == "post" && slug.current != $slug] | order(publishedAt desc)[0..2]{
          title, "slug": slug.current, "imageUrl": mainImage.asset->url, publishedAt
        }`,
        { slug: currentSlug }
      );
      if (Array.isArray(related) && related.length > 0) {
        return related;
      }
    } catch (e) {
      console.error("Sanity related posts fetch error:", e);
    }
  }

  // 2. Local Fallback
  try {
    const localDbPath = path.join(process.cwd(), "lib", "db", "blogs.json");
    if (fs.existsSync(localDbPath)) {
      const content = fs.readFileSync(localDbPath, "utf-8");
      const posts = JSON.parse(content);
      if (Array.isArray(posts)) {
        return posts
          .filter((p: any) => p.slug !== currentSlug)
          .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 3)
          .map((p: any) => ({
            title: p.title,
            slug: p.slug,
            imageUrl: p.imageUrl,
            publishedAt: p.publishedAt
          }));
      }
    }
  } catch (e) {
    console.error("Local related posts fetch error:", e);
  }

  return [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostData(params.slug);
  return {
    title: post?.title || "Blog — Tikajoshi",
    description: post?.seoDescription || post?.excerpt || "",
  };
}

export default async function BlogDetail({ params }: { params: { slug: string } }) {
  const [post, related] = await Promise.all([getPostData(params.slug), getRelatedData(params.slug)]);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#050810] text-white">
      <Navbar />

      {/* Hero Image */}
      {post.imageUrl && (
        <div className="relative h-[50vh] w-full mt-16">
          <Image src={post.imageUrl} alt={post.title} fill className="object-cover opacity-40" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050810]/30 via-transparent to-[#050810]" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 pt-8">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white transition">Blog</Link>
          <span>/</span>
          <span className="text-slate-400 truncate max-w-[200px]">{post.title}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-slate-400 text-lg mb-6 leading-relaxed">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-3 mb-10 pb-8 border-b border-white/8">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-black">T</div>
          <div>
            <p className="text-sm font-bold">Tikajoshi</p>
            <p className="text-xs text-slate-500">
              {new Date(post.publishedAt).toLocaleDateString('ne-NP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-invert prose-lg max-w-none
          prose-headings:font-black prose-headings:text-white
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4
          prose-strong:text-white prose-a:text-violet-400 font-sans">
          {post.bodyHtml ? (
            <div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
          ) : Array.isArray(post.body) ? (
            post.body.some((block: any) =>
              block.children?.some((child: any) => /<[a-z][\s\S]*>/i.test(child.text))
            ) ? (
              <div dangerouslySetInnerHTML={{ __html: post.body.map((block: any) => block.children?.map((c: any) => c.text).join("") || "").join("\n") }} />
            ) : (
              <PortableText value={post.body} />
            )
          ) : typeof post.body === "string" ? (
            /<[a-z][\s\S]*>/i.test(post.body) ? (
              <div dangerouslySetInnerHTML={{ __html: post.body }} />
            ) : (
              <div className="whitespace-pre-line">{post.body}</div>
            )
          ) : null}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-white/8">
            <h2 className="text-xl font-black mb-6">थप Articles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r: any) => (
                <Link key={r.slug} href={`/blog/${r.slug}`}
                  className="group bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-xl overflow-hidden transition-all">
                  <div className="relative h-36 bg-white/5">
                    {r.imageUrl && (
                      <Image src={r.imageUrl} alt={r.title} fill
                        className="object-cover opacity-60 group-hover:opacity-90 transition-opacity" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-500 mb-1">{new Date(r.publishedAt).toLocaleDateString('ne-NP')}</p>
                    <h3 className="text-sm font-bold group-hover:text-violet-300 transition-colors line-clamp-2">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}