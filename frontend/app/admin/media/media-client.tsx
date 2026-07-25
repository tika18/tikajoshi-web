// frontend/app/admin/media/media-client.tsx
"use client";

import React, { useState, useTransition, useMemo } from "react";
import { uploadMedia, deleteMediaAsset, updateMediaAssetAlt } from "@/actions/sanity";
import { useToast } from "@/components/Toast";
import {
  UploadCloud,
  Grid,
  List,
  Copy,
  Trash2,
  Edit,
  Check,
  Search,
  Loader2,
  FileImage,
  ExternalLink,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaAsset {
  _id: string;
  url: string;
  metadata?: {
    dimensions: {
      width: number;
      height: number;
    };
  };
  originalFilename?: string;
  size: number;
  altText?: string;
}

export default function MediaClient({ initialAssets }: { initialAssets: MediaAsset[] }) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drag & drop states
  const [dragActive, setDragActive] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Selected asset for Alt Editor Panel
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [altText, setAltText] = useState("");
  const [updatingAlt, setUpdatingAlt] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Search Filter
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const q = searchQuery.toLowerCase();
    return assets.filter(
      (a) =>
        (a.originalFilename && a.originalFilename.toLowerCase().includes(q)) ||
        (a.altText && a.altText.toLowerCase().includes(q))
    );
  }, [assets, searchQuery]);

  // 2. Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFile = async (file: File) => {
    const toastId = toast(`Uploading "${file.name}"...`, "loading");
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadMedia(formData);
    if (res.success && res.asset) {
      toast("Media uploaded successfully", "success");
      
      const newAsset: MediaAsset = {
        _id: res.asset._id,
        url: res.asset.url,
        size: res.asset.size,
        originalFilename: res.asset.originalFilename,
        metadata: res.asset.metadata,
      };

      setAssets((prev) => [newAsset, ...prev]);
    } else {
      toast(res.error || "Failed to upload file", "error");
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files);
      for (const file of filesArray) {
        if (file.type.startsWith("image/")) {
          await uploadFile(file);
        } else {
          toast("Only image files are supported", "info");
        }
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files);
      for (const file of filesArray) {
        await uploadFile(file);
      }
    }
  };

  // 3. Clipboard copy
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast("Link copied to clipboard", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 4. Delete Asset
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name || "this asset"}"?`)) return;

    const toastId = toast("Deleting asset...", "loading");
    const res = await deleteMediaAsset(id);

    startTransition(() => {
      if (res.success) {
        toast("Asset deleted successfully", "success");
        setAssets((prev) => prev.filter((a) => a._id !== id));
        if (selectedAsset?._id === id) {
          setSelectedAsset(null);
        }
      } else {
        toast(res.error || "Delete failed", "error");
      }
    });
  };

  // 5. Update Alt Text
  const handleUpdateAlt = async () => {
    if (!selectedAsset) return;
    setUpdatingAlt(true);
    const res = await updateMediaAssetAlt(selectedAsset._id, altText);
    setUpdatingAlt(false);
    
    if (res.success) {
      toast("Alt text updated", "success");
      setAssets((prev) =>
        prev.map((a) => (a._id === selectedAsset._id ? { ...a, altText } : a))
      );
      setSelectedAsset((prev) => (prev ? { ...prev, altText } : null));
    } else {
      toast(res.error || "Update failed", "error");
    }
  };

  const openAltEditor = (asset: MediaAsset) => {
    setSelectedAsset(asset);
    setAltText(asset.altText || "");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Media Library</h1>
          <p className="text-xs text-slate-500 mt-1">Upload and manage Sanity CDN assets</p>
        </div>
      </div>

      {/* Drag & Drop File Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full py-10 bg-white/[0.01] hover:bg-white/[0.02] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition duration-200 cursor-pointer ${
          dragActive
            ? "border-indigo-500 bg-indigo-500/5 text-indigo-400"
            : "border-white/10 text-slate-500 hover:border-indigo-500/30"
        }`}
      >
        <UploadCloud size={32} className={dragActive ? "text-indigo-400" : "text-slate-400"} />
        <div className="text-center">
          <p className="text-xs font-bold text-white">Drag and drop images here, or click to browse</p>
          <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG, WEBP, SVG up to 10MB</p>
        </div>
        <label className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold cursor-pointer transition shadow-lg shadow-indigo-600/10">
          Browse Files
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#05090f]/75 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search assets by name or alt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/60 rounded-xl py-1.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none transition"
          />
        </div>

        {/* View togglers */}
        <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition ${
              viewMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Grid size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition ${
              viewMode === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 items-start">
        {/* Grid/List representation */}
        <div className="lg:col-span-3">
          {filteredAssets.length > 0 ? (
            viewMode === "grid" ? (
              // GRID REPRESENTATION
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset._id}
                    className="group relative bg-[#05090f]/75 border border-white/5 hover:border-indigo-500/30 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col aspect-square justify-between"
                  >
                    <div className="flex-1 bg-white/5 overflow-hidden relative flex items-center justify-center">
                      <img src={asset.url} alt="" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-300" />
                      
                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 gap-1.5">
                        <button
                          onClick={() => handleCopyLink(asset.url, asset._id)}
                          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                          title="Copy CDN Link"
                        >
                          {copiedId === asset._id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => openAltEditor(asset)}
                          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                          title="Edit Alt Text"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(asset._id, asset.originalFilename || "")}
                          className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition"
                          title="Delete Asset"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Caption bar */}
                    <div className="p-2.5 bg-[#05090f]/90 border-t border-white/5 shrink-0 select-none">
                      <p className="text-[10px] font-bold text-white truncate">
                        {asset.originalFilename || "untitled-image"}
                      </p>
                      <p className="text-[8px] text-slate-500 font-semibold tracking-wide mt-0.5">
                        {asset.metadata?.dimensions
                          ? `${asset.metadata.dimensions.width}×${asset.metadata.dimensions.height}`
                          : "Image"}{" "}
                        · {Math.round(asset.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // LIST REPRESENTATION
              <div className="bg-[#05090f]/75 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/[0.01] border-b border-white/5 text-[10px] font-black uppercase text-slate-500 tracking-wider select-none">
                      <th className="py-3 px-4 w-14">Image</th>
                      <th className="py-3 px-4">Filename</th>
                      <th className="py-3 px-4">Dimensions</th>
                      <th className="py-3 px-4">File Size</th>
                      <th className="py-3 px-4">Alt Text</th>
                      <th className="py-3 px-4 text-right pr-6 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredAssets.map((asset) => (
                      <tr key={asset._id} className="hover:bg-white/[0.01] transition-all">
                        <td className="py-2.5 px-4">
                          <div className="w-9 h-9 bg-white/5 rounded overflow-hidden border border-white/5 relative flex items-center justify-center font-bold">
                            <img src={asset.url} alt="" className="object-cover w-full h-full" />
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-white max-w-[200px] truncate">
                          {asset.originalFilename || "untitled-asset"}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">
                          {asset.metadata?.dimensions
                            ? `${asset.metadata.dimensions.width}×${asset.metadata.dimensions.height}`
                            : "Image"}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">
                          {Math.round(asset.size / 1024)} KB
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 italic truncate max-w-[200px]" title={asset.altText}>
                          {asset.altText || "No description / altText configured"}
                        </td>
                        <td className="py-2.5 px-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleCopyLink(asset.url, asset._id)}
                              className="p-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-slate-400 hover:text-white rounded-lg transition"
                              title="Copy Link"
                            >
                              {copiedId === asset._id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                            <button
                              onClick={() => openAltEditor(asset)}
                              className="p-1.5 bg-white/[0.03] hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded-lg transition"
                              title="Edit Alt"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(asset._id, asset.originalFilename || "")}
                              className="p-1.5 bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition animate-opacity"
                              title="Delete Asset"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl text-slate-500">
              <FileImage size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-400">No media assets found</p>
              <p className="text-[10px] text-slate-600 mt-1">Files uploaded in Sanity CDN will display here.</p>
            </div>
          )}
        </div>

        {/* Selected Asset Alt Text Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#05090f]/75 border border-white/5 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold">Asset Inspector</h3>
            {selectedAsset ? (
              <div className="space-y-4 text-left">
                <div className="aspect-video w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden relative flex items-center justify-center">
                  <img src={selectedAsset.url} alt="" className="object-cover w-full h-full" />
                  <a
                    href={selectedAsset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-1.5 bg-[#080d14]/80 backdrop-blur border border-white/10 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 rounded-lg transition"
                    title="Open CDN Image"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-bold text-slate-500">Filename</p>
                  <p className="text-[11px] font-bold text-white truncate max-w-full" title={selectedAsset.originalFilename}>
                    {selectedAsset.originalFilename || "unknown"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">
                    Alt Text (SEO Description)
                  </label>
                  <textarea
                    placeholder="Describe this image for screen readers and search bots..."
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    rows={4}
                    className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 outline-none resize-none transition"
                  />
                </div>

                <button
                  onClick={handleUpdateAlt}
                  disabled={updatingAlt}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                >
                  {updatingAlt ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Details
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-600 border border-dashed border-white/5 rounded-xl">
                Select an image&apos;s edit button to edit SEO alt text configurations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
