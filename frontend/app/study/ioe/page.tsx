"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
// FIX: Added 'Link' to imports
import Link from "next/link"; 
import { ChevronRight, FileText, BookOpen, GraduationCap, ArrowLeft, Download, Database, Loader2, Folder, Eye, HardDrive, ExternalLink, Layers, Youtube } from "lucide-react";

export default function EngineeringPage() {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({ type: "", uni: "", stream: "", resource: "" });
  const [dataList, setDataList] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);

  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  
  // IMPROVED BACK LOGIC
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      // Reset specific data to avoid confusion when going back
      if (step === 5) setDataList([]); 
    }
  };

  const select = (key: string, val: string) => { 
    setSelection({ ...selection, [key]: val }); 
    setStep(step + 1); 
  };

  useEffect(() => { 
    if (step === 5) fetchData(); 
  }, [step]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const uniVal = selection.uni.toLowerCase().includes("tribhuvan") ? "tu" : "pu";
      const facultyVal = selection.stream.toLowerCase().includes("computer") ? "computer" : "civil"; 
      
      let typeVal = "notes"; 
      if (selection.resource.toLowerCase().includes("question")) typeVal = "question";
      if (selection.resource.toLowerCase().includes("syllabus")) typeVal = "syllabus";

      const query = `*[_type == "ioeResource" && university == "${uniVal}" && type == "${typeVal}"]{
        subjects[ count(targets[faculty == "${facultyVal}"]) > 0 ] {
          subjectName,
          targets,
          materials[] {
            title,
            "fileUrl": file.asset->url,
            externalLink,
            videoLink
          }
        }
      }`;

      const rawData = await client.fetch(query);
      const cleanData = rawData.flatMap((doc: any) => doc.subjects || []).filter((sub: any) => sub !== null);
      setDataList(cleanData);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const getDriveID = (url: string) => {
    if (!url) return null;
    const match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Navbar />
      <div className="max-w-6xl mx-auto py-24 px-6">
        
        {/* Navigation Path (Breadcrumb) - FIXED */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 font-mono overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-emerald-500 transition">Home</Link> / 
            <Link href="/study" className="hover:text-emerald-500 transition">Study</Link> / 
            <span className={`cursor-pointer hover:text-emerald-500 ${step===1 ? 'font-bold text-emerald-500' : ''}`} onClick={() => setStep(1)}>IOE</span>
            
            {step > 1 && <> / <span className={`${step===2 ? 'font-bold text-emerald-500' : ''}`}>{selection.type}</span></>}
            {step > 2 && <> / <span className={`${step===3 ? 'font-bold text-emerald-500' : ''}`}>{selection.uni}</span></>}
            {step > 3 && <> / <span className={`${step===4 ? 'font-bold text-emerald-500' : ''}`}>{selection.stream}</span></>}
            {step > 4 && <> / <span className="font-bold text-emerald-500">{selection.resource}</span></>}
        </div>

        {/* Header & Back Button */}
        <div className="flex items-center gap-4 mb-10">
            {step > 1 && (
                <button onClick={goBack} className="bg-slate-100 dark:bg-[#1e293b] p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 shadow-sm">
                    <ArrowLeft size={20}/>
                </button>
            )}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Engineering Resources</h1>
                <p className="text-slate-500">Step {step}: {step === 5 ? "Materials List" : "Select Option"}</p>
            </div>
        </div>

        {/* STEP 1: Type */}
        {step === 1 && (
             <div className="grid md:grid-cols-2 gap-6">
                <div onClick={() => select('type', 'Entrance')} className="cursor-pointer bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-8 rounded-3xl hover:border-yellow-500 transition text-center group shadow-sm hover:shadow-xl">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition">🚀</div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">IOE Entrance Prep</h3>
                    <p className="text-slate-500">Past questions & Syllabus</p>
                </div>
                <div onClick={() => select('type', 'Engineering')} className="cursor-pointer bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-8 rounded-3xl hover:border-emerald-500 transition text-center group shadow-sm hover:shadow-xl">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition">👷‍♂️</div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Engineering (Bachelor)</h3>
                    <p className="text-slate-500">Notes, Syllabus & QB</p>
                </div>
            </div>
        )}

        {/* STEP 2: University */}
        {step === 2 && (
            <div className="grid md:grid-cols-2 gap-6">
                <div onClick={() => select('uni', 'Tribhuvan University (TU)')} className="cursor-pointer bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-8 rounded-3xl hover:border-blue-500 text-center shadow-sm hover:shadow-lg transition">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Tribhuvan University (TU)</h3>
                    <p className="text-slate-500 mt-2">Pulchowk, Thapathali</p>
                </div>
                <div onClick={() => select('uni', 'Pokhara University (PU)')} className="cursor-pointer bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-8 rounded-3xl hover:border-purple-500 text-center shadow-sm hover:shadow-lg transition">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Pokhara University (PU)</h3>
                    <p className="text-slate-500 mt-2">NCIT, NEC, Cosmos</p>
                </div>
            </div>
        )}

        {/* STEP 3: Faculty */}
        {step === 3 && (
            <div className="grid md:grid-cols-2 gap-6">
                <div onClick={() => select('stream', 'Computer Engineering')} className="cursor-pointer bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl hover:border-cyan-500 flex items-center gap-6 shadow-sm hover:shadow-lg transition">
                    <div className="p-4 bg-cyan-500/10 text-cyan-500 rounded-xl"><Database size={32}/></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Computer Engineering</h3>
                </div>
                <div onClick={() => select('stream', 'Civil Engineering')} className="cursor-pointer bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl hover:border-orange-500 flex items-center gap-6 shadow-sm hover:shadow-lg transition">
                    <div className="p-4 bg-orange-500/10 text-orange-500 rounded-xl"><Folder size={32}/></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Civil Engineering</h3>
                </div>
            </div>
        )}

        {/* STEP 4: Resource Type */}
        {step === 4 && (
            <div className="grid md:grid-cols-3 gap-6">
                <div onClick={() => select('resource', 'Syllabus')} className="cursor-pointer bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl hover:border-blue-500 text-center shadow-sm hover:shadow-lg transition">
                    <BookOpen className="mx-auto text-blue-500 mb-3" size={40}/>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Syllabus</h3>
                </div>
                <div onClick={() => select('resource', 'Notes')} className="cursor-pointer bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl hover:border-emerald-500 text-center shadow-sm hover:shadow-lg transition">
                    <FileText className="mx-auto text-emerald-500 mb-3" size={40}/>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notes</h3>
                </div>
                <div onClick={() => select('resource', 'Question Bank')} className="cursor-pointer bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-6 rounded-2xl hover:border-red-500 text-center shadow-sm hover:shadow-lg transition">
                    <GraduationCap className="mx-auto text-red-500 mb-3" size={40}/>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Question Bank</h3>
                </div>
            </div>
        )}

        {/* STEP 5: DISPLAY DATA */}
        {step === 5 && (
            <div className="animate-in fade-in">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selection.stream} - {selection.resource}</h2>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm">{selection.uni}</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-2"><Loader2 className="animate-spin" size={32}/><p>Checking database...</p></div>
                ) : dataList.length > 0 ? (
                    <div className="space-y-4">
                        {semesters.map((sem) => {
                            const semSubjects = dataList.filter((sub: any) => 
                                sub.targets?.some((t: any) => 
                                    t.semester === sem && 
                                    t.faculty === (selection.stream.toLowerCase().includes("computer") ? "computer" : "civil")
                                )
                            );
                            
                            if (semSubjects.length === 0) return null;

                            return (
                                <details key={sem} className="group bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm" open>
                                    <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                                        <span className="font-bold text-slate-900 dark:text-white text-lg">Semester {sem}</span>
                                        <span className="text-slate-400 group-open:rotate-90 transition transform"><ChevronRight/></span>
                                    </summary>
                                    
                                    <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a]/50 grid gap-8">
                                        {semSubjects.map((sub: any, idx: number) => (
                                            <div key={idx}>
                                                <h4 className="text-emerald-600 dark:text-emerald-400 font-bold mb-3 flex items-center gap-2 text-lg border-b border-slate-200 dark:border-slate-800 pb-2">
                                                    <Layers size={20}/> {sub.subjectName}
                                                </h4>
                                                
                                                <div className="grid gap-3 pl-2">
                                                    {sub.materials?.map((mat: any, mIdx: number) => {
                                                        const driveID = mat.externalLink ? getDriveID(mat.externalLink) : null;
                                                        const isDriveFolder = mat.externalLink && mat.externalLink.includes('drive.google.com') && mat.externalLink.includes('folders');

                                                        return (
                                                            <div key={mIdx} className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition">
                                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-3">
                                                                        {mat.videoLink ? <Youtube size={18} className="text-red-500"/> : isDriveFolder ? <HardDrive size={18} className="text-yellow-500"/> : <FileText size={18} className="text-blue-500"/>}
                                                                        <span className="font-medium text-slate-800 dark:text-slate-200">{mat.title}</span>
                                                                    </div>
                                                                    
                                                                    <div className="flex gap-2">
                                                                        {mat.videoLink && (
                                                                            <a href={mat.videoLink} target="_blank" className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 font-bold"><Youtube size={14}/> Watch</a>
                                                                        )}
                                                                        {mat.fileUrl && (
                                                                            <>
                                                                            <a href={mat.fileUrl} target="_blank" className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-300 px-3 py-1.5 rounded text-xs flex items-center gap-1 font-bold"><Eye size={14}/> View</a>
                                                                            <a href={`${mat.fileUrl}?dl=`} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 font-bold"><Download size={14}/> PDF</a>
                                                                            </>
                                                                        )}
                                                                        {mat.externalLink && !isDriveFolder && (
                                                                            <a href={mat.externalLink} target="_blank" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 font-bold"><ExternalLink size={14}/> Open</a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {isDriveFolder && driveID && (
                                                                    <div className="w-full h-[400px] bg-white rounded-lg overflow-hidden mt-4 shadow-inner border border-slate-200">
                                                                        <iframe src={`https://drive.google.com/embeddedfolderview?id=${driveID}#list`} width="100%" height="100%" style={{border: "none"}}></iframe>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-50 dark:bg-[#1e293b]/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Materials Found 😕</p>
                        <p className="text-slate-500 dark:text-slate-400">Try checking another semester or type.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}