import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";
import { parse } from "node-html-parser";

export const dynamic = "force-dynamic";

const LOCAL_DB_DIR = path.join(process.cwd(), "lib", "db");
const LOCAL_DB_FILE = path.join(LOCAL_DB_DIR, "blogs.json");

// Smart Internal Linking Keyword Mapping
const LINK_RULES = [
  { keyword: "NEPSE", url: "/market" },
  { keyword: "IOE", url: "/study/ioe" },
  { keyword: "Loksewa", url: "/study/loksewa" },
  { keyword: "NEB", url: "/study/neb" },
  { keyword: "Forex", url: "/market/forex" },
  { keyword: "forex", url: "/market/forex" },
  { keyword: "TU", url: "/tools/tu-result" },
  { keyword: "EMI", url: "/tools/emi-calculator" },
  { keyword: "license", url: "/study/license" },
  { keyword: "vehicles", url: "/vehicles" },
  { keyword: "vehicle", url: "/vehicles" }
];

// Helper to convert HTML content (or plain text) to PortableText with formatting and links preserved
function htmlToPortableText(html: string): any[] {
  const root = parse(html);
  const blocks: any[] = [];
  let currentInlineSpans: any[] = [];
  let currentMarkDefs: any[] = [];

  const flushInlineBlocks = () => {
    if (currentInlineSpans.length > 0) {
      blocks.push({
        _type: "block",
        _key: Math.random().toString(36).slice(2),
        style: "normal",
        markDefs: [...currentMarkDefs],
        children: [...currentInlineSpans]
      });
      currentInlineSpans = [];
      currentMarkDefs = [];
    }
  };

  const processInlineNode = (node: any, parentMarks: string[] = []): { spans: any[]; markDefs: any[] } => {
    const spans: any[] = [];
    const markDefs: any[] = [];

    if (node.nodeType === 3) {
      if (node.text) {
        spans.push({
          _type: "span",
          _key: Math.random().toString(36).slice(2),
          marks: parentMarks,
          text: node.text
        });
      }
    } else if (node.nodeType === 1) {
      const tagName = node.tagName.toLowerCase();
      let markKey: string | null = null;
      const marks = [...parentMarks];

      if (tagName === "strong" || tagName === "b") {
        marks.push("strong");
      } else if (tagName === "em" || tagName === "i") {
        marks.push("em");
      } else if (tagName === "a") {
        markKey = `link-${Math.random().toString(36).slice(2)}`;
        marks.push(markKey);
        markDefs.push({
          _key: markKey,
          _type: "link",
          href: node.getAttribute("href") || ""
        });
      }

      node.childNodes.forEach((child: any) => {
        const result = processInlineNode(child, marks);
        spans.push(...result.spans);
        markDefs.push(...result.markDefs);
      });

      if (node.childNodes.length === 0) {
        spans.push({
          _type: "span",
          _key: Math.random().toString(36).slice(2),
          marks: marks,
          text: ""
        });
      }
    }

    return { spans, markDefs };
  };

  const processInlineChildren = (element: any) => {
    const spans: any[] = [];
    const markDefs: any[] = [];

    element.childNodes.forEach((node: any) => {
      const result = processInlineNode(node);
      spans.push(...result.spans);
      markDefs.push(...result.markDefs);
    });

    return { spans, markDefs };
  };

  const processNode = (node: any) => {
    if (node.nodeType === 3) {
      const text = node.text;
      if (text) {
        currentInlineSpans.push({
          _type: "span",
          _key: Math.random().toString(36).slice(2),
          marks: [],
          text: text
        });
      }
    } else if (node.nodeType === 1) {
      const tagName = node.tagName.toLowerCase();

      if (["h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "blockquote"].includes(tagName)) {
        flushInlineBlocks();
        
        const childrenResult = processInlineChildren(node);
        blocks.push({
          _type: "block",
          _key: Math.random().toString(36).slice(2),
          style: ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName) ? tagName : "normal",
          markDefs: childrenResult.markDefs,
          children: childrenResult.spans.length > 0 ? childrenResult.spans : [{
            _type: "span",
            _key: Math.random().toString(36).slice(2),
            marks: [],
            text: ""
          }]
        });
      } else if (tagName === "li") {
        flushInlineBlocks();
        const parentTag = node.parentNode?.tagName?.toLowerCase();
        const listItemType = parentTag === "ol" ? "number" : "bullet";
        const childrenResult = processInlineChildren(node);
        blocks.push({
          _type: "block",
          _key: Math.random().toString(36).slice(2),
          style: "normal",
          listItem: listItemType,
          level: 1,
          markDefs: childrenResult.markDefs,
          children: childrenResult.spans.length > 0 ? childrenResult.spans : [{
            _type: "span",
            _key: Math.random().toString(36).slice(2),
            marks: [],
            text: ""
          }]
        });
      } else if (tagName === "ul" || tagName === "ol") {
        flushInlineBlocks();
        node.childNodes.forEach(processNode);
      } else if (tagName === "br") {
        currentInlineSpans.push({
          _type: "span",
          _key: Math.random().toString(36).slice(2),
          marks: [],
          text: "\n"
        });
      } else {
        const inlineResult = processInlineNode(node);
        currentInlineSpans.push(...inlineResult.spans);
        currentMarkDefs.push(...inlineResult.markDefs);
      }
    }
  };

  root.childNodes.forEach(processNode);
  flushInlineBlocks();

  return blocks;
}

