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
import MouseEffectBackground from "./components/MouseEffectBackground";
import AdminPage from "./pages/AdminPage";
import { ToastContainer } from "./components/Toast";

export default function App() {
  const [route, setRoute] = useState<"portfolio" | "admin">(
    window.location.hash === "#/admin" ? "admin" : "portfolio",
  );

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash === "#/admin" ? "admin" : "portfolio");
    };
    window.addEventListener("hashchange", handleHashChange);

    // Ctrl+Shift+A shortcut navigates to admin page
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        window.location.hash = "#/admin";
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleDataChange = () => {
    window.dispatchEvent(new Event("portfolio-data-updated"));
  };

  // Admin page — full separate page, no portfolio chrome
  if (route === "admin") {
    return (
      <div
        className="relative min-h-screen text-[#F4EEE8] font-sans antialiased overflow-x-hidden"
        style={{ background: "var(--page-bg)" }}
      >
        <div className="noise-overlay" />
        <AdminPage onDataChange={handleDataChange} />
        <ToastContainer />
      </div>
    );
  }

  // Main portfolio
  return (
    <div
      className="relative min-h-screen text-[#F4EEE8] font-sans antialiased overflow-x-hidden selection:bg-[#F4EEE8] selection:text-[#0B0B12]"
      style={{ background: "var(--page-bg)" }}
    >
      <MouseEffectBackground dotSpacing={32} />
      <div className="noise-overlay" />

      <Navbar />

      <main className="relative z-10 w-full flex flex-col">
        <Hero />
        <About />
        <Skills />
        <MusicSection />
        <Projects />
        <Testimonials />
        <BookCall />
      </main>

      <Footer
        onOpenAdmin={() => {
          window.location.hash = "#/admin";
        }}
      />
      <ToastContainer />
    </div>
  );
}
