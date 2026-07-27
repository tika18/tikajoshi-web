// frontend/app/admin/study/[id]/edit/page.tsx
import { getStudyMaterialById } from "@/actions/sanity";
import { notFound } from "next/navigation";
import StudyEditorClient from "../../study-editor-client";

export const dynamic = "force-dynamic";

interface EditStudyMaterialPageProps {
  params: {
    id: string;
  };
}

export default async function EditStudyMaterialPage({ params }: EditStudyMaterialPageProps) {
  const result = await getStudyMaterialById(params.id);

  if (!result.success || !result.material) {
    notFound();
  }

  // Map Sanity schema files structure if necessary to local components
  const material = result.material;

  return <StudyEditorClient initialMaterial={material} />;
}
