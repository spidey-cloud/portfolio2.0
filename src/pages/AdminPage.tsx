import { useEffect } from "react";
import AdminPanel from "../components/AdminPanel";

interface AdminPageProps {
  onDataChange: () => void;
}

export default function AdminPage({ onDataChange }: AdminPageProps) {
  // Set page title
  useEffect(() => {
    document.title = "Admin — Rohon Portfolio";
    return () => { document.title = "Rohon Kumar Dutta"; };
  }, []);

  const handleClose = () => {
    // Navigate back to portfolio home
    window.location.hash = "";
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <AdminPanel
        isOpen={true}
        isPage={true}
        onClose={handleClose}
        onDataChange={onDataChange}
      />
    </div>
  );
}
