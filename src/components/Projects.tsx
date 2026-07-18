import { useState, useRef, MouseEvent, useEffect } from "react";
import { motion } from "motion/react";
import { Github, ExternalLink } from "lucide-react";
import { loadProjects, trackActivity } from "../lib/storage";
import { Project } from "../types";

// Interactive Mouse Tilt Wrapper Card
function TiltProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Mouse coords relative to card
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized to range [-0.5, 0.5]
    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;
    
    // Map to tilt degree (5 degrees max)
    const tiltX = normY * -5; // tilt up/down
    const tiltY = normX * 5;  // tilt left/right
    
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const isEven = index % 2 === 0;

  const handleTrackProjectClick = (linkType: "github" | "live") => {
    trackActivity(
      linkType === "github" ? "github_click" : "live_click",
      `Project: ${project.title} (${linkType === "github" ? "GitHub" : "Live Web"})`
    );
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => trackActivity("project_click", `Project: ${project.title} (Detailed View)`)}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
      }}
      className={`relative w-full max-w-[1500px] mx-auto min-h-[600px] md:min-h-[650px] bg-[#20242F] rounded-3xl p-8 md:p-[64px] border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] hover:border-white/10 ${
        isHovered ? "-translate-y-2" : ""
      }`}
    >
      {/* Decorative ambient background glow behind laptop */}
      <div className="absolute right-[10%] bottom-[10%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Grid: alternating order for desktop */}
      <div className={`w-full flex flex-col lg:flex-row items-center gap-12 ${isEven ? "" : "lg:flex-row-reverse"}`}>
        
        {/* Text Area */}
        <div className="w-full lg:w-[45%] flex flex-col items-start text-left space-y-6 relative z-10">
          
          {/* Top Buttons: GitHub & Live Link */}
          <div className="flex items-center gap-4">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTrackProjectClick("github")}
              aria-label="View on GitHub"
              className="w-12 h-12 rounded-full bg-[#F4EEE8] text-[#0B0B12] flex items-center justify-center transition-all duration-300 hover:scale-115 hover:bg-white hover:shadow-lg hover:shadow-black/20 cursor-pointer"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTrackProjectClick("live")}
              aria-label="View Live Website"
              className="w-12 h-12 rounded-full bg-[#F4EEE8] text-[#0B0B12] flex items-center justify-center transition-all duration-300 hover:scale-115 hover:bg-white hover:shadow-lg hover:shadow-black/20 cursor-pointer"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>

          {/* Title */}
          <h3 className="text-3xl md:text-5xl font-black text-[#F4EEE8] tracking-tight leading-none uppercase">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-[#A8A8B0] text-base md:text-lg font-light leading-relaxed max-w-[500px]">
            {project.description}
          </p>

          {/* Tech Stack Pills */}
          <div className="flex flex-wrap gap-2.5 pt-4">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs font-semibold tracking-wider text-[#F4EEE8] uppercase bg-white/5 border border-white/5 px-4 py-2 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Mockup Laptop Area */}
        <div className="w-full lg:w-[50%] flex justify-center items-center relative z-10">
          {/* Simulated MacBook Laptop Frame */}
          <div className="w-full max-w-[620px] transition-transform duration-700 ease-out group-hover:scale-105">
            {/* Screen Section */}
            <div className="relative aspect-[16/10] bg-[#000] rounded-t-[16px] p-[2.5%] pb-0 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden">
              {/* Screen Bezel Notch/Reflections */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[10px] bg-black rounded-b-md z-20" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none z-10" />

              {/* Inner Web Page Frame */}
              <div className="w-full h-full rounded-t-[8px] overflow-hidden bg-[#121214] relative">
                <img
                  src={project.image}
                  alt={`${project.title} screenshot`}
                  className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                    isHovered ? "scale-105 rotate-0.5" : "scale-100"
                  }`}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Laptop Base Section */}
            <div className="relative h-[16px] bg-[#2d313c] rounded-b-[12px] shadow-[0_12px_20px_rgba(0,0,0,0.5)] flex justify-center border-t border-white/15">
              {/* Base Center Notch (Mac thumb recess) */}
              <div className="absolute top-0 w-[80px] h-[6px] bg-[#1a1c24] rounded-b-md" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Projects() {
  const [projectsList, setProjectsList] = useState<Project[]>([]);

  const fetchProjects = () => {
    setProjectsList(loadProjects());
  };

  useEffect(() => {
    fetchProjects();

    const handleSync = () => {
      fetchProjects();
    };

    window.addEventListener("portfolio-data-updated", handleSync);
    return () => {
      window.removeEventListener("portfolio-data-updated", handleSync);
    };
  }, []);

  return (
    <section
      id="projects"
      className="relative w-full py-[160px] bg-[#0B0B12] px-6 md:px-12 overflow-hidden border-b border-white/5"
    >
      <div className="max-w-[1600px] mx-auto flex flex-col space-y-[120px]">
        
        {/* Title Block */}
        <div className="text-center space-y-6">
          <motion.h2
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#F4EEE8]/90 font-black tracking-[-0.04em] uppercase leading-none"
            style={{ fontSize: "clamp(48px, 8vw, 120px)" }}
          >
            My Projects
          </motion.h2>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#A8A8B0] text-xs md:text-sm font-semibold tracking-[0.2em] uppercase max-w-[700px] mx-auto leading-relaxed"
          >
            FROM HIGH-CONVERSION LANDING PAGES TO AI-POWERED DASHBOARDS — EVERY BUILD HERE SOLVES A REAL-WORLD PROBLEM WITH STYLE AND SPEED.
          </motion.p>
        </div>

        {/* Projects List with 120px gap */}
        <div className="flex flex-col gap-[120px] w-full">
          {projectsList.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ y: 80, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <TiltProjectCard project={project} index={index} />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
