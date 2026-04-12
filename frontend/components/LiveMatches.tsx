"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Match {
  id: string; title: string; category: string; sport: string;
  status: string; team1: string; team2: string;
  team1Logo: string; team2Logo: string;
  score: any[]; venue: string; isLive: boolean;
  url: string; color: string;
}

const sportIcon: Record<string, string> = {
  cricket: "🏏", football: "⚽", basketball: "🏀", f1: "🏎️",
};

export default function LiveMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState("");

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      if (data.matches) setMatches(data.matches);
      if (data.updated) setUpdated(new Date(data.updated).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kathmandu"
      }));
    } catch (e) {
      console.error("Match fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    // Refresh every 2 minutes
    const interval = setInterval(fetchMatches, 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {[1,2,3,4].map(i => (
        <div key={i} className="min-w-[220px] h-16 bg-white/5 border border-white/8 rounded-2xl animate-pulse shrink-0" />
      ))}
    </div>
  );

  if (matches.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Today's Matches
          </h2>
          {matches.filter(m => m.isLive).length > 0 && (
            <span className="bg-red-500/15 border border-red-500/20 text-red-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
              {matches.filter(m => m.isLive).length} Live
            </span>
          )}
        </div>
        {updated && (
          <span className="text-[10px] text-slate-600">Updated {updated}</span>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
        {matches.map(match => (
          <Link key={match.id} href={match.url}
            className={`relative flex items-center gap-3 min-w-[240px] bg-gradient-to-br ${match.color} border border-white/8 hover:border-white/20 p-3 rounded-2xl transition-all shrink-0 group overflow-hidden`}
          >
            {/* Live badge */}
            {match.isLive && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded-full z-10">
                <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                <span className="text-[8px] font-black text-white">LIVE</span>
              </div>
            )}

            {/* Team logos */}
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur rounded-xl p-2 shrink-0">
              <img src={match.team1Logo} alt={match.team1}
                className="w-8 h-8 object-contain drop-shadow-lg"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${match.team1[0]}&background=1e293b&color=fff&size=80`; }}
              />
              <span className="text-[9px] font-black text-white/40">VS</span>
              <img src={match.team2Logo} alt={match.team2}
                className="w-8 h-8 object-contain drop-shadow-lg"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${match.team2[0]}&background=1e293b&color=fff&size=80`; }}
              />
            </div>

            {/* Info */}
            <div className="text-left min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider"
                  style={{ color: match.isLive ? "#f87171" : "#64748b" }}>
                  {match.status}
                </span>
                <span className="text-[9px] text-slate-600">·</span>
                <span className="text-[9px] text-slate-600 font-bold uppercase">{match.category}</span>
              </div>
              <p className="text-sm font-bold text-white truncate group-hover:text-yellow-300 transition-colors">
                {match.title}
              </p>
              {/* Live score */}
              {match.isLive && match.score?.length > 0 && (
                <p className="text-[10px] text-emerald-400 font-bold truncate mt-0.5">
                  {match.score.map((s: any) => `${s.r}/${s.w} (${s.o})`).join(" | ")}
                </p>
              )}
              {match.venue && (
                <p className="text-[9px] text-slate-600 truncate">{match.venue}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}