import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const NEPAL_TOPICS = [
  // Tech & AI
  "Best Budget Smartphones in Nepal 2025",
  "Top 5 Laptops Under Rs 60000 in Nepal",
  "How AI and ChatGPT are Transforming Education in Nepal",
  "Best WiFi Routers for Home and Office in Nepal 2025",
  "Smart TV Buying Guide Nepal 2025",
  // Education & Exams
  "How to Prepare for IOE Entrance Exam 2025",
  "Loksewa Nayab Subba Preparation Tips & Syllabus",
  "Best Online Learning Platforms for Nepali Students",
  "NEB Result 2025 - Complete Online Verification Guide",
  // Finance & Stock Market
  "NEPSE Investment Guide for Beginners Nepal 2025",
  "Best Banks for Fixed Deposit Rates in Nepal 2025",
  "How to Open Demat & MeroShare Account Online in Nepal",
  "Technical Analysis Essentials for NEPSE Share Traders",
  "Upcoming Hydropower and Commercial Bank IPOs in Nepal",
  // Lifestyle & Career
  "High Paying IT and Tech Jobs in Nepal 2025",
  "How to Land a Government Job in Nepal",
  "Top Tourist Destinations in Nepal for Weekend Trips",
];

async function handleBlogGeneration(req: Request) {
  let currentStep = "1. Checking Setup";
  try {
    const { searchParams } = new URL(req.url);
    
    // Support JSON body for POST requests or query params for GET
    let customTopic = searchParams.get("topic");
    let lang = searchParams.get("lang") || searchParams.get("language") || "en";
    let categoryParam = searchParams.get("category");
    let targetPageParam = searchParams.get("targetPage");
    let secret = searchParams.get("secret");

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.topic) customTopic = body.topic;
        if (body.lang) lang = body.lang;
        if (body.category) categoryParam = body.category;
        if (body.targetPage) targetPageParam = body.targetPage;
        if (body.secret) secret = body.secret;
      } catch (e) {
        // ignore non-JSON body
      }
    }

    if (secret && secret !== process.env.CRON_SECRET && secret !== "tikajoshi-auto-blog-password") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing from environment variables");
    }

    const apiKey = process.env.GEMINI_API_KEY.trim();

    // 1. Setup Sanity Client if configured
    let sanityClient: any = null;
    if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      sanityClient = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID.trim(),
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production",
        useCdn: false,
        apiVersion: "2024-01-01",
        token: process.env.SANITY_API_TOKEN?.trim(),
      });
    }

    // 2. Discover available Gemini model
    currentStep = "2. Finding Gemini Model";
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();
    if (!listRes.ok) throw new Error(`Google Gemini API Error: ${JSON.stringify(listData)}`);

    const workingModel = (listData.models || []).find(
      (m: any) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("gemini")
    );
    if (!workingModel) throw new Error("No available Gemini model with generateContent capability");
    const modelName = workingModel.name;

    // 3. Select Topic
    currentStep = "3. Generating Content";
    let topic = customTopic;
    if (!topic) {
      let postedTitles = new Set<string>();
      if (sanityClient) {
        try {
          const posted = await sanityClient.fetch(`*[_type == "post"]{ title }`);
          postedTitles = new Set((posted || []).map((p: any) => p.title));
        } catch (e) {}
      }
      const available = NEPAL_TOPICS.filter((t) => !postedTitles.has(t));
      topic = available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : NEPAL_TOPICS[Math.floor(Math.random() * NEPAL_TOPICS.length)];
    }

    // 4. Construct Language Prompt
    const cleanLang = (lang || "en").toLowerCase();
    let langInstruction = "strictly in clear, natural, high-quality English";
    if (cleanLang === "ne" || cleanLang === "nepali" || cleanLang === "np") {
      langInstruction = "strictly in Devanagari Nepali script (नेपाली भाषामा)";
    } else if (cleanLang === "romanized") {
      langInstruction = "strictly in Romanized Nepali (Nepali written using English alphabet)";
    }

    const defaultCategory = categoryParam || (topic.toLowerCase().includes("nepse") || topic.toLowerCase().includes("market") ? "NEPSE News" : "Technology");

    const prompt = `You are a professional content writer. Write a detailed, engaging, SEO-optimized blog post ${langInstruction} about: "${topic}".
Requirements:
- Ensure the title, excerpt, section headings, and paragraph content are written ${langInstruction}.
- Provide detailed analysis, practical advice, and clear headings.
Return ONLY valid JSON (no markdown formatting, no code blocks):
{
  "title": "Catchy SEO Title",
  "excerpt": "2 to 3 sentence compelling summary",
  "category": "${defaultCategory}",
  "image_search_keyword": "specific photo search keyword",
  "content": [
    {"style": "h2", "text": "Section Heading 1"},
    {"style": "normal", "text": "Detailed paragraph text with at least 3 sentences..."},
    {"style": "h2", "text": "Section Heading 2"},
    {"style": "normal", "text": "Detailed paragraph content..."},
    {"style": "h2", "text": "Key Takeaways"},
    {"style": "normal", "text": "Summary points..."},
    {"style": "h2", "text": "Conclusion"},
    {"style": "normal", "text": "Final concluding thoughts..."}
  ]
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
    const aiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!aiRes.ok) throw new Error(`Gemini API returned status ${aiRes.status}`);
    const aiData = await aiRes.json();
    let rawText = aiData.candidates[0].content.parts[0].text;
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const blogData = JSON.parse(rawText);

    // 5. Fetch Cover Image
    currentStep = "4. Fetching Cover Photo";
    let imageAssetId = null;
    let imageUrl = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop";

    if (process.env.PEXELS_API_KEY) {
      try {
        const pRes = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(blogData.image_search_keyword || topic)}&per_page=3`,
          { headers: { Authorization: process.env.PEXELS_API_KEY.trim() } }
        );
        const pData = await pRes.json();
        if (pData.photos?.length) {
          imageUrl = pData.photos[0].src.large;
          if (sanityClient) {
            const imgRes = await fetch(imageUrl);
            if (imgRes.ok) {
              const buffer = Buffer.from(await imgRes.arrayBuffer());
              const asset = await sanityClient.assets.upload("image", buffer, {
                filename: (blogData.image_search_keyword || "blog").replace(/[^a-zA-Z0-9]/g, "-") + ".jpg",
                contentType: "image/jpeg",
              });
              imageAssetId = asset._id;
            }
          }
        }
      } catch (imgErr) {
        console.warn("Pexels cover image fetch warning:", imgErr);
      }
    }

    // 6. Generate Slug & PortableText
    currentStep = "5. Publishing Post";
    const slug = blogData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const portableText = (blogData.content || []).map((block: any) => ({
      _type: "block",
      _key: Math.random().toString(36).slice(2),
      style: block.style || "normal",
      markDefs: [],
      children: [{ _type: "span", _key: Math.random().toString(36).slice(2), marks: [], text: block.text }],
    }));

    const postPayload: any = {
      _type: "post",
      title: blogData.title,
      slug: { _type: "slug", current: slug },
      excerpt: blogData.excerpt,
      publishedAt: new Date().toISOString(),
      category: blogData.category || defaultCategory,
      targetPage: targetPageParam || (defaultCategory.toLowerCase().includes("market") ? "market" : "general"),
      language: cleanLang,
      isFeatured: true,
      body: portableText,
    };

    if (imageAssetId && sanityClient) {
      postPayload.mainImage = { _type: "image", asset: { _type: "reference", _ref: imageAssetId } };
    }

    let createdPost = null;
    if (sanityClient) {
      try {
        createdPost = await sanityClient.create(postPayload);
      } catch (sErr) {
        console.warn("Sanity create warning:", sErr);
      }
    }

    // Save to local DB fallback as well
    try {
      const localDbDir = path.join(process.cwd(), "lib", "db");
      const localDbPath = path.join(localDbDir, "blogs.json");
      if (!fs.existsSync(localDbDir)) fs.mkdirSync(localDbDir, { recursive: true });

      let localPosts = [];
      if (fs.existsSync(localDbPath)) {
        try {
          localPosts = JSON.parse(fs.readFileSync(localDbPath, "utf-8"));
        } catch (e) {}
      }

      const flatBody = (blogData.content || []).map((c: any) => c.text).join("\n\n");
      const localItem = {
        id: createdPost?._id || `local-${Date.now()}`,
        title: blogData.title,
        slug,
        excerpt: blogData.excerpt,
        category: blogData.category || defaultCategory,
        targetPage: targetPageParam || (defaultCategory.toLowerCase().includes("market") ? "market" : "general"),
        publishedAt: new Date().toISOString(),
        imageUrl,
        language: cleanLang,
        isFeatured: true,
        body: flatBody,
      };

      localPosts.unshift(localItem);
      fs.writeFileSync(localDbPath, JSON.stringify(localPosts, null, 2), "utf-8");
    } catch (dbErr) {
      console.warn("Local DB write warning:", dbErr);
    }

    return NextResponse.json({
      success: true,
      title: blogData.title,
      slug,
      language: cleanLang,
      category: blogData.category || defaultCategory,
      topic,
      imageUrl,
    });
  } catch (err: any) {
    console.error("Auto blog generation error:", err);
    return NextResponse.json(
      { success: false, failed_at: currentStep, error: err.message || "Failed to generate blog" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handleBlogGeneration(req);
}

export async function POST(req: Request) {
  return handleBlogGeneration(req);
}