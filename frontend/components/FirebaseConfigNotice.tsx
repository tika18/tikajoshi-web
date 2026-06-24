"use client";

import { AlertTriangle } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function FirebaseConfigNotice() {
  if (isFirebaseConfigured) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-300 text-sm flex items-start gap-2">
      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
      <span>
        Firebase is not configured. Login, chat, and OTP features are temporarily disabled until valid Firebase keys are added in `frontend/.env.local`.
      </span>
    </div>
  );
}
