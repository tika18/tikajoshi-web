// frontend/app/admin/blogs/[id]/edit/page.tsx
import { getPostById } from "@/actions/sanity";
import EditorClient from "../../editor-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface EditBlogPageProps {
  params: {
    id: string;
  };
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const result = await getPostById(params.id);

  if (!result.success || !result.post) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xl font-bold">
          !
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Post Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">The blog post you are trying to edit does not exist or was deleted.</p>
        </div>
        <Link
          href="/admin/blogs"
          className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-xs font-bold text-white rounded-xl transition"
        >
          <ArrowLeft size={14} /> Back to Blogs
        </Link>
      </div>
    );
  }

  return <EditorClient post={result.post} />;
}
