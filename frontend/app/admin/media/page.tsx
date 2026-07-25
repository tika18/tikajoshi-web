// frontend/app/admin/media/page.tsx
import { getMediaAssets } from "@/actions/sanity";
import MediaClient from "./media-client";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const result = await getMediaAssets();

  const assets = result.success && result.assets ? result.assets : [];

  return <MediaClient initialAssets={assets} />;
}
