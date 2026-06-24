import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!.trim(),
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN?.trim(),
});

const VEHICLES = [
  { name: 'Yamaha FZS V4 2025', type: 'bike', brand: 'Yamaha' },
  { name: 'Honda Hornet 2.0 2025', type: 'bike', brand: 'Honda' },
  { name: 'Bajaj Pulsar N160 2025', type: 'bike', brand: 'Bajaj' },
  { name: 'Royal Enfield Classic 350 2025', type: 'bike', brand: 'Royal Enfield' },
  { name: 'KTM Duke 200 2025', type: 'bike', brand: 'KTM' },
  { name: 'Yamaha R15 V4 2025', type: 'bike', brand: 'Yamaha' },
  { name: 'Hero Splendor Plus 2025', type: 'bike', brand: 'Hero' },
  { name: 'TVS Apache RTR 160 4V 2025', type: 'bike', brand: 'TVS' },
  { name: 'Royal Enfield Himalayan 450 2025', type: 'bike', brand: 'Royal Enfield' },
  { name: 'Honda Activa 6G 2025', type: 'scooter', brand: 'Honda' },
  { name: 'Yamaha Aerox 155 2025', type: 'scooter', brand: 'Yamaha' },
  { name: 'Yatri P1 2025', type: 'ev', brand: 'Yatri' },
  { name: 'BYD Atto 3 2025', type: 'ev', brand: 'BYD' },
  { name: 'Tata Nexon EV 2025', type: 'ev', brand: 'Tata' },
  { name: 'Hyundai Creta 2025', type: 'car', brand: 'Hyundai' },
  { name: 'Kia Seltos 2025', type: 'car', brand: 'Kia' },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  if (secret && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const count = Math.min(parseInt(searchParams.get('count') || '1'), 3);

  try {
    const apiKey = process.env.GEMINI_API_KEY!.trim();

    // Find working Gemini model
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();
    const model = (listData.models || []).find((m: any) =>
      m.supportedGenerationMethods?.includes('generateContent') && m.name.includes('gemini')
    );
    if (!model) throw new Error('No Gemini model found');

    // Already posted slugs
    const posted = await sanityClient.fetch(`*[_type == "vehicle"]{ "slug": slug.current }`);
    const postedSlugs = new Set(posted.map((v: any) => v.slug));
    const available = VEHICLES.filter(v => {
      const slug = v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return !postedSlugs.has(slug);
    });

    if (available.length === 0) {
      return NextResponse.json({ success: true, message: 'All vehicles already posted!' });
    }

    const toPost = available.sort(() => Math.random() - 0.5).slice(0, count);
    const results = [];

    for (const vehicle of toPost) {
      try {
        // Simple hardcoded prompt — Gemini ले sure JSON return गरोस्
        const prompt = `You are a Nepal vehicle expert. Return ONLY this JSON with no extra text, no markdown:
{
  "price": "estimated NPR price number only like 285000",
  "mileage": "like 45 kmpl or 120 km range",
  "engine": "like 160cc or 4.2 kWh",
  "features": ["feature1","feature2","feature3","feature4","feature5"],
  "seoTitle": "${vehicle.name} Price in Nepal 2025",
  "seoDescription": "Buy ${vehicle.name} in Nepal. Check latest price, specs and review.",
  "image_search_keyword": "${vehicle.brand} motorcycle Nepal",
  "description": [
    {"style":"h2","text":"Overview"},
    {"style":"normal","text":"The ${vehicle.name} is a popular ${vehicle.type} in Nepal offered by ${vehicle.brand} with excellent performance and value."},
    {"style":"h2","text":"Engine and Performance"},
    {"style":"normal","text":"Powered by a capable engine that delivers smooth performance on Nepal roads."},
    {"style":"h2","text":"Price in Nepal"},
    {"style":"normal","text":"The ${vehicle.name} is competitively priced in the Nepal market offering great value for money."},
    {"style":"h2","text":"Should You Buy It?"},
    {"style":"normal","text":"An excellent choice for Nepali buyers looking for reliability and performance."}
  ]
}

Fill in realistic values for ${vehicle.name} by ${vehicle.brand}.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${model.name}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3 },
            }),
          }
        );

        if (!geminiRes.ok) throw new Error(`Gemini HTTP ${geminiRes.status}`);
        const geminiData = await geminiRes.json();

        // Safe extraction
        const candidates = geminiData?.candidates;
        if (!candidates?.length) throw new Error('No candidates from Gemini');
        const rawText = candidates[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error('Empty response from Gemini');

        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleaned);

        // Pexels image
        let imageAssetId = null;
        if (process.env.PEXELS_API_KEY) {
          try {
            const pRes = await fetch(
              `https://api.pexels.com/v1/search?query=${encodeURIComponent(data.image_search_keyword)}&per_page=1`,
              { headers: { Authorization: process.env.PEXELS_API_KEY.trim() } }
            );
            const pData = await pRes.json();
            if (pData.photos?.[0]?.src?.large) {
              const imgRes = await fetch(pData.photos[0].src.large);
              if (imgRes.ok) {
                const buffer = Buffer.from(await imgRes.arrayBuffer());
                const asset = await sanityClient.assets.upload('image', buffer, {
                  filename: `${vehicle.brand}-${Date.now()}.jpg`.toLowerCase().replace(/\s/g, '-'),
                  contentType: 'image/jpeg',
                });
                imageAssetId = asset._id;
              }
            }
          } catch (imgErr) {
            console.error('Image upload failed:', imgErr);
          }
        }

        // Build Sanity doc
        const slug = vehicle.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const body = (data.description || []).map((b: any) => ({
          _type: 'block',
          _key: Math.random().toString(36).slice(2),
          style: b.style || 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: Math.random().toString(36).slice(2), marks: [], text: b.text }],
        }));

        const doc: any = {
          _type: 'vehicle',
          name: vehicle.name,
          slug: { _type: 'slug', current: slug },
          type: vehicle.type,
          brand: vehicle.brand,
          price: String(data.price || ''),
          mileage: data.mileage || '',
          engine: data.engine || '',
          features: data.features || [],
          description: body,
          seoTitle: data.seoTitle || vehicle.name,
          seoDescription: data.seoDescription || '',
        };

        if (imageAssetId) {
          doc.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: imageAssetId } };
        }

        await sanityClient.create(doc);
        results.push({ success: true, name: vehicle.name });

      } catch (e: any) {
        results.push({ success: false, name: vehicle.name, error: e.message });
      }
    }

    return NextResponse.json({
      success: true,
      posted: results.filter(r => r.success).length,
      results,
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
