"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
// FIX: Added Loader2 here
import { Upload, User, Send, Camera, Type, AlignLeft, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreatePost() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    if(!user) formData.append("author", formData.get("guestName") as string || "Anonymous");
    else formData.append("author", user.name);

    try {
        const res = await fetch('/api/chill/create', { method: 'POST', body: formData });
        if (res.ok) router.push("/chill-zone");
        else alert("Failed to post. Try again.");
    } catch (error) {
        console.error(error);
        alert("Something went wrong");
    } finally {
        setLoading(false);
    }
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto py-24 px-6">
        
        <Link href="/chill-zone" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition">
            <ArrowLeft size={18}/> Back to Chill Zone
        </Link>

        <div className="bg-[#1e293b]/50 border border-slate-700 p-8 md:p-10 rounded-[2rem] shadow-2xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-white mb-2">Create New Post 📸</h1>
                <p className="text-slate-400">Share your experience with the community.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {!user && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                        <label className="text-xs font-bold text-yellow-500 uppercase block mb-2">Posting as Guest</label>
                        <div className="flex items-center bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3">
                            <User size={18} className="text-slate-400 mr-3"/>
                            <input name="guestName" className="bg-transparent w-full outline-none text-white" placeholder="Your Name" required/>
                        </div>
                    </div>
                )}

                <div>
                    <label className="font-bold mb-2 block flex items-center gap-2"><Type size={16} className="text-blue-400"/> Title / Caption</label>
                    <input name="title" className="w-full bg-[#0f172a] border border-slate-600 p-4 rounded-xl outline-none focus:border-blue-500 transition text-white" placeholder="My ride to Mustang..." required/>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="font-bold mb-2 block">Category</label>
                        <select name="category" className="w-full bg-[#0f172a] border border-slate-600 p-4 rounded-xl outline-none text-white">
                            {['Ride 🏍️', 'Travel 🏔️', 'Food 🍜', 'Tech 💻', 'Meme 😂', 'Confession 🤫'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-bold mb-2 block">Upload Photo</label>
                        <label className="flex items-center justify-center gap-2 w-full bg-[#0f172a] border border-slate-600 border-dashed p-4 rounded-xl cursor-pointer hover:bg-slate-800 transition h-[58px]">
                            <input type="file" name="image" accept="image/*" className="hidden" onChange={handleImageChange} required/>
                            <Camera size={18} className="text-pink-500"/>
                            <span className="text-sm text-slate-400">{preview ? "Change Photo" : "Choose Photo"}</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="font-bold mb-2 block flex items-center gap-2"><AlignLeft size={16} className="text-purple-400"/> Description / Story</label>
                    <textarea name="description" className="w-full bg-[#0f172a] border border-slate-600 p-4 rounded-xl outline-none focus:border-purple-500 transition h-32 text-white" placeholder="Write something about this..."></textarea>
                </div>

                {preview && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 h-64 w-full">
                        <img src={preview} className="w-full h-full object-cover" alt="Preview"/>
                    </div>
                )}

                <button disabled={loading} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold flex justify-center gap-2 transition shadow-lg shadow-pink-500/20">
                    {loading ? <Loader2 className="animate-spin"/> : <><Send size={18}/> Publish Post</>}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}