// app/blog/page.tsx
import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Tikajoshi",
  description: "Nepal tech, finance, career र lifestyle को latest articles।",
};

export const revalidate = 60;

async function getPosts() {
  return await client.fetch(
    `*[_type == "post"] | order(publishedAt desc)[0..19] {
      _id, title, excerpt, publishedAt,
      "slug": slug.current,
      "imageUrl": mainImage.asset->url
    }`
  );
}

export default async function BlogPage() {
  const posts = await getPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#050810] text-white">
      <Navbar />

      {/* Hero */}
      <div className="relative pt-32 pb-16 px-4 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-300 uppercase tracking-widest mb-6">
          ✍️ Blog
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
          Latest{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            Articles
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl">
          Nepal tech, finance, career र lifestyle को in-depth guides।
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-32 text-slate-500">
            <p className="text-2xl font-bold mb-2">Posts आउँदैछन्...</p>
            <p className="text-sm">Auto-post system ले चाँडै content थप्नेछ।</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featured && (
              <Link href={`/blog/${featured.slug}`}
                className="group block mb-12 bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
                <div className="grid md:grid-cols-2">
                  <div className="relative h-64 md:h-auto min-h-[300px] bg-white/5">
                    {featured.imageUrl ? (
                      <Image src={featured.imageUrl} alt={featured.title} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">📝</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050810]/80 hidden md:block" />
                    <div className="absolute top-4 left-4 bg-violet-600 text-white text-xs font-black px-3 py-1 rounded-full">
                      FEATURED
                    </div>
                  </div>
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <p className="text-xs text-slate-500 mb-3">
                      {new Date(featured.publishedAt).toLocaleDateString('ne-NP')}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-4 group-hover:text-violet-300 transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                      {featured.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-violet-400 group-hover:gap-3 transition-all">
                      Read Article →
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((post: any) => (
                <Link key={post._id} href={`/blog/${post.slug}`}
                  className="group bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300">
                  <div className="relative h-48 bg-white/5 overflow-hidden">
                    {post.imageUrl ? (
                      <Image src={post.imageUrl} alt={post.title} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-70 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">📄</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] text-slate-500 mb-2">
                      {new Date(post.publishedAt).toLocaleDateString('ne-NP')}
                    </p>
                    <h3 className="text-base font-black text-white mb-2 group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-1 mt-4 text-xs font-bold text-slate-600 group-hover:text-violet-400 transition-colors">
                      Read More →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}