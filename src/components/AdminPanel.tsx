import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, X, Edit, Trash2, Plus, Check, Eye, Trash, 
  Settings, FolderKanban, Award, Image, FileText, 
  TrendingUp, RefreshCw, BarChart2, Activity, ShieldCheck, LogOut, ArrowRight
} from "lucide-react";
import { 
  loadProjects, saveProjects, 
  loadSkills, saveSkills, 
  loadSongs, saveSongs, 
  loadWorkUpdates, saveWorkUpdates, 
  loadResume, saveResume, 
  loadAvatar, saveAvatar, 
  loadActivityLogs, clearActivities
} from "../lib/storage";
import { ActivityLog, Project, SkillCategory, Song, WorkUpdate } from "../types";

// Password for simple demo authentication
const ADMIN_PASSWORD = "admin";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChange: () => void; // Notify parent to refresh lists
}

export default function AdminPanel({ isOpen, onClose, onDataChange }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"projects" | "skills" | "work" | "photos" | "analytics">("analytics");

  // Dynamic state
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [workUpdates, setWorkUpdates] = useState<WorkUpdate[]>([]);
  const [resume, setResume] = useState({ url: "", fileName: "", updatedAt: "" });
  const [avatar, setAvatar] = useState({ url: "", statusText: "" });
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Project edit form state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: "",
    description: "",
    image: "",
    techStack: [],
    githubUrl: "",
    liveUrl: ""
  });
  const [techInput, setTechInput] = useState<string>("");

  // Skills state
  const [newSkillText, setNewSkillText] = useState<{ [catId: string]: string }>({});

  // Song state
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [newSong, setNewSong] = useState<Partial<Song>>({
    title: "",
    artist: "",
    coverUrl: "",
    spotifyUrl: ""
  });

  // Work update state
  const [editingWork, setEditingWork] = useState<WorkUpdate | null>(null);
  const [newWork, setNewWork] = useState<Partial<WorkUpdate>>({
    role: "",
    company: "",
    companyUrl: "",
    duration: "",
    description: ""
  });

  // File upload state / feedback
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Load all initial data
  useEffect(() => {
    if (isOpen) {
      setProjects(loadProjects());
      setSkills(loadSkills());
      setSongs(loadSongs());
      setWorkUpdates(loadWorkUpdates());
      setResume(loadResume());
      setAvatar(loadAvatar());
      setLogs(loadActivityLogs());
    }
  }, [isOpen]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
  };

  // 1. PROJECT HANDLERS
  const handleSaveProject = (e: FormEvent) => {
    e.preventDefault();
    let updatedProjects = [...projects];

    if (editingProject) {
      // Update existing
      updatedProjects = updatedProjects.map(p => 
        p.id === editingProject.id ? { ...editingProject } : p
      );
      setEditingProject(null);
    } else {
      // Add new
      if (!newProject.title || !newProject.description) return;
      const added: Project = {
        id: Math.random().toString(36).substring(2, 9),
        title: newProject.title,
        description: newProject.description,
        image: newProject.image || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
        techStack: newProject.techStack || [],
        githubUrl: newProject.githubUrl || "https://github.com",
        liveUrl: newProject.liveUrl || "https://vercel.app"
      };
      updatedProjects.push(added);
      setNewProject({
        title: "",
        description: "",
        image: "",
        techStack: [],
        githubUrl: "",
        liveUrl: ""
      });
      setTechInput("");
    }

    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    onDataChange();
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
    onDataChange();
  };

  const addTechPill = (isEditing: boolean) => {
    if (!techInput.trim()) return;
    if (isEditing && editingProject) {
      const updatedStack = [...(editingProject.techStack || []), techInput.trim()];
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
        techStack: editingProject.techStack.filter(t => t !== tech)
      });
    } else {
      setNewProject({
        ...newProject,
        techStack: (newProject.techStack || []).filter(t => t !== tech)
      });
    }
  };

  // Convert File uploads to base64 strings to simulate local photos upload
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>, target: "project" | "avatar" | "song" | "resume") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("Processing...");
    const reader = new FileReader();

    if (target === "resume") {
      // Simulate file upload metadata
      setTimeout(() => {
        const updatedResume = {
          url: "#",
          fileName: file.name,
          updatedAt: new Date().toISOString().split("T")[0]
        };
        setResume(updatedResume);
        saveResume(updatedResume);
        setUploadStatus(`Success: ${file.name} saved locally!`);
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
      } else if (target === "avatar") {
        const updatedAvatar = { ...avatar, url: base64String };
        setAvatar(updatedAvatar);
        saveAvatar(updatedAvatar);
        setUploadStatus("Profile photo updated successfully!");
        onDataChange();
      } else if (target === "song") {
        if (editingSong) {
          setEditingSong({ ...editingSong, coverUrl: base64String });
        } else {
          setNewSong({ ...newSong, coverUrl: base64String });
        }
        setUploadStatus("Song cover image updated successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  // 2. SKILL HANDLERS
  const handleAddSkill = (catId: string) => {
    const text = newSkillText[catId];
    if (!text || !text.trim()) return;

    const updated = skills.map(cat => {
      if (cat.id === catId) {
        return { ...cat, items: [...cat.items, text.trim()] };
      }
      return cat;
    });

    setSkills(updated);
    saveSkills(updated);
    setNewSkillText({ ...newSkillText, [catId]: "" });
    onDataChange();
  };

  const handleRemoveSkill = (catId: string, skill: string) => {
    const updated = skills.map(cat => {
      if (cat.id === catId) {
        return { ...cat, items: cat.items.filter(i => i !== skill) };
      }
      return cat;
    });

    setSkills(updated);
    saveSkills(updated);
    onDataChange();
  };

  // 3. WORK UPDATE HANDLERS
  const handleSaveWork = (e: FormEvent) => {
    e.preventDefault();
    let updatedWork = [...workUpdates];

    if (editingWork) {
      updatedWork = updatedWork.map(w => w.id === editingWork.id ? { ...editingWork } : w);
      setEditingWork(null);
    } else {
      if (!newWork.role || !newWork.company) return;
      const added: WorkUpdate = {
        id: Math.random().toString(36).substring(2, 9),
        role: newWork.role,
        company: newWork.company,
        companyUrl: newWork.companyUrl || "https://google.com",
        duration: newWork.duration || "Present",
        description: newWork.description || ""
      };
      updatedWork.push(added);
      setNewWork({ role: "", company: "", companyUrl: "", duration: "", description: "" });
    }

    setWorkUpdates(updatedWork);
    saveWorkUpdates(updatedWork);
    onDataChange();
  };

  const handleDeleteWork = (id: string) => {
    if (!confirm("Delete this work record?")) return;
    const updated = workUpdates.filter(w => w.id !== id);
    setWorkUpdates(updated);
    saveWorkUpdates(updated);
    onDataChange();
  };

  // 4. PHOTO/SONG HANDLERS
  const handleSaveSong = (e: FormEvent) => {
    e.preventDefault();
    let updatedSongs = [...songs];

    if (editingSong) {
      updatedSongs = updatedSongs.map(s => s.id === editingSong.id ? { ...editingSong } : s);
      setEditingSong(null);
    } else {
      if (!newSong.title || !newSong.artist) return;
      const added: Song = {
        id: Math.random().toString(36).substring(2, 9),
        title: newSong.title,
        artist: newSong.artist,
        coverUrl: newSong.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400",
        spotifyUrl: newSong.spotifyUrl || "https://spotify.com"
      };
      updatedSongs.push(added);
      setNewSong({ title: "", artist: "", coverUrl: "", spotifyUrl: "" });
    }

    setSongs(updatedSongs);
    saveSongs(updatedSongs);
    onDataChange();
  };

  const handleDeleteSong = (id: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return;
    const updated = songs.filter(s => s.id !== id);
    setSongs(updated);
    saveSongs(updated);
    onDataChange();
  };

  const handleUpdateAvatarDetails = (e: FormEvent) => {
    e.preventDefault();
    saveAvatar(avatar);
    setUploadStatus("Profile settings saved successfully!");
    onDataChange();
  };

  // 5. ANALYTICS CALCULATIONS
  const totalViews = logs.filter(l => l.type === "page_view").length;
  const projectClicks = logs.filter(l => l.type === "project_click").length;
  const liveClicks = logs.filter(l => l.type === "live_click").length;
  const githubClicks = logs.filter(l => l.type === "github_click").length;
  const resumeDownloads = logs.filter(l => l.type === "resume_download").length;
  const bookings = logs.filter(l => l.type === "book_call_success").length;

  const handleClearActivities = () => {
    if (!confirm("Clear all website activity analytics? This cannot be undone.")) return;
    clearActivities();
    setLogs([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md overflow-y-auto p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl bg-[#121216] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#16161c]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h2 className="text-[#F4EEE8] font-bold text-sm tracking-wider uppercase">
              Syed's Admin Panel
            </h2>
            {isAuthenticated && (
              <span className="text-[10px] bg-purple-500/10 text-purple-400 font-semibold px-2 py-0.5 rounded-full border border-purple-500/20 uppercase tracking-widest">
                Authenticated
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 hover:border-white/20 text-[#A8A8B0] hover:text-[#F4EEE8] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Password Form */
          <div className="flex-1 p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#F4EEE8] uppercase tracking-wide">Enter Administrator Password</h3>
              <p className="text-xs text-[#A3A3AA] leading-relaxed">
                Unlock the gateway to dynamic uploads, updating skills, editing your projects, and reviewing real-time web activities.
              </p>
            </div>
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="space-y-1">
                <input
                  type="password"
                  placeholder="Enter Password (default: admin)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1e1e24] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F4EEE8] outline-none focus:border-purple-400 text-center transition-all"
                  autoFocus
                />
                {authError && <p className="text-rose-400 text-[11px] font-medium pt-1">{authError}</p>}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#F4EEE8] text-[#0B0B12] rounded-xl font-bold text-xs tracking-wider uppercase hover:bg-white transition-all cursor-pointer shadow-lg shadow-purple-500/5 flex items-center justify-center gap-2"
              >
                Unlock Panel <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          /* Actual Dashboard */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-[220px] bg-[#16161c] border-r border-white/5 p-4 flex flex-col justify-between">
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "analytics" ? "bg-white/5 text-[#F4EEE8] border border-white/10" : "text-[#A8A8B0] hover:text-[#F4EEE8] hover:bg-white/[0.02]"
                  }`}
                >
                  <Activity className="w-4 h-4 text-purple-400" />
                  Activity Logs
                </button>
                <button
                  onClick={() => setActiveTab("projects")}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "projects" ? "bg-white/5 text-[#F4EEE8] border border-white/10" : "text-[#A8A8B0] hover:text-[#F4EEE8] hover:bg-white/[0.02]"
                  }`}
                >
                  <FolderKanban className="w-4 h-4 text-purple-400" />
                  Projects
                </button>
                <button
                  onClick={() => setActiveTab("skills")}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "skills" ? "bg-white/5 text-[#F4EEE8] border border-white/10" : "text-[#A8A8B0] hover:text-[#F4EEE8] hover:bg-white/[0.02]"
                  }`}
                >
                  <Award className="w-4 h-4 text-purple-400" />
                  Skills List
                </button>
                <button
                  onClick={() => setActiveTab("work")}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "work" ? "bg-white/5 text-[#F4EEE8] border border-white/10" : "text-[#A8A8B0] hover:text-[#F4EEE8] hover:bg-white/[0.02]"
                  }`}
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  Work & Resume
                </button>
                <button
                  onClick={() => setActiveTab("photos")}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "photos" ? "bg-white/5 text-[#F4EEE8] border border-white/10" : "text-[#A8A8B0] hover:text-[#F4EEE8] hover:bg-white/[0.02]"
                  }`}
                >
                  <Image className="w-4 h-4 text-purple-400" />
                  Avatar & Songs
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 mt-6 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all cursor-pointer border border-transparent hover:border-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Panel
              </button>
            </div>

            {/* Core Working Area */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[65vh] lg:max-h-[unset] space-y-6">
              
              {/* STATUS LOG MESSAGE */}
              {uploadStatus && (
                <div className="flex items-center justify-between p-3.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-xs font-medium tracking-wide">
                  <span>{uploadStatus}</span>
                  <button onClick={() => setUploadStatus("")} className="hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}

              {/* 1. TAB CONTENT: ANALYTICS & ACTIVITY LOGS */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-wider text-[#F4EEE8]">Visitor & Web Analytics</h3>
                      <p className="text-xs text-[#A3A3AA]">Track real-time interaction logs and overall metrics.</p>
                    </div>
                    <button
                      onClick={handleClearActivities}
                      className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3.5 py-2 rounded-xl hover:bg-rose-500/20 transition-all cursor-pointer font-bold tracking-wide flex items-center gap-1.5"
                    >
                      <Trash className="w-3.5 h-3.5" /> Clear Analytics
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-[#1e1e24]/40 border border-white/5 p-4 rounded-xl space-y-1.5">
                      <p className="text-[10px] uppercase text-[#A3A3AA] tracking-wider font-semibold">Page Views</p>
                      <p className="text-2xl font-black text-[#F4EEE8]">{totalViews}</p>
                    </div>
                    <div className="bg-[#1e1e24]/40 border border-white/5 p-4 rounded-xl space-y-1.5">
                      <p className="text-[10px] uppercase text-[#A3A3AA] tracking-wider font-semibold">Project Clicks</p>
                      <p className="text-2xl font-black text-[#F4EEE8]">{projectClicks}</p>
                    </div>
                    <div className="bg-[#1e1e24]/40 border border-white/5 p-4 rounded-xl space-y-1.5">
                      <p className="text-[10px] uppercase text-[#A3A3AA] tracking-wider font-semibold">Live Links</p>
                      <p className="text-2xl font-black text-[#F4EEE8]">{liveClicks}</p>
                    </div>
                    <div className="bg-[#1e1e24]/40 border border-white/5 p-4 rounded-xl space-y-1.5">
                      <p className="text-[10px] uppercase text-[#A3A3AA] tracking-wider font-semibold">GitHub Clicks</p>
                      <p className="text-2xl font-black text-[#F4EEE8]">{githubClicks}</p>
                    </div>
                    <div className="bg-[#1e1e24]/40 border border-white/5 p-4 rounded-xl space-y-1.5">
                      <p className="text-[10px] uppercase text-[#A3A3AA] tracking-wider font-semibold">Resume Dl</p>
                      <p className="text-2xl font-black text-[#F4EEE8]">{resumeDownloads}</p>
                    </div>
                    <div className="bg-[#1e1e24]/40 border border-white/5 p-4 rounded-xl space-y-1.5">
                      <p className="text-[10px] uppercase text-[#A3A3AA] tracking-wider font-semibold">Calls Booked</p>
                      <p className="text-2xl font-black text-[#F4EEE8]">{bookings}</p>
                    </div>
                  </div>

                  {/* Visual SVG Activity Charts matching high contrast design */}
                  <div className="bg-[#1e1e24]/20 border border-white/5 p-5 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4EEE8] mb-4 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-purple-400" /> Click breakdown graph
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: "Views", val: totalViews, color: "bg-purple-400" },
                        { label: "Project Clicks", val: projectClicks, color: "bg-indigo-400" },
                        { label: "Live Clicks", val: liveClicks, color: "bg-sky-400" },
                        { label: "GitHub Clicks", val: githubClicks, color: "bg-slate-400" },
                        { label: "Resume Downloads", val: resumeDownloads, color: "bg-emerald-400" },
                        { label: "Bookings", val: bookings, color: "bg-pink-400" }
                      ].map((bar, idx) => {
                        const maxVal = Math.max(totalViews, projectClicks, liveClicks, githubClicks, resumeDownloads, bookings, 1);
                        const percentage = (bar.val / maxVal) * 100;
                        return (
                          <div key={idx} className="flex items-center gap-4 text-xs">
                            <span className="w-32 text-[#A3A3AA] truncate font-medium uppercase tracking-wider text-[10px]">{bar.label}</span>
                            <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                              <div className={`h-full ${bar.color}`} style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="w-8 text-right text-[#F4EEE8] font-bold">{bar.val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Log list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4EEE8] flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400" /> Chronological Log History
                    </h4>
                    {logs.length === 0 ? (
                      <p className="text-xs text-[#A3A3AA] py-6 text-center border border-dashed border-white/10 rounded-xl">No activities logged yet. Browse around the portfolio to record some events!</p>
                    ) : (
                      <div className="border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5 max-h-[250px] overflow-y-auto pr-2">
                        {logs.map((log) => (
                          <div key={log.id} className="flex justify-between items-center p-3 text-xs font-mono">
                            <div className="flex gap-3 items-center">
                              <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">[{log.type}]</span>
                              <span className="text-[#F4EEE8]">{log.details}</span>
                            </div>
                            <span className="text-white/30 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. TAB CONTENT: PROJECTS UPLOAD & EDIT */}
              {activeTab === "projects" && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-[#F4EEE8]">Upload & Manage Projects</h3>
                    <p className="text-xs text-[#A3A3AA]">Add new work showcase assets or edit operational entries.</p>
                  </div>

                  {/* Add/Edit Form */}
                  <form onSubmit={handleSaveProject} className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4EEE8]">
                        {editingProject ? "Editing Project Context" : "Add New Project"}
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
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Project Title</label>
                        <input
                          type="text"
                          required
                          value={editingProject ? editingProject.title : newProject.title}
                          onChange={(e) => editingProject ? setEditingProject({ ...editingProject, title: e.target.value }) : setNewProject({ ...newProject, title: e.target.value })}
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="e.g. Astro-Dashboard"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Cover Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingProject ? editingProject.image : (newProject.image || "")}
                            onChange={(e) => editingProject ? setEditingProject({ ...editingProject, image: e.target.value }) : setNewProject({ ...newProject, image: e.target.value })}
                            className="flex-1 bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                            placeholder="Preset image or paste Unsplash link"
                          />
                          <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-xs px-3.5 py-2.5 border border-white/5 rounded-xl flex items-center justify-center font-bold uppercase text-[10px] tracking-wide">
                            Upload File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(e, "project")}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Description</label>
                      <textarea
                        required
                        rows={2}
                        value={editingProject ? editingProject.description : newProject.description}
                        onChange={(e) => editingProject ? setEditingProject({ ...editingProject, description: e.target.value }) : setNewProject({ ...newProject, description: e.target.value })}
                        className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400 resize-none"
                        placeholder="Detail project highlights and outcomes"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">GitHub URL</label>
                        <input
                          type="url"
                          value={editingProject ? editingProject.githubUrl : (newProject.githubUrl || "")}
                          onChange={(e) => editingProject ? setEditingProject({ ...editingProject, githubUrl: e.target.value }) : setNewProject({ ...newProject, githubUrl: e.target.value })}
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="https://github.com/..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Live URL</label>
                        <input
                          type="url"
                          value={editingProject ? editingProject.liveUrl : (newProject.liveUrl || "")}
                          onChange={(e) => editingProject ? setEditingProject({ ...editingProject, liveUrl: e.target.value }) : setNewProject({ ...newProject, liveUrl: e.target.value })}
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Tech Stack pills</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTechPill(!!editingProject))}
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
                        {(editingProject ? editingProject.techStack : (newProject.techStack || [])).map(tech => (
                          <span
                            key={tech}
                            className="bg-white/5 border border-white/5 text-[10px] px-2.5 py-1 rounded-full text-[#F4EEE8] flex items-center gap-1 uppercase tracking-wider font-semibold"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => removeTechPill(tech, !!editingProject)}
                              className="text-[#A3A3AA] hover:text-rose-400 text-xs ml-1"
                            >
                              ×
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4EEE8]">Current Active Projects ({projects.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((proj) => (
                        <div key={proj.id} className="bg-[#1e1e24]/20 border border-white/5 p-4 rounded-xl flex gap-4 items-center">
                          <img
                            src={proj.image}
                            alt={proj.title}
                            className="w-16 h-16 object-cover rounded-lg border border-white/5 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold uppercase text-[#F4EEE8] truncate">{proj.title}</h5>
                            <p className="text-[10px] text-[#A3A3AA] line-clamp-2 mt-1">{proj.description}</p>
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
                    <h3 className="text-lg font-bold uppercase tracking-wider text-[#F4EEE8]">Manage Skills & Tech Stack</h3>
                    <p className="text-xs text-[#A3A3AA]">Add or remove tools in frontend, backend, or UI categories.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {skills.map((category) => (
                      <div key={category.id} className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4">
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
                                onClick={() => handleRemoveSkill(category.id, skill)}
                                className="text-[#A3A3AA] hover:text-rose-400 font-bold text-xs"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Add input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkillText[category.id] || ""}
                            onChange={(e) => setNewSkillText({ ...newSkillText, [category.id]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleAddSkill(category.id)}
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
                    <h3 className="text-lg font-bold uppercase tracking-wider text-[#F4EEE8]">Manage Work Experience & Resume</h3>
                    <p className="text-xs text-[#A3A3AA]">Add chronological career checkpoints and update your PDF resume metadata.</p>
                  </div>

                  {/* Resume upload box */}
                  <div className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4EEE8] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" /> Resume metadata
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Resume Link / URL</label>
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
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Virtual File Upload</label>
                        <label className="cursor-pointer bg-white/5 hover:bg-white/10 w-full h-[38px] border border-white/5 rounded-xl flex items-center justify-center font-bold uppercase text-[10px] tracking-wide transition-all">
                          Select Document (.pdf)
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
                      <span>Active File: <strong className="text-[#F4EEE8]">{resume.fileName}</strong></span>
                      <span>Last Refreshed: <strong className="text-[#F4EEE8]">{resume.updatedAt}</strong></span>
                    </div>
                  </div>

                  {/* Work edit form */}
                  <form onSubmit={handleSaveWork} className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4EEE8]">
                      {editingWork ? "Edit Career History Checkpoint" : "Add Career History Checkpoint"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Role / Title</label>
                        <input
                          type="text"
                          required
                          value={editingWork ? editingWork.role : newWork.role}
                          onChange={(e) => editingWork ? setEditingWork({ ...editingWork, role: e.target.value }) : setNewWork({ ...newWork, role: e.target.value })}
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="e.g. Senior Frontend Dev"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Company Name</label>
                        <input
                          type="text"
                          required
                          value={editingWork ? editingWork.company : newWork.company}
                          onChange={(e) => editingWork ? setEditingWork({ ...editingWork, company: e.target.value }) : setNewWork({ ...newWork, company: e.target.value })}
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="e.g. Virallens"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Company URL</label>
                        <input
                          type="url"
                          value={editingWork ? editingWork.companyUrl : (newWork.companyUrl || "")}
                          onChange={(e) => editingWork ? setEditingWork({ ...editingWork, companyUrl: e.target.value }) : setNewWork({ ...newWork, companyUrl: e.target.value })}
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Duration</label>
                        <input
                          type="text"
                          value={editingWork ? editingWork.duration : (newWork.duration || "")}
                          onChange={(e) => editingWork ? setEditingWork({ ...editingWork, duration: e.target.value }) : setNewWork({ ...newWork, duration: e.target.value })}
                          className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                          placeholder="e.g. Jan 2025 - Present"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Description</label>
                      <textarea
                        rows={2}
                        value={editingWork ? editingWork.description : newWork.description}
                        onChange={(e) => editingWork ? setEditingWork({ ...editingWork, description: e.target.value }) : setNewWork({ ...newWork, description: e.target.value })}
                        className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400 resize-none"
                        placeholder="Detail core responsibilities or project metrics"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#F4EEE8] text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white cursor-pointer shadow-md"
                    >
                      {editingWork ? "Save Career details" : "Add Career details"}
                    </button>
                  </form>

                  {/* Career timeline list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4EEE8]">Current Career Records</h4>
                    <div className="space-y-3">
                      {workUpdates.map(work => (
                        <div key={work.id} className="bg-[#1e1e24]/20 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                          <div>
                            <h5 className="text-xs font-bold uppercase text-[#F4EEE8]">{work.role}</h5>
                            <p className="text-[11px] text-purple-400 font-semibold uppercase tracking-wider mt-0.5">{work.company} · {work.duration}</p>
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
                    <h3 className="text-lg font-bold uppercase tracking-wider text-[#F4EEE8]">Avatar & Recommended Tunes</h3>
                    <p className="text-xs text-[#A3A3AA]">Refresh your profile image avatar or fine-tune songs showcased in your recommendations grid.</p>
                  </div>

                  {/* Profile Avatar update */}
                  <form onSubmit={handleUpdateAvatarDetails} className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4EEE8] flex items-center gap-2">
                      <Image className="w-4 h-4 text-purple-400" /> profile avatar settings
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Avatar Image URL</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={avatar.url}
                              onChange={(e) => setAvatar({ ...avatar, url: e.target.value })}
                              className="flex-1 bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                              placeholder="Preset photo url"
                            />
                            <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-xs px-3.5 py-2.5 border border-white/5 rounded-xl flex items-center justify-center font-bold uppercase text-[10px] tracking-wide whitespace-nowrap">
                              Upload File
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
                          <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Status Text (Open to work)</label>
                          <input
                            type="text"
                            value={avatar.statusText}
                            onChange={(e) => setAvatar({ ...avatar, statusText: e.target.value })}
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
                        <span className="text-[10px] uppercase text-purple-400 tracking-wider mt-2.5 font-black">[{avatar.statusText}]</span>
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
                    <form onSubmit={handleSaveSong} className="bg-[#1e1e24]/40 border border-white/5 p-5 rounded-2xl space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#F4EEE8]">
                        {editingSong ? "Edit Song details" : "Add Song Recommendation"}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Song Title</label>
                          <input
                            type="text"
                            required
                            value={editingSong ? editingSong.title : newSong.title}
                            onChange={(e) => editingSong ? setEditingSong({ ...editingSong, title: e.target.value }) : setNewSong({ ...newSong, title: e.target.value })}
                            className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                            placeholder="e.g. Call Out My Name"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Artist</label>
                          <input
                            type="text"
                            required
                            value={editingSong ? editingSong.artist : newSong.artist}
                            onChange={(e) => editingSong ? setEditingSong({ ...editingSong, artist: e.target.value }) : setNewSong({ ...newSong, artist: e.target.value })}
                            className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                            placeholder="e.g. The Weeknd"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Song Spotify URL</label>
                          <input
                            type="url"
                            value={editingSong ? editingSong.spotifyUrl : (newSong.spotifyUrl || "")}
                            onChange={(e) => editingSong ? setEditingSong({ ...editingSong, spotifyUrl: e.target.value }) : setNewSong({ ...newSong, spotifyUrl: e.target.value })}
                            className="w-full bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                            placeholder="https://open.spotify.com/..."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase text-[#A3A3AA] font-bold tracking-wider">Song Cover Album Image</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingSong ? editingSong.coverUrl : (newSong.coverUrl || "")}
                              onChange={(e) => editingSong ? setEditingSong({ ...editingSong, coverUrl: e.target.value }) : setNewSong({ ...newSong, coverUrl: e.target.value })}
                              className="flex-1 bg-[#16161c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400"
                              placeholder="preset image or unsplash URL"
                            />
                            <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-xs px-3.5 py-2.5 border border-white/5 rounded-xl flex items-center justify-center font-bold uppercase text-[10px] tracking-wide whitespace-nowrap">
                              Upload File
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(e, "song")}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-[#F4EEE8] text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white cursor-pointer shadow-md"
                      >
                        {editingSong ? "Save Song Recommendation" : "Upload Song Recommendation"}
                      </button>
                    </form>

                    {/* Interactive horizontal display of current songs */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4EEE8]">Songs List ({songs.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {songs.map(song => (
                          <div key={song.id} className="bg-[#1e1e24]/20 border border-white/5 p-3 rounded-xl flex gap-3 items-center">
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="w-12 h-12 object-cover rounded-lg border border-white/5 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold uppercase text-[#F4EEE8] truncate">{song.title}</h5>
                              <p className="text-[10px] text-[#A3A3AA] truncate">{song.artist}</p>
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
