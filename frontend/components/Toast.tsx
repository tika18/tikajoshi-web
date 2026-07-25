// frontend/components/Toast.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "info" | "loading";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success", duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (type !== "loading" && duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full sm:w-auto pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border shadow-lg backdrop-blur-xl ${
                t.type === "success"
                  ? "bg-[#081510]/80 border-emerald-500/30 text-emerald-300"
                  : t.type === "error"
                  ? "bg-[#180a0a]/80 border-red-500/30 text-red-300"
                  : t.type === "loading"
                  ? "bg-[#080d14]/80 border-indigo-500/30 text-indigo-300"
                  : "bg-[#0c121e]/80 border-slate-500/30 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {t.type === "success" && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                {t.type === "error" && <AlertTriangle size={18} className="text-red-400 shrink-0" />}
                {t.type === "info" && <Info size={18} className="text-slate-400 shrink-0" />}
                {t.type === "loading" && <Loader2 size={18} className="text-indigo-400 animate-spin shrink-0" />}
                <p className="text-xs font-semibold leading-relaxed pr-2">{t.message}</p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-slate-500 hover:text-slate-300 transition duration-150"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
