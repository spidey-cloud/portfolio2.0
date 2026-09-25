import { motion } from "motion/react";
import { Lock } from "lucide-react";
import SocialFlipButton from "./SocialFlipButton";
import { trackActivity } from "../lib/storage";

interface FooterProps {
  onOpenAdmin?: () => void;
}

export default function Footer({ onOpenAdmin }: FooterProps) {
  const handleScrollToCall = () => {
    trackActivity("book_call_attempt", "Clicked Book a Call inside footer");
    const element = document.getElementById("book-a-call");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleTrackSocial = (platform: "linkedin" | "github" | "email") => {
    trackActivity(
      platform === "email" ? "live_click" : "github_click",
      `Social Link Click: ${platform} from Footer`,
    );
  };

  return (
    <footer
      id="footer"
      className="relative w-full bg-[#0B0B12] px-6 md:px-12 pt-[120px] pb-8 overflow-hidden"
    >
      <div className="max-w-[1600px] mx-auto flex flex-col justify-between">
        {/* Massive Headline LET'S TALK */}
        <div className="w-full text-center mb-16 select-none overflow-hidden">
          <motion.h2
            initial={{ y: 150 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#F4EEE8]/90 font-black tracking-[-0.05em] uppercase leading-[0.8] select-none"
            style={{ fontSize: "clamp(80px, 16vw, 320px)" }}
          >
            LET'S TALK
          </motion.h2>
        </div>

        {/* Content Row: Left Question & Right Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-20 items-end">
          {/* Left Column (Inquiry & Mail/Call links) */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <p className="text-[#F4EEE8] text-base md:text-lg tracking-wider font-semibold max-w-[500px] uppercase leading-relaxed">
              GOT A QUESTION, PROPOSAL, PROJECT, OR WANT TO WORK TOGETHER ON
              SOMETHING?
            </p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm font-bold tracking-wider uppercase text-[#F4EEE8]">
              <a
                href="mailto:rohonkumardutta@gmail.com"
                onClick={() => handleTrackSocial("email")}
                className="relative py-0.5 group inline-block cursor-pointer underline underline-offset-4 decoration-white/30 hover:decoration-white hover:text-white transition-colors"
              >
                Send me an email
              </a>
              <span className="text-[#A3A3AA] font-light">OR</span>
              <button
                onClick={handleScrollToCall}
                className="relative py-0.5 group inline-block cursor-pointer underline underline-offset-4 decoration-white/30 hover:decoration-white hover:text-white transition-colors"
              >
                Book a Call
              </button>
            </div>
          </div>

          {/* Right Column (LinkedIn & GitHub links) */}
          <div className="lg:col-span-4 flex flex-wrap gap-8 md:justify-end text-sm font-bold tracking-wider uppercase items-center">
            <div className="mr-4">
              <SocialFlipButton className="hidden md:flex" />
            </div>
            <a
              href="https://linkedin.com/in/rohon-kumar-dutta"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTrackSocial("linkedin")}
              className="relative py-1 group text-[#A8A8B0] hover:text-[#F4EEE8] transition-colors"
            >
              LinkedIn
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#F4EEE8] transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="https://github.com/spidey-cloud"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTrackSocial("github")}
              className="relative py-1 group text-[#A8A8B0] hover:text-[#F4EEE8] transition-colors"
            >
              GitHub
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#F4EEE8] transition-all duration-300 group-hover:w-full" />
            </a>
          </div>
        </div>

        {/* Bottom copyright details & credits */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] md:text-xs font-semibold tracking-widest text-[#A8A8B0] uppercase">
          <div className="flex items-center gap-4">
            <span>COPYRIGHT 2026</span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-white/20 hover:text-purple-400 transition-colors flex items-center gap-1 cursor-pointer font-bold select-none"
                title="Admin Access Gateway"
              >
                <Lock className="w-3 h-3" /> [ADMIN GATEWAY]
              </button>
            )}
          </div>
          <div className="text-[#A8A8B0]/80">
            NEED A HELP IN WEBSITE DM ME{" "}
            <a
              href="https://linkedin.com/in/rohon-kumar-dutta"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F4EEE8] hover:underline"
            >
              ROHON KUMAR DUTTA
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
