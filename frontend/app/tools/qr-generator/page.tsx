"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { QrCode, Download, Link as LinkIcon } from "lucide-react";

export default function QRGenerator() {
  const [text, setText] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const generateQR = () => {
    if(!text) return;
    // Using simple API for QR
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      <div className="pt-32 px-6 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-black mb-4">QR Code Generator</h1>
        <p className="text-slate-400 mb-10">Create instant QR codes for links, text or wifi.</p>

        <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-2xl">
            <div className="flex gap-2 mb-8">
                <div className="relative flex-1">
                    <LinkIcon className="absolute left-4 top-4 text-slate-500" size={20}/>
                    <input 
                        type="text" 
                        placeholder="Enter website link or text here..." 
                        className="w-full bg-[#0f172a] border border-slate-600 rounded-xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 outline-none transition"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>
                <button onClick={generateQR} className="bg-emerald-600 hover:bg-emerald-500 px-6 rounded-xl font-bold transition">Generate</button>
            </div>

            {qrUrl && (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <div className="bg-white p-4 rounded-xl mb-6">
                        <img src={qrUrl} alt="QR Code" className="w-48 h-48"/>
                    </div>
                    <a href={qrUrl} download="qrcode.png" target="_blank" className="flex items-center gap-2 text-emerald-400 font-bold hover:text-white transition">
                        <Download size={20}/> Download QR
                    </a>
                </div>
            )}
            
            {!qrUrl && (
                <div className="border-2 border-dashed border-slate-700 rounded-xl h-48 flex flex-col items-center justify-center text-slate-500">
                    <QrCode size={40} className="mb-2 opacity-50"/>
                    <p>QR Code will appear here</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}