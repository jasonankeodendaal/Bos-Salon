import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dbSubscribeToDoc } from "../../utils/dbAdapter";

import PhotographyHome from "./PhotographyHome";
import PhotographyLibrary from "./PhotographyLibrary";
import PhotographyBooking from "./PhotographyBooking";
import PhotographyHeader from "./PhotographyHeader";
import PhotographyFooter from "./PhotographyFooter";

interface Props {
  view: "home" | "library" | "booking";
  onNavigateHome: () => void;
  onNavigateAdmin?: () => void;
}

const PhotographyApp: React.FC<Props> = ({
  view,
  onNavigateHome,
  onNavigateAdmin,
}) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<
    "home" | "library" | "booking"
  >(view);

  useEffect(() => {
    setCurrentView(view);
  }, [view]);

  const handleNavigate = (newView: "home" | "library" | "booking") => {
    navigate(`/magicalmemories/${newView}`);
    setCurrentView(newView);
  };

  const [settings, setSettings] = useState<any>(() => {
    try {
      const cached = localStorage.getItem("photography_settings_cache");
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(
    () => !localStorage.getItem("photography_settings_cache"),
  );

  useEffect(() => {
    const unsub = dbSubscribeToDoc("settings", "photography", (data) => {
      if (data) {
        setSettings(data);
        localStorage.setItem(
          "photography_settings_cache",
          JSON.stringify(data),
        );
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-stone-300">
        <p className="animate-pulse tracking-widest text-sm uppercase">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans selection:bg-stone-300 selection:text-black overflow-x-hidden relative"
      style={{
        backgroundColor: "#0a0a0a",
        color: "#e5e5e5",
        fontFamily: settings.theme?.fontSans || "Inter, sans-serif",
      }}
    >
      <style>{`
        @keyframes float-3d {
            0% { transform: translateY(110vh) rotate(0deg) scale(0.8); opacity: 0; }
            10% { opacity: 0.35; }
            90% { opacity: 0.35; }
            100% { transform: translateY(-20vh) rotate(360deg) scale(1.2); opacity: 0; }
        }
        .float-icon {
            position: absolute;
            animation: float-3d linear infinite;
            filter: drop-shadow(0 15px 25px rgba(255,255,255,0.15)) grayscale(10%) brightness(1.5) contrast(2.5) saturate(1.2);
            will-change: transform;
        }
        @keyframes flash-bulb {
            0%, 90% { opacity: 0; transform: scale(0.8); }
            92% { opacity: 0.35; transform: scale(1.5); filter: blur(8px); }
            95% { opacity: 0; transform: scale(3); filter: blur(25px); }
            96% { opacity: 0.15; transform: scale(1.2); filter: blur(15px); }
            98%, 100% { opacity: 0; transform: scale(1); }
        }
        .flash-bg {
            background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%);
            animation: flash-bulb 14s infinite;
        }
        .flash-bg-2 {
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(200,200,255,0) 60%);
            animation: flash-bulb 21s infinite;
            animation-delay: -8s;
        }
        .flash-bg-3 {
            background: radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 65%);
            animation: flash-bulb 17s infinite;
            animation-delay: -3s;
        }
      `}</style>

      {/* Background ambient light effects & Floating Icons */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] -ml-[200px] -mt-[200px] rounded-full flash-bg mix-blend-screen"></div>
        <div className="absolute top-[40%] right-[20%] w-[500px] h-[500px] -mr-[250px] -mt-[250px] rounded-full flash-bg-2 mix-blend-screen"></div>
        <div className="absolute top-[70%] left-[15%] w-[350px] h-[350px] -ml-[175px] -mt-[175px] rounded-full flash-bg-3 mix-blend-screen"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-stone-800/10 blur-[140px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-stone-400/5 blur-[120px]"></div>

        {[...Array(15)].map((_, i) => {
          const baseLeft = (i / 15) * 100;
          const width = 60 + (i % 3) * 20; // 60px to 100px
          const duration = 40 + (i % 5) * 8; // 40s to 72s
          const delay = -(i * 11); // stagger delays so they are all at different heights

          return (
            <img
              key={i}
              src="https://i.ibb.co/MkyWFbQ6/Gemini-Generated-Image-removebg-preview.png"
              alt=""
              className="float-icon"
              style={{
                left: `${baseLeft}%`,
                width: `${width}px`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                zIndex: 0,
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <PhotographyHeader
          settings={settings}
          currentView={currentView}
          onNavigate={handleNavigate}
          onNavigateBosSalon={onNavigateHome}
        />

        <main className="flex-grow pt-32 pb-20 w-full">
          {currentView === "home" && <PhotographyHome settings={settings} onNavigate={handleNavigate} />}
          {currentView === "library" && (
            <div className="max-w-[1000px] mx-auto px-4 md:px-8">
              <PhotographyLibrary settings={settings} />
            </div>
          )}
          {currentView === "booking" && (
            <div className="max-w-[1000px] mx-auto px-4 md:px-8">
              <PhotographyBooking settings={settings} />
            </div>
          )}
        </main>

        <PhotographyFooter
          settings={settings}
          onNavigateAdmin={onNavigateAdmin}
        />
      </div>
    </div>
  );
};

export default PhotographyApp;
