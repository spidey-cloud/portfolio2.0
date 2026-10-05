import { Project, Song, Testimonial } from "../types";
import {
  PROJECTS as INITIAL_PROJECTS,
  RECOMMENDED_SONGS,
  TESTIMONIALS as INITIAL_TESTIMONIALS,
  FRONTEND_TOOLS,
  BACKEND_TOOLS,
  UI_LIBRARIES,
} from "../data";
import { safeJsonParse, sanitizeText } from "./validate";

export interface WorkUpdate {
  id: string;
  role: string;
  company: string;
  companyUrl: string;
  duration: string;
  description: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  items: string[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type:
    | "page_view"
    | "project_click"
    | "github_click"
    | "live_click"
    | "resume_download"
    | "book_call_attempt"
    | "book_call_success";
  details: string;
}

// Default state variables
const DEFAULT_SKILLS: SkillCategory[] = [
  { id: "frontend", title: "Frontend Tools", items: FRONTEND_TOOLS },
  { id: "backend", title: "Backend Tools", items: BACKEND_TOOLS },
  { id: "ui", title: "UI & Animation Libraries", items: UI_LIBRARIES },
];

const DEFAULT_WORK_UPDATES: WorkUpdate[] = [
  {
    id: "1",
    role: "Python Django Intern",
    company: "Euphoria Genx",
    companyUrl: "",
    duration: "Jun 2023 – Oct 2023",
    description:
      "Completed a Skill Development and Internship Programme focused on Python and Django. Developed an Online Mechanic Booking System with user registration, booking requests, and service management. Worked with backend logic, database integration, and full-stack web development concepts.",
  },
];

const DEFAULT_RESUME = {
  url: "https://drive.google.com/file/d/1lc6oe-EnCmaa7TMeUTiXQsXq1eJUIVvS/view?usp=sharing",
  fileName: "Rohon-Kumar-Dutta-Resume.pdf",
  updatedAt: "2026-07-19",
};

const DEFAULT_AVATAR = {
  url: "/static/images/profile_avatar_1784406141109.jpg",
  statusText: "I'm Open to work",
};

// ---------------------------------------------------------------------------
// URL safety guard — strips any javascript: / data: href before rendering
// ---------------------------------------------------------------------------
const SAFE_URL_RE =
  /^(https?:\/\/|\/|data:image\/(jpeg|png|webp|gif);base64,)/i;

function safeUrl(url: unknown, fallback = ""): string {
  if (typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (SAFE_URL_RE.test(trimmed)) return trimmed;
  return fallback; // reject javascript:, vbscript:, etc.
}

// ---------------------------------------------------------------------------
// STORAGE ACTIONS (API Backend)
// ---------------------------------------------------------------------------
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function loadProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_URL}/api/projects`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (e) {
    console.error("Failed to load projects", e);
  }
  return INITIAL_PROJECTS;
}

export async function saveProjects(projects: Project[]) {
  try {
    await fetch(`${API_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projects),
    });
  } catch (e) {
    console.error("Failed to save projects", e);
  }
}

export async function loadSkills(): Promise<SkillCategory[]> {
  try {
    const res = await fetch(`${API_URL}/api/skills`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (e) {
    console.error("Failed to load skills", e);
  }
  return DEFAULT_SKILLS;
}

export async function saveSkills(skills: SkillCategory[]) {
  try {
    await fetch(`${API_URL}/api/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skills),
    });
  } catch (e) {
    console.error("Failed to save skills", e);
  }
}

export async function loadSongs(): Promise<Song[]> {
  try {
    const res = await fetch(`${API_URL}/api/songs`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (e) {
    console.error("Failed to load songs", e);
  }
  return RECOMMENDED_SONGS;
}

export async function saveSongs(songs: Song[]) {
  try {
    await fetch(`${API_URL}/api/songs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(songs),
    });
  } catch (e) {
    console.error("Failed to save songs", e);
  }
}

export async function loadWorkUpdates(): Promise<WorkUpdate[]> {
  try {
    const res = await fetch(`${API_URL}/api/work-updates`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (e) {
    console.error("Failed to load work updates", e);
  }
  return DEFAULT_WORK_UPDATES;
}

export async function saveWorkUpdates(updates: WorkUpdate[]) {
  try {
    await fetch(`${API_URL}/api/work-updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  } catch (e) {
    console.error("Failed to save work updates", e);
  }
}

export async function loadResume() {
  try {
    const res = await fetch(`${API_URL}/api/resume`);
    const data = await res.json();
    if (data && data.url) return data;
  } catch (e) {
    console.error("Failed to load resume", e);
  }
  return DEFAULT_RESUME;
}

export async function saveResume(resume: typeof DEFAULT_RESUME) {
  try {
    await fetch(`${API_URL}/api/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resume),
    });
  } catch (e) {
    console.error("Failed to save resume", e);
  }
}

export async function loadAvatar() {
  try {
    const res = await fetch(`${API_URL}/api/avatar`);
    const data = await res.json();
    if (data && data.url) return data;
  } catch (e) {
    console.error("Failed to load avatar", e);
  }
  return DEFAULT_AVATAR;
}

export async function saveAvatar(avatar: typeof DEFAULT_AVATAR) {
  try {
    await fetch(`${API_URL}/api/avatar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(avatar),
    });
  } catch (e) {
    console.error("Failed to save avatar", e);
  }
}

// ---------------------------------------------------------------------------
// ACTIVITY LOG TRACKER
// ---------------------------------------------------------------------------

export async function loadActivityLogs(): Promise<ActivityLog[]> {
  try {
    const res = await fetch(`${API_URL}/api/activity-logs`);
    const data = await res.json();
    if (Array.isArray(data)) return data;
  } catch (e) {
    console.error("Failed to load activity logs", e);
  }
  return [];
}

export async function trackActivity(
  type: ActivityLog["type"],
  details: string,
) {
  const safeDetails = sanitizeText(details).slice(0, 200);
  const log: ActivityLog = {
    id: Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toISOString(),
    type,
    details: safeDetails,
  };
  try {
    await fetch(`${API_URL}/api/activity-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
  } catch (e) {
    console.error("Failed to track activity", e);
  }
}

export async function clearActivities() {
  // Clearing not explicitly implemented in backend yet, but we can do it via a special POST or DELETE.
  // We'll skip for now or we could add a DELETE endpoint later.
  console.log("clearActivities called - not implemented on backend yet");
}