// URL slug sanitization helper
function sanitizeSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric except spaces/hyphens
    .replace(/[\s_]+/g, "-")      // replace spaces and underscores with hyphens
    .replace(/-+/g, "-")          // replace multiple hyphens with single
    .replace(/^-+|-+$/g, "");     // trim leading/trailing hyphens
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      richTextBody,
      featuredImage,
      slug,
      metaDescription,
      keywords,
      targetPage,
      category,
      secondaryImages,
      seoTitle
    } = body;

    if (!title || !richTextBody) {
      return NextResponse.json({ error: "Title and Body are required" }, { status: 400 });
    }

    // Slug generation/sanitization
    const finalSlug = slug ? sanitizeSlug(slug) : sanitizeSlug(title);

    // Apply smart linking to richTextBody for saving locally or as HTML
    let linkedHtmlBody = richTextBody;
    for (const rule of LINK_RULES) {
      const regex = new RegExp(`\\b${rule.keyword}\\b`, "g");
      linkedHtmlBody = linkedHtmlBody.replace(
        regex,
        `<a href="${rule.url}" class="text-violet-400 hover:underline font-bold">${rule.keyword}</a>`
      );
    }

    const postObj = {
      id: Math.random().toString(36).slice(2, 9),
      title,
      slug: finalSlug,
      excerpt: metaDescription ? metaDescription.substring(0, 160) : richTextBody.substring(0, 150) + "...",
      body: richTextBody,
      bodyHtml: linkedHtmlBody,
      imageUrl: featuredImage || "/og-image.jpg",
      secondaryImages: Array.isArray(secondaryImages) ? secondaryImages.filter(Boolean) : [],
      category: category || "NEPSE News",
      likes: 0,
      comments: [],
      seoTitle: seoTitle || title,
      metaDescription: metaDescription || richTextBody.substring(0, 150) + "...",
      keywords: keywords ? keywords.split(",").map((k: string) => k.trim()) : [],
      targetPage: targetPage || "study",
      publishedAt: new Date().toISOString()
    };

    // 1. Try writing to Sanity CMS
    let sanitySuccess = false;
    if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.SANITY_API_TOKEN) {
      try {
        const sanityClient = createClient({
          projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID.trim(),
          dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production",
          useCdn: false,
          apiVersion: "2024-01-01",
          token: process.env.SANITY_API_TOKEN.trim()
        });

        // Check if there is an image to upload or reference
        let mainImageRef = null;
        if (featuredImage && (featuredImage.startsWith("http://") || featuredImage.startsWith("https://"))) {
          try {
            const imgRes = await fetch(featuredImage);
            if (imgRes.ok) {
              const buffer = Buffer.from(await imgRes.arrayBuffer());
              const asset = await sanityClient.assets.upload("image", buffer, {
                filename: `${finalSlug}-image.jpg`,
                contentType: "image/jpeg"
              });
              mainImageRef = {
                _type: "image",
                asset: {
                  _type: "reference",
                  _ref: asset._id
                }
              };
            }
          } catch (e) {
            console.error("Sanity asset upload failed:", e);
          }
        }

        const portableTextBody = htmlToPortableText(linkedHtmlBody);

        const sanityDoc: any = {
          _type: "post",
          title,
          slug: { _type: "slug", current: finalSlug },
          excerpt: postObj.excerpt,
          seoDescription: postObj.metaDescription,
          keywords: keywords || "",
          targetPage: postObj.targetPage,
          publishedAt: postObj.publishedAt,
          body: portableTextBody
        };

        if (mainImageRef) {
          sanityDoc.mainImage = mainImageRef;
        }

        await sanityClient.create(sanityDoc);
        sanitySuccess = true;
      } catch (e) {
        console.error("Sanity post publish failed:", e);
      }
    }

    // 2. Local JSON Database fall-through / backup
    try {
      if (!fs.existsSync(LOCAL_DB_DIR)) {
        fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
      }

      let localPosts: any[] = [];
      if (fs.existsSync(LOCAL_DB_FILE)) {
        const content = fs.readFileSync(LOCAL_DB_FILE, "utf-8");
        localPosts = JSON.parse(content);
      }

      // Add to array and save
      localPosts.push(postObj);
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(localPosts, null, 2), "utf-8");
    } catch (e) {
      console.error("Local database write failed:", e);
    }

    return NextResponse.json({
      success: true,
      sanityPublished: sanitySuccess,
      post: postObj
    });
  } catch (error: any) {
    console.error("Error publishing blog:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
