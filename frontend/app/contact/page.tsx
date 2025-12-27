"use client";
import Navbar from "@/components/Navbar";
import { Mail, MapPin, Phone, Send, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Contact() {
  // WhatsApp Redirect Function
  const openWhatsApp = () => {
    const message = "Hello Tikajoshi! I have a query regarding the website.";
    window.open(`https://wa.me/9779848859853?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] text-slate-900 dark:text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto py-24 px-6">
        
        {/* Navigation History */}
        <div className="mb-8 text-sm text-slate-500">
            <Link href="/" className="hover:text-primary">Home</Link> / <span className="font-bold">Contact</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left: Info */}
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Let's Connect! 💬</h1>
                    <p className="text-slate-500 text-lg">Have a suggestion, found a bug, or want to share notes? We are always open to feedback.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600 dark:text-blue-400"><Mail/></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Email</p>
                            <p className="font-medium">tikajoshi2@gmail.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-green-500 transition" onClick={openWhatsApp}>
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl text-green-600 dark:text-green-400"><Phone/></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">WhatsApp (Fast Support)</p>
                            <p className="font-medium">+977 9848859853</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl text-purple-600 dark:text-purple-400"><MapPin/></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Location</p>
                            <p className="font-medium">Kathmandu, Nepal</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Working Form (Uses FormSubmit.co) */}
            <div className="bg-white dark:bg-[#1e293b] p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
                
                {/* FormSubmit Service used for Email */}
                <form action="https://formsubmit.co/tikajoshi2@gmail.com" method="POST" className="space-y-4">
                    {/* Redirect after submit */}
                    <input type="hidden" name="_next" value="http://localhost:3000/contact"/>
                    <input type="hidden" name="_captcha" value="false"/>
                    <input type="hidden" name="_subject" value="New Message from Tikajoshi Website!"/>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2 ml-1">Name</label>
                            <input type="text" name="name" required className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 p-3 rounded-xl outline-none focus:border-primary transition" placeholder="Your Name"/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 ml-1">Phone/Email</label>
                            <input type="text" name="contact" required className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 p-3 rounded-xl outline-none focus:border-primary transition" placeholder="Contact Info"/>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold mb-2 ml-1">Message</label>
                        <textarea name="message" required className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 p-3 rounded-xl h-32 outline-none focus:border-primary transition" placeholder="Write your suggestion or request notes..."></textarea>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold flex justify-center gap-2 transition shadow-lg shadow-blue-500/30">
                        <Send size={18}/> Send via Email
                    </button>
                </form>

                <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                    <span className="relative bg-white dark:bg-[#1e293b] px-4 text-xs text-slate-500 font-bold uppercase">OR</span>
                </div>

                <button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold flex justify-center gap-2 transition shadow-lg shadow-green-500/30">
                    <MessageCircle size={18}/> Chat on WhatsApp
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}