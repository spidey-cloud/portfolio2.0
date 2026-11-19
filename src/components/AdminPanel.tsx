import { useState, useEffect, useRef, KeyboardEvent, ClipboardEvent, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  X,
  Edit,
  Trash2,
  Plus,
  Check,
  Eye,
  Trash,
  Settings,
  FolderKanban,
  Award,
  Image,
  FileText,
  TrendingUp,
  RefreshCw,
  BarChart2,
  Activity,
  ShieldCheck,
  LogOut,
  ArrowRight,
} from "lucide-react";
import {
  loadProjects,
  saveProjects,
  loadSkills,
  saveSkills,
  loadSongs,
  saveSongs,
  loadWorkUpdates,
  saveWorkUpdates,
  loadResume,
  saveResume,
  loadAvatar,
  saveAvatar,
  loadActivityLogs,
  clearActivities,
} from "../lib/storage";
import {
  verifyTOTP,
  generateQRCodeDataURL,
  isTOTPSetup,
  markTOTPSetupComplete,
  is2FAEnabled,
  set2FAEnabled,
} from "../lib/totp";
import { toast } from "./Toast";
import {
  validateShortText,
  validateLongText,
  validateUrl,
  validateOptionalShortText,
} from "../lib/validate";
import {
  ActivityLog,
  Project,
  SkillCategory,
  Song,
  WorkUpdate,
} from "../types";

// Password for simple demo authentication
const ADMIN_PASSWORD = "admin";

interface AdminPanelProps {
  isOpen: boolean;
  isPage?: boolean;
  onClose: () => void;
  onDataChange: () => void; // Notify parent to refresh lists
}

