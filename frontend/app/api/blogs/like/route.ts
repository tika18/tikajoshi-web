import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const LOCAL_DB_DIR = path.join(process.cwd(), "lib", "db");
const LOCAL_DB_FILE = path.join(LOCAL_DB_DIR, "blogs.json");

export async function POST(req: Request) {
  try {
    const { slug } = await req.json();
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    if (!fs.existsSync(LOCAL_DB_FILE)) {
      return NextResponse.json({ error: "No posts found in database" }, { status: 404 });
    }

    const content = fs.readFileSync(LOCAL_DB_FILE, "utf-8");
    const posts = JSON.parse(content);
    if (!Array.isArray(posts)) {
      return NextResponse.json({ error: "Invalid database structure" }, { status: 500 });
    }

    const postIndex = posts.findIndex((p: any) => p.slug === slug);
    if (postIndex === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Default likes to 0 if not present, and increment
    const currentLikes = typeof posts[postIndex].likes === "number" ? posts[postIndex].likes : 0;
    posts[postIndex].likes = currentLikes + 1;
    posts[postIndex].updatedAt = new Date().toISOString();

    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(posts, null, 2), "utf-8");

    return NextResponse.json({ success: true, likes: posts[postIndex].likes });
  } catch (error: any) {
    console.error("Error liking post:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
