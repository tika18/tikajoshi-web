// frontend/actions/sanity.ts
"use server";

import { writeClient } from "@/lib/sanity/writeClient";
import { revalidatePath } from "next/cache";

// Helper to determine status from a post
function getPostStatus(post: any) {
  if (!post.publishedAt) return "draft";
  const pubDate = new Date(post.publishedAt);
  const now = new Date();
  return pubDate > now ? "scheduled" : "published";
}

export async function getAdminPosts() {
  try {
    const posts = await writeClient.fetch(
      `*[_type == "post"] | order(publishedAt desc, _createdAt desc) {
        _id,
        title,
        "slug": slug.current,
        excerpt,
        publishedAt,
        _createdAt,
        _updatedAt,
        "imageUrl": mainImage.asset->url,
        mainImage {
          asset {
            _ref,
            _type
          }
        },
        seoTitle,
        seoDescription
      }`
    );

    return {
      success: true,
      posts: posts.map((p: any) => ({
        ...p,
        status: getPostStatus(p),
      })),
    };
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return { success: false, error: error.message, posts: [] };
  }
}

export async function getPostById(id: string) {
  try {
    const post = await writeClient.fetch(
      `*[_type == "post" && _id == $id][0] {
        _id,
        title,
        "slug": slug.current,
        excerpt,
        publishedAt,
        body,
        mainImage,
        "imageUrl": mainImage.asset->url,
        seoTitle,
        seoDescription
      }`,
      { id }
    );
    return { success: true, post };
  } catch (error: any) {
    console.error("Error fetching post by ID:", error);
    return { success: false, error: error.message };
  }
}

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  body: any[];
  mainImage?: any;
  seoTitle?: string;
  seoDescription?: string;
}) {
  try {
    const doc = {
      _type: "post",
      title: data.title,
      slug: { _type: "slug", current: data.slug },
      excerpt: data.excerpt || "",
      publishedAt: data.publishedAt || new Date().toISOString(),
      body: data.body || [],
      mainImage: data.mainImage || null,
      seoTitle: data.seoTitle || "",
      seoDescription: data.seoDescription || "",
    };

    const newDoc = await writeClient.create(doc);
    revalidatePath("/blog");
    revalidatePath("/admin/blogs");
    return { success: true, id: newDoc._id };
  } catch (error: any) {
    console.error("Error creating post:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePost(
  id: string,
  data: {
    title: string;
    slug: string;
    excerpt?: string;
    publishedAt?: string;
    body: any[];
    mainImage?: any;
    seoTitle?: string;
    seoDescription?: string;
  }
) {
  try {
    const patchData: any = {
      title: data.title,
      slug: { _type: "slug", current: data.slug },
      excerpt: data.excerpt || "",
      publishedAt: data.publishedAt || new Date().toISOString(),
      body: data.body || [],
      seoTitle: data.seoTitle || "",
      seoDescription: data.seoDescription || "",
    };

    if (data.mainImage !== undefined) {
      patchData.mainImage = data.mainImage;
    }

    await writeClient
      .patch(id)
      .set(patchData)
      .commit();

    revalidatePath("/blog");
    revalidatePath(`/blog/${data.slug}`);
    revalidatePath("/admin/blogs");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating post:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePost(id: string) {
  try {
    await writeClient.delete(id);
    revalidatePath("/blog");
    revalidatePath("/admin/blogs");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return { success: false, error: error.message };
  }
}

export async function bulkDeletePosts(ids: string[]) {
  try {
    const transaction = writeClient.transaction();
    ids.forEach((id) => transaction.delete(id));
    await transaction.commit();
    revalidatePath("/blog");
    revalidatePath("/admin/blogs");
    return { success: true };
  } catch (error: any) {
    console.error("Error bulk deleting posts:", error);
    return { success: false, error: error.message };
  }
}

export async function bulkPublishPosts(ids: string[], publish: boolean) {
  try {
    const transaction = writeClient.transaction();
    
    if (publish) {
      // Set publishedAt to now
      const now = new Date().toISOString();
      ids.forEach((id) => {
        transaction.patch(id, (p) => p.set({ publishedAt: now }));
      });
    } else {
      // Unpublish: set publishedAt to null (or we can unset it)
      ids.forEach((id) => {
        transaction.patch(id, (p) => p.unset(["publishedAt"]));
      });
    }

    await transaction.commit();
    revalidatePath("/blog");
    revalidatePath("/admin/blogs");
    return { success: true };
  } catch (error: any) {
    console.error("Error bulk updating publication status:", error);
    return { success: false, error: error.message };
  }
}

// Media library actions
export async function getMediaAssets() {
  try {
    const assets = await writeClient.fetch(
      `*[_type == "sanity.imageAsset"] | order(_createdAt desc) {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height
          }
        },
        originalFilename,
        size,
        title,
        description,
        altText
      }`
    );
    return { success: true, assets };
  } catch (error: any) {
    console.error("Error fetching media assets:", error);
    return { success: false, error: error.message, assets: [] };
  }
}

export async function uploadMedia(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload asset
    const asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return { success: true, asset };
  } catch (error: any) {
    console.error("Error uploading media:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMediaAsset(id: string) {
  try {
    await writeClient.delete(id);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting media asset:", error);
    return { success: false, error: error.message };
  }
}

export async function updateMediaAssetAlt(id: string, altText: string) {
  try {
    await writeClient.patch(id).set({ altText }).commit();
    return { success: true };
  } catch (error: any) {
    console.error("Error updating alt text:", error);
    return { success: false, error: error.message };
  }
}

export async function getStudyMaterials() {
  try {
    const materials = await writeClient.fetch(
      `*[_type == "studyMaterial"] | order(subjectName asc, _createdAt desc) {
        _id,
        subjectName,
        subjectCode,
        category,
        resourceType,
        targets,
        materials,
        isShared,
        publishedAt,
        _createdAt
      }`
    );
    return { success: true, materials };
  } catch (error: any) {
    console.error("Error fetching study materials:", error);
    return { success: false, error: error.message, materials: [] };
  }
}

export async function getStudyMaterialById(id: string) {
  try {
    const material = await writeClient.fetch(
      `*[_type == "studyMaterial" && _id == $id][0]`,
      { id }
    );
    return { success: true, material };
  } catch (error: any) {
    console.error("Error fetching study material by ID:", error);
    return { success: false, error: error.message };
  }
}

export async function createStudyMaterial(payload: any) {
  try {
    const doc = {
      _type: "studyMaterial",
      ...payload,
      publishedAt: payload.publishedAt || new Date().toISOString(),
    };
    const res = await writeClient.create(doc);
    revalidatePath("/study");
    revalidatePath("/study/ioe");
    revalidatePath("/study/neb");
    revalidatePath("/study/license");
    revalidatePath("/study/loksewa");
    return { success: true, id: res._id };
  } catch (error: any) {
    console.error("Error creating study material:", error);
    return { success: false, error: error.message };
  }
}

export async function updateStudyMaterial(id: string, payload: any) {
  try {
    const res = await writeClient
      .patch(id)
      .set(payload)
      .commit();
    revalidatePath("/study");
    revalidatePath("/study/ioe");
    revalidatePath("/study/neb");
    revalidatePath("/study/license");
    revalidatePath("/study/loksewa");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating study material:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteStudyMaterial(id: string) {
  try {
    await writeClient.delete(id);
    revalidatePath("/study");
    revalidatePath("/study/ioe");
    revalidatePath("/study/neb");
    revalidatePath("/study/license");
    revalidatePath("/study/loksewa");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting study material:", error);
    return { success: false, error: error.message };
  }
}

export async function uploadStudyFile(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await writeClient.assets.upload("file", buffer, {
      filename: file.name,
      contentType: file.type,
    });
    return { success: true, asset };
  } catch (error: any) {
    console.error("Error uploading study file:", error);
    return { success: false, error: error.message };
  }
}

export async function testSanityConnection() {
  const startTime = Date.now();
  try {
    // Basic ping test querying Sanity project configurations
    const project = writeClient.config();
    // Do a quick light query
    await writeClient.fetch(`*[_type == "post"][0..0]`);
    const latency = Date.now() - startTime;
    return {
      success: true,
      projectId: project.projectId,
      dataset: project.dataset,
      latency,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

