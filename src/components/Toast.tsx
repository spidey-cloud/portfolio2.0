import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

type ToastListener = (toast: ToastMessage) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success: (message: string) => emitToast("success", message),
  error: (message: string) => emitToast("error", message),
  info: (message: string) => emitToast("info", message),
};

function emitToast(type: ToastMessage["type"], message: string) {
  const id = Math.random().toString(36).substring(2, 9);
  listeners.forEach((listener) => listener({ id, type, message }));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler: ToastListener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs font-medium tracking-wide ${
              t.type === "success"
                ? "bg-[#131d17]/95 border-emerald-500/30 text-emerald-300 shadow-emerald-950/40"
                : t.type === "error"
                ? "bg-[#201416]/95 border-rose-500/30 text-rose-300 shadow-rose-950/40"
                : "bg-[#181824]/95 border-purple-500/30 text-purple-200 shadow-purple-950/40"
            }`}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {t.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              {t.type === "info" && (
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
              )}
              <span className="truncate">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white/40 hover:text-white transition-colors shrink-0 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
