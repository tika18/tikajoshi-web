"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Mic, Copy, Trash2, Download, StopCircle, FileText, Check } from "lucide-react";
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
      recognitionRef.current.continuous = true; // Don't stop after one sentence
      recognitionRef.current.interimResults = true; // Show results while speaking
      recognitionRef.current.lang = lang;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          }
        }

        // Append only final results to existing text to prevent overwriting edits
        if (finalTranscript) {
          setText((prev) => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Error occurred in recognition: " + event.error);
        if(event.error === 'no-speech') {
            // Ignore no-speech errors, keep listening
            return;
        }
        setIsListening(false);
      };
    } else {
      alert("Browser not supported. Please use Google Chrome for best results.");
    }
  }, []);

  // Update Language dynamically
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

  // Generate & Download Word File (.docx)
  const downloadWord = () => {
    if (!text) return alert("Please speak or type something first!");

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: text,
                  font: "Calibri", // Standard font
                  size: 24, // 12pt size
                }),
              ],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Tikajoshi_Voice_Note.docx");
    });
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      <div className="pt-32 pb-20 px-4 md:px-6 max-w-5xl mx-auto">
        
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Smart Voice Assistant 🎙️
            </h1>
            <p className="text-slate-400 text-lg">
            Speak in Nepali or English -> Export to Word for your Project.
            </p>
        </div>

        {/* Language & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#1e293b] p-4 rounded-2xl border border-slate-700 mb-6 gap-4">
            
            {/* Language Switcher */}
            <div className="flex bg-slate-900 p-1 rounded-xl">
                <button 
                    onClick={() => setLang("ne-NP")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${lang === "ne-NP" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                >
                    🇳🇵 Nepali
                </button>
                <button 
                    onClick={() => setLang("en-US")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${lang === "en-US" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                >
                    🇺🇸 English
                </button>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${isListening ? "bg-red-500 animate-ping" : "bg-slate-500"}`}></span>
                <span className={`font-bold ${isListening ? "text-red-400" : "text-slate-500"}`}>
                    {isListening ? "Listening... (Speak Now)" : "Microphone Off"}
                </span>
            </div>
        </div>

        {/* Main Editor Area */}
        <div className="relative mb-8">
            <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={lang === 'ne-NP' ? "यहाँ बोल्नुहोस् वा टाइप गर्नुहोस्..." : "Start speaking or typing here..."}
                className="w-full h-[500px] bg-[#0f172a] border border-slate-700 rounded-3xl p-8 text-lg md:text-xl leading-relaxed focus:border-blue-500 outline-none resize-none shadow-inner text-slate-200"
            ></textarea>
            
            {/* Floating Mic Button */}
            <button 
                onClick={toggleListening}
                className={`absolute bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl z-10 ${
                    isListening 
                    ? "bg-red-600 hover:bg-red-700 scale-110 border-4 border-[#0f172a]" 
                    : "bg-blue-600 hover:bg-blue-500"
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
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 p-4 rounded-xl font-bold transition disabled:opacity-50"
            >
                {copied ? <Check size={20} className="text-green-500"/> : <Copy size={20}/>}
                {copied ? "Copied!" : "Copy Text"}
            </button>

            <button 
                onClick={() => setText("")}
                disabled={!text}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 p-4 rounded-xl font-bold transition disabled:opacity-50"
            >
                <Trash2 size={20}/> Clear All
            </button>

            <button 
                onClick={downloadWord}
                disabled={!text}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none"
            >
                <FileText size={20}/> Export to Word (.docx)
            </button>
        </div>

        <p className="text-center text-slate-500 text-sm mt-10">
            * Note: For best Nepali accuracy, speak slowly and clearly. Use Google Chrome browser.
        </p>

      </div>
    </div>
  );
}