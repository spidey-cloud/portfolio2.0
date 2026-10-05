import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { loadSkills } from "../lib/storage";

type Category = "ALL" | "FRONTEND" | "BACKEND" | "UI_DESIGN";

interface SkillItem {
  name: string;
  category: Category;
}

export default function Skills() {
  const [activeTab, setActiveTab] = useState<Category>("ALL");
  const [skillsData, setSkillsData] = useState<any[]>([]);

  useEffect(() => {
    loadSkills().then(setSkillsData);
  }, []);

  // Compile all skills dynamically into an array of objects
  const allSkills: SkillItem[] = [];
  
  skillsData.forEach(cat => {
    let categoryKey: Category = "ALL";
    if (cat.id === "frontend") categoryKey = "FRONTEND";
    else if (cat.id === "backend") categoryKey = "BACKEND";
    else if (cat.id === "ui") categoryKey = "UI_DESIGN";

    cat.items.forEach((item: string) => {
      allSkills.push({ name: item, category: categoryKey });
    });
  });

  const filteredSkills =
    activeTab === "ALL"
      ? allSkills
      : allSkills.filter((s) => s.category === activeTab);

  const tabNames: { id: Category; label: string }[] = [
    { id: "ALL", label: "All Technologies" },
    { id: "FRONTEND", label: "Frontend" },
    { id: "BACKEND", label: "Backend" },
    { id: "UI_DESIGN", label: "UI & Design" },
  ];

  return (
    <section
      id="skills"
      className="relative w-full py-[160px] bg-[#0B0B12] px-6 md:px-12 overflow-hidden border-b border-white/5"
    >
      {/* Background spotlights */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute bottom-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-[#1e1a3a] blur-[140px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col items-center">
        {/* Title */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[#F4EEE8] text-sm font-semibold tracking-[0.2em] uppercase mb-4"
          >
            My Skillset
          </motion.h2>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-[#F4EEE8] tracking-tight uppercase"
          >
            Crafting with Modern Tech
          </motion.p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16 max-w-2xl">
          {tabNames.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-6 py-3 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 relative border cursor-pointer bg-transparent text-[#A8A8B0] border-white/10 hover:border-white/30 hover:text-[#F4EEE8]"
              style={{
                backgroundColor: activeTab === tab.id ? "#F4EEE8" : "transparent",
                color: activeTab === tab.id ? "#0B0B12" : "#A8A8B0",
                borderColor: activeTab === tab.id ? "#F4EEE8" : "rgba(255, 255, 255, 0.1)"
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.span
                  layoutId="activeSkillTab"
                  className="absolute inset-0 rounded-full border border-[#F4EEE8] -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Pill Badges Container */}
        <motion.div
          layout
          className="flex flex-wrap justify-center gap-4 max-w-5xl"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
                className="group relative"
              >
                {/* Glow Backdrop */}
                <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Pill Badge */}
                <div
                  className="relative px-6 py-4 rounded-full border border-white/5 bg-[#171721]/50 backdrop-blur-sm text-[#F4EEE8] text-sm font-medium tracking-wide transition-all duration-300 ease-out cursor-default
                  group-hover:-translate-y-1.5 group-hover:scale-[1.05] group-hover:bg-[#20242F] group-hover:border-white/20 group-hover:shadow-[0_10px_30px_-5px_rgba(127,127,229,0.3)]"
                >
                  <span className="relative z-10">{skill.name}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
