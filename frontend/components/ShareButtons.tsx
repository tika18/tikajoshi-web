"use client";
import React, { useState, useEffect } from "react";
import { Facebook, MessageCircle, Link2, Check } from "lucide-react";

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL: ", err);
    }
  };

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const viberShareUrl = `viber://forward?text=${encodeURIComponent(title + "\n" + shareUrl)}`;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Share:</span>
      <a
        href={facebookShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 transition-all duration-300"
        title="Share on Facebook"
      >
        <Facebook size={16} />
      </a>
      <a
        href={viberShareUrl}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#7360F2]/10 hover:bg-[#7360F2] text-[#7360F2] hover:text-white border border-[#7360F2]/20 transition-all duration-300"
        title="Share on Viber"
      >
        {/* Viber uses a purple theme, and MessageCircle looks clean as an icon */}
        <MessageCircle size={16} />
      </a>
      <button
        onClick={handleCopy}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all duration-300 relative"
        title="Copy Link"
      >
        {copied ? (
          <Check size={16} className="text-emerald-400 animate-pulse" />
        ) : (
          <Link2 size={16} />
        )}
      </button>
      {copied && (
        <span className="text-xs font-bold text-emerald-400 animate-fade-in transition-all">
          Link Copied!
        </span>
      )}
    </div>
  );
}
