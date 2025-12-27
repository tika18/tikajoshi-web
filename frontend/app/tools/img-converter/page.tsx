"use client";
import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Upload, Download, RefreshCw, FileImage } from "lucide-react";

export default function ImgConverter() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [format, setFormat] = useState("image/png"); // Default PNG
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImgSrc(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgSrc) return;
    
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imgSrc;
    
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx!.drawImage(img, 0, 0);
        
        const ext = format.split("/")[1];
        const link = document.createElement('a');
        link.download = `tikajoshi-converted.${ext}`;
        link.href = canvas.toDataURL(format, 1.0);
        link.click();
    };
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <Navbar />
      <div className="max-w-4xl mx-auto py-24 px-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Image Format Converter</h1>
        <p className="text-slate-400 mb-10">Convert JPG to PNG, PNG to JPG, or WEBP easily.</p>

        <div className="bg-[#1e293b]/50 border border-slate-700 p-8 rounded-3xl inline-block w-full max-w-2xl">
          {!imgSrc ? (
            <label className="block border-2 border-dashed border-slate-600 bg-slate-800/30 rounded-2xl p-16 cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition">
                <input type="file" onChange={handleUpload} className="hidden" accept="image/*" />
                <FileImage className="mx-auto text-slate-500 mb-4" size={48} />
                <span className="text-xl font-bold text-white">Upload Image</span>
                <p className="text-sm text-slate-500 mt-2">Supports JPG, PNG, WEBP</p>
            </label>
          ) : (
            <div className="space-y-6">
                <img src={imgSrc} alt="Preview" className="max-h-64 mx-auto rounded-lg border border-slate-700 shadow-xl" />
                
                <div className="flex items-center justify-center gap-4">
                    <span className="font-bold text-slate-400">Convert to:</span>
                    <select 
                        value={format} 
                        onChange={(e) => setFormat(e.target.value)} 
                        className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500"
                    >
                        <option value="image/png">PNG (Transparent)</option>
                        <option value="image/jpeg">JPG (Small Size)</option>
                        <option value="image/webp">WEBP (Modern)</option>
                    </select>
                </div>

                <div className="flex gap-4 justify-center">
                    <button onClick={() => setImgSrc(null)} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition">
                        Reset
                    </button>
                    <button onClick={download} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition">
                        <Download size={18} /> Download
                    </button>
                </div>
                {/* Hidden Canvas for Processing */}
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}