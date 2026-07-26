// frontend/app/admin/blogs/editor-client.tsx
"use client";

import React, { useState, useEffect, useRef, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost, getMediaAssets, uploadMedia } from "@/actions/sanity";
import { useToast } from "@/components/Toast";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Search,
  Image as ImageIcon,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface EditorClientProps {
  post?: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string;
    body: any[];
    mainImage?: any;
    imageUrl?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
}

interface Block {
  id: string;
  style: "normal" | "h2" | "h3" | "blockquote";
  text: string;
}

export default function EditorClient({ post }: EditorClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!post;
  const [postId, setPostId] = useState(post?._id || "");

  // 1. Fields state
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [publishedAt, setPublishedAt] = useState(
    post?.publishedAt ? new Date(post?.publishedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || "");

  // Cover image states
  const [mainImage, setMainImage] = useState<any>(post?.mainImage || null);
  const [imageUrl, setImageUrl] = useState<string>(post?.imageUrl || "");

  // 2. Block editor state
  // Convert Sanity body PortableText blocks to local Block items
  const initialBlocks = useMemo(() => {
    if (post?.body && Array.isArray(post.body)) {
      return post.body.map((b: any) => ({
        id: b._key || Math.random().toString(36).substring(2, 9),
        style: b.style || "normal",
        text: b.children?.[0]?.text || "",
      }));
    }
    // Default initial blocks
    return [
      { id: "1", style: "h2" as const, text: "Introduction" },
      { id: "2", style: "normal" as const, text: "Start writing your blog content here..." },
    ];
  }, [post]);

  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [editorMode, setEditorMode] = useState<"blocks" | "html">("blocks");
  const [htmlContent, setHtmlContent] = useState("");

  // Sync editor mode and HTML content when post loads
  useEffect(() => {
    if (post) {
      let isHtml = false;
      let bodyText = "";

      if (Array.isArray(post.body)) {
        isHtml = post.body.some((block: any) =>
          block.children?.some((child: any) => /<[a-z][\s\S]*>/i.test(child.text))
        );
        bodyText = post.body
          .map((block: any) => block.children?.map((c: any) => c.text).join("") || "")
          .join("\n");
      } else if (typeof post.body === "string") {
        isHtml = /<[a-z][\s\S]*>/i.test(post.body);
        bodyText = post.body;
      }

      if (isHtml) {
        setEditorMode("html");
        setHtmlContent(bodyText);
      } else {
        setEditorMode("blocks");
        setHtmlContent("");
      }
    }
  }, [post]);  // 3. Media Picker States
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // 4. Autosave Engine
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const skipAutosaveRef = useRef(false); // Prevents initial triggers

  // Generate standard PortableText format from local state
  const getSanityBody = () => {
    if (editorMode === "html") {
      return [
        {
          _type: "block",
          _key: "html-body",
          style: "normal",
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: "html-span",
              marks: [],
              text: htmlContent,
            },
          ],
        },
      ];
    }

    return blocks.map((b) => ({
      _type: "block",
      _key: b.id,
      style: b.style,
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: Math.random().toString(36).substring(2, 9),
          marks: [],
          text: b.text,
        },
      ],
    }));
  };

  // Create or Update operation
  const savePostContent = async (silent = false) => {
    if (!title.trim()) {
      if (!silent) toast("Title is required", "error");
      return;
    }

    const payload = {
      title,
      slug: slug || generateSlugFromTitle(title),
      excerpt,
      publishedAt: new Date(publishedAt).toISOString(),
      body: getSanityBody(),
      mainImage,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
    };

    setSaveStatus("saving");

    if (postId) {
      // Update
      const res = await updatePost(postId, payload);
      if (res.success) {
        setSaveStatus("saved");
        if (!silent) toast("Post saved successfully", "success");
        startTransition(() => {
          router.refresh();
        });
      } else {
        setSaveStatus("error");
        if (!silent) toast(res.error || "Save failed", "error");
      }
    } else {
      // Create
      const res = await createPost(payload);
      if (res.success && res.id) {
        setPostId(res.id);
        setSaveStatus("saved");
        if (!silent) toast("Post created and saved", "success");
        
        // Transition to edit URL silently without reload
        skipAutosaveRef.current = true; // prevent saving again immediately on reload
        startTransition(() => {
          router.push(`/admin/blogs/${res.id}/edit`);
          router.refresh();
        });
      } else {
        setSaveStatus("error");
        if (!silent) toast(res.error || "Create failed", "error");
      }
    }
  };

  // Run autosave with debouncing
  useEffect(() => {
    if (!title.trim()) return;
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      savePostContent(true);
    }, 3000); // 3-second debounce

    return () => clearTimeout(timer);
  }, [title, slug, excerpt, publishedAt, blocks, htmlContent, editorMode, mainImage, seoTitle, seoDescription]);

  // 5. Block Operations
  const addBlock = (style: Block["style"]) => {
    const newBlock = {
      id: Math.random().toString(36).substring(2, 9),
      style,
      text: "",
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const updateBlockText = (id: string, text: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, text } : b)));
  };

  const removeBlock = (id: string) => {
    if (blocks.length === 1) {
      toast("Editor must have at least one block", "info");
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const nextBlocks = [...blocks];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    
    // Swap
    const temp = nextBlocks[index];
    nextBlocks[index] = nextBlocks[targetIdx];
    nextBlocks[targetIdx] = temp;
    
    setBlocks(nextBlocks);
  };

  // 6. Slug Helper
  const generateSlugFromTitle = (txt: string) => {
    return txt
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleSlugGenerate = () => {
    if (!title.trim()) {
      toast("Enter a title first to generate slug", "info");
      return;
    }
    setSlug(generateSlugFromTitle(title));
    toast("Slug generated!", "success");
  };

  // 7. Media Picker Helpers
  const openMediaPicker = async () => {
    setMediaModalOpen(true);
    setMediaLoading(true);
    const res = await getMediaAssets();
    setMediaLoading(false);
    if (res.success && res.assets) {
      setMediaAssets(res.assets);
    } else {
      toast("Failed to load media library", "error");
    }
  };

  const handleSelectMedia = (asset: any) => {
    setMainImage({
      _type: "image",
      asset: {
        _ref: asset._id,
        _type: "reference",
      },
    });
    setImageUrl(asset.url);
    setMediaModalOpen(false);
    toast("Cover image selected", "success");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast("Uploading image...", "loading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadMedia(formData);
      if (res && res.success && res.asset) {
        toast("Image uploaded and selected", "success");
        setMainImage({
          _type: "image",
          asset: {
            _ref: res.asset._id,
            _type: "reference",
          },
        });
        setImageUrl(res.asset.url);
        setMediaModalOpen(false);
      } else {
        toast(res?.error || "Upload failed", "error");
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      toast(err.message || "Failed to upload image due to connection error", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // Filter media inside modal
  const filteredAssets = mediaAssets.filter((asset) => {
    const q = mediaSearch.toLowerCase();
    return (
      (asset.originalFilename && asset.originalFilename.toLowerCase().includes(q)) ||
      (asset.altText && asset.altText.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Editor Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs"
            className="p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-black">{isEditMode ? "Edit Blog Post" : "Create Blog Post"}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Autosave:</span>
              <span className="text-[10px] font-bold flex items-center gap-1">
                {saveStatus === "saving" && (
                  <span className="text-indigo-400 flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Saving changes...
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={10} /> Saved to database
                  </span>
                )}
                {saveStatus === "error" && (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle size={10} /> Sync error
                  </span>
                )}
                {saveStatus === "idle" && <span className="text-slate-500">All changes saved</span>}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => savePostContent(false)}
          disabled={isPending}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 active:scale-[0.98] self-start sm:self-auto"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Draft
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Editor Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#05090f]/75 border border-white/5 p-6 rounded-2xl space-y-5">
            {/* Title */}
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Title: Enter blog headline here..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-xl md:text-2xl font-black text-white placeholder:text-slate-700 outline-none border-b border-white/5 focus:border-indigo-500/30 pb-3 transition duration-150"
              />
            </div>

            {/* Slug & Date */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Slug Url
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="post-slug-url"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 bg-white/[0.02] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none transition"
                  />
                  <button
                    onClick={handleSlugGenerate}
                    className="px-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 rounded-xl text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                    title="Generate from title"
                  >
                    <Sparkles size={11} /> Gen
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Published Date
                </label>
                <input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Summary / Excerpt
              </label>
              <textarea
                placeholder="Write a brief, SEO-friendly summary of the blog post..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 outline-none resize-none transition"
              />
            </div>

            {/* Cover image selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Cover Image
              </label>
              {imageUrl ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                  <img src={imageUrl} alt="" className="object-cover w-full h-full opacity-80" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 gap-2">
                    <button
                      onClick={openMediaPicker}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                    >
                      Change Image
                    </button>
                    <button
                      onClick={() => {
                        setMainImage(null);
                        setImageUrl("");
                      }}
                      className="px-3.5 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={openMediaPicker}
                  className="w-full py-8 bg-white/[0.01] hover:bg-white/[0.03] border border-dashed border-white/10 hover:border-indigo-500/30 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-300 transition group duration-200"
                >
                  <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 group-hover:scale-105 transition">
                    <ImageIcon size={22} className="text-slate-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider">Select Cover Image</span>
                </button>
              )}
            </div>
          </div>

          {/* Editor Mode Selector */}
          <div className="flex bg-white/[0.02] border border-white/5 rounded-xl p-1 shrink-0">
            <button
              onClick={() => {
                if (editorMode === "html" && confirm("Switch to visual blocks? This will reload your blocks from the saved state. Any custom HTML-only tags could be lost.")) {
                  setEditorMode("blocks");
                } else if (editorMode === "blocks") {
                  setEditorMode("blocks");
                }
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                editorMode === "blocks"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Visual Blocks
            </button>
            <button
              onClick={() => {
                if (editorMode === "blocks") {
                  // Auto-generate HTML from current blocks
                  const generated = blocks.map(b => {
                    if (b.style === "h2") return `<h2>${b.text}</h2>`;
                    if (b.style === "h3") return `<h3>${b.text}</h3>`;
                    if (b.style === "blockquote") return `<blockquote>${b.text}</blockquote>`;
                    return `<p>${b.text}</p>`;
                  }).join("\n");
                  setHtmlContent(generated);
                  setEditorMode("html");
                }
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                editorMode === "html"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              HTML Code / Raw Text
            </button>
          </div>

          {editorMode === "blocks" ? (
            /* Block Content Editor */
            <div className="bg-[#05090f]/75 border border-white/5 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-bold">Block Content Editor</h3>
                  <p className="text-[10px] text-slate-500">Edit elements recursively to form PortableText</p>
                </div>
                
                {/* Add Blocks Toolbar */}
                <div className="flex gap-1 bg-white/[0.02] border border-white/5 p-1 rounded-xl">
                  {(["normal", "h2", "h3", "blockquote"] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => addBlock(style)}
                      className="px-2 py-1 hover:bg-white/5 text-[9px] font-bold text-slate-400 hover:text-white rounded transition"
                    >
                      + {style === "normal" ? "Paragraph" : style === "blockquote" ? "Quote" : style.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blocks List */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    className="group/block relative bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-xl p-3.5 flex gap-4 transition duration-150"
                  >
                    {/* Block Label badge */}
                    <span className="absolute left-3.5 top-[-8px] text-[7px] font-black tracking-widest uppercase bg-[#080d14] border border-white/10 text-slate-500 px-1.5 py-0.5 rounded-full">
                      {block.style === "normal" ? "paragraph" : block.style === "blockquote" ? "quote" : block.style}
                    </span>

                    {/* Move & Delete Toolbar */}
                    <div className="absolute right-3.5 top-[-8px] bg-[#080d14] border border-white/10 px-1.5 py-0.5 rounded-md opacity-0 group-hover/block:opacity-100 flex gap-1.5 transition duration-150">
                      <button
                        onClick={() => moveBlock(idx, "up")}
                        disabled={idx === 0}
                        className="text-slate-500 hover:text-white disabled:opacity-20 transition"
                        title="Move Block Up"
                      >
                        <ChevronUp size={10} />
                      </button>
                      <button
                        onClick={() => moveBlock(idx, "down")}
                        disabled={idx === blocks.length - 1}
                        className="text-slate-500 hover:text-white disabled:opacity-20 transition"
                        title="Move Block Down"
                      >
                        <ChevronDown size={10} />
                      </button>
                      <div className="w-px h-3 bg-white/10 self-center" />
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="text-slate-500 hover:text-red-400 transition"
                        title="Delete Block"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>

                    {/* Input field depending on style */}
                    <div className="flex-1 mt-1.5">
                      {block.style === "blockquote" ? (
                        <div className="border-l-2 border-indigo-500 pl-3">
                          <textarea
                            placeholder="Write blockquote content..."
                            value={block.text}
                            onChange={(e) => updateBlockText(block.id, e.target.value)}
                            rows={2}
                            className="w-full bg-transparent text-xs text-slate-300 italic placeholder:text-slate-700 outline-none resize-none"
                          />
                        </div>
                      ) : block.style === "h2" ? (
                        <input
                          type="text"
                          placeholder="Heading 2 Section..."
                          value={block.text}
                          onChange={(e) => updateBlockText(block.id, e.target.value)}
                          className="w-full bg-transparent text-base font-black text-white placeholder:text-slate-700 outline-none"
                        />
                      ) : block.style === "h3" ? (
                        <input
                          type="text"
                          placeholder="Heading 3 Subsection..."
                          value={block.text}
                          onChange={(e) => updateBlockText(block.id, e.target.value)}
                          className="w-full bg-transparent text-sm font-bold text-white placeholder:text-slate-700 outline-none"
                        />
                      ) : (
                        <textarea
                          placeholder="Write paragraph text here..."
                          value={block.text}
                          onChange={(e) => updateBlockText(block.id, e.target.value)}
                          rows={3}
                          className="w-full bg-transparent text-xs text-slate-300 leading-relaxed placeholder:text-slate-700 outline-none resize-none"
                        />
                      )}
                    </div>
                  </div>
                ))}

                {blocks.length === 0 && (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No content blocks. Use the top bar to add a Paragraph or Heading!
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* HTML Code Editor */
            <div className="bg-[#05090f]/75 border border-white/5 p-6 rounded-2xl space-y-4">
              <div>
                <h3 className="text-sm font-bold">HTML / Raw Text Editor</h3>
                <p className="text-[10px] text-slate-500">Write custom HTML or plain text directly. HTML elements are rendered safely on the frontend.</p>
              </div>
              <textarea
                placeholder="<p>Write your HTML or normal text here...</p>"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={15}
                className="w-full bg-[#03060b] border border-white/10 focus:border-indigo-500/60 rounded-xl p-4 text-xs font-mono text-indigo-300 placeholder:text-slate-700 outline-none resize-y min-h-[300px] leading-relaxed custom-scrollbar"
              />
            </div>
          )}
        </div>

        {/* SEO Sidebar Previews */}
        <div className="space-y-6">
          {/* SEO Details Input */}
          <div className="bg-[#05090f]/75 border border-white/5 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold">SEO Configurations</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 pl-1">
                SEO Meta Title
              </label>
              <input
                type="text"
                placeholder="Google search listing title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 pl-1">
                SEO Meta Description
              </label>
              <textarea
                placeholder="Short snippet visible in search results..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                className="w-full bg-white/[0.02] border border-white/[0.05] focus:border-indigo-500/60 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 outline-none resize-none transition"
              />
            </div>
          </div>

          {/* Google Snippet Search Preview */}
          <div className="bg-[#05090f]/75 border border-white/5 p-5 rounded-2xl space-y-3.5">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Globe size={14} className="text-slate-400" /> Google Search Snippet
            </h3>
            <div className="bg-[#080d14] border border-white/5 p-4 rounded-xl space-y-1 text-left">
              <span className="text-[10px] text-slate-500 block truncate">
                www.tikajoshi.com.np › blog › {slug || "post-slug"}
              </span>
              <span className="text-sm text-[#8ab4f8] hover:underline cursor-pointer font-medium block leading-tight">
                {seoTitle || title || "Untitled Article - Tikajoshi"}
              </span>
              <p className="text-[11px] text-[#bdc1c6] leading-snug line-clamp-3">
                {seoDescription || excerpt || "Write some excerpts or SEO description to populate the search snippet details description."}
              </p>
            </div>
          </div>

          {/* OpenGraph Card Preview */}
          <div className="bg-[#05090f]/75 border border-white/5 p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Eye size={14} className="text-slate-400" /> OpenGraph Social Preview
            </h3>
            <div className="bg-[#080d14] border border-white/5 rounded-xl overflow-hidden text-left flex flex-col">
              <div className="aspect-video w-full bg-white/5 relative border-b border-white/5 flex items-center justify-center text-2xl font-bold">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="object-cover w-full h-full" />
                ) : (
                  "🖼️ COVER IMAGE"
                )}
              </div>
              <div className="p-3 space-y-0.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                  tikajoshi.com.np
                </span>
                <span className="text-[11px] font-bold text-white block truncate">
                  {seoTitle || title || "Untitled Post Title"}
                </span>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {seoDescription || excerpt || "Post description goes here..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MEDIA PICKER DIALOG --- */}
      <AnimatePresence>
        {mediaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMediaModalOpen(false)}
              className="fixed inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#080d14] border border-white/[0.08] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col z-10 max-h-[80vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-sm font-bold">Select Cover Image</h3>
                  <p className="text-[10px] text-slate-500">Pick from existing Sanity uploads or add new file</p>
                </div>

                <div className="flex gap-2">
                  <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-1">
                    {uploadingImage ? (
                      <>
                        <Loader2 size={10} className="animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Plus size={10} /> Upload New
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => setMediaModalOpen(false)}
                    className="bg-white/5 text-slate-400 hover:text-white px-2 py-1 rounded text-[10px] font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Modal search bar */}
              <div className="px-5 py-3 border-b border-white/5 bg-[#05090f]/50 flex items-center gap-3 shrink-0">
                <Search size={14} className="text-slate-600" />
                <input
                  type="text"
                  placeholder="Search uploaded images..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-600 outline-none"
                />
              </div>

              {/* Assets Grid */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar min-h-[250px]">
                {mediaLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Loader2 size={24} className="animate-spin text-indigo-500" />
                    <span className="text-xs">Loading media assets...</span>
                  </div>
                ) : filteredAssets.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {filteredAssets.map((asset) => (
                      <button
                        key={asset._id}
                        onClick={() => handleSelectMedia(asset)}
                        className="group/item relative aspect-square rounded-xl bg-white/5 border border-white/5 overflow-hidden hover:border-indigo-500/40 transition flex items-center justify-center"
                      >
                        <img src={asset.url} alt="" className="object-cover w-full h-full opacity-80 group-hover/item:opacity-100 group-hover/item:scale-105 transition duration-200" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 flex items-end p-2 transition duration-200">
                          <span className="text-[8px] text-white font-bold truncate w-full block">
                            {asset.originalFilename || "select image"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-600">
                    No images found in your Sanity media records.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
