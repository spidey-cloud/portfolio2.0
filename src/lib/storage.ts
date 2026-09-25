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
// STORAGE ACTIONS
// ---------------------------------------------------------------------------

export function loadProjects(): Project[] {
  const raw = localStorage.getItem("portfolio_projects");
  const parsed = safeJsonParse<Project[]>(raw, INITIAL_PROJECTS);
  if (!Array.isArray(parsed)) {
    localStorage.setItem(
      "portfolio_projects",
      JSON.stringify(INITIAL_PROJECTS),
    );
    return INITIAL_PROJECTS;
  }
  // Sanitize every project's URL fields before returning
  const safe = parsed.map((p) => ({
    ...p,
    title: sanitizeText(p.title),
    description: sanitizeText(p.description),
    githubUrl: safeUrl(p.githubUrl, "https://github.com"),
    liveUrl: safeUrl(p.liveUrl, "#"),
    image: safeUrl(p.image, ""),
  }));
  return safe;
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem("portfolio_projects", JSON.stringify(projects));
}

export function loadSkills(): SkillCategory[] {
  const raw = localStorage.getItem("portfolio_skills");
  const parsed = safeJsonParse<SkillCategory[]>(raw, DEFAULT_SKILLS);
  if (!Array.isArray(parsed)) {
    localStorage.setItem("portfolio_skills", JSON.stringify(DEFAULT_SKILLS));
    return DEFAULT_SKILLS;
  }
  // Reset if stored data still has the old frontend-heavy skill set
  if (
    parsed.length > 0 &&
    parsed[0].items &&
    parsed[0].items.includes("Prismic CMS")
  ) {
    localStorage.setItem("portfolio_skills", JSON.stringify(DEFAULT_SKILLS));
    return DEFAULT_SKILLS;
  }
  return parsed;
}

export function saveSkills(skills: SkillCategory[]) {
  localStorage.setItem("portfolio_skills", JSON.stringify(skills));
}

export function loadSongs(): Song[] {
  const raw = localStorage.getItem("portfolio_songs");
  const parsed = safeJsonParse<Song[]>(raw, RECOMMENDED_SONGS);
  if (!Array.isArray(parsed)) {
    localStorage.setItem("portfolio_songs", JSON.stringify(RECOMMENDED_SONGS));
    return RECOMMENDED_SONGS;
  }
  // Sanitize song URL fields
  return parsed.map((s) => ({
    ...s,
    title: sanitizeText(s.title),
    artist: sanitizeText(s.artist),
    youtubeUrl: safeUrl(s.youtubeUrl, "https://youtube.com"),
    coverUrl: safeUrl(s.coverUrl, ""),
  }));
}

export function saveSongs(songs: Song[]) {
  localStorage.setItem("portfolio_songs", JSON.stringify(songs));
}

export function loadWorkUpdates(): WorkUpdate[] {
  const raw = localStorage.getItem("portfolio_work_updates");
  const parsed = safeJsonParse<WorkUpdate[]>(raw, DEFAULT_WORK_UPDATES);
  if (!Array.isArray(parsed)) {
    localStorage.setItem(
      "portfolio_work_updates",
      JSON.stringify(DEFAULT_WORK_UPDATES),
    );
    return DEFAULT_WORK_UPDATES;
  }
  // Reset if stored data still has the old Virallens entry
  if (parsed.length > 0 && parsed[0].company === "Virallens") {
    localStorage.setItem(
      "portfolio_work_updates",
      JSON.stringify(DEFAULT_WORK_UPDATES),
    );
    return DEFAULT_WORK_UPDATES;
  }
  return parsed.map((w) => ({
    ...w,
    role: sanitizeText(w.role),
    company: sanitizeText(w.company),
    companyUrl: safeUrl(w.companyUrl, ""),
    duration: sanitizeText(w.duration),
    description: sanitizeText(w.description),
  }));
}

export function saveWorkUpdates(updates: WorkUpdate[]) {
  localStorage.setItem("portfolio_work_updates", JSON.stringify(updates));
}

export function loadResume() {
  const raw = localStorage.getItem("portfolio_resume");
  const parsed = safeJsonParse(raw, DEFAULT_RESUME);
  // Reset stale / unsafe URLs
  if (
    !parsed.url ||
    parsed.url.includes("/view?usp=sharing") ||
    parsed.url.includes("uc?export=download") ||
    (parsed.fileName && parsed.fileName.toLowerCase().includes("Rohon"))
  ) {
    localStorage.setItem("portfolio_resume", JSON.stringify(DEFAULT_RESUME));
    return DEFAULT_RESUME;
  }
  return {
    ...parsed,
    url: safeUrl(parsed.url, DEFAULT_RESUME.url),
    fileName: sanitizeText(parsed.fileName),
    updatedAt: sanitizeText(parsed.updatedAt),
  };
}

export function saveResume(resume: typeof DEFAULT_RESUME) {
  localStorage.setItem("portfolio_resume", JSON.stringify(resume));
}

export function loadAvatar() {
  const raw = localStorage.getItem("portfolio_avatar");
  const parsed = safeJsonParse(raw, DEFAULT_AVATAR);
  // Reject old GitHub avatar
  if (parsed.url === "https://avatars.githubusercontent.com/u/120935548?v=4") {
    localStorage.setItem("portfolio_avatar", JSON.stringify(DEFAULT_AVATAR));
    return DEFAULT_AVATAR;
  }
  return {
    url: safeUrl(parsed.url, DEFAULT_AVATAR.url),
    statusText: sanitizeText(parsed.statusText) || DEFAULT_AVATAR.statusText,
  };
}

export function saveAvatar(avatar: typeof DEFAULT_AVATAR) {
  localStorage.setItem("portfolio_avatar", JSON.stringify(avatar));
}

// ---------------------------------------------------------------------------
// ACTIVITY LOG TRACKER
// ---------------------------------------------------------------------------

export function loadActivityLogs(): ActivityLog[] {
  const raw = localStorage.getItem("portfolio_activities");
  const parsed = safeJsonParse<ActivityLog[]>(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function trackActivity(type: ActivityLog["type"], details: string) {
  // Sanitize the details string before storing — truncate to 200 chars
  const safeDetails = sanitizeText(details).slice(0, 200);
  const log: ActivityLog = {
    id: Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toISOString(),
    type,
    details: safeDetails,
  };
  const logs = loadActivityLogs();
  logs.unshift(log);
  if (logs.length > 500) logs.pop();
  localStorage.setItem("portfolio_activities", JSON.stringify(logs));
}

export function clearActivities() {
  localStorage.setItem("portfolio_activities", JSON.stringify([]));
}
