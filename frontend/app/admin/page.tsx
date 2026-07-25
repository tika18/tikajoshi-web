// frontend/app/admin/page.tsx
import { getAdminPosts } from "@/actions/sanity";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const result = await getAdminPosts();

  // If fetching failed, we'll pass an empty array, dashboard-client will handle it gracefully.
  const posts = result.success && result.posts ? result.posts : [];

  return <DashboardClient posts={posts} />;
}