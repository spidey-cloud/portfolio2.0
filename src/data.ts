import { Project, Testimonial, Song } from "./types";

// Note: Using the real generated images from our workspace for Projects 1 & 2
// For others, we use highly aesthetic high-resolution premium Unsplash technology images
export const PROJECTS: Project[] = [
  {
    id: "1",
    title: "AI Money Mentor",
    description: "A full-stack multi-agent financial assistant powered by Google Gemini 2.0 Flash. Features an Orchestrator with Health, Tax, and FIRE domain agents, a Tax Wizard with Old vs. New regime comparison and deduction modeling (80C, 80D, NPS, HRA), and a FIRE Path Planner generating month-by-month SIP and asset allocation roadmaps.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&auto=format&fit=crop",
    techStack: ["React", "Node.js", "Express.js", "Gemini 2.0 Flash"],
    githubUrl: "https://github.com/spidey-cloud/ai-money-mentor",
    liveUrl: "https://money-mentor-final.vercel.app/"
  },
  {
    id: "2",
    title: "FitLife",
    description: "An offline-first Android fitness app built with MVVM and Clean Architecture to manage workouts, diet, and wellbeing. Integrates Google Health Connect SDK for bi-directional health data sync, Room DB and WorkManager for persistent storage, and features a Material 3 UI with dynamic colors, interactive charts, and an ML Kit powered barcode scanner.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format&fit=crop",
    techStack: ["Kotlin", "Jetpack Compose", "Health Connect", "Room", "Hilt"],
    githubUrl: "https://github.com/spidey-cloud/fitlife",
    liveUrl: "https://fitlife-d.pages.dev/"
  },
  {
    id: "3",
    title: "Online Mechanic Booking System",
    description: "A Django-based web application developed during internship at Euphoria Genx. Features user registration, booking requests, and service management with full backend logic, database integration, and web application development.",
    image: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80&auto=format&fit=crop",
    techStack: ["Python", "Django", "SQLite", "HTML", "CSS"],
    githubUrl: "https://github.com/spidey-cloud/Mechanics-Booking",
    liveUrl: "#"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    quote: "One thing that truly stood out while working with Syed is his incredible speed. He has a rare ability to spin up clean, functional landing pages in no time. Whether it's a quick iteration or a fresh build, you can always count on Zenith Studio to deliver with speed and precision.",
    client: "ABHINAV",
    position: "CEO @ CallKaro AI"
  },
  {
    id: "2",
    quote: "Working with Syed was seamless. I came with just an idea, and he turned it into a sleek, high-performing eCommerce site. He handled everything—from design to development—while keeping me in the loop. Highly recommend him and the Zenith Studio team for turning vague visions into real products.",
    client: "AYO",
    position: "Software Developer @ Freelance"
  },
  {
    id: "3",
    quote: "I wanted a platform that captured my journey and love for Urdu — Syed delivered exactly that. The portfolio feels personal, professional, and culturally respectful. Grateful for the care and creativity he brought to the entire process.",
    client: "IFRANULLA",
    position: "Content Creator @ Independent"
  },
  {
    id: "4",
    quote: "Syed built a vibrant landing page for our product launch — fast, responsive, and exactly to the brief. His ability to understand brand voice and turn it into a clean website experience is unmatched.",
    client: "NEHA",
    position: "Marketing Manager @ GlowWave Media"
  },
  {
    id: "5",
    quote: "Zenith Studio helped us move from a basic idea to a polished SaaS landing page in record time. Syed's suggestions on layout, flow, and CTAs clearly show he understands not just design but real conversion strategies.",
    client: "ROHAN",
    position: "Founder @ Bloom Analytics"
  },
  {
    id: "6",
    quote: "Working with Syed was stress-free and efficient. He took ownership of the project, communicated regularly, and delivered a stunning landing page that now serves as the face of our brand online.",
    client: "ADITI",
    position: "Operations Lead @ CraftNest"
  }
];

export const RECOMMENDED_SONGS: Song[] = [
  {
    id: "1",
    title: "Rare",
    artist: "Selena Gomez",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80&auto=format&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=IAEA5mqKmzo"
  },
  {
    id: "2",
    title: "Call Out My Name",
    artist: "The Weeknd",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80&auto=format&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=M4ZoCHID9GI"
  },
  {
    id: "3",
    title: "HUMBLE.",
    artist: "Kendrick Lamar",
    coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80&auto=format&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=tvTRZJ-4EyI"
  },
  {
    id: "4",
    title: "STAY",
    artist: "The Kid LAROI & Justin Bieber",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80&auto=format&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=kTJczUoc26U"
  },
  {
    id: "5",
    title: "Ruin",
    artist: "Shawn Mendes",
    coverUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80&auto=format&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=u3OEKz4YvI4"
  }
];

export const FRONTEND_TOOLS = [
  "HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript", "React", "Next.js", "Git/GitHub"
];

export const BACKEND_TOOLS = [
  "Node.js", "Express.js", "Django", "Python", "MongoDB", "REST APIs"
];

export const UI_LIBRARIES = [
  "ReactJS", "NextJS", "NodeJS", "ExpressJS", "Tailwind CSS", "Framer Motion"
];
