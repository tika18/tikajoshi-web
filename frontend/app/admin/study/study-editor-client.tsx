// frontend/app/admin/study/study-editor-client.tsx
"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import {
  createStudyMaterial,
  updateStudyMaterial,
  uploadStudyFile,
} from "@/actions/sanity";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  FileText,
  Youtube,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

interface Target {
  university: string;
  stream: string;
  semester: string;
}

interface Material {
  title: string;
  pdfFile?: {
    _type: "file";
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
  fileUrl?: string; // Cache url locally for preview
  videoLink?: string;
  externalLink?: string;
  description?: string;
}

interface StudyMaterial {
  _id: string;
  subjectName: string;
  subjectCode?: string;
  category: "ioe" | "loksewa" | "neb" | "license" | "general";
  resourceType: "notes" | "question" | "syllabus" | "book" | "video" | "lab";
  targets?: Target[];
  materials?: Material[];
  isShared?: boolean;
  publishedAt?: string;
  _createdAt: string;
}

interface StudyEditorClientProps {
  initialMaterial?: StudyMaterial;
}

export default function StudyEditorClient({ initialMaterial }: StudyEditorClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!initialMaterial;
  const [materialId, setMaterialId] = useState(initialMaterial?._id || "");

  // Form Fields State
  const [subjectName, setSubjectName] = useState(initialMaterial?.subjectName || "");
  const [subjectCode, setSubjectCode] = useState(initialMaterial?.subjectCode || "");
  const [category, setCategory] = useState<StudyMaterial["category"]>(
    initialMaterial?.category || "ioe"
  );
  const [resourceType, setResourceType] = useState<StudyMaterial["resourceType"]>(
    initialMaterial?.resourceType || "notes"
  );
  const [isShared, setIsShared] = useState(initialMaterial?.isShared || false);
  const [description, setDescription] = useState(initialMaterial?.description || "");
  const [publishedAt, setPublishedAt] = useState(
    initialMaterial?.publishedAt
      ? new Date(initialMaterial.publishedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );

  // Targets State
  const [targets, setTargets] = useState<Target[]>(initialMaterial?.targets || []);
  const [newTarget, setNewTarget] = useState<Target>({
    university: "tu",
    stream: "computer",
    semester: "1",
  });

  // Materials List State
  const [materialsList, setMaterialsList] = useState<Material[]>(
    initialMaterial?.materials || []
  );

  // Uploading state track for rows
  const [uploadingRowIdx, setUploadingRowIdx] = useState<number | null>(null);

  // Autosave Engine
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const skipAutosaveRef = useRef(false);

  const saveContent = async (silent = false) => {
    if (!subjectName.trim()) {
      if (!silent) toast("Subject Name is required", "error");
      return;
    }

    const payload = {
      subjectName,
      subjectCode: subjectCode.trim() || undefined,
      category,
      resourceType,
      isShared,
      description,
      publishedAt: new Date(publishedAt).toISOString(),
      targets: targets.length > 0 ? targets : undefined,
      materials: materialsList.length > 0 ? materialsList : undefined,
    };

    setSaveStatus("saving");

    if (materialId) {
      // Update
      const res = await updateStudyMaterial(materialId, payload);
      if (res.success) {
        setSaveStatus("saved");
        if (!silent) toast("Study material saved", "success");
        startTransition(() => {
          router.refresh();
        });
      } else {
        setSaveStatus("error");
        if (!silent) toast(res.error || "Save failed", "error");
      }
    } else {
      // Create
      const res = await createStudyMaterial(payload);
      if (res.success && res.id) {
        setMaterialId(res.id);
        setSaveStatus("saved");
        if (!silent) toast("Study material created and saved", "success");
        skipAutosaveRef.current = true;
        startTransition(() => {
          router.push(`/admin/study/${res.id}/edit`);
          router.refresh();
        });
      } else {
        setSaveStatus("error");
        if (!silent) toast(res.error || "Creation failed", "error");
      }
    }
  };

  // Autosave triggers
  useEffect(() => {
    if (!subjectName.trim()) return;
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      saveContent(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    subjectName,
    subjectCode,
    category,
    resourceType,
    isShared,
    description,
    publishedAt,
    targets,
    materialsList,
  ]);

  // Target Helpers
  const addTargetRule = () => {
    // Avoid exact duplicate targets
    const isDuplicate = targets.some(
      (t) =>
        t.university === newTarget.university &&
        t.stream === newTarget.stream &&
        t.semester === newTarget.semester
    );
    if (isDuplicate) {
      toast("This targeting rule already exists", "info");
      return;
    }

    setTargets((prev) => [...prev, newTarget]);
    toast("Targeting rule added", "success");
  };

  const removeTargetRule = (idx: number) => {
    setTargets((prev) => prev.filter((_, i) => i !== idx));
  };

  // Materials Helpers
  const addMaterialRow = () => {
    const newMaterial: Material = {
      title: "",
      description: "",
      videoLink: "",
      externalLink: "",
    };
    setMaterialsList((prev) => [...prev, newMaterial]);
  };

  const updateMaterialField = (idx: number, field: keyof Material, value: any) => {
    setMaterialsList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleFileUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRowIdx(idx);
    const toastId = toast(`Uploading "${file.name}"...`, "loading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadStudyFile(formData);
      if (res && res.success && res.asset) {
        toast("File uploaded successfully", "success");
        // Update the material structure
        setMaterialsList((prev) =>
          prev.map((item, i) =>
            i === idx
              ? {
                  ...item,
                  pdfFile: {
                    _type: "file",
                    asset: {
                      _ref: res.asset._id,
                      _type: "reference",
                    },
                  },
                  fileUrl: res.asset.url,
                }
              : item
          )
        );
      } else {
        toast(res?.error || "File upload failed", "error");
      }
    } catch (err: any) {
      console.error("File upload error:", err);
      toast(err.message || "Connection error during file upload", "error");
    } finally {
      setUploadingRowIdx(null);
    }
  };

  const removeMaterialRow = (idx: number) => {
    setMaterialsList((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/study"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-black">
              {isEditMode ? "Edit Study Material" : "Create Study Material"}
            </h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              {materialId ? `ID: ${materialId}` : "Draft document"}
            </p>
          </div>
        </div>

        {/* Action Button / Save Indicator */}
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
            {saveStatus === "saving" && (
              <>
                <Loader2 size={12} className="animate-spin text-indigo-400" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckCircle size={12} className="text-emerald-400" />
                <span className="text-emerald-400">Autosaved</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle size={12} className="text-red-400" />
                <span className="text-red-400">Save Error</span>
              </>
            )}
          </div>

          <button
            onClick={() => saveContent(false)}
            disabled={isPending || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save Material
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="bg-[#05090f]/75 border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold border-b border-white/5 pb-2">Subject Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subject Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineering Mathematics I, Logic Circuits..."
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition"
                />
              </div>

              {/* Subject Code */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Subject Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. SH 401, CT 602..."
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#03060b] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none transition"
                >
                  <option value="ioe">IOE / Engineering</option>
                  <option value="loksewa">Loksewa</option>
                  <option value="neb">NEB Class 11/12</option>
                  <option value="license">License Exam (NEC/NMC)</option>
                  <option value="general">General / Shared</option>
                </select>
              </div>

              {/* Resource Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Resource Type
                </label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as any)}
                  className="w-full bg-[#03060b] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none transition"
                >
                  <option value="notes">Notes</option>
                  <option value="question">Question Bank / PYQ</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="book">Reference Book</option>
                  <option value="video">Video Lecture</option>
                  <option value="lab">Lab Manual</option>
                </select>
              </div>

              {/* Shared Switch */}
              <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/5 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-white">Shared Subject?</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Appears in multiple streams</p>
                </div>
                <input
                  type="checkbox"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-white/10 bg-transparent"
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Publishing Date
                </label>
                <input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Description / Study Guidelines
                </label>
                <textarea
                  placeholder="Write a brief overview or study guide for this material..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl p-4 text-xs text-white placeholder:text-slate-600 outline-none resize-none transition"
                />
              </div>
            </div>
          </div>

          {/* Resources / Materials List Card */}
          <div className="bg-[#05090f]/75 border border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div>
                <h3 className="text-sm font-bold">Uploaded Resources</h3>
                <p className="text-[10px] text-slate-500">Add documents, links, or videos for this subject</p>
              </div>
              <button
                onClick={addMaterialRow}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 text-indigo-400 hover:text-indigo-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition"
              >
                <Plus size={11} /> Add Resource
              </button>
            </div>

            {/* Materials rows list */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {materialsList.map((material, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.01] border border-white/5 rounded-xl p-4 relative space-y-3.5 hover:border-white/10 transition"
                >
                  {/* Delete button */}
                  <button
                    onClick={() => removeMaterialRow(idx)}
                    className="absolute right-3.5 top-3.5 text-slate-600 hover:text-red-400 transition"
                    title="Remove resource"
                  >
                    <Trash2 size={13} />
                  </button>

                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    Resource #{idx + 1}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Title */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Resource Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Chapter 1 Notes (Handwritten), 2080 Board Question..."
                        value={material.title}
                        onChange={(e) => updateMaterialField(idx, "title", e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/40 transition"
                      />
                    </div>

                    {/* PDF Uploader */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Document PDF File</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                          onChange={(e) => handleFileUpload(idx, e)}
                          id={`file-upload-${idx}`}
                          className="hidden"
                          disabled={uploadingRowIdx === idx}
                        />
                        <label
                          htmlFor={`file-upload-${idx}`}
                          className="flex items-center gap-2 px-4 py-2 border border-dashed border-white/10 hover:border-indigo-500/30 bg-white/[0.01] hover:bg-white/[0.02] text-[10px] font-bold rounded-lg text-slate-400 hover:text-white transition cursor-pointer select-none"
                        >
                          {uploadingRowIdx === idx ? (
                            <Loader2 size={12} className="animate-spin text-indigo-400" />
                          ) : (
                            <FileText size={12} />
                          )}
                          <span>Upload PDF (.pdf, .doc, .ppt)</span>
                        </label>
                        {material.pdfFile && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            ✓ PDF Uploaded
                          </span>
                        )}
                      </div>
                    </div>

                    {/* YouTube Video Link */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-500">YouTube Video URL (optional)</label>
                      <div className="relative">
                        <Youtube size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500/80" />
                        <input
                          type="url"
                          placeholder="https://youtube.com/..."
                          value={material.videoLink || ""}
                          onChange={(e) => updateMaterialField(idx, "videoLink", e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/40 transition"
                        />
                      </div>
                    </div>

                    {/* External Link (Drive/Docs) */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-500">External Drive Link (optional)</label>
                      <div className="relative">
                        <ExternalLink size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                        <input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          value={material.externalLink || ""}
                          onChange={(e) => updateMaterialField(idx, "externalLink", e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/40 transition"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Short Description / Subtitle</label>
                      <input
                        type="text"
                        placeholder="e.g. Contains 5 years old questions with solutions"
                        value={material.description || ""}
                        onChange={(e) => updateMaterialField(idx, "description", e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/40 transition"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {materialsList.length === 0 && (
                <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-xs text-slate-500">
                  No resources added. Click the top button to add files or links!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Form: Targeting Rules */}
        <div className="space-y-6">
          {/* Targeting Editor Card */}
          <div className="bg-[#05090f]/75 border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold border-b border-white/5 pb-2">Targeting Rules</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Target this subject to specific universities, engineering streams, and semesters. Adding rules determines where it appears on the study site.
            </p>

            {/* Rule Selector Panel */}
            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3.5">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Configure Rule</p>

              {/* University Selector */}
              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">University</label>
                <select
                  value={newTarget.university}
                  onChange={(e) => setNewTarget((t) => ({ ...t, university: e.target.value }))}
                  className="w-full bg-[#03060b] border border-white/10 rounded-lg p-2 text-xs text-slate-300 outline-none pr-1"
                >
                  <option value="tu">TU (Tribhuvan)</option>
                  <option value="pu">PU (Pokhara)</option>
                  <option value="both">Both TU & PU</option>
                  <option value="na">Not Applicable</option>
                </select>
              </div>

              {/* Stream Selector */}
              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Stream</label>
                <select
                  value={newTarget.stream}
                  onChange={(e) => setNewTarget((t) => ({ ...t, stream: e.target.value }))}
                  className="w-full bg-[#03060b] border border-white/10 rounded-lg p-2 text-xs text-slate-300 outline-none pr-1"
                >
                  <option value="computer">Computer Engineering</option>
                  <option value="civil">Civil Engineering</option>
                  <option value="electrical">Electrical Engineering</option>
                  <option value="electronics">Electronics Engineering</option>
                  <option value="mechanical">Mechanical Engineering</option>
                  <option value="architecture">Architecture</option>
                  <option value="all">All Engineering Streams</option>
                  <option value="na">Not Applicable</option>
                </select>
              </div>

              {/* Semester Selector */}
              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Semester</label>
                <select
                  value={newTarget.semester}
                  onChange={(e) => setNewTarget((t) => ({ ...t, semester: e.target.value }))}
                  className="w-full bg-[#03060b] border border-white/10 rounded-lg p-2 text-xs text-slate-300 outline-none pr-1"
                >
                  {["1", "2", "3", "4", "5", "6", "7", "8", "entrance", "all"].map((sem) => (
                    <option key={sem} value={sem}>
                      {sem === "all" ? "All Semesters" : sem === "entrance" ? "Entrance Prep" : `Semester ${sem}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={addTargetRule}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition"
              >
                Add Targeting Rule
              </button>
            </div>

            {/* Current Targeting Rules List */}
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Targets</p>
              
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                {targets.map((target, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-xl transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-white uppercase leading-none">{target.university}</p>
                      <p className="text-[9px] text-slate-500 mt-1">
                        {target.stream} · {target.semester === "entrance" ? "Entrance" : `Sem ${target.semester}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeTargetRule(idx)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Remove Target"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {targets.length === 0 && (
                  <div className="text-center py-6 text-[10px] text-slate-600 italic">
                    No targeting tags added yet. Subject is not visible.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
