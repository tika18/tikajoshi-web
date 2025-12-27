"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Upload, Download, Smartphone, Monitor, Square, Move, Layers } from "lucide-react";

export default function AdvancedResizer() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Controls
  const [aspectRatio, setAspectRatio] = useState(16/9); // Default Landscape
  const [scale, setScale] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);

  const handleUpload = (e: any) => {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            setImgSrc(ev.target?.result as string);
            // Reset controls on new upload
            setScale(1); setPosX(0); setPosY(0);
        };
        reader.readAsDataURL(file);
    }
  };

  // Real-time Rendering Logic
  useEffect(() => {
    if (!canvasRef.current || !imgSrc) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imgSrc;

    img.onload = () => {
        // 1. Set Canvas Size (HD Quality Base)
        const baseHeight = 1080; 
        const baseWidth = baseHeight * aspectRatio;
        
        canvas.width = baseWidth;
        canvas.height = baseHeight;

        // 2. Draw Blurred Background (Fill)
        ctx!.filter = "blur(40px) brightness(0.6)";
        // Draw image covering the whole canvas for background
        const bgScale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const bgX = (canvas.width - img.width * bgScale) / 2;
        const bgY = (canvas.height - img.height * bgScale) / 2;
        ctx!.drawImage(img, bgX, bgY, img.width * bgScale, img.height * bgScale);

        // 3. Draw Foreground Image (With User Controls)
        ctx!.filter = "none";
        ctx!.shadowColor = "rgba(0,0,0,0.5)";
        ctx!.shadowBlur = 30;

        // Calculate size based on "Fit" logic initially, then apply user scale
        const fitScale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9; // 90% fit initially
        const finalScale = fitScale * scale;
        
        const finalW = img.width * finalScale;
        const finalH = img.height * finalScale;
        
        // Center position + User Offset
        const x = (canvas.width - finalW) / 2 + posX;
        const y = (canvas.height - finalH) / 2 + posY;

        ctx!.drawImage(img, x, y, finalW, finalH);
    };
  }, [imgSrc, aspectRatio, scale, posX, posY]);

  const download = () => {
    const link = document.createElement('a');
    link.download = `tikajoshi-resized-${Date.now()}.png`;
    link.href = canvasRef.current!.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0B1121] text-white pt-24 pb-12">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Advanced Canvas Resizer</h1>
            <p className="text-slate-400">Convert Portrait ↔ Landscape with Blur Fill & Controls</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left: Controls Panel */}
            <div className="lg:col-span-1 bg-[#1e293b]/50 p-6 rounded-2xl border border-white/10 h-fit">
                {!imgSrc ? (
                     <label className="block border-2 border-dashed border-slate-600 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition">
                        <input type="file" onChange={handleUpload} className="hidden" accept="image/*" />
                        <Upload className="mx-auto text-slate-400 mb-2"/>
                        <span className="font-bold text-slate-200">Upload Photo</span>
                    </label>
                ) : (
                    <div className="space-y-6">
                        {/* Aspect Ratio Buttons */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Target Size</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setAspectRatio(16/9)} className={`p-2 rounded-lg text-xs font-bold flex items-center gap-2 border ${aspectRatio === 16/9 ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-white/5'}`}>
                                    <Monitor size={14}/> YouTube (16:9)
                                </button>
                                <button onClick={() => setAspectRatio(9/16)} className={`p-2 rounded-lg text-xs font-bold flex items-center gap-2 border ${aspectRatio === 9/16 ? 'bg-purple-600 border-purple-500' : 'bg-slate-800 border-white/5'}`}>
                                    <Smartphone size={14}/> TikTok (9:16)
                                </button>
                                <button onClick={() => setAspectRatio(1)} className={`p-2 rounded-lg text-xs font-bold flex items-center gap-2 border ${aspectRatio === 1 ? 'bg-pink-600 border-pink-500' : 'bg-slate-800 border-white/5'}`}>
                                    <Square size={14}/> Post (1:1)
                                </button>
                                <button onClick={() => setAspectRatio(4/5)} className={`p-2 rounded-lg text-xs font-bold flex items-center gap-2 border ${aspectRatio === 4/5 ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-white/5'}`}>
                                    <Layers size={14}/> FB (4:5)
                                </button>
                            </div>
                        </div>

                        {/* Sliders */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block flex justify-between">
                                Zoom Scale <span>{Math.round(scale * 100)}%</span>
                            </label>
                            <input type="range" min="0.5" max="3" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none"/>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block flex justify-between">
                                Move Vertical (Y) <span>{posY}px</span>
                            </label>
                            <input type="range" min="-500" max="500" step="10" value={posY} onChange={(e) => setPosY(parseInt(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none"/>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block flex justify-between">
                                Move Horizontal (X) <span>{posX}px</span>
                            </label>
                            <input type="range" min="-500" max="500" step="10" value={posX} onChange={(e) => setPosX(parseInt(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none"/>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button onClick={() => setImgSrc(null)} className="flex-1 py-3 bg-slate-700 rounded-xl font-bold text-sm hover:bg-slate-600">New Image</button>
                            <button onClick={download} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                                <Download size={16}/> Download
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Canvas Preview */}
            <div className="lg:col-span-2 bg-[#020617] p-4 rounded-2xl border border-white/10 flex items-center justify-center min-h-[400px]">
                {imgSrc ? (
                    <canvas ref={canvasRef} className="max-w-full max-h-[600px] shadow-2xl shadow-black rounded-lg border border-slate-800"></canvas>
                ) : (
                    <div className="text-slate-600 flex flex-col items-center">
                        <Move size={48} className="mb-2 opacity-20"/>
                        <p>Preview Area</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}