import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, FileText, ExternalLink, Loader2 } from "lucide-react";
import { API_URL } from "../lib/storage";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl: string;
  fileName: string;
}

export default function ResumeModal({
  isOpen,
  onClose,
  resumeUrl,
  fileName,
}: ResumeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Fast direct stream from local backend proxy
  const proxyPreviewUrl = `${API_URL}/api/resume-proxy#toolbar=0&navpanes=0`;
  const directDownloadUrl = `${API_URL}/api/resume-proxy?download=true`;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Resume Preview"
            className="relative w-full max-w-5xl h-[92vh] bg-[#0E0E18] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#141422] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-sm font-semibold text-[#F4EEE8] tracking-wide truncate max-w-[200px] sm:max-w-md">
                  {fileName || "Rohon-Kumar-Dutta-Resume.pdf"}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href={directDownloadUrl}
                  download={fileName || "Resume.pdf"}
                  className="inline-flex items-center gap-2 bg-[#F4EEE8] text-[#0B0B12] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.03] hover:bg-white shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>

                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open original Drive link"
                    className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={onClose}
                  aria-label="Close resume preview"
                  className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer with instant proxy & loading spinner */}
            <div className="relative flex-1 bg-[#181828] overflow-hidden">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0E0E18] text-white/70 z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  <p className="text-xs font-mono uppercase tracking-wider text-white/50">
                    Loading resume preview...
                  </p>
                </div>
              )}
              <iframe
                src={proxyPreviewUrl}
                title="Resume Preview"
                className="w-full h-full border-0"
                onLoad={() => setLoading(false)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
