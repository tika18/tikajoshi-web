"use client";
import { Tv } from "lucide-react";

export default function LiveScoreWidget() {
  return (
    <div className="bg-[#111318] border border-white/8 rounded-2xl overflow-hidden w-full">
      <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2 bg-[#1a1d24]">
        <Tv size={15} className="text-emerald-400" />
        <span className="font-black text-white text-sm uppercase tracking-wider">Live Scores</span>
        <span className="ml-auto flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-black text-emerald-400">
          <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> LIVE
        </span>
      </div>
      <div className="w-full h-[500px] bg-[#0d0f14] relative">
        {/* Using a free Scorebat widget for live scores as an iframe */}
        <iframe
          src="https://www.scorebat.com/embed/livescore/"
          frameBorder="0"
          width="100%"
          height="100%"
          allowFullScreen
          allow="autoplay; fullscreen"
          className="absolute inset-0 w-full h-full"
          title="Live Sports Scores"
        />
      </div>
    </div>
  );
}
