import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import MusicSection from "./components/MusicSection";
import Projects from "./components/Projects";
import Testimonials from "./components/Testimonials";
import BookCall from "./components/BookCall";
import Footer from "./components/Footer";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  useEffect(() => {
    // Listen for Ctrl+Shift+A shortcut to open the admin panel securely
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleDataChange = () => {
    // Fire event to notify all components to re-sync data
    window.dispatchEvent(new Event("portfolio-data-updated"));
  };

  return (
    <div className="relative min-h-screen bg-[#0B0B12] text-[#F4EEE8] font-sans antialiased overflow-x-hidden selection:bg-[#F4EEE8] selection:text-[#0B0B12]">
      {/* Absolute Film Grain Noise Overlay (3% Opacity, Globally Applied) */}
      <div className="noise-overlay" />

      {/* Main Structural Layout */}
      <Navbar />
      
      <main className="relative z-10 w-full flex flex-col">
        {/* Hero Section (100vh) */}
        <Hero />

        {/* About Section */}
        <About />

        {/* Skills Section */}
        <Skills />

        {/* Recommended Songs Horizontal Gallery */}
        <MusicSection />

        {/* Projects Alternating Cards Section */}
        <Projects />

        {/* Testimonials Grid Section */}
        <Testimonials />

        {/* Book A Call (Cal.com Mockup Calendar) */}
        <BookCall />
      </main>

      {/* Massive LET'S TALK Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Admin Panel Overlay */}
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onDataChange={handleDataChange} 
      />
    </div>
  );
}
