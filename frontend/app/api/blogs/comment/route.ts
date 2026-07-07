import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const LOCAL_DB_DIR = path.join(process.cwd(), "lib", "db");
const LOCAL_DB_FILE = path.join(LOCAL_DB_DIR, "blogs.json");

export async function POST(req: Request) {
  try {
    const { slug, name, comment } = await req.json();
    if (!slug || !name || !comment) {
      return NextResponse.json({ error: "Slug, name, and comment are required" }, { status: 400 });
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

    // Default comments to empty array if not present, and append new comment
    if (!Array.isArray(posts[postIndex].comments)) {
      posts[postIndex].comments = [];
    }

    const newComment = {
      name: name.trim(),
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    posts[postIndex].comments.push(newComment);
    posts[postIndex].updatedAt = new Date().toISOString();

    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(posts, null, 2), "utf-8");

    return NextResponse.json({ success: true, comments: posts[postIndex].comments });
  } catch (error: any) {
    console.error("Error commenting on post:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
