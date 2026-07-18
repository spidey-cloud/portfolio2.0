export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  client: string;
  position: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  spotifyUrl: string;
}

export interface ToolCategory {
  title: string;
  items: string[];
}

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
