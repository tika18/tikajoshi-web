// frontend/app/admin/blogs/page.tsx
import { getAdminPosts } from "@/actions/sanity";
import BlogsClient from "./blogs-client";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const result = await getAdminPosts();

  const posts = result.success && result.posts ? result.posts : [];

  return <BlogsClient initialPosts={posts} />;
}
