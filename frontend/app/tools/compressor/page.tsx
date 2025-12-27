"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import Navbar from "@/components/Navbar";
import { Upload, Download, Cpu, HardDrive } from "lucide-react";

export default function CompressorPro() {
  const [original, setOriginal] = useState<File | null>(null);
  const [compressed, setCompressed] = useState<Blob | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [loading, setLoading] = useState(false);

  // Helper: Format Bytes to KB/MB
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setOriginal(file);
      await process(file, quality);
    }
  };

  const process = async (file: File, q: number) => {
    setLoading(true);
    // Aggressive compression config
    const options = { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: q };
    try {
      const output = await imageCompression(file, options);
      setCompressed(output);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6">
        <div className="glass-panel p-1 rounded-3xl">
          <div className="bg-[#030711] rounded-[1.4rem] p-8 md:p-12 border border-white/5">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Cpu className="text-orange-500" /> ULTRA COMPRESSOR
            </h1>
            <p className="text-slate-400 mb-10">Intelligent compression algorithm. Reduce size up to 95%.</p>

            {/* Slider */}
            <div className="mb-10 bg-slate-900/50 p-6 rounded-2xl border border-white/5">
               <div className="flex justify-between mb-4">
                 <label className="text-sm font-bold text-slate-300">Compression Strength</label>
                 <span className="text-orange-400 font-mono text-sm">{(quality * 100).toFixed(0)}% Quality</span>
               </div>
               <input 
                 type="range" min="0.05" max="1" step="0.05" 
                 value={quality} 
                 onChange={(e) => {
                    setQuality(parseFloat(e.target.value));
                    if(original) process(original, parseFloat(e.target.value));
                 }}
                 className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
               />
               <div className="flex justify-between mt-2 text-[10px] text-slate-500 uppercase tracking-widest">
                 <span>Max Compression (Smallest Size)</span>
                 <span>Best Quality</span>
               </div>
            </div>

            {/* Upload Area */}
            {!original && (
              <label className="block border-2 border-dashed border-slate-700 hover:border-orange-500/50 hover:bg-orange-500/5 rounded-2xl p-16 text-center cursor-pointer transition-all">
                 <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                 <HardDrive size={48} className="mx-auto text-slate-600 mb-4" />
                 <span className="text-xl font-bold text-white">Drop Image Here</span>
              </label>
            )}

            {/* Stats Grid */}
            {original && compressed && (
              <div className="grid grid-cols-2 gap-4 mt-8">
                 <div className="p-6 rounded-2xl bg-slate-900 border border-white/5">
                    <p className="text-xs text-slate-500 uppercase mb-1">Original</p>
                    <p className="text-2xl font-mono text-white">{formatSize(original.size)}</p>
                 </div>
                 <div className="p-6 rounded-2xl bg-orange-500/10 border border-orange-500/20 relative">
                    <span className="absolute top-4 right-4 text-[10px] bg-orange-500 text-black px-2 py-0.5 rounded font-bold">
                        -{Math.round((1 - compressed.size / original.size) * 100)}%
                    </span>
                    <p className="text-xs text-orange-400 uppercase mb-1">Compressed</p>
                    <p className="text-2xl font-mono text-orange-400">{formatSize(compressed.size)}</p>
                 </div>
                 <button onClick={() => setOriginal(null)} className="col-span-1 py-4 bg-slate-800 rounded-xl text-slate-300 font-bold hover:bg-slate-700">Reset</button>
                 <a href={URL.createObjectURL(compressed)} download={`min-${original.name}`} className="col-span-1 py-4 bg-orange-600 rounded-xl text-white font-bold text-center hover:bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                    Download
                 </a>
              </div>
            )}
            {loading && <p className="text-center mt-4 text-orange-500 animate-pulse">Processing Neural Engine...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}