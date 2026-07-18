import { Project, Song, Testimonial } from "../types";
import { PROJECTS as INITIAL_PROJECTS, RECOMMENDED_SONGS, TESTIMONIALS as INITIAL_TESTIMONIALS, FRONTEND_TOOLS, BACKEND_TOOLS, UI_LIBRARIES } from "../data";

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
  type: "page_view" | "project_click" | "github_click" | "live_click" | "resume_download" | "book_call_attempt" | "book_call_success";
  details: string;
}

// Default state variables
const DEFAULT_SKILLS: SkillCategory[] = [
  { id: "frontend", title: "Frontend Tools", items: FRONTEND_TOOLS },
  { id: "backend", title: "Backend Tools", items: BACKEND_TOOLS },
  { id: "ui", title: "UI & Animation Libraries", items: UI_LIBRARIES }
];

const DEFAULT_WORK_UPDATES: WorkUpdate[] = [
  {
    id: "1",
    role: "Frontend Engineer",
    company: "Virallens",
    companyUrl: "https://virallens.com",
    duration: "Jan 2025 - Present",
    description: "Developing responsive websites with Next.js, building advanced interaction patterns, and leading production releases."
  }
];

const DEFAULT_RESUME = {
  url: "https://drive.google.com/file/d/1Xexample/view",
  fileName: "Syed_Moinuddin_Resume.pdf",
  updatedAt: "2026-07-15"
};

const DEFAULT_AVATAR = {
  url: "/src/assets/images/profile_avatar_1784406141109.jpg",
  statusText: "I'm Open to work"
};

// STORAGE ACTIONS
export function loadProjects(): Project[] {
  const data = localStorage.getItem("portfolio_projects");
  if (!data) {
    localStorage.setItem("portfolio_projects", JSON.stringify(INITIAL_PROJECTS));
    return INITIAL_PROJECTS;
  }
  return JSON.parse(data);
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem("portfolio_projects", JSON.stringify(projects));
}

export function loadSkills(): SkillCategory[] {
  const data = localStorage.getItem("portfolio_skills");
  if (!data) {
    localStorage.setItem("portfolio_skills", JSON.stringify(DEFAULT_SKILLS));
    return DEFAULT_SKILLS;
  }
  return JSON.parse(data);
}

export function saveSkills(skills: SkillCategory[]) {
  localStorage.setItem("portfolio_skills", JSON.stringify(skills));
}

export function loadSongs(): Song[] {
  const data = localStorage.getItem("portfolio_songs");
  if (!data) {
    localStorage.setItem("portfolio_songs", JSON.stringify(RECOMMENDED_SONGS));
    return RECOMMENDED_SONGS;
  }
  return JSON.parse(data);
}

export function saveSongs(songs: Song[]) {
  localStorage.setItem("portfolio_songs", JSON.stringify(songs));
}

export function loadWorkUpdates(): WorkUpdate[] {
  const data = localStorage.getItem("portfolio_work_updates");
  if (!data) {
    localStorage.setItem("portfolio_work_updates", JSON.stringify(DEFAULT_WORK_UPDATES));
    return DEFAULT_WORK_UPDATES;
  }
  return JSON.parse(data);
}

export function saveWorkUpdates(updates: WorkUpdate[]) {
  localStorage.setItem("portfolio_work_updates", JSON.stringify(updates));
}

export function loadResume() {
  const data = localStorage.getItem("portfolio_resume");
  if (!data) {
    localStorage.setItem("portfolio_resume", JSON.stringify(DEFAULT_RESUME));
    return DEFAULT_RESUME;
  }
  return JSON.parse(data);
}

export function saveResume(resume: typeof DEFAULT_RESUME) {
  localStorage.setItem("portfolio_resume", JSON.stringify(resume));
}

export function loadAvatar() {
  const data = localStorage.getItem("portfolio_avatar");
  if (!data) {
    localStorage.setItem("portfolio_avatar", JSON.stringify(DEFAULT_AVATAR));
    return DEFAULT_AVATAR;
  }
  try {
    const parsed = JSON.parse(data);
    if (parsed && parsed.url === "https://avatars.githubusercontent.com/u/120935548?v=4") {
      localStorage.setItem("portfolio_avatar", JSON.stringify(DEFAULT_AVATAR));
      return DEFAULT_AVATAR;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_AVATAR;
  }
}

export function saveAvatar(avatar: typeof DEFAULT_AVATAR) {
  localStorage.setItem("portfolio_avatar", JSON.stringify(avatar));
}

// ACTIVITY LOG TRACKER
export function loadActivityLogs(): ActivityLog[] {
  const data = localStorage.getItem("portfolio_activities");
  if (!data) return [];
  return JSON.parse(data);
}

export function trackActivity(type: ActivityLog["type"], details: string) {
  const log: ActivityLog = {
    id: Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toISOString(),
    type,
    details
  };
  const logs = loadActivityLogs();
  logs.unshift(log); // newest first
  // Limit to last 500 logs to prevent localStorage explosion
  if (logs.length > 500) {
    logs.pop();
  }
  localStorage.setItem("portfolio_activities", JSON.stringify(logs));
}

export function clearActivities() {
  localStorage.setItem("portfolio_activities", JSON.stringify([]));
}
