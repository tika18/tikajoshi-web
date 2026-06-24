"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Upload, Download, RefreshCw, Scissors } from "lucide-react";

export default function PassportPhoto() {
  const [image, setImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setImage(readerEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processPhoto = () => {
    // Simple logic: Draw image on canvas and crop center (35x45 Aspect Ratio)
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = image;
    
    img.onload = () => {
        // Set Passport Size Ratio (350x450px for high quality)
        canvas.width = 350;
        canvas.height = 450;
        
        // Draw image cover (auto center crop)
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        
        // Fill White Background (Simple Hack)
        ctx!.fillStyle = "white";
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx!.drawImage(img, x, y, img.width * scale, img.height * scale);
    };
  };

  const downloadPhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'passport-photo-nepal.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3 flex items-center justify-center gap-2">
            <Scissors className="text-emerald-600"/> Passport Photo Maker (Nepal)
          </h1>
          <p className="text-slate-500">Create 35mm x 45mm Passport Size photo instantly.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm">
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="pass-upload" />
            <label htmlFor="pass-upload" className="cursor-pointer block border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-2xl p-10 hover:bg-emerald-100 transition">
              <Upload className="mx-auto text-emerald-600 mb-3" size={32} />
              <span className="font-bold text-slate-700">Upload Your Photo</span>
            </label>
            
            {image && (
              <div className="mt-6">
                <img src={image} alt="Original" className="w-32 h-32 object-cover mx-auto rounded-lg border" />
                <button onClick={processPhoto} className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                  <RefreshCw size={18} /> Convert to Passport Size
                </button>
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm flex flex-col items-center justify-center">
            <p className="font-bold text-slate-400 mb-4">Preview (35mm x 45mm)</p>
            <canvas ref={canvasRef} className="bg-slate-100 border border-slate-300 w-[175px] h-[225px] shadow-md"></canvas>
            
            <button onClick={downloadPhoto} className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2">
              <Download size={18} /> Download HD Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}