"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { PDFDocument } from "pdf-lib"; // Make sure to: npm install pdf-lib
import { Upload, FileText, Download, Trash2, Plus } from "lucide-react";

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
      setDownloadUrl(null); // Reset previous merge
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const mergePDFs = async () => {
    if (files.length < 2) return alert("Please select at least 2 PDF files.");
    setIsMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error(error);
      alert("Error merging PDFs. Please try again.");
    }
    setIsMerging(false);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto text-center">
        
        <div className="mb-10">
            <h1 className="text-4xl font-black text-white mb-2">Merge PDF Files</h1>
            <p className="text-slate-400">Combine multiple PDF documents into a single file.</p>
        </div>

        {/* Upload Area */}
        <div className="bg-[#1e293b] border-2 border-dashed border-slate-700 rounded-3xl p-10 hover:border-emerald-500 transition-colors cursor-pointer relative mb-8">
            <input 
                type="file" 
                multiple 
                accept=".pdf" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-4">
                <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-500">
                    <Upload size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Click to Upload PDFs</h3>
                    <p className="text-slate-500 text-sm mt-1">Select multiple files at once</p>
                </div>
            </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
            <div className="bg-slate-900 rounded-xl p-4 mb-8 text-left">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 ml-2">Selected Files ({files.length})</h3>
                <div className="space-y-2">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#1e293b] p-3 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-3">
                                <FileText size={20} className="text-red-400"/>
                                <span className="text-sm text-slate-200 truncate max-w-[200px] md:max-w-md">{file.name}</span>
                            </div>
                            <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-red-500 transition">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-center">
                    <button className="text-sm text-emerald-500 font-bold flex items-center justify-center gap-1 hover:text-emerald-400 relative">
                        <Plus size={16}/> Add More Files (Click box above)
                    </button>
                </div>
            </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col items-center gap-4">
            <button 
                onClick={mergePDFs}
                disabled={files.length < 2 || isMerging}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all w-full md:w-auto"
            >
                {isMerging ? "Merging..." : "Merge Files Now"}
            </button>

            {downloadUrl && (
                <a 
                    href={downloadUrl} 
                    download="tikajoshi-merged.pdf"
                    className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-900/30 px-6 py-3 rounded-lg border border-emerald-500/30 animate-pulse"
                >
                    <Download size={20}/> Download Merged PDF
                </a>
            )}
        </div>
      </div>
    </div>
  );
}