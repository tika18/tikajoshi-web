import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

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

// Helper to convert plain text body to PortableText with smart internal links
function textToPortableText(text: string): any[] {
  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
  
  return paragraphs.map(p => {
    const blockKey = Math.random().toString(36).slice(2);
    const children: any[] = [];
    const markDefs: any[] = [];
    
    let tempText = p;
    let index = 0;

    // Scan paragraph text for keywords
    while (tempText.length > 0) {
      let earliestKeyword = null;
      let earliestPos = -1;

      for (const rule of LINK_RULES) {
        const pos = tempText.indexOf(rule.keyword);
        if (pos !== -1 && (earliestPos === -1 || pos < earliestPos)) {
          earliestKeyword = rule;
          earliestPos = pos;
        }
      }

      if (earliestKeyword && earliestPos !== -1) {
        // Text before the keyword
        if (earliestPos > 0) {
          children.push({
            _type: "span",
            _key: `${blockKey}-text-${index++}`,
            marks: [],
            text: tempText.substring(0, earliestPos)
          });
        }

        // The keyword span linked to internal route
        const markKey = `link-${Math.random().toString(36).slice(2)}`;
        markDefs.push({
          _type: "link",
          _key: markKey,
          href: earliestKeyword.url
        });

        children.push({
          _type: "span",
          _key: `${blockKey}-link-${index++}`,
          marks: [markKey],
          text: earliestKeyword.keyword
        });

        // Slice string past the keyword
        tempText = tempText.substring(earliestPos + earliestKeyword.keyword.length);
      } else {
        // No more keywords found, add the rest of the text
        children.push({
          _type: "span",
          _key: `${blockKey}-text-${index++}`,
          marks: [],
          text: tempText
        });
        tempText = "";
      }
    }

    return {
      _type: "block",
      _key: blockKey,
      style: "normal",
      markDefs,
      children
    };
  });
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
    const { title, richTextBody, featuredImage, slug, metaDescription, keywords, targetPage } = body;

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

        const portableTextBody = textToPortableText(richTextBody);

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
