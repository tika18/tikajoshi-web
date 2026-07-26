// frontend/lib/sanity/writeClient.ts
import { createClient } from "@sanity/client";

// CRITICAL SECURITY CHECK: Ensure this client is NEVER executed in the browser/client-side.
if (typeof window !== "undefined") {
  throw new Error("CRITICAL SECURITY ERROR: Sanity Write Client cannot be instantiated in the browser!");
}

const writeToken = process.env.SANITY_API_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN || "";

if (!writeToken) {
  console.warn("WARNING: Sanity write token (SANITY_API_TOKEN/SANITY_API_WRITE_TOKEN) is not defined in the environment. Write operations will fail.");
}

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: writeToken,
});
