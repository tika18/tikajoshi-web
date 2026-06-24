"use client";
import { useState, useEffect } from "react";
import { CalendarClock, Timer } from "lucide-react";

interface Event {
  id: string;
  name: string;
  date: string; // ISO string
  type: "football" | "cricket" | "f1";
  teams?: string;
}

const UPCOMING_EVENTS: Event[] = [
  { id: "1", name: "FIFA World Cup Qualifiers", date: new Date(Date.now() + 86400000 * 3).toISOString(), type: "football", teams: "Brazil vs Argentina" },
  { id: "2", name: "ICC T20 Match", date: new Date(Date.now() + 86400000 * 5).toISOString(), type: "cricket", teams: "Nepal vs UAE" },
  { id: "3", name: "Grand Prix", date: new Date(Date.now() + 86400000 * 12).toISOString(), type: "f1", teams: "Monaco GP" },
];

export default function CountdownSchedule() {
  const [now, setNow] = useState(new Date().getTime());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeLeft = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - now;
    if (diff <= 0) return "Started";
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "football": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "cricket": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "f1": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  return (
    <div className="bg-[#111318] border border-white/8 rounded-2xl p-5 sm:p-6 w-full">
      <div className="flex items-center gap-2 mb-6 border-b border-white/8 pb-4">
        <CalendarClock size={20} className="text-orange-400" />
        <h3 className="font-black text-white text-base sm:text-lg uppercase tracking-widest">Upcoming High-Voltage Matches</h3>
      </div>

      <div className="space-y-4">
        {UPCOMING_EVENTS.map(event => (
          <div key={event.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-xl border border-white/5 transition-colors gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getTypeColor(event.type)}`}>
                  {event.type}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <h4 className="text-white font-bold text-sm">{event.name}</h4>
              {event.teams && <p className="text-xs text-slate-500 mt-1">{event.teams}</p>}
            </div>
            <div className="flex items-center gap-2 bg-[#0d0f14] border border-white/10 px-4 py-2 rounded-lg shrink-0">
              <Timer size={14} className="text-orange-400" />
              <span className="font-mono font-bold text-orange-400 text-sm tracking-wider">
                {formatTimeLeft(event.date)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
