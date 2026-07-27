// frontend/app/admin/study/page.tsx
import { getStudyMaterials } from "@/actions/sanity";
import StudyClient from "./study-client";

export const dynamic = "force-dynamic";

export default async function AdminStudyPage() {
  const result = await getStudyMaterials();
  const materials = result.success && result.materials ? result.materials : [];

  return <StudyClient initialMaterials={materials} />;
}
