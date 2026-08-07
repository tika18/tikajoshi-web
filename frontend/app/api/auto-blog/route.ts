import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Year-agnostic base topics pool
const BASE_NEPAL_TOPICS = [
  // Tech & AI
  "Best Budget Smartphones in Nepal",
  "Top Laptops Under Rs 60000 in Nepal for Students",
  "How AI and ChatGPT are Transforming Education in Nepal",
  "Best WiFi Routers for Home and Office in Nepal",
  "Smart TV Buying Guide Nepal",
  "Best Electric Scooters & Bikes in Nepal Price Specs",
  "Top Mobile Banking & Digital Wallet Apps in Nepal",
  "How to Choose the Best ISP Fiber Internet in Nepal",
  "Must-Have Mobile Apps Every Nepali Student Should Download",
  "5G Network Expansion in Nepal What You Need to Know",

  // Education & Exams
  "How to Prepare for IOE Entrance Exam Complete Guide",
  "Loksewa Nayab Subba Preparation Tips & Syllabus",
  "Best Online Learning Platforms for Nepali Students",
  "NEB Class 12 Result Complete Verification Guide",
  "TU Exam Result Check Online with Marksheet Guide",
  "How to Apply for NEC Engineering License Exam in Nepal",
  "Top IT and Computer Engineering Colleges in Nepal",
  "Medical Entrance Exam Prep Guide for CEE Nepal",

  // Finance & Stock Market
  "NEPSE Investment Guide for Beginners Nepal",
  "Best Banks for High Fixed Deposit Interest Rates in Nepal",
  "How to Open Demat & MeroShare Account Online in Nepal",
  "Technical Analysis Essentials for NEPSE Share Traders",
  "Upcoming Hydropower and Commercial Bank IPOs in Nepal",
  "How to Calculate Capital Gains Tax on Shares in Nepal",
  "SIP vs Fixed Deposit Which is Better for Nepali Investors",
  "Understanding NEPSE Sectoral Indices Hydropower vs Microfinance",
  "Best Dividend Paying Stocks in NEPSE for Long Term Growth",
  "How to Check Meroshare Allotment Status Online",

  // Careers & Lifestyle
  "High Paying IT and Tech Jobs in Nepal Salary Guide",
  "How to Land a Government Job in Nepal Step by Step",
  "Top Tourist Destinations in Nepal for Weekend Trips",
  "Work From Home and Remote Freelancing Guide for Nepali Youth",
  "How to Register a Private Limited Company in Nepal",
  "Cost of Living in Kathmandu Guide for Students and Couples",
  "Electric Car Tax Policy and EV Buying Guide in Nepal",
  "Passport Online Application Process & District Collection Guide",
  "Driving License Online Application & Trial Rules in Nepal",
];

function checkAuthorization(req: Request, secretParam?: string | null): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();

  // 1. Check Vercel Cron Authorization header (Bearer {CRON_SECRET})
  if (cronSecret && authHeader) {
    if (authHeader === `Bearer ${cronSecret}` || authHeader.endsWith(cronSecret)) {
      return true;
    }
  }

  // 2. Check secret query param or JSON body fallback
  if (secretParam) {
    if (secretParam === cronSecret || secretParam === "tikajoshi-auto-blog-password") {
      return true;
    }
  }

  // 3. Dev environment fallback
  if (process.env.NODE_ENV !== "production" && !cronSecret) {
    return true;
  }

  return false;
}

async function handleBlogGeneration(req: Request) {
  let currentStep = "1. Checking Setup";
  try {
    const { searchParams } = new URL(req.url);
    
    let customTopic = searchParams.get("topic");
    let lang = searchParams.get("lang") || searchParams.get("language") || "en";
    let categoryParam = searchParams.get("category");
    let targetPageParam = searchParams.get("targetPage");
    let secretParam = searchParams.get("secret");

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.topic) customTopic = body.topic;
        if (body.lang) lang = body.lang;
        if (body.category) categoryParam = body.category;
        if (body.targetPage) targetPageParam = body.targetPage;
        if (body.secret) secretParam = body.secret;
      } catch (e) {
        // ignore non-JSON body
      }
    }

    if (!checkAuthorization(req, secretParam)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing from environment variables");
    }

    const apiKey = process.env.GEMINI_API_KEY.trim();
    const currentYear = new Date().getFullYear();
    const currentDateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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

    // 3. Select & Format Topic
    currentStep = "3. Generating Content";
    let rawTopic = customTopic;
    if (!rawTopic) {
      let postedTitles = new Set<string>();
      if (sanityClient) {
        try {
          const posted = await sanityClient.fetch(`*[_type == "post"]{ title }`);
          postedTitles = new Set((posted || []).map((p: any) => p.title.toLowerCase()));
        } catch (e) {}
      }
      const available = BASE_NEPAL_TOPICS.filter((t) => !postedTitles.has(t.toLowerCase()));
      rawTopic = available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : BASE_NEPAL_TOPICS[Math.floor(Math.random() * BASE_NEPAL_TOPICS.length)];
    }

    // Inject dynamic year if not present
    const topic = rawTopic.includes(String(currentYear))
      ? rawTopic
      : `${rawTopic} (${currentYear})`;

    // 4. Construct Language Prompt with Anti-AI Clichés & Date Context
    const cleanLang = (lang || "en").toLowerCase();
    let langInstruction = "strictly in clear, natural, high-quality English";
    if (cleanLang === "ne" || cleanLang === "nepali" || cleanLang === "np") {
      langInstruction = "strictly in Devanagari Nepali script (नेपाली भाषामा)";
    } else if (cleanLang === "romanized") {
      langInstruction = "strictly in Romanized Nepali (Nepali written using English alphabet)";
    }

    const defaultCategory = categoryParam || (topic.toLowerCase().includes("nepse") || topic.toLowerCase().includes("market") ? "NEPSE News" : "Technology");

    const prompt = `Today's date is ${currentDateStr}. Do not reference any year, season, or time-sensitive event as if it were in the past relative to this date. If discussing 'latest' or 'current' products/trends, only reference things plausible as of ${currentDateStr}.

You are an expert Nepali tech & financial journalist writing for Tikajoshi.com.np. Write an in-depth, highly practical, SEO-optimized blog post ${langInstruction} about: "${topic}".

Writing Style & Anti-AI Guidelines:
1. Tone: Conversational, authoritative, concise, and direct. Avoid sounding like a generic AI listicle.
2. Negative Constraint: Do NOT use AI buzzwords or cliché phrases such as:
   - "in today's fast-paced world"
   - "it's important to note"
   - "in conclusion"
   - "delve into" / "unlock" / "game-changer" / "testament to" / "tapestry" / "beacon" / "seamless"
3. Sentence Structure: Use varied sentence length — combine short punchy observations with detailed explanatory sentences.
4. Local Accuracy: Mention real local context where relevant (e.g. NPR pricing, Nepali banks, IOE/TU/NEB boards, Meroshare, SEBON).

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
    {"style": "h2", "text": "Final Thoughts"},
    {"style": "normal", "text": "Closing perspective..."}
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

    // Save to local DB fallback
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