import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: number; // width and height of the circular logo in pixels
}

export default function Logo({ className = "", size = 36 }: LogoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  // High-Definition, scalable, perfectly crisp vector SVG representation of the Kunyah circular logo
  const renderSvg = (svgSize: string | number) => (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none pointer-events-none"
    >
      {/* PERFECT YELLOW ICON BACKGROUND CIRCLE */}
      <circle cx="250" cy="250" r="235" fill="#E8B100" />
      
      {/* STYLIZED KUNYAH CENTRAL GRAPHICS - EXACT REPLICA OF THE BRAND LOGO */}
      <g stroke="#1E1E1E" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round">
        {/* ROW 1: "kun" */}
        {/* 'k' letter */}
        <path d="M 130,130 L 130,230" />
        <path d="M 175,135 L 140,175 L 175,225" />
        <path d="M 140,175 L 180,175" />

        {/* 'u' letter */}
        <path d="M 220,130 L 220,190 C 220,215 260,215 260,190 L 260,130" />
        {/* Characteristic underline under the 'u' */}
        <path d="M 215,230 L 265,230" strokeWidth="26" />

        {/* 'n' letter */}
        <path d="M 300,230 L 300,165 C 300,135 340,135 340,165 L 340,230" />
        <path d="M 370,130 L 370,230" />

        {/* ROW 2: "yah" */}
        {/* 'y' letter (descending loop with gap and beautiful hook) */}
        <path d="M 130,270 L 130,330 C 130,355 170,355 170,330 L 170,270" />
        <path d="M 170,310 C 170,360 130,370 130,370" />

        {/* 'a' letter style */}
        <path d="M 215,315 C 215,285 255,285 255,315 C 255,345 215,345 215,315 Z" />
        <path d="M 255,285 L 255,370" />

        {/* 'h' letter */}
        <path d="M 295,370 L 295,305 C 295,275 335,275 335,305 L 335,370" />
        
        {/* Diamond accent dot typical of the custom typography */}
        <path d="M 370,270 L 370,370" />
      </g>
    </svg>
  );

  // Render method with robust fallback to SVG vector graphic if image doesn't exist
  const renderLogo = (logoSize: string | number) => {
    if (!hasImageError) {
      return (
        <img
          src="https://i.ibb.co.com/q3W0YrVZ/Gemini-Generated-Image-lkru5dlkru5dlkru.png"
          alt="Kunyah Logo"
          onError={() => setHasImageError(true)}
          style={{ width: logoSize, height: logoSize }}
          className="select-none object-contain rounded-full shadow-sm"
          referrerPolicy="no-referrer"
        />
      );
    }
    return renderSvg(logoSize);
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`cursor-pointer overflow-hidden rounded-full flex items-center justify-center hover:brightness-105 active:scale-95 transition-all duration-200 ${className}`}
        style={{ width: size, height: size }}
        title="Klik untuk memperbesar Logo"
      >
        {renderLogo("100%")}
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 cursor-zoom-out"
                style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh" }}
              >
                {/* Visual Exit Banner Indicator */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all focus:outline-none cursor-pointer z-50 animate-pulse"
                  aria-label="Tutup"
                >
                  <X className="w-6 h-6" strokeWidth={2.5} />
                </button>

                <motion.div
                  initial={{ scale: 0.85, y: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    y: 0, 
                    opacity: 1,
                    transition: { type: "spring", damping: 25, stiffness: 220 } 
                  }}
                  exit={{ scale: 0.85, y: 0, opacity: 0, transition: { duration: 0.15 } }}
                  onClick={() => setIsOpen(false)}
                  className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center justify-center gap-6 cursor-zoom-out"
                >
                  {/* Massive rendering of the logo (attempts Image, falls back to SVG) */}
                  <div className="w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] bg-white rounded-full p-[1px] shadow-2xl flex items-center justify-center relative overflow-hidden group select-none">
                    {renderLogo("100%")}
                  </div>

                  {/* Decorative Brand Text inside popup */}
                  <div className="text-center text-white pointer-events-none">
                    <h3 className="text-3xl font-black tracking-widest text-white uppercase font-sans">
                      KUNYAH<span className="text-[#E8B100]">.</span>
                    </h3>
                    <p className="text-sm text-yellow-500 font-extrabold uppercase tracking-widest mt-1.5 font-sans">
                      Hidup Sehat Berkhidmat
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
