"use client";
// app/study/ioe/page.tsx — DAAMI version 🔥

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import Link from "next/link";
import {
  ChevronDown, FileText, BookOpen, GraduationCap, ArrowLeft,
  Download, Loader2, Eye, HardDrive, ExternalLink, Layers,
  Youtube, FlaskConical, Cpu, Building2, Zap, Wrench,
  LayoutGrid, Search, X, BookMarked, Filter,
} from "lucide-react";

// ── CONFIG ──────────────────────────────────────────────────────
const STREAMS = [
  { value: "computer",    label: "Computer",    full: "Computer Engineering",    icon: Cpu,          color: "#06b6d4", bg: "rgba(6,182,212,0.08)"   },
  { value: "civil",       label: "Civil",       full: "Civil Engineering",        icon: Building2,    color: "#f97316", bg: "rgba(249,115,22,0.08)"  },
  { value: "electrical",  label: "Electrical",  full: "Electrical Engineering",   icon: Zap,          color: "#eab308", bg: "rgba(234,179,8,0.08)"   },
  { value: "electronics", label: "Electronics", full: "Electronics Engineering",  icon: FlaskConical, color: "#a855f7", bg: "rgba(168,85,247,0.08)"  },
  { value: "mechanical",  label: "Mechanical",  full: "Mechanical Engineering",   icon: Wrench,       color: "#ef4444", bg: "rgba(239,68,68,0.08)"   },
  { value: "architecture",label: "Architecture",full: "Architecture",             icon: LayoutGrid,   color: "#ec4899", bg: "rgba(236,72,153,0.08)"  },
];

const RESOURCE_TYPES = [
  { value: "notes",    label: "Notes",         icon: FileText,        color: "#10b981" },
  { value: "question", label: "Question Bank", icon: GraduationCap,  color: "#ef4444" },
  { value: "syllabus", label: "Syllabus",      icon: BookOpen,        color: "#3b82f6" },
  { value: "lab",      label: "Lab Manual",    icon: FlaskConical,    color: "#a855f7" },
];

const SEMESTERS = ["1","2","3","4","5","6","7","8"];

type Mode = "entrance" | "bachelor";
type Uni  = "tu" | "pu";

