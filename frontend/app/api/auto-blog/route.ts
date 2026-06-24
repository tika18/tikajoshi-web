// app/api/auto-blog/route.ts
// तपाईंको existing pattern extend गरिएको — Nepal-specific topics थपिएको

import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';

const NEPAL_TOPICS = [
  // Tech
  'Best Budget Smartphones in Nepal 2025',
  'Top 5 Laptops Under Rs 60000 in Nepal',
  'Best WiFi Routers in Nepal 2025',
  'Smart TV Buying Guide Nepal 2025',
  // Education
  'How to Prepare for IOE Entrance Exam 2025',
  'Loksewa Nayab Subba Preparation Tips',
  'Best Online Learning Platforms for Nepali Students',
  'NEB Result 2025 - How to Check Online',
  // Finance
  'NEPSE Investment Guide for Beginners Nepal',
  'Best Banks for Fixed Deposit in Nepal 2025',
  'How to Open Demat Account in Nepal',
  // Lifestyle
  'Best Places to Visit in Nepal 2025',
  'Top Restaurants in Kathmandu 2025',
  'Work From Home Tips for Nepali Professionals',
  // Career
  'High Paying Jobs in Nepal 2025',
  'How to Get Government Job in Nepal',
  'IT Jobs in Nepal Salary Guide 2025',
];

export async function GET(req: Request) {
  let currentStep = '1. Checking Setup';
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) throw new Error('Sanity Project ID missing');
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API key missing');

    const apiKey = process.env.GEMINI_API_KEY.trim();

    const sanityClient = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID.trim(),
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production',
      useCdn: false,
      apiVersion: '2024-01-01',
      token: process.env.SANITY_API_TOKEN?.trim(),
    });

    currentStep = '2. Finding Gemini Model';
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const listData = await listRes.json();
    if (!listRes.ok) throw new Error(`Google API Error: ${JSON.stringify(listData)}`);

    const workingModel = (listData.models || []).find(
      (m: any) =>
        m.supportedGenerationMethods?.includes('generateContent') &&
        m.name.includes('gemini')
    );
    if (!workingModel) throw new Error('No Gemini model available');
    const modelName = workingModel.name;

    currentStep = '3. Generating Content';
    // Already posted topics avoid गर्न
    const posted = await sanityClient.fetch(`*[_type == "post"]{ title }`);
    const postedTitles = new Set(posted.map((p: any) => p.title));
    const available = NEPAL_TOPICS.filter((t) => !postedTitles.has(t));
    const topic = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : NEPAL_TOPICS[Math.floor(Math.random() * NEPAL_TOPICS.length)];

    const prompt = `Write a detailed, SEO-optimized blog post for Nepali audience about: "${topic}".
Return ONLY valid JSON (no markdown):
{
  "title": "Catchy SEO title",
  "excerpt": "2 sentence summary for Nepal audience",
  "image_search_keyword": "specific photo search term",
  "content": [
    {"style": "h2", "text": "Section heading"},
    {"style": "normal", "text": "Paragraph text minimum 3 sentences..."},
    {"style": "h2", "text": "Another section"},
    {"style": "normal", "text": "More content..."},
    {"style": "h2", "text": "Conclusion"},
    {"style": "normal", "text": "Final thoughts..."}
  ]
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
    const aiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!aiRes.ok) throw new Error(`Gemini error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    let text = aiData.candidates[0].content.parts[0].text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const blogData = JSON.parse(text);

    currentStep = '4. Fetching Photo';
    let imageAssetId = null;
    if (process.env.PEXELS_API_KEY) {
      const pRes = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(blogData.image_search_keyword)}&per_page=3`,
        { headers: { Authorization: process.env.PEXELS_API_KEY.trim() } }
      );
      const pData = await pRes.json();
      if (pData.photos?.length) {
        const imgRes = await fetch(pData.photos[0].src.large);
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          const asset = await sanityClient.assets.upload('image', buffer, {
            filename: blogData.image_search_keyword.replace(/[^a-zA-Z0-9]/g, '-') + '.jpg',
            contentType: 'image/jpeg',
          });
          imageAssetId = asset._id;
        }
      }
    }

    currentStep = '5. Publishing to Sanity';
    const slug = blogData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const portableText = blogData.content.map((block: any) => ({
      _type: 'block',
      _key: Math.random().toString(36).slice(2),
      style: block.style || 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: Math.random().toString(36).slice(2), marks: [], text: block.text }],
    }));

    const post: any = {
      _type: 'post',
      title: blogData.title,
      slug: { _type: 'slug', current: slug },
      excerpt: blogData.excerpt,
      publishedAt: new Date().toISOString(),
      body: portableText,
    };
    if (imageAssetId) {
      post.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: imageAssetId } };
    }

    await sanityClient.create(post);
    return NextResponse.json({ success: true, title: blogData.title, topic });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, failed_at: currentStep, error: err.message },
      { status: 500 }
    );
  }
}