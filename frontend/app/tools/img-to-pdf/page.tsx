"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import jsPDF from "jspdf";
import { Upload, FileDown, X, Image as ImageIcon } from "lucide-react";

export default function ImgToPdf() {
  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleUpload = (e: any) => {
    const files = Array.from(e.target.files);
    files.forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const generatePDF = () => {
    if (images.length === 0) return;
    setProcessing(true);
    
    // Default A4 Size
    const doc = new jsPDF("p", "mm", "a4");
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    images.forEach((img, i) => {
      if (i > 0) doc.addPage();
      doc.addImage(img, "JPEG", 0, 0, width, height, undefined, "FAST");
    });

    doc.save("tikajoshi-converted.pdf");
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <Navbar />
      <div className="max-w-4xl mx-auto py-24 px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Image to PDF Converter</h1>
          <p className="text-slate-400">Combine multiple photos (JPG/PNG) into a single PDF document.</p>
        </div>

        <div className="bg-[#1e293b]/50 border border-slate-700 p-8 rounded-3xl">
          {/* Upload Area */}
          <label className="block border-2 border-dashed border-slate-600 bg-slate-800/50 rounded-2xl p-10 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/10 transition mb-8">
            <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
            <ImageIcon className="mx-auto text-emerald-500 mb-3" size={40} />
            <span className="text-xl font-bold text-white">Select Images</span>
            <p className="text-sm text-slate-400 mt-1">Select multiple files to merge</p>
          </label>

          {/* Preview Grid */}
          {images.length > 0 && (
            <div className="mb-8">
              <p className="text-sm font-bold text-slate-400 mb-4 uppercase">Selected Images ({images.length})</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-slate-600">
                    <img src={img} className="w-full h-full object-cover" alt="preview" />
                    <button 
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-1 left-2 text-xs font-bold text-white bg-black/50 px-2 rounded">
                      Page {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          {images.length > 0 && (
            <button 
              onClick={generatePDF}
              disabled={processing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition"
            >
              {processing ? "Generating..." : <><FileDown /> Download PDF</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}