export default function IOEPage() {
  const [mode, setMode]             = useState<Mode | null>(null);
  const [uni, setUni]               = useState<Uni | null>(null);
  const [stream, setStream]         = useState<string | null>(null);
  const [resourceType, setResourceType] = useState<string>("notes");
  const [activeSem, setActiveSem]   = useState<string>("1");
  const [subjects, setSubjects]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");

  // which step are we on?
  const step = !mode ? 0 : !uni ? 1 : !stream ? 2 : 3;

  const selectedStream = STREAMS.find(s => s.value === stream);

  const fetchSubjects = useCallback(async () => {
    if (!uni || !stream) return;
    setLoading(true);
    try {
      // New studyMaterial schema
      const q1 = `*[_type == "studyMaterial" && category == "ioe" && resourceType == "${resourceType}" && targets[university in ["${uni}","both","all"] && stream in ["${stream}","all"]][0] != null] | order(subjectName asc) {
        subjectName, subjectCode, isShared, targets,
        materials[]{ title, videoLink, externalLink, description, "fileUrl": pdfFile.asset->url }
      }`;

      // Legacy ioeResource schema (backward compat)
      const q2 = `*[_type == "ioeResource" && university == "${uni}"] {
        subjects[]{ subjectName, targets,
          materials[]{ title, videoLink, externalLink, "fileUrl": coalesce(file.asset->url, pdfFile.asset->url, pdf.asset->url) }
        }
      }`;

      const [newData, legacyRaw] = await Promise.all([
        client.fetch(q1),
        client.fetch(q2),
      ]);

      const legacy = legacyRaw.flatMap((d: any) => d.subjects || []);
      setSubjects([...newData, ...legacy]);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [uni, stream, resourceType]);

  useEffect(() => { if (step === 3) fetchSubjects(); }, [step, fetchSubjects]);

  const getSubjectsForSem = (sem: string) =>
    subjects.filter((sub: any) => {
      if (!sub.targets?.length) return true;
      return sub.targets.some((t: any) =>
        (t.semester === sem || t.semester === "all") &&
        (t.stream === stream || t.stream === "all")
      );
    }).filter((sub: any) =>
      !search || sub.subjectName?.toLowerCase().includes(search.toLowerCase())
    );

  const reset = () => { setMode(null); setUni(null); setStream(null); setSubjects([]); setSearch(""); };

  return (
    <div className="min-h-screen bg-[#020917] text-white">
      <Navbar />

      {/* ── AMBIENT BG ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-emerald-600/5 blur-[140px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-cyan-600/5 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-24">

        {/* ── TOP BAR ── */}
        <div className="flex items-center gap-3 mb-10">
          {step > 0 && (
            <button onClick={reset}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mb-1">
              <Link href="/" className="hover:text-emerald-400 transition">Home</Link>
              <span>/</span>
              <Link href="/study" className="hover:text-emerald-400 transition">Study</Link>
              <span>/</span>
              <span className="text-emerald-400">IOE</span>
              {mode && <><span>/</span><span className="text-slate-400 capitalize">{mode}</span></>}
              {uni  && <><span>/</span><span className="text-slate-400 uppercase">{uni}</span></>}
              {stream && <><span>/</span><span className="text-slate-400">{selectedStream?.label}</span></>}
            </div>
            <h1 className="text-2xl font-black">
              {step === 0 && "Engineering Resources"}
              {step === 1 && (mode === "entrance" ? "IOE Entrance Prep" : "Engineering Bachelor")}
              {step === 2 && "Select University"}
              {step === 3 && `${selectedStream?.full} — ${RESOURCE_TYPES.find(r=>r.value===resourceType)?.label}`}
            </h1>
          </div>
        </div>

        {/* ══════════════ STEP 0 — Mode Select ══════════════ */}
        {step === 0 && (
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { key: "entrance" as Mode, emoji: "🚀", title: "IOE Entrance Prep", sub: "Past questions, Model sets, Syllabus", glow: "#f59e0b" },
              { key: "bachelor" as Mode, emoji: "🎓", title: "Bachelor (4 Years)", sub: "Notes, Question Bank, Lab Manual, Syllabus", glow: "#10b981" },
            ].map(item => (
              <button key={item.key} onClick={() => setMode(item.key)}
                className="group relative text-left p-10 rounded-3xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-2xl"
                style={{ '--glow': item.glow } as any}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 30% 50%, ${item.glow}15 0%, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{item.emoji}</div>
                  <h2 className="text-2xl font-black text-white mb-2">{item.title}</h2>
                  <p className="text-slate-400 text-sm">{item.sub}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-bold"
                    style={{ color: item.glow }}>
                    Select <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ══════════════ STEP 1 — University ══════════════ */}
        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { key: "tu" as Uni, label: "Tribhuvan University", short: "TU", colleges: "Pulchowk · Thapathali · WRC · DOECE", color: "#3b82f6" },
              { key: "pu" as Uni, label: "Pokhara University",   short: "PU", colleges: "NCIT · NEC · Cosmos · Purbanchal",   color: "#8b5cf6" },
            ].map(item => (
              <button key={item.key} onClick={() => setUni(item.key)}
                className="group relative text-left p-10 rounded-3xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 30% 50%, ${item.color}15 0%, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="text-5xl font-black mb-4" style={{ color: item.color }}>{item.short}</div>
                  <h2 className="text-xl font-black text-white mb-2">{item.label}</h2>
                  <p className="text-slate-500 text-xs">{item.colleges}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-bold" style={{ color: item.color }}>
                    Select <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ══════════════ STEP 2 — Stream Select ══════════════ */}
        {step === 2 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STREAMS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.value} onClick={() => setStream(s.value)}
                  className="group relative text-left p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 overflow-hidden hover:-translate-y-0.5 hover:shadow-xl">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `radial-gradient(circle at 20% 50%, ${s.color}12 0%, transparent 60%)` }} />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300"
                      style={{ background: s.bg }}>
                      <Icon size={22} style={{ color: s.color }} />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base leading-tight">{s.full}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 uppercase font-mono">{uni?.toUpperCase()}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ══════════════ STEP 3 — Materials ══════════════ */}
        {step === 3 && selectedStream && (
          <div>
            {/* Resource type tabs */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {RESOURCE_TYPES.map(r => {
                const Icon = r.icon;
                const active = resourceType === r.value;
                return (
                  <button key={r.value} onClick={() => setResourceType(r.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${active
                      ? "text-white border-transparent"
                      : "text-slate-400 border-white/8 hover:border-white/20 bg-white/[0.02]"}`}
                    style={active ? { background: r.color + "22", borderColor: r.color + "44", color: r.color } : {}}>
                    <Icon size={14} /> {r.label}
                  </button>
                );
              })}

              {/* Search */}
              <div className="ml-auto relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search subject..."
                  className="pl-8 pr-8 py-2 text-sm bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 w-48" />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Semester pills */}
            <div className="flex gap-2 flex-wrap mb-8">
              {SEMESTERS.map(sem => {
                const count = getSubjectsForSem(sem).length;
                const active = activeSem === sem;
                return (
                  <button key={sem} onClick={() => setActiveSem(sem)}
                    disabled={count === 0}
                    className={`relative px-4 py-2 rounded-xl text-sm font-black transition-all border ${
                      active
                        ? "text-white border-transparent"
                        : count === 0
                          ? "text-slate-700 border-white/4 cursor-not-allowed"
                          : "text-slate-400 border-white/8 hover:border-emerald-500/40 hover:text-white bg-white/[0.02]"}`}
                    style={active ? { background: selectedStream.color + "22", borderColor: selectedStream.color + "55", color: selectedStream.color } : {}}>
                    Sem {sem}
                    {count > 0 && (
                      <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-white/8"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Stream badge */}
            <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl border"
              style={{ background: selectedStream.bg, borderColor: selectedStream.color + "30" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: selectedStream.color + "20" }}>
                <selectedStream.icon size={20} style={{ color: selectedStream.color }} />
              </div>
              <div>
                <h2 className="font-black text-white">{selectedStream.full}</h2>
                <p className="text-xs" style={{ color: selectedStream.color }}>
                  {uni?.toUpperCase()} · Semester {activeSem} · {RESOURCE_TYPES.find(r=>r.value===resourceType)?.label}
                </p>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 animate-pulse" />
                  <Loader2 size={28} className="animate-spin absolute inset-0 m-auto text-emerald-400" />
                </div>
                <p className="text-sm">Loading materials...</p>
              </div>
            ) : getSubjectsForSem(activeSem).length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/8 rounded-3xl">
                <BookMarked size={40} className="mx-auto mb-4 text-slate-600" />
                <p className="text-xl font-black text-slate-400 mb-2">No materials yet</p>
                <p className="text-slate-600 text-sm">Sanity Studio बाट upload गर्नुस्</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {getSubjectsForSem(activeSem).map((sub: any, idx: number) => (
                  <SubjectCard key={idx} subject={sub} streamColor={selectedStream.color} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Subject Card ─────────────────────────────────────────────────
function SubjectCard({ subject, streamColor }: { subject: any; streamColor: string }) {
  const [open, setOpen] = useState(true);

  const resolveUrl = (mat: any) =>
    mat.fileUrl || mat.pdfUrl || mat.pdf?.asset?.url || mat.file?.asset?.url || null;

  const matCount = subject.materials?.length || 0;

  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden bg-white/[0.02]">
      {/* Subject header */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.03] transition text-left">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: streamColor + "18" }}>
            <Layers size={15} style={{ color: streamColor }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-black text-white text-sm">{subject.subjectName}</h4>
              {subject.subjectCode && (
                <span className="text-[10px] font-mono bg-white/8 text-slate-400 px-2 py-0.5 rounded-full">
                  {subject.subjectCode}
                </span>
              )}
              {subject.isShared && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ background: streamColor + "15", borderColor: streamColor + "30", color: streamColor }}>
                  Shared
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-xs text-slate-500">{matCount} file{matCount !== 1 ? "s" : ""}</span>
          <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Materials */}
      {open && (
        <div className="border-t border-white/6 p-4 grid gap-2 bg-black/20">
          {matCount === 0 ? (
            <p className="text-xs text-slate-600 italic text-center py-3">No files uploaded yet</p>
          ) : (
            subject.materials.map((mat: any, i: number) => {
              const fileUrl     = resolveUrl(mat);
              const isDriveFolder = mat.externalLink?.includes("drive.google.com/") && mat.externalLink?.includes("folders");
              const driveID     = isDriveFolder ? mat.externalLink.match(/folders\/([a-zA-Z0-9-_]+)/)?.[1] : null;

              return (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/6 hover:border-white/12 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    {mat.videoLink
                      ? <Youtube size={15} className="text-red-500 shrink-0" />
                      : isDriveFolder
                        ? <HardDrive size={15} className="text-yellow-500 shrink-0" />
                        : <FileText size={15} className="text-blue-400 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{mat.title || "(Untitled)"}</p>
                      {mat.description && <p className="text-xs text-slate-500">{mat.description}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap shrink-0">
                    {mat.videoLink && (
                      <a href={mat.videoLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-600/30 transition">
                        <Youtube size={11} /> Watch
                      </a>
                    )}
                    {fileUrl && (
                      <>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 text-slate-300 border border-white/10 text-xs font-bold hover:bg-white/12 transition">
                          <Eye size={11} /> View
                        </a>
                        <a href={`${fileUrl}?dl=`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold hover:opacity-80 transition"
                          style={{ background: streamColor + "30", borderWidth: 1, borderStyle: "solid", borderColor: streamColor + "40" }}>
                          <Download size={11} /> PDF
                        </a>
                      </>
                    )}
                    {mat.externalLink && !isDriveFolder && (
                      <a href={mat.externalLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-bold hover:bg-blue-600/30 transition">
                        <ExternalLink size={11} /> Open
                      </a>
                    )}
                    {!fileUrl && !mat.videoLink && !mat.externalLink && (
                      <span className="text-xs text-slate-600 italic px-2">No file</span>
                    )}
                  </div>

                  {isDriveFolder && driveID && (
                    <div className="w-full h-72 rounded-xl overflow-hidden mt-2 border border-white/8">
                      <iframe src={`https://drive.google.com/embeddedfolderview?id=${driveID}#list`}
                        width="100%" height="100%" style={{ border: "none" }} title="Drive Folder" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}