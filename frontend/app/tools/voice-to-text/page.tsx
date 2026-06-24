"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Mic, Copy, Trash2, StopCircle, FileText, Check, AlertCircle } from "lucide-react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

export default function VoiceToText() {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState("ne-NP"); // Default Nepali
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // CRITICAL FIX FOR REPETITION:
      recognitionRef.current.continuous = true; 
      recognitionRef.current.interimResults = false; // False = Only show text when fully sure (Fixes repetition)
      recognitionRef.current.lang = lang;

      recognitionRef.current.onresult = (event: any) => {
        let newText = "";
        
        // Loop through the results properly
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            newText += event.results[i][0].transcript + " "; // Add space after sentence
          }
        }

        if (newText) {
          setText((prev) => prev + newText);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech error:", event.error);
        if (event.error === 'no-speech') return;
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        // If user didn't manually stop, logic to restart or just stop
        if(isListening) {
            // Optional: Auto-restart if it cuts off alone
            // recognitionRef.current.start(); 
        } else {
            setIsListening(false);
        }
      };

    } else {
      alert("Browser not supported. Please use Google Chrome.");
    }
  }, [lang]); // Re-run if lang changes

  // Update Language
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  // Toggle Recording
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Copy to Clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate & Download Word File
  const downloadWord = () => {
    if (!text) return alert("Please create some text first!");

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: text,
                font: "Kalimati", // Good for Nepali if installed, else falls back
                size: 24, 
              }),
            ],
          }),
        ],
      }],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Tikajoshi_Notes.docx");
    });
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      <div className="pt-32 pb-20 px-4 md:px-6 max-w-4xl mx-auto">
        
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Smart Voice Notes 🎙️
            </h1>
            <p className="text-slate-400 text-lg">
            Speak naturally. AI will type it for you.
            </p>
        </div>

        {/* Language & Status Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#1e293b] p-4 rounded-2xl border border-slate-700 mb-6 gap-4 shadow-xl">
            
            <div className="flex bg-slate-900 p-1 rounded-xl">
                <button 
                    onClick={() => { setLang("ne-NP"); setText(""); }}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${lang === "ne-NP" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                >
                    🇳🇵 Nepali
                </button>
                <button 
                    onClick={() => { setLang("en-US"); setText(""); }}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${lang === "en-US" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                >
                    🇺🇸 English
                </button>
            </div>

            <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-full">
                <div className={`w-3 h-3 rounded-full ${isListening ? "bg-red-500 animate-pulse" : "bg-slate-500"}`}></div>
                <span className={`font-bold text-sm ${isListening ? "text-red-400" : "text-slate-500"}`}>
                    {isListening ? "Listening... (Speak Now)" : "Ready to Record"}
                </span>
            </div>
        </div>

        {/* Main Editor Area */}
        <div className="relative mb-8 group">
            <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={lang === 'ne-NP' ? "माइक अन गरेर बोल्नुहोस्... (यहाँ लेखिनेछ)" : "Turn on mic and start speaking..."}
                className="w-full h-[400px] bg-[#0f172a] border border-slate-700 rounded-3xl p-6 text-lg md:text-xl leading-relaxed focus:border-blue-500 outline-none resize-none shadow-inner text-slate-200 transition-all focus:ring-1 focus:ring-blue-500/50"
            ></textarea>
            
            {/* Floating Mic Button */}
            <button 
                onClick={toggleListening}
                className={`absolute bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl z-10 ${
                    isListening 
                    ? "bg-red-600 hover:bg-red-700 scale-110 ring-4 ring-red-900/30 animate-pulse" 
                    : "bg-blue-600 hover:bg-blue-500 hover:scale-105"
                }`}
                title={isListening ? "Stop Listening" : "Start Listening"}
            >
                {isListening ? <StopCircle size={32} className="text-white"/> : <Mic size={32} className="text-white"/>}
            </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
                onClick={copyToClipboard}
                disabled={!text}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 p-4 rounded-xl font-bold transition disabled:opacity-50 border border-slate-700 hover:border-slate-500"
            >
                {copied ? <Check size={20} className="text-green-500"/> : <Copy size={20}/>}
                {copied ? "Copied!" : "Copy Text"}
            </button>

            <button 
                onClick={() => {
                    if(confirm("Are you sure you want to clear all text?")) setText("");
                }}
                disabled={!text}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-900/30 hover:text-red-400 p-4 rounded-xl font-bold transition disabled:opacity-50 border border-slate-700 hover:border-red-900/50"
            >
                <Trash2 size={20}/> Clear All
            </button>

            <button 
                onClick={downloadWord}
                disabled={!text}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none hover:-translate-y-1"
            >
                <FileText size={20}/> Download Word
            </button>
        </div>

        {/* Tips Section */}
        <div className="mt-8 p-4 bg-yellow-900/10 border border-yellow-700/30 rounded-xl flex gap-3 text-left">
            <AlertCircle className="text-yellow-500 shrink-0" size={24}/>
            <div className="text-sm text-slate-400">
                <p className="font-bold text-yellow-500 mb-1">Tips for Accuracy:</p>
                <ul className="list-disc ml-4 space-y-1">
                    <li>नेपालीमा बोल्दा अलिकति <strong>बिस्तारै र प्रस्ट</strong> बोल्नुहोस्।</li>
                    <li>एक वाक्य सकेपछि <strong>सानो पज (Pause)</strong> लिनुहोस्, अनि टेक्स्ट आउँछ।</li>
                    <li>यदि कुनै शब्द बिग्रियो भने, माथिको बक्समा क्लिक गरेर <strong>Edit</strong> गर्न सकिन्छ।</li>
                </ul>
            </div>
        </div>

      </div>
    </div>
  );
}