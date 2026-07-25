// frontend/actions/cache.ts
"use server";

import { revalidatePath } from "next/cache";

/**
 * Force-purges the Next.js cache for the entire site on-demand
 */
export async function forceRevalidateAll() {
  try {
    // Revalidates all routes recursively
    revalidatePath("/", "layout");
    return { success: true, message: "Entire site cache purged successfully!" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
