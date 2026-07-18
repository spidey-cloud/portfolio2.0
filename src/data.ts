import { Project, Testimonial, Song } from "./types";

// Note: Using the real generated images from our workspace for Projects 1 & 2
// For others, we use highly aesthetic high-resolution premium Unsplash technology images
export const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Ayo Remi",
    description: "This is a modern e-commerce website designed as a replica of the United Store platform, featuring full SEO optimization, improved performance, and built using WordPress, Next.js, and TypeScript.",
    image: "/src/assets/images/ayo_remi_laptop_1784406155891.jpg",
    techStack: ["React", "Tailwind CSS", "Framer Motion"],
    githubUrl: "https://github.com/syed-moinuddin106/ayo-remi",
    liveUrl: "https://ayo-remi.vercel.app"
  },
  {
    id: "2",
    title: "MechX-AI",
    description: "This is a next-generation engineering platform designed to automate mechanical tasks, offering breakthrough projects, ready-to-use solutions, and collaboration opportunities for building future mechatronics innovations.",
    image: "/src/assets/images/mechx_ai_laptop_1784406171114.jpg",
    techStack: ["React", "Tailwind CSS", "Framer Motion"],
    githubUrl: "https://github.com/syed-moinuddin106/mechx-ai",
    liveUrl: "https://mechx-ai.vercel.app"
  },
  {
    id: "3",
    title: "Zenith Solar",
    description: "This is a landing page created for a solar energy company to strengthen their digital presence and showcase innovative solutions for capturing, storing, and utilizing solar power.",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80&auto=format&fit=crop",
    techStack: ["React", "Next.js", "GSAP"],
    githubUrl: "https://github.com/syed-moinuddin106/zenith-solar",
    liveUrl: "https://zenith-solar.vercel.app"
  },
  {
    id: "4",
    title: "Nova Solar",
    description: "This is a landing page developed for Solarnova to showcase their innovative clean energy solutions, empowering homes, businesses, and communities to thrive sustainably.",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80&auto=format&fit=crop",
    techStack: ["Next.js", "TypeScript", "Prisma"],
    githubUrl: "https://github.com/syed-moinuddin106/nova-solar",
    liveUrl: "https://nova-solar.vercel.app"
  },
  {
    id: "5",
    title: "Quantum Dock",
    description: "This is a website for an AI startup designed to present cutting-edge AI-driven data processing solutions, enabling seamless integration with multiple providers, workflow automation, and data unification.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80&auto=format&fit=crop",
    techStack: ["Next.js", "TypeScript", "Prisma"],
    githubUrl: "https://github.com/syed-moinuddin106/quantum-dock",
    liveUrl: "https://quantum-dock.vercel.app"
  },
  {
    id: "6",
    title: "Dev-Creations",
    description: "This is a website redesign for Dev-Creations, where I utilized modern tech stacks and applied my own UI/UX design knowledge to create a more contemporary, user-friendly look and feel.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80&auto=format&fit=crop",
    techStack: ["Next.js", "TypeScript", "Prisma"],
    githubUrl: "https://github.com/syed-moinuddin106/dev-creations",
    liveUrl: "https://dev-creations.vercel.app"
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
    spotifyUrl: "https://open.spotify.com/album/4m6bZskbIWhNWeM42XzY3T"
  },
  {
    id: "2",
    title: "Call Out My Name",
    artist: "The Weeknd",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80&auto=format&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/09mEdoA6grmY80v0Z6of6Z"
  },
  {
    id: "3",
    title: "HUMBLE.",
    artist: "Kendrick Lamar",
    coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80&auto=format&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/7KXgZ6u76Cc9vS569m9Oca"
  },
  {
    id: "4",
    title: "STAY",
    artist: "The Kid LAROI & Justin Bieber",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80&auto=format&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/50nZ31v2vSTg687uI69gS7"
  },
  {
    id: "5",
    title: "Ruin",
    artist: "Shawn Mendes",
    coverUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80&auto=format&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/303UjH6vV0nK8FqR4Wf08E"
  }
];

export const FRONTEND_TOOLS = [
  "JavaScript (ES6+)", "React", "Next.js", "TypeScript", "Prismic CMS", 
  "Redux", "Redux Toolkit", "React Testing Library", "Vitest", "HTML5", 
  "Git/GitHub", "NextAuth", "Formik"
];

export const BACKEND_TOOLS = [
  "Node.js", "Express.js", "Supabase", "Firebase", "Prisma ORM", 
  "PlanetScale", "REST APIs", "PostgreSQL", "MongoDB", "Stripe Integration"
];

export const UI_LIBRARIES = [
  "CSS3/SCSS/SASS", "Tailwind CSS", "Material UI", "Framer Motion", 
  "GSAP", "Bootstrap", "Chart.js"
];
