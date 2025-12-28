import { createClient } from "next-sanity";
import { NextResponse } from "next/server";

// Client Config with Token
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN, // Make sure .env.local has this!
  useCdn: false,
  apiVersion: "2024-01-01",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Get Text Data
    const title = formData.get("title") as string;
    const body = formData.get("description") as string;
    const category = formData.get("category") as string;
    const author = formData.get("author") as string;
    const isGuest = formData.get("isGuest") === "true"; // Fix boolean conversion

    // Get Image File
    const imageFile = formData.get("image") as File;
    let imagesArray = [];

    // 1. Upload Image to Sanity Assets
    if (imageFile) {
      console.log("Uploading Image...");
      const buffer = await imageFile.arrayBuffer();
      const asset = await client.assets.upload("image", Buffer.from(buffer), {
        filename: imageFile.name,
      });
      
      // 2. Prepare Reference Object
      imagesArray.push({
        _key: Math.random().toString(36).substring(7), // Unique Key required for arrays
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      });
    }

    // 3. Create Document
    console.log("Creating Post...");
    await client.create({
      _type: "chillPost",
      title,
      body,
      category,
      author,
      isGuest, // Boolean
      images: imagesArray, // Array of image references
      publishedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Success" });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}