import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("portfolio-theme") as "dark" | "light") || "dark"
      );
    }
    return "dark";
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 w-full h-[90px] z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-500 ${
        isScrolled
          ? theme === "light"
            ? "bg-white/70 backdrop-blur-md border-b border-black/5"
            : "bg-[#0B0B12]/80 backdrop-blur-md border-b border-white/5"
          : theme === "light"
            ? "bg-white/30 backdrop-blur-sm"
            : "bg-transparent"
      }`}
    >
      {/* Left: Book A Call Button & Theme Toggle */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => handleScrollTo("book-a-call")}
          className={`border px-6 py-2.5 rounded-full uppercase text-xs font-semibold tracking-wider transition-all duration-300 ${
            theme === "light"
              ? "border-black/20 bg-[#0F0F16] text-[#FAF8F5] shadow-sm shadow-black/10 hover:bg-[#1B1C23]"
              : "border-white/40 text-[#F4EEE8] bg-transparent hover:bg-[#F4EEE8] hover:text-[#0B0B12]"
          }`}
        >
          Book A Call
        </button>

        <button
          onClick={toggleTheme}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            theme === "light"
              ? "border-black/10 text-[#0B0B12] bg-white/5 hover:bg-white/10"
              : "border-white/10 text-[#F4EEE8] bg-white/5 hover:bg-white/10"
          }`}
          title={
            theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Right: Menu Links */}
      <div className="flex items-center gap-6 md:gap-8 text-s font-medium tracking-wider text-[#F4EEE8]">
        <button
          onClick={() => handleScrollTo("about")}
          className="relative py-1 cursor-pointer group uppercase text-[#A8A8B0] hover:text-[#F4EEE8] transition-colors hidden sm:block"
        >
          About
          <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#F4EEE8] transition-all duration-300 group-hover:w-full" />
        </button>

        <button
          onClick={() => handleScrollTo("projects")}
          className="relative py-1 cursor-pointer group uppercase text-[#A8A8B0] hover:text-[#F4EEE8] transition-colors hidden sm:block"
        >
          Projects
          <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#F4EEE8] transition-all duration-300 group-hover:w-full" />
        </button>

        <a
          href="https://linkedin.com/in/rohon-kumar-dutta"
          target="_blank"
          rel="noopener noreferrer"
          className="relative py-1 cursor-pointer group uppercase text-[#A8A8B0] hover:text-[#F4EEE8] transition-colors"
        >
          LinkedIn
          <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#F4EEE8] transition-all duration-300 group-hover:w-full" />
        </a>
      </div>
    </nav>
  );
}
