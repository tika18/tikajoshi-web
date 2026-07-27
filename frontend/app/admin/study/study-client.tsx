// frontend/app/admin/study/study-client.tsx
"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { deleteStudyMaterial } from "@/actions/sanity";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  FileText,
  BookOpen,
  Trash2,
  Edit,
  ExternalLink,
  Layers,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Target {
  university: string;
  stream: string;
  semester: string;
}

interface Material {
  title: string;
  pdfFile?: any;
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

export default function StudyClient({ initialMaterials }: { initialMaterials: StudyMaterial[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<StudyMaterial[]>(initialMaterials);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionId, setActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pageSize = 10;

  // Filtering
  const filteredMaterials = useMemo(() => {
    let result = [...materials];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.subjectName.toLowerCase().includes(q) ||
          (m.subjectCode && m.subjectCode.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((m) => m.category === categoryFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((m) => m.resourceType === typeFilter);
    }

    return result;
  }, [materials, searchQuery, categoryFilter, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredMaterials.length / pageSize) || 1;
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMaterials.slice(start, start + pageSize);
  }, [filteredMaterials, currentPage]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setActionId(id);
    const toastId = toast("Deleting study material...", "loading");

    const res = await deleteStudyMaterial(id);
    setActionId(null);

    startTransition(() => {
      if (res.success) {
        toast("Study material deleted successfully", "success");
        setMaterials((prev) => prev.filter((m) => m._id !== id));
        router.refresh();
      } else {
        toast(res.error || "Failed to delete", "error");
      }
    });
  };

  const getCategoryLabel = (cat: string) => {
    const maps: Record<string, string> = {
      ioe: "IOE / Engineering",
      loksewa: "Loksewa",
      neb: "NEB Class 11/12",
      license: "License Exam",
      general: "General",
    };
    return maps[cat] || cat;
  };

  const getCategoryColor = (cat: string) => {
    const maps: Record<string, string> = {
      ioe: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      loksewa: "bg-red-500/10 text-red-400 border-red-500/20",
      neb: "bg-green-500/10 text-green-400 border-green-500/20",
      license: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      general: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return maps[cat] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  const getTypeLabel = (type: string) => {
    const maps: Record<string, string> = {
      notes: "Notes",
      question: "Question Bank",
      syllabus: "Syllabus",
      book: "Reference Book",
      video: "Video Lecture",
      lab: "Lab Manual",
    };
    return maps[type] || type;
  };

  const getTypeColor = (type: string) => {
    const maps: Record<string, string> = {
      notes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      question: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      syllabus: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      book: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      video: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      lab: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    };
    return maps[type] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Study Materials</h1>
          <p className="text-xs text-slate-500 mt-1">Manage, search, edit and upload study materials (syllabus, notes, question banks)</p>
        </div>
        <Link
          href="/admin/study/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 self-start sm:self-auto"
        >
          <Plus size={15} /> Add Study Material
        </Link>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-[#05090f]/75 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search by subject name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/60 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl px-2.5 py-1.5">
            <Filter size={12} className="text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-[#080d14]">All Categories</option>
              <option value="ioe" className="bg-[#080d14]">IOE / Engineering</option>
              <option value="loksewa" className="bg-[#080d14]">Loksewa</option>
              <option value="neb" className="bg-[#080d14]">NEB Class 11/12</option>
              <option value="license" className="bg-[#080d14]">License Exam</option>
              <option value="general" className="bg-[#080d14]">General</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl px-2.5 py-1.5">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-[#080d14]">All Types</option>
              <option value="notes" className="bg-[#080d14]">Notes</option>
              <option value="question" className="bg-[#080d14]">Question Bank</option>
              <option value="syllabus" className="bg-[#080d14]">Syllabus</option>
              <option value="book" className="bg-[#080d14]">Reference Book</option>
              <option value="video" className="bg-[#080d14]">Video Lecture</option>
              <option value="lab" className="bg-[#080d14]">Lab Manual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid List or Table View */}
      <div className="bg-[#05090f]/75 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="p-4 text-[10px] font-black tracking-wider uppercase text-slate-500 pl-6">Subject</th>
                <th className="p-4 text-[10px] font-black tracking-wider uppercase text-slate-500">Category</th>
                <th className="p-4 text-[10px] font-black tracking-wider uppercase text-slate-500">Type</th>
                <th className="p-4 text-[10px] font-black tracking-wider uppercase text-slate-500">Targeting Rules</th>
                <th className="p-4 text-[10px] font-black tracking-wider uppercase text-slate-500">Material Files</th>
                <th className="p-4 text-[10px] font-black tracking-wider uppercase text-slate-500 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedMaterials.map((material) => {
                const targetsCount = material.targets?.length || 0;
                const filesCount = material.materials?.length || 0;

                return (
                  <tr key={material._id} className="hover:bg-white/[0.01] transition duration-150">
                    {/* Subject */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                          <Layers size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{material.subjectName}</p>
                          {material.subjectCode && (
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{material.subjectCode}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getCategoryColor(material.category)}`}>
                        {getCategoryLabel(material.category)}
                      </span>
                    </td>

                    {/* Resource Type */}
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getTypeColor(material.resourceType)}`}>
                        {getTypeLabel(material.resourceType)}
                      </span>
                    </td>

                    {/* Targeting Summary */}
                    <td className="p-4 text-xs text-slate-400">
                      {targetsCount > 0 ? (
                        <div className="max-w-xs truncate">
                          {material.targets?.map((t, idx) => (
                            <span key={idx} className="block text-[10px] leading-tight">
                              • <span className="uppercase text-slate-300">{t.university}</span>: {t.stream} (Sem {t.semester})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600 italic">No targeting set</span>
                      )}
                    </td>

                    {/* Materials Count */}
                    <td className="p-4 text-xs font-bold text-slate-300">
                      {filesCount > 0 ? (
                        <span className="flex items-center gap-1.5 text-xs text-indigo-400">
                          <FileText size={13} /> {filesCount} Resource{filesCount > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic text-xs">No resources uploaded</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/study/${material._id}/edit`}
                          className="p-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-lg transition"
                          title="Edit Material"
                        >
                          <Edit size={12} />
                        </Link>
                        <button
                          onClick={() => handleDelete(material._id, material.subjectName)}
                          disabled={actionId === material._id}
                          className="p-1.5 bg-red-600/10 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white rounded-lg transition disabled:opacity-30"
                          title="Delete Material"
                        >
                          {actionId === material._id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500 text-xs">
                    No study materials found matching the search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-2">
              Showing {Math.min(filteredMaterials.length, (currentPage - 1) * pageSize + 1)}-
              {Math.min(filteredMaterials.length, currentPage * pageSize)} of {filteredMaterials.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-white/5 hover:border-white/10 rounded-xl disabled:opacity-20 text-slate-400 hover:text-white transition"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold px-3 py-1 bg-white/5 rounded-lg text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-white/5 hover:border-white/10 rounded-xl disabled:opacity-20 text-slate-400 hover:text-white transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
