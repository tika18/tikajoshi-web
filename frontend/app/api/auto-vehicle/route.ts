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

    // Find model
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();
    const model = (listData.models || []).find((m: any) =>
      m.supportedGenerationMethods?.includes('generateContent') && m.name.includes('gemini')
    );
    if (!model) throw new Error('No Gemini model');

    // Already posted
    const posted = await sanityClient.fetch(`*[_type == "vehicle"]{ "slug": slug.current }`);
    const postedSlugs = new Set(posted.map((v: any) => v.slug));
    const available = VEHICLES.filter(v => {
      const slug = v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return !postedSlugs.has(slug);
    });

    if (available.length === 0) return NextResponse.json({ success: true, message: 'All posted!' });

    const toPost = available.sort(() => Math.random() - 0.5).slice(0, count);
    const results = [];

    for (const vehicle of toPost) {
      try {
        const prompt = `Write a Nepal vehicle review for ${vehicle.name}. Return ONLY valid JSON:
{"price":"285000","mileage":"45 kmpl","engine":"160cc Single Cylinder","features":["Feature 1","Feature 2","Feature 3","Feature 4","Feature 5"],"seoTitle":"${vehicle.name} Price in Nepal 2025","seoDescription":"${vehicle.name} price, specs and review in Nepal 2025.","image_search_keyword":"${vehicle.brand} ${vehicle.type} motorcycle","description":[{"style":"h2","text":"Overview"},{"style":"normal","text":"The ${vehicle.name} is one of the most popular vehicles in Nepal market offering great value."},{"style":"h2","text":"Performance"},{"style":"normal","text":"Detailed performance analysis for Nepal roads and conditions."},{"style":"h2","text":"Price in Nepal"},{"style":"normal","text":"Price and value for money analysis in Nepal market."},{"style":"h2","text":"Verdict"},{"style":"normal","text":"Final verdict for Nepali buyers."}]}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${model.name}:generateContent?key=${apiKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
        );
        const geminiData = await geminiRes.json();
        let text = geminiData.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(text);

        // Pexels image
        let imageAssetId = null;
        if (process.env.PEXELS_API_KEY) {
          const pRes = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(data.image_search_keyword)}&per_page=1`,
            { headers: { Authorization: process.env.PEXELS_API_KEY.trim() } }
          );
          const pData = await pRes.json();
          if (pData.photos?.[0]) {
            const imgRes = await fetch(pData.photos[0].src.large);
            if (imgRes.ok) {
              const buffer = Buffer.from(await imgRes.arrayBuffer());
              const asset = await sanityClient.assets.upload('image', buffer, {
                filename: vehicle.brand.toLowerCase() + '-' + Date.now() + '.jpg',
                contentType: 'image/jpeg',
              });
              imageAssetId = asset._id;
            }
          }
        }

        const slug = vehicle.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const body = data.description.map((b: any) => ({
          _type: 'block', _key: Math.random().toString(36).slice(2),
          style: b.style, markDefs: [],
          children: [{ _type: 'span', _key: Math.random().toString(36).slice(2), marks: [], text: b.text }],
        }));

        const doc: any = {
          _type: 'vehicle',
          name: vehicle.name,
          slug: { _type: 'slug', current: slug },
          type: vehicle.type,
          brand: vehicle.brand,
          price: data.price,
          mileage: data.mileage,
          engine: data.engine,
          features: data.features,
          description: body,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
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

    return NextResponse.json({ success: true, posted: results.filter(r => r.success).length, results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
