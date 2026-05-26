import { useState, useEffect } from "react";
import { Menu, X, PhoneCall } from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Home", href: "#top" },
    { label: "Assessment", href: "#assessment" },
    { label: "Tentang Kunyah", href: "#tentang-kunyah" },
    { label: "Cara Kerja", href: "#cara-kerja" },
    { label: "Kontak", href: "#kontak" }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-md py-4 border-b border-[#F5F3EC]" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Kunyah Brand Brand Logo */}
        <div className="flex items-center gap-2.5">
          <Logo size={42} />
          <a href="#top" className="flex flex-col group select-none">
            <span className="font-sans text-lg font-black tracking-widest text-[#1E1E1E] uppercase leading-none group-hover:text-[#E8B100] transition-colors">
              KUNYAH<span className="text-[#E8B100]">.</span>
            </span>
            <span className="text-[8px] font-black text-gray-400 tracking-wider uppercase mt-1 leading-none">
              Hidup Sehat Berkhidmat
            </span>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-gray-600 hover:text-[#E8B100] transition-colors relative group py-1"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#E8B100] transition-all group-hover:w-full" />
            </a>
          ))}
          
          <a
            href="#assessment"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-100/50 hover:bg-yellow-100 text-[#E8B100] font-bold text-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Assessment Gratis
          </a>
        </nav>

        {/* Mobile Hamburger menu */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-[#E8B100] transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dynamic Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#F5F3EC] shadow-xl py-4 px-4 flex flex-col gap-3 animate-slide-up-fade">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold text-gray-700 hover:text-[#E8B100] hover:bg-[#F8F7F2] py-2 px-3 rounded-xl transition-all"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#assessment"
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (typeof window !== "undefined") {
                (window as any).triggerKunyahAssessmentStart?.();
              }
            }}
            className="w-full text-center py-3 rounded-2xl bg-[#E8B100] text-white font-bold text-sm hover:bg-[#D5A200] transition-all"
          >
            Mulai Assessment Gratis
          </a>
        </div>
      )}
    </header>
  );
}
