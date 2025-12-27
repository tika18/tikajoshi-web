"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Upload, User, Send } from "lucide-react";

export default function CreatePost() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ title: "", category: "Ride 🏍️", guestName: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    // Logic: Use Logged in name OR Guest Name
    const authorName = user ? user.name : (formData.guestName || "Anonymous");

    const doc = {
      _type: 'chillPost',
      title: formData.title,
      category: formData.category,
      author: authorName,
      isGuest: !user,
      publishedAt: new Date().toISOString()
    };

    await client.create(doc);
    setLoading(false);
    router.push("/chill-zone");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] text-slate-900 dark:text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto py-32 px-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Share Your Story 📸</h1>
        
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-[#1e293b] p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
            
            {/* If Guest, Ask Name */}
            {!user && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-4">
                    <label className="block text-xs font-bold uppercase text-yellow-600 mb-2">Posting as Guest</label>
                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg px-3 border border-slate-200 dark:border-slate-600">
                        <User size={18} className="text-slate-400 mr-2"/>
                        <input className="w-full bg-transparent p-3 outline-none" placeholder="Enter your name..." required onChange={e => setFormData({...formData, guestName: e.target.value})}/>
                    </div>
                </div>
            )}

            <div>
                <label className="block font-bold mb-2">Title / Caption</label>
                <input className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-4 rounded-xl outline-none focus:border-blue-500" placeholder="My ride to Mustang..." required onChange={e => setFormData({...formData, title: e.target.value})}/>
            </div>

            <div>
                <label className="block font-bold mb-2">Category</label>
                <select className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-4 rounded-xl outline-none" onChange={e => setFormData({...formData, category: e.target.value})}>
                    {['Ride 🏍️', 'Travel 🏔️', 'Food 🍜', 'Tech 💻', 'Meme 😂'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Photo Upload Placeholder (For now text) */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 text-center text-slate-500">
                <Upload className="mx-auto mb-2"/>
                <p>Photo Upload Coming Soon (Requires API)</p>
            </div>

            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold flex justify-center gap-2 transition">
                {loading ? "Posting..." : <><Send size={18}/> Post Now</>}
            </button>
        </form>
      </div>
    </div>
  );
}