import { Instagram, HelpCircle, MessageSquare, Heart } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[#F5F3EC] pt-16 pb-8" id="kontak">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Main Footer Contents */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12">
          
          {/* Logo & Vision Block */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <Logo size={36} />
              <div className="flex flex-col">
                <span className="font-sans text-base font-black tracking-widest text-[#1E1E1E] uppercase leading-none">
                  KUNYAH<span className="text-[#E8B100]">.</span>
                </span>
                <span className="text-[7px] font-black text-gray-400 tracking-wider uppercase mt-1 leading-none">
                  Hidup Sehat Berkhidmat
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
              Membantu masyarakat Indonesia mencapai berat badan ideal melalui analisis kebiasaan harian dan pola hidup realistis yang berkelanjutan. Tanpa diet ekstrem, penuh kepedulian.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-heading text-sm font-bold text-gray-800 tracking-wider uppercase flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#E8B100]" /> Program <strong className="font-bold">Kunyah</strong>
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#assessment" className="hover:text-[#E8B100] transition-colors font-medium">Diagnostic Assessment</a>
              </li>
              <li>
                <a href="#tentang-kunyah" className="hover:text-[#E8B100] transition-colors font-medium">Asal-Usul & Metodologi</a>
              </li>
              <li>
                <a href="#cara-kerja" className="hover:text-[#E8B100] transition-colors font-medium">3 Tahap Perubahan</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Brand Divider with Soft Kunyah Yellow line */}
        <div className="h-0.5 w-full bg-yellow-200/50 mb-8 rounded-full" />

        {/* Lower Banner Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium">
          <p>© {currentYear} <strong className="font-bold">Kunyah</strong> Indonesia. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-red-400 fill-current" /> untuk perubahan pola hidup sehat Indonesia.
          </p>
        </div>

      </div>
    </footer>
  );
}
