import { motion } from "motion/react";
import { Quote } from "lucide-react";
import { TESTIMONIALS } from "../data";

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative w-full py-[160px] bg-[#0B0B12] px-6 md:px-12 overflow-hidden border-b border-white/5"
    >
      {/* Background spotlights */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-[#1c142c] blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col space-y-[80px]">
        
        {/* Heading */}
        <div className="text-center space-y-6">
          <motion.h2
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[#F4EEE8] font-black tracking-[-0.03em] uppercase leading-none"
            style={{ fontSize: "clamp(48px, 8vw, 110px)" }}
          >
            Testimonials
          </motion.h2>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#A8A8B0] text-xs md:text-sm font-semibold tracking-[0.2em] uppercase max-w-[700px] mx-auto leading-relaxed"
          >
            REAL STORIES FROM CLIENTS AND COLLABORATORS WHO HAVE EXPERIENCED MY WORK FIRSTHAND
          </motion.p>
        </div>

        {/* 3-Column Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {TESTIMONIALS.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative"
            >
              {/* Outer glow background layer */}
              <div className="absolute inset-0 bg-purple-500/5 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Testimonial Card */}
              <div className="relative h-full bg-[#20242F]/40 backdrop-blur-sm border border-white/5 rounded-[32px] p-8 md:p-10 flex flex-col justify-between space-y-8 transition-all duration-500 ease-out 
                group-hover:-translate-y-2 group-hover:bg-[#20242F]/80 group-hover:border-white/15 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              >
                {/* Quote details */}
                <div className="space-y-6">
                  {/* Quote icon & line indicator */}
                  <div className="flex items-center gap-3">
                    <span className="text-white/20 text-xs font-mono select-none">//////////</span>
                    <Quote className="w-5 h-5 text-purple-400 opacity-60 shrink-0" />
                  </div>
                  
                  {/* Body quote text */}
                  <p className="text-[#F4EEE8] text-base md:text-[17px] font-light leading-relaxed group-hover:text-white transition-colors duration-300">
                    "{t.quote}"
                  </p>
                </div>

                {/* Author Block */}
                <div className="pt-6 border-t border-white/5 space-y-1">
                  <h4 className="text-[#F4EEE8] font-black tracking-wider text-base uppercase">
                    {t.client}
                  </h4>
                  <p className="text-[#A3A3AA] text-xs font-light tracking-wide uppercase">
                    {t.position}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
