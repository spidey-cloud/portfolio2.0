import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { loadSkills, loadWorkUpdates, loadResume, trackActivity } from "../lib/storage";
import { FileText, Calendar, ExternalLink } from "lucide-react";

export default function About() {
  const [skills, setSkills] = useState<any[]>([]);
  const [workUpdates, setWorkUpdates] = useState<any[]>([]);
  const [resume, setResume] = useState<any>({ url: "", fileName: "", updatedAt: "" });

  useEffect(() => {
    // Load dynamic contents on component mount
    setSkills(loadSkills());
    setWorkUpdates(loadWorkUpdates());
    setResume(loadResume());
  }, []);

  // Handle resume tracking activity
  const handleDownloadResume = () => {
    trackActivity("resume_download", `File: ${resume.fileName}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section
      id="about"
      className="relative w-full py-[160px] bg-[#0B0B12] px-6 md:px-12 overflow-hidden border-b border-white/5"
    >
      {/* Subtle radial spotlight background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-[#3b3b4f] blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto">
        {/* Large Display Heading */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-[80px]"
        >
          <h2 className="text-[#F4EEE8] font-black tracking-[-0.04em] uppercase leading-[0.9] text-[40px] sm:text-[60px] md:text-[80px] lg:text-[96px] max-w-[1300px]">
            I BUILD STARTUPS,
            <br />
            ACCELERATE GROWTH,
            <br />
            CREATE EMPIRES.
          </h2>
        </motion.div>

        {/* Two-Column Content Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start"
        >
          {/* Left Column: Biography */}
          <div className="lg:col-span-7 space-y-8 max-w-[620px]">
            <motion.p
              variants={itemVariants}
              className="text-[#F4EEE8] text-lg md:text-[22px] font-light leading-relaxed"
            >
              I specialize in crafting high-converting landing pages and websites for SaaS, Web3 & AI startups. I'm passionate about building software that makes a difference.
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-[#A8A8B0] text-lg md:text-[22px] font-light leading-relaxed"
            >
              Beyond my work as a frontend developer, I'm also very active in gaming, regularly playing PUBG, Valorant, and other PC games, combining my passion for technology with competitive gaming experiences.
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-[#A8A8B0] text-lg md:text-[22px] font-light leading-relaxed"
            >
              When I’m away from the keyboard, I’m usually diving into anime marathons or spending time with friends, recharging for the next big idea.
            </motion.p>

            {/* Dynamic Interactive Resume Button */}
            <motion.div variants={itemVariants} className="pt-6 border-t border-white/5">
              <a
                href={resume.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDownloadResume}
                className="inline-flex items-center gap-3 bg-[#F4EEE8] text-[#0B0B12] px-6 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] hover:bg-white cursor-pointer shadow-lg hover:shadow-white/10"
              >
                <FileText className="w-4 h-4 text-[#0B0B12]" />
                Download Resume ({resume.fileName || "PDF"})
              </a>
              <p className="text-[10px] text-[#A8A8B0] font-semibold tracking-widest uppercase mt-3 pl-2">
                Last updated: {resume.updatedAt}
              </p>
            </motion.div>

            {/* Dynamic Career History Updates Timeline */}
            {workUpdates.length > 0 && (
              <motion.div variants={itemVariants} className="pt-10 space-y-6">
                <h3 className="text-xs font-black tracking-[0.25em] uppercase text-[#F4EEE8]">
                  Career Timeline Updates
                </h3>
                <div className="space-y-6 pl-1 border-l border-white/10">
                  {workUpdates.map((work: any) => (
                    <div key={work.id} className="relative pl-6 space-y-1.5 group">
                      {/* Timeline dot */}
                      <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-400 border border-[#0B0B12] group-hover:scale-125 transition-transform" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="text-sm font-bold uppercase text-[#F4EEE8] tracking-wider">
                          {work.role}
                        </h4>
                        <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase font-mono">
                          {work.duration}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={work.companyUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-purple-400 hover:underline uppercase tracking-widest flex items-center gap-1"
                        >
                          {work.company} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      <p className="text-xs text-[#A3A3AA] font-light leading-relaxed max-w-xl">
                        {work.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Dynamic Stack & Tools lists */}
          <div className="lg:col-span-5 space-y-12">
            {skills.map((category: any) => (
              <motion.div key={category.id} variants={itemVariants} className="space-y-4">
                <h3 className="text-[#F4EEE8] text-base md:text-lg font-bold tracking-wider uppercase">
                  {category.title}
                </h3>
                <p className="text-[#A3A3AA] text-sm md:text-base leading-relaxed font-light">
                  {category.items.join(", ")}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
