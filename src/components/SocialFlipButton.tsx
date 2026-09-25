"use client";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import { cn } from "../lib/utils";
import {
  FaGithub,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaDiscord,
} from "react-icons/fa";

export interface SocialItem {
  letter: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface SocialFlipButtonProps {
  items?: SocialItem[];
  className?: string;
  itemClassName?: string;
  frontClassName?: string;
  backClassName?: string;
}

const defaultItems: SocialItem[] = [
  {
    letter: "C",
    icon: <FaGithub />,
    label: "Github",
    href: "https://github.com/Rohon-kumar-dutta",
  },
  { letter: "O", icon: <FaTwitter />, label: "Twitter", href: "#" },
  {
    letter: "N",
    icon: <FaLinkedin />,
    label: "LinkedIn",
    href: "https://linkedin.com/in/rohon-kumar-dutta",
  },
  { letter: "T", icon: <FaInstagram />, label: "Instagram", href: "#" },
  { letter: "A", icon: <FaFacebook />, label: "Facebook", href: "#" },
  {
    letter: "C",
    icon: <FaEnvelope />,
    label: "Email",
    href: "mailto:rohonkumardutta@gmail.com",
  },
  { letter: "T", icon: <FaDiscord />, label: "Discord", href: "#" },
];

const SocialFlipNode = ({
  item,
  index,
  isHovered,
  setTooltipIndex,
  tooltipIndex,
  itemClassName,
  frontClassName,
  backClassName,
}: {
  item: SocialItem;
  index: number;
  isHovered: boolean;
  setTooltipIndex: (val: number | null) => void;
  tooltipIndex: number | null;
  itemClassName?: string;
  frontClassName?: string;
  backClassName?: string;
}) => {
  const Wrapper = item.href ? "a" : "div";
  const wrapperProps = item.href
    ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
    : { onClick: item.onClick };
  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={cn("relative h-10 w-10 cursor-pointer", itemClassName)}
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setTooltipIndex(index)}
      onMouseLeave={() => setTooltipIndex(null)}
    >
      <AnimatePresence>
        {isHovered && tooltipIndex === index && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8, x: "-50%" }}
            animate={{ opacity: 1, y: -50, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.8, x: "-50%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-1/2 z-50 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-neutral-900"
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative h-full w-full"
        initial={false}
        animate={{ rotateY: isHovered ? 180 : 0 }}
        transition={{
          duration: 0.35,
          ease: "easeInOut",
          delay: index * 0.04,
        }}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* Front - Letter */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-lg bg-neutral-100 text-lg font-bold text-neutral-800 shadow-sm dark:bg-neutral-900 dark:text-neutral-200",
            frontClassName,
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          {item.letter}
        </div>
        {/* Back - Icon */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-lg bg-black text-lg text-white dark:bg-white dark:text-black",
            backClassName,
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="text-xl">{item.icon}</div>
        </div>
      </motion.div>
    </Wrapper>
  );
};

export default function SocialFlipButton({
  items = defaultItems,
  className,
  itemClassName,
  frontClassName,
  backClassName,
}: SocialFlipButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn("w-full flex items-center justify-center p-4", className)}
    >
      <div
        className="group relative flex items-center justify-center gap-2 rounded-2xl glass-border bg-transparent border border-white/10 p-4 shadow-sm dark:border-white/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setTooltipIndex(null);
        }}
      >
        {/* Animated Top Border Line */}
        <motion.div
          className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-black/50 to-transparent dark:via-white/50"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {/* Animated Bottom Border Line */}
        <motion.div
          className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-black/50 to-transparent dark:via-white/50"
          animate={{ x: ["100%", "-100%"] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {items.map((item, index) => (
          <SocialFlipNode
            key={index}
            item={item}
            index={index}
            isHovered={isHovered}
            setTooltipIndex={setTooltipIndex}
            tooltipIndex={tooltipIndex}
            itemClassName={itemClassName}
            frontClassName={frontClassName}
            backClassName={backClassName}
          />
        ))}
      </div>
    </div>
  );
}
