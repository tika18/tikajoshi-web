"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Upload, Download, FileText, Loader2, CheckCircle2, X } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

export default function PdfToImage() {
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Force specific worker version to match library
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }, []);

  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    setFileName(file.name.replace(".pdf", ""));
    setIsLoading(true);
    setImages([]);
    setSelected([]);

    try {
      const uri = URL.createObjectURL(file);
      const pdf = await pdfjsLib.getDocument(uri).promise;
      const totalPages = pdf.numPages;
      const imgList: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // High quality
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            imgList.push(canvas.toDataURL("image/jpeg", 0.8)); // Convert to JPG
        }
      }
      setImages(imgList);
      // Automatically select all pages initially
      setSelected(imgList.map((_, i) => i));
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Error processing PDF. It might be password protected or corrupted.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter(i => i !== index));
    } else {
      setSelected([...selected, index]);
    }
  };

  const downloadSelected = () => {
    selected.forEach((index) => {
        const link = document.createElement('a');
        link.href = images[index];
        link.download = `${fileName}-page-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
  };

  const reset = () => {
    setImages([]);
    setSelected([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto py-24 px-6">
        <h1 className="text-3xl md:text-4xl font-black text-center mb-3">PDF to Image Converter</h1>
        <p className="text-center text-slate-400 mb-12">Select specific pages from your PDF and save them as HD Images.</p>

        {/* Upload Section */}
        {images.length === 0 ? (
            <div 
                className="max-w-xl mx-auto bg-[#1e293b]/50 border-2 border-dashed border-slate-600 rounded-3xl p-12 text-center hover:border-emerald-500 hover:bg-emerald-500/5 transition cursor-pointer relative group"
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                />
                {isLoading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48}/>
                        <p className="text-lg font-bold text-white">Processing PDF...</p>
                        <p className="text-sm text-slate-400">This happens locally in your browser.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-800 p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition text-emerald-500 shadow-lg">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Upload PDF File</h3>
                        <p className="text-slate-400">Click here to browse your files</p>
                    </>
                )}
            </div>
        ) : (
            // Result Section
            <div className="animate-in fade-in slide-in-from-bottom-8">
                {/* Control Bar */}
                <div className="sticky top-20 z-40 bg-[#0f172a]/80 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl flex flex-wrap justify-between items-center mb-8 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <button onClick={reset} className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg transition" title="Upload New">
                            <X size={20}/>
                        </button>
                        <div>
                            <p className="font-bold text-white text-lg">{fileName}.pdf</p>
                            <p className="text-sm text-slate-400">Selected: <span className="text-emerald-400 font-bold">{selected.length}</span> / {images.length}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <button 
                            onClick={() => setSelected(selected.length === images.length ? [] : images.map((_, i) => i))}
                            className="text-sm font-bold text-slate-300 hover:text-white px-4 py-2 border border-slate-700 rounded-lg"
                        >
                            {selected.length === images.length ? "Deselect All" : "Select All"}
                        </button>
                        <button 
                            onClick={downloadSelected} 
                            disabled={selected.length === 0} 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-emerald-500/20"
                        >
                            <Download size={18}/> Download {selected.length} Images
                        </button>
                    </div>
                </div>

                {/* Grid View */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((img, i) => (
                        <div 
                            key={i} 
                            onClick={() => toggleSelect(i)} 
                            className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
                                selected.includes(i) 
                                    ? 'ring-4 ring-emerald-500 scale-[1.02] shadow-xl' 
                                    : 'ring-1 ring-slate-700 hover:ring-slate-500 hover:scale-[1.01]'
                            }`}
                        >
                            <div className="bg-slate-800 aspect-[3/4] relative">
                                <img src={img} alt={`Page ${i}`} className="w-full h-full object-contain"/>
                            </div>
                            
                            {/* Checkmark Overlay */}
                            <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${selected.includes(i) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selected.includes(i) ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                                    <CheckCircle2 size={24}/>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur text-center text-xs py-2 text-slate-300 font-medium">
                                Page {i + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}