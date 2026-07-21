import { useState, useRef, MouseEvent, useEffect } from "react";
import { motion } from "motion/react";
import { Github, ExternalLink } from "lucide-react";
import { loadProjects, trackActivity } from "../lib/storage";
import { Project } from "../types";

function TiltProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const requestId = useRef<number | null>(null);
  const pendingPointer = useRef({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const supportsFinePointer =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer:fine)").matches;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!supportsFinePointer || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    pendingPointer.current = {
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    };

    if (requestId.current !== null) return;

    requestId.current = window.requestAnimationFrame(() => {
      const { x, y } = pendingPointer.current;
      setTilt({ x: y * -5, y: x * 5 });
      requestId.current = null;
    });
  };

  const handleMouseLeave = () => {
    if (requestId.current !== null) {
      window.cancelAnimationFrame(requestId.current);
      requestId.current = null;
    }
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (requestId.current !== null) {
        window.cancelAnimationFrame(requestId.current);
      }
    };
  }, []);

  const isEven = index % 2 === 0;

  const handleTrackProjectClick = (linkType: "github" | "live") => {
    trackActivity(
      linkType === "github" ? "github_click" : "live_click",
      `Project: ${project.title} (${linkType === "github" ? "GitHub" : "Live Web"})`
    );
  };

  const hasLiveUrl = project.liveUrl && project.liveUrl !== "#";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => trackActivity("project_click", `Project: ${project.title}`)}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isHovered
          ? "transform 0.1s ease-out"
          : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
      }}
      className={`relative w-full max-w-[1500px] mx-auto bg-[#20242F] rounded-3xl p-8 md:p-[56px] border border-white/5 overflow-hidden hover:border-white/10 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] ${
        isHovered ? "-translate-y-1" : ""
      }`}
    >
      {/* Ambient glow */}
      <div className="absolute right-[10%] bottom-[10%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className={`w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${isEven ? "" : "lg:flex-row-reverse"}`}>

        {/* ── Left / Text Column ── */}
        <div className="w-full lg:w-[45%] flex flex-col items-start text-left space-y-6 relative z-10">

          {/* Index label */}
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#A3A3AA]">
            Project {String(index + 1).padStart(2, "0")}
          </span>

          {/* Title */}
          <h3 className="text-3xl md:text-[42px] font-black text-[#F4EEE8] tracking-tight leading-none uppercase">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-[#A8A8B0] text-sm md:text-base font-light leading-relaxed max-w-[500px]">
            {project.description}
          </p>

          {/* Tech Stack Pills */}
          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] font-bold tracking-wider text-[#F4EEE8] uppercase bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* ── CTA Buttons ── */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTrackProjectClick("github")}
              className="inline-flex items-center gap-2 bg-[#F4EEE8] text-[#0B0B12] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-white hover:scale-[1.03] hover:shadow-lg cursor-pointer"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>

            {hasLiveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleTrackProjectClick("live")}
                className="inline-flex items-center gap-2 border border-white/20 text-[#F4EEE8] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-white/5 hover:border-white/40 hover:scale-[1.03] cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Live Demo
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 border border-white/10 text-[#A3A3AA] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-not-allowed select-none">
                <ExternalLink className="w-3.5 h-3.5" />
                No Live Demo
              </span>
            )}
          </div>
        </div>

        {/* ── Right / Image Column ── */}
        <div className="w-full lg:w-[55%] flex justify-center items-center relative z-10">
          {/* MacBook frame */}
          <div className="w-full max-w-[620px]">
            {/* Screen */}
            <div className="relative aspect-[16/10] bg-[#000] rounded-t-[16px] p-[2.5%] pb-0 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[10px] bg-black rounded-b-md z-20" />
              {/* Glare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none z-10" />

              {/* Screenshot */}
              <div className="w-full h-full rounded-t-[8px] overflow-hidden bg-[#121214] relative">
                <img
                  src={project.image}
                  alt={`${project.title} screenshot`}
                  className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                    isHovered ? "scale-105" : "scale-100"
                  }`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Overlay with quick-access links on hover */}
                <div
                  className={`absolute inset-0 bg-black/60 flex items-center justify-center gap-4 transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { e.stopPropagation(); handleTrackProjectClick("github"); }}
                    className="w-12 h-12 rounded-full bg-[#F4EEE8] text-[#0B0B12] flex items-center justify-center hover:bg-white hover:scale-110 transition-all cursor-pointer shadow-xl"
                    aria-label="View on GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  {hasLiveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => { e.stopPropagation(); handleTrackProjectClick("live"); }}
                      className="w-12 h-12 rounded-full bg-[#F4EEE8] text-[#0B0B12] flex items-center justify-center hover:bg-white hover:scale-110 transition-all cursor-pointer shadow-xl"
                      aria-label="View Live Demo"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Laptop base */}
            <div className="relative h-[16px] bg-[#2d313c] rounded-b-[12px] shadow-[0_12px_20px_rgba(0,0,0,0.5)] flex justify-center border-t border-white/15">
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

  useEffect(() => {
    setProjectsList(loadProjects());
    const handleSync = () => setProjectsList(loadProjects());
    window.addEventListener("portfolio-data-updated", handleSync);
    return () => window.removeEventListener("portfolio-data-updated", handleSync);
  }, []);

  return (
    <section
      id="projects"
      className="relative w-full py-[160px] bg-[#0B0B12] px-6 md:px-12 overflow-hidden border-b border-white/5"
    >
      <div className="max-w-[1600px] mx-auto flex flex-col space-y-[120px]">

        {/* Section Header */}
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
            Full-stack web apps, Android apps, and AI-powered tools — built to solve real problems.
          </motion.p>
        </div>

        {/* Project Cards */}
        <div className="flex flex-col gap-[100px] w-full">
          {projectsList.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ y: 80, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
