import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, FileText } from "lucide-react";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl: string;
  fileName: string;
}

/** Convert any Google Drive "view" URL to an embeddable "preview" URL */
function toPreviewUrl(url: string): string {
  // https://drive.google.com/file/d/{ID}/view?... → .../preview
  const match = url.match(/\/file\/d\/([^/]+)/);
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  // Fallback: use Google Docs Viewer
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

/** Convert any Google Drive URL to a direct download URL */
function toDownloadUrl(url: string): string {
  const match = url.match(/\/file\/d\/([^/]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url;
}

export default function ResumeModal({
  isOpen,
  onClose,
  resumeUrl,
  fileName,
}: ResumeModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const previewUrl = resumeUrl ? toPreviewUrl(resumeUrl) : "";
  const downloadUrl = resumeUrl ? toDownloadUrl(resumeUrl) : "#";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9000] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Resume Preview"
            className="fixed inset-0 z-[9001] flex items-center justify-center p-4 md:p-8 pointer-events-none"
          >
            <div
              className="relative w-full max-w-5xl h-[90vh] bg-[#0F0F1A] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-[#F4EEE8] tracking-wide truncate max-w-[260px] md:max-w-none">
                    {fileName || "Resume.pdf"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Download button */}
                  <a
                    href={downloadUrl}
                    download={fileName || "Resume.pdf"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#F4EEE8] text-[#0B0B12] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.04] hover:bg-white shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    aria-label="Close resume preview"
                    className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF iframe */}
              <div className="flex-1 overflow-hidden bg-[#1a1a2e]">
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    title="Resume Preview"
                    className="w-full h-full border-0"
                    allow="autoplay"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#A8A8B0] text-sm">
                    No resume URL configured.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