export default function AdminPanel({
  isOpen,
  isPage = false,
  onClose,
  onDataChange,
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  // Authentication step state: idle -> otp -> authenticated
  const [authStep, setAuthStep] = useState<"idle" | "otp" | "authenticated">(
    "idle",
  );
  // 6-digit OTP stored as array of single chars
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const otpCode = otpDigits.join("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Brute-force protection
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<
    "projects" | "skills" | "work" | "photos" | "analytics" | "bookings"
  >("bookings");

  const [apiBookings, setApiBookings] = useState<any[]>([]);

  // Dynamic state
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [workUpdates, setWorkUpdates] = useState<WorkUpdate[]>([]);
  const [resume, setResume] = useState({
    url: "",
    fileName: "",
    updatedAt: "",
  });
  const [avatar, setAvatar] = useState({ url: "", statusText: "" });
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Project edit form state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: "",
    description: "",
    image: "",
    videoUrl: "",
    techStack: [],
    githubUrl: "",
    liveUrl: "",
  });
  const [techInput, setTechInput] = useState<string>("");

  // Skills state
  const [newSkillText, setNewSkillText] = useState<{ [catId: string]: string }>(
    {},
  );

  // Song state
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [newSong, setNewSong] = useState<Partial<Song>>({
    title: "",
    artist: "",
    coverUrl: "",
    youtubeUrl: "",
  });

  // Work update state
  const [editingWork, setEditingWork] = useState<WorkUpdate | null>(null);
  const [newWork, setNewWork] = useState<Partial<WorkUpdate>>({
    role: "",
    company: "",
    companyUrl: "",
    duration: "",
    description: "",
  });

  // File upload state / feedback
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Load all initial data
  useEffect(() => {
    if (isOpen) {
      loadProjects().then(setProjects);
      loadSkills().then(setSkills);
      loadSongs().then(setSongs);
      loadWorkUpdates().then(setWorkUpdates);
      loadResume().then(setResume);
      loadAvatar().then(setAvatar);
      loadActivityLogs().then(setLogs);

      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      fetch(`${API_BASE}/api/bookings`)
        .then(res => res.json())
        .then(data => setApiBookings(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [isOpen]);

  const handleBookingAction = async (id: string, action: 'accept' | 'cancel') => {
    setUploadStatus(`Processing ${action}...`);
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/${action}`, { method: 'POST' });
      if (res.ok) {
        const msg = `Booking ${action}ed successfully.`;
        setUploadStatus(msg);
        toast.success(msg);
        const updated = await fetch(`${API_BASE}/api/bookings`).then(r => r.json());
        setApiBookings(Array.isArray(updated) ? updated : []);
      } else {
        const err = `Failed to ${action} booking.`;
        setUploadStatus(err);
        toast.error(err);
      }
    } catch(e: any) {
      setUploadStatus(`Error: ${e.message}`);
      toast.error(`Error: ${e.message}`);
    }
  };

  const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  const isLocked = () => lockUntil !== null && Date.now() < lockUntil;

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLocked()) {
      setAuthError("Too many failed attempts. Try again later.");
      return;
    }

    if (password === ADMIN_PASSWORD) {
      setAuthError("");
      
      if (!is2FAEnabled()) {
        setIsAuthenticated(true);
        setAuthStep("authenticated");
      } else {
        setAuthStep("otp");
        // If TOTP hasn't been setup before, generate a QR to show
        if (!isTOTPSetup()) {
          try {
            const qr = await generateQRCodeDataURL();
            setQrDataUrl(qr);
          } catch (err) {
            // ignore QR generation failure
          }
        }
      }
    } else {
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      if (next >= 5) {
        const until = Date.now() + LOCK_DURATION;
        setLockUntil(until);
        setAuthError("Too many failed attempts. Locked for 15 minutes.");
      } else {
        setAuthError("Incorrect password. Please try again.");
      }
    }
  };

  const handleVerifyOtp = (e: FormEvent) => {
    e.preventDefault();
    if (isLocked()) {
      setAuthError("Too many failed attempts. Try again later.");
      return;
    }
    const ok = verifyTOTP(otpCode);
    if (ok) {
      setIsAuthenticated(true);
      setAuthStep("authenticated");
      setAuthError("");
      setFailedAttempts(0);
      setLockUntil(null);
      if (!isTOTPSetup()) {
        markTOTPSetupComplete();
        setQrDataUrl("");
      }
    } else {
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      if (next >= 5) {
        setLockUntil(Date.now() + LOCK_DURATION);
        setAuthError("Too many failed attempts. Locked for 15 minutes.");
      } else {
        setAuthError("Invalid OTP code. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    setAuthStep("idle");
    setOtpDigits(Array(6).fill(""));
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array(6).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // 1. PROJECT HANDLERS
  const handleSaveProject = (e: FormEvent) => {
    e.preventDefault();
    let updatedProjects = [...projects];

    if (editingProject) {
      // Update existing
      updatedProjects = updatedProjects.map((p) =>
        p.id === editingProject.id ? { ...editingProject } : p,
      );
      setEditingProject(null);
    } else {
      // Add new with validation
      const titleV = validateShortText(newProject.title || "");
      const descV = validateLongText(newProject.description || "", true);
      if (!titleV.ok) {
        setUploadStatus(titleV.error);
        return;
      }
      if (!descV.ok) {
        setUploadStatus(descV.error);
        return;
      }

      // image may be a data URL or an https url
      const imageVal = newProject.image || "";
      if (
        imageVal &&
        !imageVal.startsWith("data:") &&
        !validateUrl(imageVal).ok
      ) {
        setUploadStatus(
          "Cover image must be a valid https:// URL or uploaded file.",
        );
        return;
      }

      if (newProject.githubUrl && !validateUrl(newProject.githubUrl).ok) {
        setUploadStatus("GitHub URL is invalid. Include https://");
        return;
      }
      if (newProject.liveUrl && !validateUrl(newProject.liveUrl).ok) {
        setUploadStatus("Live URL is invalid. Include https://");
        return;
      }
      const added: Project = {
        id: Math.random().toString(36).substring(2, 9),
        title: newProject.title,
        description: newProject.description,
        image:
          newProject.image ||
          "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
        videoUrl: newProject.videoUrl || "",
        techStack: newProject.techStack || [],
        githubUrl: newProject.githubUrl || "https://github.com",
        liveUrl: newProject.liveUrl || "https://vercel.app",
      };
      updatedProjects.push(added);
      setNewProject({
        title: "",
        description: "",
        image: "",
        videoUrl: "",
        techStack: [],
        githubUrl: "",
        liveUrl: "",
      });
      setTechInput("");
    }

    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    toast.success(editingProject ? "Project updated successfully!" : "New project added successfully!");
    onDataChange();
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
    toast.success("Project deleted successfully!");
    onDataChange();
  };

  const addTechPill = (isEditing: boolean) => {
    if (!techInput.trim()) return;
    if (isEditing && editingProject) {
      const updatedStack = [
        ...(editingProject.techStack || []),
        techInput.trim(),
      ];
      setEditingProject({ ...editingProject, techStack: updatedStack });
    } else {
      const updatedStack = [...(newProject.techStack || []), techInput.trim()];
      setNewProject({ ...newProject, techStack: updatedStack });
    }
    setTechInput("");
  };

  const removeTechPill = (tech: string, isEditing: boolean) => {
    if (isEditing && editingProject) {
      setEditingProject({
        ...editingProject,
        techStack: editingProject.techStack.filter((t) => t !== tech),
      });
    } else {
      setNewProject({
        ...newProject,
        techStack: (newProject.techStack || []).filter((t) => t !== tech),
      });
    }
  };

  // Helper to extract YouTube video ID and build thumbnail URL
  const getYouTubeThumbnail = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };

  // Convert File uploads to base64 strings to simulate local photos upload
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB limit

  const handlePhotoUpload = (
    e: ChangeEvent<HTMLInputElement>,
    target: "project" | "project-video" | "avatar" | "song" | "resume",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      const err = `File "${file.name}" exceeds the 2MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a file under 2 MB.`;
      setUploadStatus(err);
      toast.error(err);
      e.target.value = "";
      return;
    }

    setUploadStatus("Processing...");
    const reader = new FileReader();

    if (target === "resume") {
      setTimeout(() => {
        const updatedResume = {
          url: "#",
          fileName: file.name,
          updatedAt: new Date().toISOString().split("T")[0],
        };
        setResume(updatedResume);
        saveResume(updatedResume);
        const msg = `Resume document ${file.name} saved!`;
        setUploadStatus(msg);
        toast.success(msg);
        onDataChange();
      }, 800);
      return;
    }

    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (target === "project") {
        if (editingProject) {
          setEditingProject({ ...editingProject, image: base64String });
        } else {
          setNewProject({ ...newProject, image: base64String });
        }
        setUploadStatus("Project cover image uploaded successfully!");
        toast.success("Project cover image uploaded!");
      } else if (target === "project-video") {
        if (editingProject) {
          setEditingProject({ ...editingProject, videoUrl: base64String });
        } else {
          setNewProject({ ...newProject, videoUrl: base64String });
        }
        setUploadStatus("Project demo video uploaded successfully!");
        toast.success("Project video uploaded!");
      } else if (target === "avatar") {
        const updatedAvatar = { ...avatar, url: base64String };
        setAvatar(updatedAvatar);
        saveAvatar(updatedAvatar);
        setUploadStatus("Profile photo updated successfully!");
        toast.success("Profile photo updated!");
        onDataChange();
      } else if (target === "song") {
        if (editingSong) {
          setEditingSong({ ...editingSong, coverUrl: base64String });
        } else {
          setNewSong({ ...newSong, coverUrl: base64String });
        }
        setUploadStatus("Song cover image updated successfully!");
        toast.success("Song cover image updated!");
      }
    };
    reader.readAsDataURL(file);
  };

  // 2. SKILL HANDLERS
  const handleAddSkill = (catId: string) => {
    const text = newSkillText[catId];
    if (!text || !text.trim()) return;

    const updated = skills.map((cat) => {
      if (cat.id === catId) {
        return { ...cat, items: [...cat.items, text.trim()] };
      }
      return cat;
    });

    setSkills(updated);
    saveSkills(updated);
    setNewSkillText({ ...newSkillText, [catId]: "" });
    toast.success(`Skill "${text.trim()}" added!`);
    onDataChange();
  };

  const handleRemoveSkill = (catId: string, skill: string) => {
    const updated = skills.map((cat) => {
      if (cat.id === catId) {
        return { ...cat, items: cat.items.filter((i) => i !== skill) };
      }
      return cat;
    });

    setSkills(updated);
    saveSkills(updated);
    toast.success(`Skill "${skill}" removed!`);
    onDataChange();
  };

  // 3. WORK UPDATE HANDLERS
  const handleSaveWork = (e: FormEvent) => {
    e.preventDefault();
    let updatedWork = [...workUpdates];

    if (editingWork) {
      updatedWork = updatedWork.map((w) =>
        w.id === editingWork.id ? { ...editingWork } : w,
      );
      setEditingWork(null);
    } else {
      // validation
      const roleV = validateShortText(newWork.role || "");
      const compV = validateShortText(newWork.company || "");
      if (!roleV.ok) {
        setUploadStatus(roleV.error);
        return;
      }
      if (!compV.ok) {
        setUploadStatus(compV.error);
        return;
      }

      if (newWork.companyUrl && !validateUrl(newWork.companyUrl).ok) {
        setUploadStatus("Company URL is invalid. Include https://");
        return;
      }
      const added: WorkUpdate = {
        id: Math.random().toString(36).substring(2, 9),
        role: newWork.role,
        company: newWork.company,
        companyUrl: newWork.companyUrl || "https://google.com",
        duration: newWork.duration || "Present",
        description: newWork.description || "",
      };
      updatedWork.push(added);
      setNewWork({
        role: "",
        company: "",
        companyUrl: "",
        duration: "",
        description: "",
      });
    }

    setWorkUpdates(updatedWork);
    saveWorkUpdates(updatedWork);
    toast.success(editingWork ? "Work experience updated!" : "Work experience added!");
    onDataChange();
  };

  const handleDeleteWork = (id: string) => {
    if (!confirm("Delete this work record?")) return;
    const updated = workUpdates.filter((w) => w.id !== id);
    setWorkUpdates(updated);
    saveWorkUpdates(updated);
    toast.success("Work record deleted!");
    onDataChange();
  };

  // 4. PHOTO/SONG HANDLERS
  const handleSaveSong = async (e: FormEvent) => {
    e.preventDefault();
    let updatedSongs = [...songs];

    try {
      if (editingSong) {
        let yt = (editingSong.youtubeUrl || "").trim();
        if (yt && !/^https?:\/\//i.test(yt)) yt = "https://" + yt;

        const autoThumb = getYouTubeThumbnail(yt);
        const finalCover = (!editingSong.coverUrl || editingSong.coverUrl.trim() === "") && autoThumb
          ? autoThumb
          : editingSong.coverUrl;

        updatedSongs = updatedSongs.map((s) =>
          s.id === editingSong.id ? { ...editingSong, youtubeUrl: yt, coverUrl: finalCover } : s,
        );
      } else {
        const titleV = validateShortText(newSong.title || "");
        const artistV = validateShortText(newSong.artist || "");
        if (!titleV.ok) {
          toast.error(titleV.error || "Song title is required");
          return;
        }
        if (!artistV.ok) {
          toast.error(artistV.error || "Artist name is required");
          return;
        }

        let yt = (newSong.youtubeUrl || "").trim();
        if (yt && !/^https?:\/\//i.test(yt)) yt = "https://" + yt;

        if (yt && !validateUrl(yt).ok) {
          toast.error("YouTube URL is invalid");
          return;
        }

        const autoThumb = getYouTubeThumbnail(yt);
        const finalCover = newSong.coverUrl || autoThumb || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400";

        const added: Song = {
          id: Math.random().toString(36).substring(2, 9),
          title: newSong.title || "Untitled",
          artist: newSong.artist || "Unknown Artist",
          coverUrl: finalCover,
          youtubeUrl: yt || "https://youtube.com",
        };
        updatedSongs.push(added);
      }

      await saveSongs(updatedSongs);
      setSongs(updatedSongs);
      if (editingSong) {
        setEditingSong(null);
      } else {
        setNewSong({ title: "", artist: "", coverUrl: "", youtubeUrl: "" });
      }
      toast.success(editingSong ? "Song recommendation updated!" : "Song recommendation added!");
      onDataChange();
    } catch (err: any) {
      console.error("Save song error:", err);
      toast.error(`Failed to save song: ${err?.message || "Server error"}`);
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return;
    const updated = songs.filter((s) => s.id !== id);
    try {
      await saveSongs(updated);
      setSongs(updated);
      toast.success("Song removed from recommendations!");
      onDataChange();
    } catch (err: any) {
      console.error("Delete song error:", err);
      toast.error(`Failed to delete song: ${err?.message || "Server error"}`);
    }
  };

  const handleUpdateAvatarDetails = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await saveAvatar(avatar);
      setUploadStatus("Profile settings saved successfully!");
      toast.success("Profile settings saved successfully!");
      onDataChange();
    } catch (err: any) {
      toast.error("Failed to save profile settings");
    }
  };

  // 5. ANALYTICS CALCULATIONS
  const totalViews = logs.filter((l) => l.type === "page_view").length;
  const projectClicks = logs.filter((l) => l.type === "project_click").length;
  const liveClicks = logs.filter((l) => l.type === "live_click").length;
  const githubClicks = logs.filter((l) => l.type === "github_click").length;
  const resumeDownloads = logs.filter(
    (l) => l.type === "resume_download",
  ).length;
  const bookings = logs.filter((l) => l.type === "book_call_success").length;

  const handleClearActivities = async () => {
    if (
      !confirm("Clear all website activity analytics? This cannot be undone.")
    )
      return;
    await clearActivities();
    setLogs([]);
    toast.success("Analytics cleared");
  };

  const handleRefreshAnalytics = () => {
    loadActivityLogs().then((data) => {
      setLogs(data);
      toast.success(`Refreshed — ${data.length} log${data.length !== 1 ? "s" : ""} loaded`);
    });
  };

  if (!isOpen) return null;

  const outerClass = isPage
    ? "fixed inset-0 flex flex-col overflow-hidden"
    : "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md overflow-y-auto p-4 select-none";

  return (
    <div className={outerClass} style={isPage ? { background: "var(--page-bg)", backgroundSize: "cover" } : {}}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={isPage
          ? "relative w-full h-full flex flex-col overflow-hidden"
          : "relative w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border"}
        style={{
          background: "var(--card-bg)",
          borderColor: isPage ? "transparent" : "var(--border-color)",
        }}
      >
        {/* Header Bar */}
        <div
          className="flex items-center justify-between px-8 py-5 border-b shrink-0"
          style={{
            background: "var(--card-bg-2)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h2 className="font-bold text-base tracking-wider uppercase" style={{ color: "var(--text-primary)" }}>
              Rohon's Admin Panel
            </h2>
            {isAuthenticated && (
              <span className="text-xs bg-purple-500/10 text-purple-400 font-semibold px-3 py-1 rounded-full border border-purple-500/20 uppercase tracking-widest">
                Authenticated
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center border cursor-pointer transition-colors hover:opacity-70"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {authStep !== "authenticated" ? (
          authStep === "idle" ? (
            /* Password Form */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 p-8">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: "var(--card-bg-2)", border: "2px solid var(--border-color-strong)", color: "var(--text-primary)" }}
              >
                <Lock className="w-12 h-12" />
              </div>
              <div className="space-y-3 max-w-lg">
                <h3
                  className="text-3xl font-bold uppercase tracking-wide"
                  style={{ color: "var(--text-primary)" }}
                >
                  Enter Administrator Password
                </h3>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  Unlock the gateway to dynamic uploads, updating skills,
                  editing your projects, and reviewing real-time web activities.
                </p>
              </div>
              <form
                onSubmit={handlePasswordSubmit}
                className="w-full max-w-sm space-y-4"
              >
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Enter Password (default: admin)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl px-6 py-4 text-base outline-none text-center transition-all"
                    style={{
                      background: "var(--card-bg-2)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color-strong)",
                    }}
                    autoFocus
                  />
                  {authError && (
                    <p className="text-rose-400 text-sm font-medium pt-1">
                      {authError}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl font-bold text-sm tracking-wider uppercase hover:opacity-90 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  style={{
                    background: "var(--btn-bg)",
                    color: "var(--btn-text)",
                  }}
                >
                  Unlock Panel <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* OTP Form — 6 individual boxes */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 p-8">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: "var(--card-bg-2)", border: "2px solid var(--border-color-strong)", color: "var(--text-primary)" }}
              >
                <ShieldCheck className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3
                  className="text-3xl font-bold uppercase tracking-wide"
                  style={{ color: "var(--text-primary)" }}
                >
                  Two-Factor Authentication
                </h3>
                <p className="text-base" style={{ color: "var(--text-muted)" }}>
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>
              {qrDataUrl && (
                <div className="p-4 rounded-2xl" style={{ background: "var(--card-bg-2)", border: "1px solid var(--border-color)" }}>
                  <img src={qrDataUrl} alt="TOTP QR" className="rounded-xl" />
                  <p
                    className="text-sm mt-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Scan this in Google Authenticator (first-time setup)
                  </p>
                </div>
              )}
              <form onSubmit={handleVerifyOtp} className="w-full max-w-sm space-y-6">
                {/* 6-box OTP inputs */}
                <div className="flex gap-4 justify-center">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otpDigits[idx]}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      className="w-14 h-16 rounded-2xl text-center text-2xl font-bold outline-none transition-all"
                      style={{
                        background: "var(--card-bg-2)",
                        color: "var(--text-primary)",
                        border: otpDigits[idx]
                          ? "2px solid #a855f7"
                          : "1px solid var(--border-color-strong)",
                        boxShadow: otpDigits[idx] ? "0 0 0 4px rgba(168,85,247,0.15)" : "none",
                      }}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
                {authError && (
                  <p className="text-rose-400 text-sm font-medium">
                    {authError}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-4 rounded-2xl font-bold text-sm uppercase cursor-pointer hover:opacity-90 transition-all"
                    style={{
                      background: "var(--btn-bg)",
                      color: "var(--btn-text)",
                    }}
                  >
                    Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep("idle");
                      setPassword("");
                      setQrDataUrl("");
                      setOtpDigits(Array(6).fill(""));
                    }}
                    className="py-4 px-6 rounded-2xl text-sm cursor-pointer hover:opacity-80 transition-all"
                    style={{ border: "1px solid var(--border-color-strong)", color: "var(--text-secondary)" }}
                  >
                    Back
                  </button>
                </div>
              </form>
            </div>
          )
        ) : (
          /* Actual Dashboard */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div
              className="w-full lg:w-[280px] shrink-0 border-r p-6 flex flex-col justify-between"
              style={{
                background: "var(--card-bg-2)",
                borderColor: "var(--border-color)",
              }}
            >
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "analytics"
                      ? "bg-white/5 border border-white/10"
                      : "hover:bg-white/[0.03]"
                  }`}
                  style={{ color: "var(--text-primary)" }}
                >
                  <Activity className="w-5 h-5 text-purple-400" />
                  Activity Logs
                </button>
                <button
                  onClick={() => setActiveTab("projects")}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "projects"
                      ? "bg-white/5 border border-white/10"
                      : "hover:bg-white/[0.03]"
                  }`}
                  style={{ color: "var(--text-primary)" }}
                >
                  <FolderKanban className="w-5 h-5 text-purple-400" />
                  Projects
                </button>
                <button
                  onClick={() => setActiveTab("skills")}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "skills"
                      ? "bg-white/5 border border-white/10"
                      : "hover:bg-white/[0.03]"
                  }`}
                  style={{ color: "var(--text-primary)" }}
                >
                  <Award className="w-5 h-5 text-purple-400" />
                  Skills List
                </button>
                <button
                  onClick={() => setActiveTab("work")}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "work"
                      ? "bg-white/5 border border-white/10"
                      : "hover:bg-white/[0.03]"
                  }`}
                  style={{ color: "var(--text-primary)" }}
                >
                  <FileText className="w-5 h-5 text-purple-400" />
                  Work & Resume
                </button>
                <button
                  onClick={() => setActiveTab("photos")}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "photos"
                      ? "bg-white/5 border border-white/10"
                      : "hover:bg-white/[0.03]"
                  }`}
                  style={{ color: "var(--text-primary)" }}
                >
                  <Image className="w-5 h-5 text-purple-400" />
                  Security, Avatar & Songs
                </button>
              </div>
              
              <div className="mt-2">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "bookings"
                      ? "bg-white/5 border border-white/10"
                      : "hover:bg-white/[0.03]"
                  }`}
                  style={{ color: "var(--text-primary)" }}
                >
                  <Check className="w-5 h-5 text-purple-400" />
                  Meeting Bookings
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 mt-6 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all cursor-pointer border border-transparent hover:border-rose-500/10"
              >
                <LogOut className="w-5 h-5" />
                Sign Out Panel
              </button>
            </div>

            {/* Core Working Area */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6">
              {/* STATUS LOG MESSAGE */}
              {uploadStatus && (
                <div className="flex items-center justify-between p-3.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-xs font-medium tracking-wide">
                  <span>{uploadStatus}</span>
                  <button
                    onClick={() => setUploadStatus("")}
                    className="hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 1. TAB CONTENT: ANALYTICS & ACTIVITY LOGS */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-wider text-[#F4EEE8]">
                        Visitor & Web Analytics
                      </h3>
                      <p className="text-xs text-[#A3A3AA]">
                        Track real-time interaction logs and overall metrics.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRefreshAnalytics}
                        className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3.5 py-2 rounded-xl hover:bg-blue-500/20 transition-all cursor-pointer font-bold tracking-wide flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                      </button>
                      <button
                        onClick={handleClearActivities}
                        className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3.5 py-2 rounded-xl hover:bg-rose-500/20 transition-all cursor-pointer font-bold tracking-wide flex items-center gap-1.5"
                      >
                        <Trash className="w-3.5 h-3.5" /> Clear Analytics
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { label: "Page Views", val: totalViews },
                      { label: "Project Clicks", val: projectClicks },
                      { label: "Live Links", val: liveClicks },
                      { label: "GitHub Clicks", val: githubClicks },
                      { label: "Resume Dl", val: resumeDownloads },
                      { label: "Calls Booked", val: bookings },
                    ].map((card, idx) => (
                      <div
                        key={idx}
                        className="border p-4 rounded-xl space-y-1.5"
                        style={{
                          background: "var(--card-bg-2)",
                          borderColor: "rgba(255,255,255,0.05)",
                        }}
                      >
                        <p
                          className="text-[10px] uppercase tracking-wider font-semibold"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {card.label}
                        </p>
                        <p
                          className="text-2xl font-black"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {card.val}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Visual SVG Activity Charts matching high contrast design */}
                  <div
                    className="border p-5 rounded-2xl"
                    style={{
                      background: "var(--card-bg-2)",
                      borderColor: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <h4
                      className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <BarChart2 className="w-4 h-4 text-purple-400" /> Click
                      breakdown graph
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Views",
                          val: totalViews,
                          color: "bg-purple-400",
                        },
                        {
                          label: "Project Clicks",
                          val: projectClicks,
                          color: "bg-indigo-400",
                        },
                        {
                          label: "Live Clicks",
                          val: liveClicks,
                          color: "bg-sky-400",
                        },
                        {
                          label: "GitHub Clicks",
                          val: githubClicks,
                          color: "bg-slate-400",
                        },
                        {
                          label: "Resume Downloads",
                          val: resumeDownloads,
                          color: "bg-emerald-400",
                        },
                        {
                          label: "Bookings",
                          val: bookings,
                          color: "bg-pink-400",
                        },
                      ].map((bar, idx) => {
                        const maxVal = Math.max(
                          totalViews,
                          projectClicks,
                          liveClicks,
                          githubClicks,
                          resumeDownloads,
                          bookings,
                          1,
                        );
                        const percentage = (bar.val / maxVal) * 100;
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-4 text-xs"
                          >
                            <span
                              className="w-32 truncate font-medium uppercase tracking-wider text-[10px]"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {bar.label}
                            </span>
                            <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${bar.color}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span
                              className="w-8 text-right font-bold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {bar.val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Log list */}
                  <div className="space-y-3">
                    <h4
                      className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <Activity className="w-4 h-4 text-purple-400" />{" "}
                      Chronological Log History
                    </h4>
                    {logs.length === 0 ? (
                      <p
                        className="text-xs py-6 text-center border border-dashed rounded-xl"
                        style={{
                          color: "var(--text-muted)",
                          borderColor: "rgba(255,255,255,0.06)",
                        }}
                      >
                        No activities logged yet. Browse around the portfolio to
                        record some events!
                      </p>
                    ) : (
                      <div className="border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5 max-h-[250px] overflow-y-auto pr-2">
                        {logs.map((log) => (
                          <div
                            key={log.id}
                            className="flex justify-between items-center p-3 text-xs font-mono"
                          >
                            <div className="flex gap-3 items-center">
                              <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">
                                [{log.type}]
                              </span>
                              <span style={{ color: "var(--text-primary)" }}>
                                {log.details}
                              </span>
                            </div>
                            <span className="text-white/30 text-[10px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BOOKINGS TAB CONTENT */}
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-[#F4EEE8]">
                      Meeting Bookings
                    </h3>
                    <p className="text-xs text-[#A3A3AA]">
                      Accept or cancel strategy call requests. Notifications are sent automatically.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {apiBookings.length === 0 ? (
                      <p className="text-xs py-6 text-center border border-dashed rounded-xl" style={{ color: "var(--text-muted)", borderColor: "rgba(255,255,255,0.06)" }}>
                        No booking requests yet.
                      </p>
                    ) : (
                      apiBookings.map((b: any) => (
                        <div key={b.id} className="p-5 rounded-2xl border flex flex-col gap-3" style={{ background: "var(--card-bg-2)", borderColor: "rgba(255,255,255,0.05)" }}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-[#F4EEE8] text-lg">{b.name}</h4>
                              <a href={`mailto:${b.email}`} className="text-sm text-[#A78BFA] hover:underline">{b.email}</a>
                              <p className="text-sm mt-2 font-medium" style={{ color: "var(--text-primary)" }}>
                                {new Date(b.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "long" })} @ {b.time}
                              </p>
                              {b.notes && (
                                <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                  <p className="text-xs text-[#A3A3AA] italic">"{b.notes}"</p>
                                </div>
                              )}
                            </div>
                            <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              b.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              b.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {b.status}
                            </div>
                          </div>
                          
                          {b.status === 'pending' && (
                            <div className="flex gap-3 mt-2 border-t border-white/5 pt-4">
                              <button
                                onClick={() => handleBookingAction(b.id, 'accept')}
                                className="flex-1 py-2.5 bg-[#F4EEE8] hover:bg-white text-[#0B0B12] rounded-xl text-xs font-bold uppercase cursor-pointer transition-all shadow-lg"
                              >
                                Accept Request
                              </button>
                              <button
                                onClick={() => handleBookingAction(b.id, 'cancel')}
                                className="px-6 py-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 2. TAB CONTENT: PROJECTS UPLOAD & EDIT */}
              {activeTab === "projects" && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-[#F4EEE8]">
                      Upload & Manage Projects
                    </h3>
                    <p className="text-xs text-[#A3A3AA]">
                      Add new work showcase assets or edit operational entries.
                    </p>
                  </div>

                  {/* Add/Edit Form */}
                  <form
                    onSubmit={handleSaveProject}
                    className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4EEE8]">
                        {editingProject
                          ? "Editing Project Context"
                          : "Add New Project"}
                      </h4>
                      {editingProject && (
                        <button
                          type="button"
                          onClick={() => setEditingProject(null)}
                          className="text-[10px] text-[#A8A8B0] underline hover:text-[#F4EEE8]"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                          Project Title
                        </label>
                        <input
                          type="text"
                          required
                          value={
                            editingProject
                              ? editingProject.title
                              : newProject.title
                          }
                          onChange={(e) =>
                            editingProject
                              ? setEditingProject({
                                  ...editingProject,
                                  title: e.target.value,
                                })
                              : setNewProject({
                                  ...newProject,
                                  title: e.target.value,
                                })
                          }
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="e.g. Astro-Dashboard"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider flex items-center gap-1.5">
                            Cover Image
                          </label>
                          <span className="text-[9px] text-[#A3A3AA] font-mono">Limit: 2 MB</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={
                              editingProject
                                ? editingProject.image
                                : newProject.image || ""
                            }
                            onChange={(e) =>
                              editingProject
                                ? setEditingProject({
                                    ...editingProject,
                                    image: e.target.value,
                                  })
                                : setNewProject({
                                    ...newProject,
                                    image: e.target.value,
                                  })
                            }
                            className="flex-1 bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                            placeholder="Paste image URL or upload (Max 2MB)"
                          />
                          <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-xs px-3.5 py-2.5 border border-white/5 rounded-xl flex items-center justify-center font-bold uppercase text-[10px] tracking-wide whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                            Upload (Max 2MB)
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(e, "project")}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {(editingProject ? editingProject.image : newProject.image) && (
                          <div className="relative w-full h-28 rounded-xl overflow-hidden border border-white/5 mt-1">
                            <img
                              src={editingProject ? editingProject.image : newProject.image}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest bg-black/60 text-white px-2 py-0.5 rounded-full">Image</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Video row */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider flex items-center gap-1.5">
                        Demo Video <span className="text-white/20 normal-case font-normal tracking-normal">(optional)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={
                            editingProject
                              ? editingProject.videoUrl || ""
                              : newProject.videoUrl || ""
                          }
                          onChange={(e) =>
                            editingProject
                              ? setEditingProject({
                                  ...editingProject,
                                  videoUrl: e.target.value,
                                })
                              : setNewProject({
                                  ...newProject,
                                  videoUrl: e.target.value,
                                })
                          }
                          className="flex-1 bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="Paste hosted mp4/webm URL or upload file"
                        />
                        <label className="cursor-pointer bg-purple-500/10 hover:bg-purple-500/20 text-xs px-3.5 py-2.5 border border-purple-500/20 rounded-xl flex items-center justify-center font-bold uppercase text-[10px] tracking-wide whitespace-nowrap text-purple-400">
                          Upload
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handlePhotoUpload(e, "project-video")}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {(editingProject ? editingProject.videoUrl : newProject.videoUrl) && (
                        <div className="relative w-full rounded-xl overflow-hidden border border-purple-500/20 mt-1 bg-black">
                          <video
                            src={editingProject ? editingProject.videoUrl : newProject.videoUrl}
                            className="w-full max-h-40 object-cover"
                            muted
                            playsInline
                            controls
                          />
                          <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest bg-purple-600/80 text-white px-2 py-0.5 rounded-full">Video ✓</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                        Description
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={
                          editingProject
                            ? editingProject.description
                            : newProject.description
                        }
                        onChange={(e) =>
                          editingProject
                            ? setEditingProject({
                                ...editingProject,
                                description: e.target.value,
                              })
                            : setNewProject({
                                ...newProject,
                                description: e.target.value,
                              })
                        }
                        className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400 resize-none"
                        placeholder="Detail project highlights and outcomes"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                          GitHub URL
                        </label>
                        <input
                          type="url"
                          value={
                            editingProject
                              ? editingProject.githubUrl
                              : newProject.githubUrl || ""
                          }
                          onChange={(e) =>
                            editingProject
                              ? setEditingProject({
                                  ...editingProject,
                                  githubUrl: e.target.value,
                                })
                              : setNewProject({
                                  ...newProject,
                                  githubUrl: e.target.value,
                                })
                          }
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="https://github.com/..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                          Live URL
                        </label>
                        <input
                          type="url"
                          value={
                            editingProject
                              ? editingProject.liveUrl
                              : newProject.liveUrl || ""
                          }
                          onChange={(e) =>
                            editingProject
                              ? setEditingProject({
                                  ...editingProject,
                                  liveUrl: e.target.value,
                                })
                              : setNewProject({
                                  ...newProject,
                                  liveUrl: e.target.value,
                                })
                          }
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                        Tech Stack pills
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addTechPill(!!editingProject))
                          }
                          className="flex-1 bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="e.g. Next.js, then click Add"
                        />
                        <button
                          type="button"
                          onClick={() => addTechPill(!!editingProject)}
                          className="bg-[#F4EEE8] text-black px-4 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-white"
                        >
                          Add
                        </button>
                      </div>

                      {/* Display current stack */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {(editingProject
                          ? editingProject.techStack
                          : newProject.techStack || []
                        ).map((tech) => (
                          <span
                            key={tech}
                            className="bg-white/5 border border-white/5 text-[10px] px-2.5 py-1 rounded-full text-[#F4EEE8] flex items-center gap-1 uppercase tracking-wider font-semibold"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() =>
                                removeTechPill(tech, !!editingProject)
                              }
                              className="text-[#A3A3AA] hover:text-rose-400 text-xs ml-1"
                            >
                              ├ù
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#F4EEE8] text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white cursor-pointer shadow-md"
                    >
                      {editingProject ? "Update Project" : "Upload Project"}
                    </button>
                  </form>

                  {/* List of current projects */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4EEE8]">
                      Current Active Projects ({projects.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="bg-[#1e1e24]/20 border border-white/5 p-4 rounded-xl flex gap-4 items-center"
                        >
                          <img
                            src={proj.image}
                            alt={proj.title}
                            className="w-16 h-16 object-cover rounded-lg border border-white/5 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold uppercase text-[#F4EEE8] truncate">
                              {proj.title}
                            </h5>
                            <p className="text-[10px] text-[#A3A3AA] line-clamp-2 mt-1">
                              {proj.description}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => setEditingProject(proj)}
                              className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 hover:border-white/20 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 hover:border-white/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. TAB CONTENT: SKILLS MANAGE */}
              {activeTab === "skills" && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-[#F4EEE8]">
                      Manage Skills & Tech Stack
                    </h3>
                    <p className="text-xs text-[#A3A3AA]">
                      Add or remove tools in frontend, backend, or UI
                      categories.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {skills.map((category) => (
                      <div
                        key={category.id}
                        className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4"
                      >
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4EEE8] pb-2 border-b border-white/5">
                          {category.title}
                        </h4>

                        {/* Current pills list */}
                        <div className="flex flex-wrap gap-2">
                          {category.items.map((skill) => (
                            <span
                              key={skill}
                              className="bg-white/5 border border-white/10 text-xs px-3.5 py-1.5 rounded-full text-[#F4EEE8] flex items-center gap-2 uppercase tracking-wide font-medium"
                            >
                              {skill}
                              <button
                                onClick={() =>
                                  handleRemoveSkill(category.id, skill)
                                }
                                className="text-[#A3A3AA] hover:text-rose-400 font-bold text-xs"
                              >
                                ├ù
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Add input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkillText[category.id] || ""}
                            onChange={(e) =>
                              setNewSkillText({
                                ...newSkillText,
                                [category.id]: e.target.value,
                              })
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddSkill(category.id)
                            }
                            placeholder={`Add tool to ${category.title}...`}
                            className="flex-1 bg-[#16161c] border border-white/5 rounded-xl px-4 py-2 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          />
                          <button
                            onClick={() => handleAddSkill(category.id)}
                            className="bg-[#F4EEE8] text-black px-4 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. TAB CONTENT: WORK HISTORY & RESUME UPLOAD */}
              {activeTab === "work" && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-[#F4EEE8]">
                      Manage Work Experience & Resume
                    </h3>
                    <p className="text-xs text-[#A3A3AA]">
                      Add chronological career checkpoints and update your PDF
                      resume metadata.
                    </p>
                  </div>

                  {/* Resume upload box */}
                  <div className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4EEE8] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" /> Resume
                      metadata
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                          Resume Link / URL
                        </label>
                        <input
                          type="text"
                          value={resume.url}
                          onChange={(e) => {
                            const updated = { ...resume, url: e.target.value };
                            setResume(updated);
                            saveResume(updated);
                          }}
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="e.g. Google Drive Link"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                            Virtual File Upload
                          </label>
                          <span className="text-[9px] text-[#A3A3AA] font-mono">Limit: 2 MB</span>
                        </div>
                        <label className="cursor-pointer bg-white/5 hover:bg-white/10 w-full h-[38px] border border-white/5 rounded-xl flex items-center justify-center font-bold uppercase text-[10px] tracking-wide transition-all">
                          Select Document (.pdf, Max 2MB)
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) => handlePhotoUpload(e, "resume")}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#A3A3AA] flex justify-between uppercase tracking-wider pt-2">
                      <span>
                        Active File:{" "}
                        <strong className="text-[#F4EEE8]">
                          {resume.fileName}
                        </strong>
                      </span>
                      <span>
                        Last Refreshed:{" "}
                        <strong className="text-[#F4EEE8]">
                          {resume.updatedAt}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Work edit form */}
                  <form
                    onSubmit={handleSaveWork}
                    className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4EEE8]">
                      {editingWork
                        ? "Edit Career History Checkpoint"
                        : "Add Career History Checkpoint"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                          Role / Title
                        </label>
                        <input
                          type="text"
                          required
                          value={editingWork ? editingWork.role : newWork.role}
                          onChange={(e) =>
                            editingWork
                              ? setEditingWork({
                                  ...editingWork,
                                  role: e.target.value,
                                })
                              : setNewWork({ ...newWork, role: e.target.value })
                          }
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="e.g. Senior Frontend Dev"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                          Company Name
                        </label>
                        <input
                          type="text"
                          required
                          value={
                            editingWork ? editingWork.company : newWork.company
                          }
                          onChange={(e) =>
                            editingWork
                              ? setEditingWork({
                                  ...editingWork,
                                  company: e.target.value,
                                })
                              : setNewWork({
                                  ...newWork,
                                  company: e.target.value,
                                })
                          }
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="e.g. Virallens"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                          Company URL
                        </label>
                        <input
                          type="url"
                          value={
                            editingWork
                              ? editingWork.companyUrl
                              : newWork.companyUrl || ""
                          }
                          onChange={(e) =>
                            editingWork
                              ? setEditingWork({
                                  ...editingWork,
                                  companyUrl: e.target.value,
                                })
                              : setNewWork({
                                  ...newWork,
                                  companyUrl: e.target.value,
                                })
                          }
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={
                            editingWork
                              ? editingWork.duration
                              : newWork.duration || ""
                          }
                          onChange={(e) =>
                            editingWork
                              ? setEditingWork({
                                  ...editingWork,
                                  duration: e.target.value,
                                })
                              : setNewWork({
                                  ...newWork,
                                  duration: e.target.value,
                                })
                          }
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="e.g. Jan 2025 - Present"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={
                          editingWork
                            ? editingWork.description
                            : newWork.description
                        }
                        onChange={(e) =>
                          editingWork
                            ? setEditingWork({
                                ...editingWork,
                                description: e.target.value,
                              })
                            : setNewWork({
                                ...newWork,
                                description: e.target.value,
                              })
                        }
                        className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400 resize-none"
                        placeholder="Detail core responsibilities or project metrics"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#F4EEE8] text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white cursor-pointer shadow-md"
                    >
                      {editingWork
                        ? "Save Career details"
                        : "Add Career details"}
                    </button>
                  </form>

                  {/* Career timeline list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4EEE8]">
                      Current Career Records
                    </h4>
                    <div className="space-y-3">
                      {workUpdates.map((work) => (
                        <div
                          key={work.id}
                          className="bg-[#1e1e24]/20 border border-white/5 p-4 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <h5 className="text-xs font-bold uppercase text-[#F4EEE8]">
                              {work.role}
                            </h5>
                            <p className="text-[11px] text-purple-400 font-semibold uppercase tracking-wider mt-0.5">
                              {work.company} ┬╖ {work.duration}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingWork(work)}
                              className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 hover:border-white/20 text-sky-400 hover:text-sky-300 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteWork(work.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 hover:border-white/20 text-rose-400 hover:text-rose-300 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. TAB CONTENT: AVATAR EDIT & SONGS/PHOTOS MANAGER */}
              {activeTab === "photos" && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-[#F4EEE8]">
                      Avatar & Recommended Tunes
                    </h3>
                    <p className="text-xs text-[#A3A3AA]">
                      Refresh your profile image avatar or fine-tune songs
                      showcased in your recommendations grid.
                    </p>
                  </div>

                  {/* Security Settings (2FA) */}
                  <div className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4EEE8] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security Settings
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-semibold text-[#F4EEE8]">Two-Factor Authentication (TOTP)</h5>
                        <p className="text-[11px] text-[#A3A3AA] mt-1 max-w-sm leading-relaxed">
                          Require Google Authenticator / Authy app verification when logging into the Admin Panel.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const newStatus = !is2FAEnabled();
                          set2FAEnabled(newStatus);
                          setUploadStatus(`2FA requirement has been ${newStatus ? 'enabled' : 'disabled'}.`);
                          // Force a re-render by doing a shallow data change
                          onDataChange(); 
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                          is2FAEnabled() ? "bg-emerald-500" : "bg-white/10"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                            is2FAEnabled() ? "left-7" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Profile Avatar update */}
                  <form
                    onSubmit={handleUpdateAvatarDetails}
                    className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4EEE8] flex items-center gap-2">
                      <Image className="w-4 h-4 text-purple-400" /> profile
                      avatar settings
                      <span className="text-[10px] text-amber-400/90 font-mono font-medium lowercase bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        max 2 MB
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                              Avatar Image URL
                            </label>
                            <span className="text-[9px] text-[#A3A3AA] font-mono">Limit: 2 MB</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={avatar.url}
                              onChange={(e) =>
                                setAvatar({ ...avatar, url: e.target.value })
                              }
                              className="flex-1 bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                              placeholder="Preset photo url"
                            />
                            <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-xs px-3.5 py-2.5 border border-white/5 rounded-xl flex items-center justify-center font-bold uppercase text-[10px] tracking-wide whitespace-nowrap">
                              Upload (Max 2MB)
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(e, "avatar")}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                            Status Text (Open to work)
                          </label>
                          <input
                            type="text"
                            value={avatar.statusText}
                            onChange={(e) =>
                              setAvatar({
                                ...avatar,
                                statusText: e.target.value,
                              })
                            }
                            className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                            placeholder="I'm Open to work"
                          />
                        </div>
                      </div>

                      {/* Preview Avatar with status bubble */}
                      <div className="flex flex-col items-center justify-center py-4 border border-dashed border-white/10 rounded-2xl h-full relative">
                        <div className="relative w-28 h-28 rounded-3xl overflow-hidden border border-white/10 shadow-lg">
                          <img
                            src={avatar.url}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-[10px] uppercase text-purple-400 tracking-wider mt-2.5 font-black">
                          [{avatar.statusText}]
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#F4EEE8] text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white cursor-pointer shadow-md"
                    >
                      Save Profile Settings
                    </button>
                  </form>

                  {/* Songs list upload */}
                  <div className="space-y-4">
                    <form
                      onSubmit={handleSaveSong}
                      className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4EEE8]">
                        {editingSong
                          ? "Edit Song details"
                          : "Add Song Recommendation"}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                            Song Title
                          </label>
                          <input
                            type="text"
                            required
                            value={
                              editingSong ? editingSong.title : newSong.title
                            }
                            onChange={(e) =>
                              editingSong
                                ? setEditingSong({
                                    ...editingSong,
                                    title: e.target.value,
                                  })
                                : setNewSong({
                                    ...newSong,
                                    title: e.target.value,
                                  })
                            }
                            className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                            placeholder="e.g. Call Out My Name"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                            Artist
                          </label>
                          <input
                            type="text"
                            required
                            value={
                              editingSong ? editingSong.artist : newSong.artist
                            }
                            onChange={(e) =>
                              editingSong
                                ? setEditingSong({
                                    ...editingSong,
                                    artist: e.target.value,
                                  })
                                : setNewSong({
                                    ...newSong,
                                    artist: e.target.value,
                                  })
                            }
                            className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                            placeholder="e.g. The Weeknd"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                            Song YouTube URL
                          </label>
                          <input
                            type="url"
                            value={
                              editingSong
                                ? editingSong.youtubeUrl
                                : newSong.youtubeUrl || ""
                            }
                            onChange={(e) => {
                              const url = e.target.value;
                              const thumb = getYouTubeThumbnail(url);
                              if (editingSong) {
                                setEditingSong({
                                  ...editingSong,
                                  youtubeUrl: url,
                                  coverUrl: (!editingSong.coverUrl || editingSong.coverUrl.includes("img.youtube.com")) && thumb ? thumb : editingSong.coverUrl,
                                });
                              } else {
                                setNewSong({
                                  ...newSong,
                                  youtubeUrl: url,
                                  coverUrl: (!newSong.coverUrl || newSong.coverUrl.includes("img.youtube.com")) && thumb ? thumb : newSong.coverUrl,
                                });
                              }
                            }}
                            className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">
                              Song Cover Album Image
                            </label>
                            <span className="text-[9px] text-purple-400 font-medium">Auto-fetches from YouTube</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={
                                editingSong
                                  ? editingSong.coverUrl
                                  : newSong.coverUrl || ""
                              }
                              onChange={(e) =>
                                editingSong
                                  ? setEditingSong({
                                      ...editingSong,
                                      coverUrl: e.target.value,
                                    })
                                  : setNewSong({
                                      ...newSong,
                                      coverUrl: e.target.value,
                                    })
                              }
                              className="flex-1 bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                              placeholder="Auto-detected from YouTube or custom URL"
                            />
                            <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-xs px-3.5 py-2.5 border border-white/5 rounded-xl flex items-center justify-center font-bold uppercase text-[10px] tracking-wide whitespace-nowrap">
                              Upload (Max 2MB)
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(e, "song")}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {(editingSong?.coverUrl || newSong.coverUrl) && (
                            <div className="flex items-center gap-2 pt-1">
                              <img
                                src={editingSong ? editingSong.coverUrl : newSong.coverUrl}
                                alt="thumbnail preview"
                                className="w-9 h-9 object-cover rounded-md border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-[10px] text-[#A3A3AA]">
                                Thumbnail Preview
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-[#F4EEE8] text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white cursor-pointer shadow-md"
                      >
                        {editingSong
                          ? "Save Song Recommendation"
                          : "Upload Song Recommendation"}
                      </button>
                    </form>

                    {/* Interactive horizontal display of current songs */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4EEE8]">
                        Songs List ({songs.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {songs.map((song) => (
                          <div
                            key={song.id}
                            className="bg-[#1e1e24]/20 border border-white/5 p-3 rounded-xl flex gap-3 items-center"
                          >
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="w-12 h-12 object-cover rounded-lg border border-white/5 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold uppercase text-[#F4EEE8] truncate">
                                {song.title}
                              </h5>
                              <p className="text-[10px] text-[#A3A3AA] truncate">
                                {song.artist}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingSong(song)}
                                className="w-7 h-7 rounded-full flex items-center justify-center border border-white/5 hover:border-white/20 text-sky-400 hover:text-sky-300 cursor-pointer"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteSong(song.id)}
                                className="w-7 h-7 rounded-full flex items-center justify-center border border-white/5 hover:border-white/20 text-rose-400 hover:text-rose-300 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
