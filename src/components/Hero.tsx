import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { loadAvatar, trackActivity } from "../lib/storage";

export default function Hero() {
  const [isHovered, setIsHovered] = useState(false);
  const [avatarData, setAvatarData] = useState({ url: "/src/assets/images/profile_avatar_1784406141109.jpg", statusText: "I'm Open to work" });

  // Motion values for cursor parallax shift
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs to avoid jittery motion
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  // Map spring values to translation values (profile image shifts slightly)
  const shiftImageX = useTransform(springX, [-0.5, 0.5], [-20, 20]);
  const shiftImageY = useTransform(springY, [-0.5, 0.5], [-20, 20]);

  // Speech bubble shifts slightly more for parallax depth
  const shiftBubbleX = useTransform(springX, [-0.5, 0.5], [-35, 35]);
  const shiftBubbleY = useTransform(springY, [-0.5, 0.5], [-35, 35]);

  useEffect(() => {
    // Track initial page view load
    trackActivity("page_view", "Portfolio Homepage loaded");

    // Fetch dynamic avatar
    setAvatarData(loadAvatar());

    // Listen for real-time updates
    const handleSync = () => {
      setAvatarData(loadAvatar());
    };
    window.addEventListener("portfolio-data-updated", handleSync);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize to [-0.5, 0.5]
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("portfolio-data-updated", handleSync);
    };
  }, [mouseX, mouseY]);

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen bg-[#0B0B12] flex flex-col justify-between px-6 md:px-12 pt-[120px] pb-12 overflow-hidden select-none animate-fade-in"
    >
      {/* Background spotlight matching the design template */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_70%)] blur-[20px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 my-auto">
        {/* Massive Text: SYED MOINUDDIN */}
        <div className="w-full flex flex-col items-center justify-center leading-[0.8] select-none relative">
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#F4EEE8] font-black text-center uppercase tracking-[-0.05em] leading-[0.85] select-none"
            style={{ fontSize: "clamp(64px, 12.5vw, 160px)" }}
          >
            Syed
          </motion.h1>

          {/* Spacer to allow the absolute profile image to fit elegantly */}
          <div className="h-[140px]" />

          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#F4EEE8] font-black text-center uppercase tracking-[-0.05em] leading-[0.85] select-none"
            style={{ fontSize: "clamp(64px, 12.5vw, 160px)" }}
          >
            Moinuddin
          </motion.h1>
        </div>

        {/* Profile Image & Speech Bubble Container (Absolutely Centered and overlaps) */}
        <motion.div
          style={{ x: shiftImageX, y: shiftImageY }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[45%] z-20 flex flex-col items-center cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsHovered(!isHovered)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Avatar frame (rounded-3xl (24px) for geometric editorial feel) */}
          <div
            className={`w-[220px] h-[220px] md:w-[280px] md:h-[280px] rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] transition-all duration-700 ease-out border border-white/10 ${
              isHovered ? "bg-[#7F7FE5] scale-[1.04]" : "bg-[#20242F]"
            }`}
          >
            <img
              src={avatarData.url}
              alt="Syed Moinuddin Avatar"
              className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                isHovered ? "brightness-105 scale-105 contrast-105" : "grayscale-[20%] brightness-95"
              }`}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Status Bubble formatted exactly to design guideline template aesthetics */}
          <motion.div
            style={{ x: shiftBubbleX, y: shiftBubbleY }}
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.8,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className={`absolute -top-12 -right-[30px] bg-[#F4EEE8] text-black px-4 md:px-5 py-2.5 rounded-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] flex items-center gap-2 border border-black/5 whitespace-nowrap transition-transform duration-300 ${
              isHovered ? "scale-105" : ""
            }`}
          >
            {/* Green Pulse Dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase font-sans">
              {avatarData.statusText}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Row formatted strictly as the hero-footer template */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-white/5">
        {/* Bottom Left */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="max-w-[340px] text-left flex flex-col space-y-2"
        >
          <p className="text-[11px] text-[#A8A8B0] uppercase tracking-[0.1em] font-semibold">Based in Bangalore, India</p>
          <p className="text-sm md:text-base text-[#F4EEE8] font-light leading-relaxed">
            I currently work as a Frontend Engineer at{" "}
            <a
              href="https://virallens.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all font-medium"
            >
              Virallens
            </a>
            , building beautiful digital products.
          </p>
        </motion.div>

        {/* Bottom Right */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="max-w-[340px] md:justify-self-end text-left md:text-right flex flex-col space-y-2"
        >
          <p className="text-[11px] text-[#A8A8B0] uppercase tracking-[0.1em] font-semibold">Expertise</p>
          <p className="text-sm md:text-base text-[#F4EEE8] font-light leading-relaxed">
            Frontend Engineer &<br />Interaction Designer
          </p>
        </motion.div>
      </div>
    </section>
  );
}
