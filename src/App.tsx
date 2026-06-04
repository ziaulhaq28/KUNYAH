import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AssessmentQuiz from "./components/AssessmentQuiz";
import OrderNotification from "./components/OrderNotification";
import AdminPortal from "./components/AdminPortal";
import { initScrollDepthTracker } from "./utils/tracker";
import { 
  Sparkles, 
  ChevronRight, 
  Target, 
  HelpCircle, 
  Users, 
  Smile, 
  FileText, 
  CheckCircle, 
  Send, 
  Clock, 
  Coffee, 
  Moon, 
  Flame, 
  Heart 
} from "lucide-react";

export default function App() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Auto detect if user is loading the app with ?admin=true & Init Scroll/PageView Tracker
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "true") {
        setIsAdminOpen(true);
      }
      
      // Initialize scroll tracker and initial page view event log
      initScrollDepthTracker();
    }
  }, []);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const problemCards = [
    {
      id: 1,
      title: "Sudah coba diet tapi gagal?",
      desc: "Membatasi makan mati-matian hanya membuat metabolisme melambat dan memicu nafsu makan balas dendam.",
    },
    {
      id: 2,
      title: "Berat cepat naik lagi?",
      desc: "Efek yoyo terjadi karena tubuh belum mengadaptasi perubahan sebagai identitas kebiasaan harian yang permanen.",
    },
    {
      id: 3,
      title: "Sulit konsisten harian?",
      desc: "Metode yang terlalu ekstrem & kaku mengabaikan realita kesibukan profesi dan ritme kehidupan sosialmu.",
    },
    {
      id: 4,
      title: "Bingung mulai dari mana?",
      desc: "Terlalu banyak mitos diet yang simpang siur. Kamu tidak butuh suplemen mahal, melainkan kejelasan pola.",
    }
  ];

  const educationPillars = [
    {
      icon: Flame,
      title: "Pola & Waktu Makan",
      desc: "Bukan sekadar memotong kalori secara drastis, tapi mengatur distribusi nutrisi agar hormon kenyang tetap optimal."
    },
    {
      icon: Moon,
      title: "Durasi & Kualitas Tidur",
      desc: "Kurang tidur memicu hormon Ghrelin (pemicu lapar) naik hingga 25% dan menurunkan metabolisme pembakaran."
    },
    {
      icon: Coffee,
      title: "Manajemen Stres & Energi",
      desc: "Hormon kortisol yang tinggi mendorong tubuh menyimpan lemak cadangan, terutama di area perut."
    },
    {
      icon: Heart,
      title: "Konsistensi Tanpa Beban",
      desc: "Membangun kebiasaan kecil (micro-habits) yang menyatu alami dengan jadwal kesibukan harianmu."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Isi Assessment",
      desc: "Jawab beberapa pertanyaan ringkas mengenai kebiasaan tidur, makan malam, tingkat aktivitas, dan tantangan terbesarmu saat ini."
    },
    {
      num: "02",
      title: "Hasil Instan",
      desc: "Begitu seluruh pertanyaan selesai dijawab, hasil analisis & penilaian awal profil kesehatan harian Anda akan langsung tampil di layar."
    },
    {
      num: "03",
      title: "Diskusi Bebas",
      desc: "Gunakan hasil analisis Anda untuk berdiskusi langsung dan berkonsultasi secara santai bersama Coach melalui WhatsApp tanpa paksaan."
    }
  ];

  const faqs = [
    {
      q: "Apakah assessment ini berbayar?",
      a: (
        <>
          100% Gratis. Misi <strong className="font-bold">Kunyah</strong> adalah memetakan hambatan kesehatan utama sebelum menyarankan solusi atau perubahan pola hidup terbaik.
        </>
      )
    },
    {
      q: "Berapa lama saya akan mendapatkan hasil analisis?",
      a: (
        <>
          Hasil diagnosis awal langsung tersaji secara instan di layar begitu Anda menekan tombol kirim. Anda dapat melanjutkannya dengan diskusi interaktif bersama Coach <strong className="font-bold">Kunyah</strong> kapan saja.
        </>
      )
    },
    {
      q: "Apakah data WhatsApp saya akan aman?",
      a: (
        <>
          Sangat aman. Kami menjamin kerahasiaan data privasi Anda. Kami tidak pernah membagikan atau menjual nomor Anda ke platform pihak ketiga mana pun.
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#E8B100]/25 selection:text-[#1E1E1E]" id="top">
      {/* Premium Header Menu */}
      <Header />

      <main className="pt-14 flex-1">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-10 pb-16 md:pt-14 md:pb-20 bg-[#F8F7F2]">
          {/* Subtle Decorative Yellow Orb background */}
          <div className="absolute top-1/4 right-[-10%] w-[400px] h-[400px] rounded-full bg-[#F2B705]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-[-5%] w-[300px] h-[300px] rounded-full bg-[#E8B100]/5 blur-3xl pointer-events-none" />

          <div className="w-full max-w-4xl mx-auto px-4 md:px-8 text-center flex flex-col items-center space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold tracking-wider rounded-full uppercase">
              <Sparkles className="w-3" /> Realistis • Berkelanjutan • Teruji
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-[#1E1E1E] leading-tight max-w-3xl">
              Berat Badan Sulit Turun Meski Merasa Sudah Menjaga Makan?
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl font-light">
              Temukan pola hidup yang mungkin menghambat progressmu melalui assessment sederhana bersama <strong className="font-bold text-gray-800">Kunyah</strong>.
            </p>

            <div className="flex flex-col items-center">
              <a
                href="#assessment"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    (window as any).triggerKunyahAssessmentStart?.();
                  }
                }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#E8B100] text-white font-extrabold rounded-2xl hover:bg-[#D5A200] transition-all duration-200 shadow-lg shadow-yellow-500/10 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Mulai Assessment Gratis
                <ChevronRight className="w-5 h-5 stroke-[3px]" />
              </a>
              <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Hanya butuh waktu 2 menit • Gratis selamanya
              </p>
            </div>
          </div>
        </section>

        {/* EMPATHY SECTION */}
        <section className="py-20 md:py-28 bg-white border-b border-[#F5F3EC]" id="tentang-kunyah">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-[#E8B100] tracking-wider uppercase">Your Personal Struggle</span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1E1E1E] tracking-tight">
                Mungkin ini yang sedang kamu alami…
              </h2>
              <p className="text-sm md:text-base text-gray-500">
                Menghadapi tantangan berat badan adalah proses emosional. Kamu tidak sendirian dalam perjalanan ini.
              </p>
            </div>

            {/* Problem card grids - Enhanced Premium Clean Border Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {problemCards.map((card) => (
                <div 
                  key={card.id}
                  className="bg-[#FAFAF9] p-6 lg:p-7 rounded-3xl border border-gray-150/80 shadow-sm hover:shadow-md hover:border-yellow-250 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <span className="w-10 h-10 rounded-2xl bg-yellow-50 text-base font-black text-[#E8B100] font-heading flex items-center justify-center border border-yellow-100/60 group-hover:bg-[#E8B100] group-hover:text-white transition-colors">
                      {card.id}
                    </span>
                    <h3 className="text-base font-bold font-heading text-[#1E1E1E] leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-[12px] md:text-xs text-gray-500 leading-relaxed font-light">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 max-w-xl mx-auto">
              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                📢 <span className="text-[#E8B100] font-bold">Banyak orang bukan kurang niat</span> — tapi hanya belum memahami dengan tepat bagaimana pola hidup unik mereka sendiri berinteraksi.
              </p>
            </div>
          </div>
        </section>

        {/* MINI EDUCATION SECTION */}
        <section className="py-20 md:py-24 bg-[#F8F7F2]">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left explanation block */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-bold text-[#E8B100] tracking-wider uppercase">Scientific Approach</span>
                <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1E1E1E] leading-tight">
                  Menurunkan berat badan bukan hanya soal makan lebih sedikit.
                </h2>
                <p className="text-base text-gray-500 leading-relaxed font-light">
                  Metabolisme tubuh manusia adalah sistem adaptasi yang cerdas. Menghukum diri sendiri dengan kelaparan hanya merusak regulasi hormonal harianmu. <strong className="font-bold text-gray-800">Kunyah</strong> berfokus memperbaiki pilar-pilar penting ini:
                </p>
                <div className="p-5 bg-[#F5F3EC] rounded-2xl border border-white/50 text-xs text-gray-600 italic">
                  "Saat semua elemen ritme hidup selaras, pengelolaan berat badan akan berjalan otomatis tanpa stres berlebih."
                </div>
              </div>

              {/* Right infographic block */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {educationPillars.map((pillar, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-[#F5F3EC] shadow-sm space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <pillar.icon className="w-5 h-5 text-[#E8B100]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-heading text-[#1E1E1E]">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* FOUNDER BRAND TRUST SECTION */}
        <section className="py-20 md:py-24 bg-white">
          <div className="w-full max-w-5xl mx-auto px-4 md:px-8 bg-[#F8F7F2] rounded-[48px] p-8 md:p-14 border border-[#F5F3EC] shadow-inner grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            
            {/* Founder Avatar badge visual representation with Image and Fallback SVG */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full bg-white shadow-md p-[2px] border-2 border-[#E8B100] overflow-hidden flex items-center justify-center">
                  <img 
                    src="https://i.ibb.co.com/q3jXFGBG/drg-Muhammad-Syafaat-1.jpg" 
                    alt="drg. Muhammad Syafaat" 
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallbackDiv) {
                        fallbackDiv.classList.remove('hidden');
                        fallbackDiv.classList.add('flex');
                      }
                    }}
                  />
                  <div className="hidden w-full h-full rounded-full bg-yellow-50 overflow-hidden items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-28 h-28 text-gray-600 mt-4">
                      <circle cx="50" cy="40" r="22" className="fill-yellow-100" />
                      <path d="M50 18c6 0 11 5 11 11s-5 11-11 11-11-5-11-11 5-11 11-11z" fill="#E8B100" />
                      <path d="M50 67c-18 0-30 8-30 18v2h60v-2c0-10-12-18-30-18z" fill="#1E1E1E" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote details */}
            <div className="md:col-span-8 space-y-4">
              <span className="text-xs font-bold text-[#E8B100] tracking-wider uppercase">Pesan dari Founder</span>
              <h3 className="text-xl md:text-2xl font-extrabold font-heading text-[#1E1E1E] leading-snug">
                "Pendekatan <strong className="font-bold text-[#1E1E1E]">Kunyah</strong> berfokus pada pola hidup harian yang realistis, tanpa diet ekstrem yang menyiksa."
              </h3>
              
              <div className="space-y-0.5">
                <p className="text-sm font-black text-gray-800">drg. Muhammad Syafaat</p>
                <p className="text-xs text-gray-400 font-medium">Healthy Productivity Coach & Founder <strong className="font-bold">Kunyah</strong></p>
              </div>

              <div className="space-y-3 text-xs md:text-sm text-gray-500 leading-relaxed font-light">
                <p>
                  Sebagai seorang praktisi medis sekaligus productivity coach, saya menyadari bahwa kesehatan tidak bisa dipisahkan dari produktivitas kerja harian. Banyak orang gagal bukan karena kurang kemauan, namun karena program diet yang terlalu ekstrem sehingga mengganggu konsentrasi hidup produktif sehari-hari.
                </p>
                <p>
                  Oleh karena itu, kami menghadirkan <strong className="font-bold text-gray-800">Kunyah</strong> (atau <strong className="font-bold text-gray-800">Kunyahlicious</strong>), program edukasi dan pendampingan pola makan sehat yang berfokus membantu Anda mencapai berat badan ideal tanpa diet ekstrem dan tanpa rasa kelaparan menyiksa. Melalui metode yang lebih intuitif, kami membimbing Anda memperbaiki kebiasaan mengunyah serta pola makan agar selaras dengan kesibukan harian Anda secara alami.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-20 bg-[#F8F7F2]" id="cara-kerja">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-[#E8B100] tracking-wider uppercase">Prosedur Simpel</span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1E1E1E] tracking-tight">
                Bagaimana Assessment Ini Bekerja?
              </h2>
              <p className="text-sm md:text-base text-gray-500">
                Proses diagnosis tanpa hambatan, dirancang khusus untuk kenyamanan dan privasi kamu.
              </p>
            </div>

            {/* Steps graphics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector dot line layout desktop */}
              <div className="hidden md:block absolute top-[20%] left-[15%] right-[15%] h-0.5 bg-yellow-200/50 -z-10" />

              {steps.map((st, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl border border-[#F5F3EC] shadow-sm flex flex-col justify-between items-start space-y-4">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-3xl font-heading font-black text-yellow-100">{st.num}</span>
                    <span className="px-2.5 py-1 rounded bg-yellow-50 text-[#E8B100] text-3xs font-extrabold uppercase tracking-wide">
                      Tahap {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-heading text-[#1E1E1E]">{st.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ASSESSMENT WIDGET COMPONENT (MOST IMPORTANT FOR AD CONVERSION) */}
        <section className="py-20 md:py-28 bg-[#FDFBF7] border-y border-yellow-100 relative" id="assessment">
          <div className="absolute inset-0 bg-radial from-yellow-500/[0.03] via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <AssessmentQuiz />
          </div>
        </section>

        {/* EXPECTATIONS SECTION */}
        <section className="py-16 md:py-20 bg-[#F8F7F2] border-t border-[#F5F3EC]">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-8 text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto text-[#E8B100]">
              <FileText className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#1E1E1E] tracking-tight">
              Apa yang terjadi setelah assessment dikirim?
            </h2>

            <p className="text-sm md:text-base text-gray-750 leading-relaxed max-w-2xl mx-auto font-medium">
              Setelah seluruh pertanyaan selesai dijawab, hasil penilaian profil kesehatan awal Anda akan langsung tampil di kolom di atas. Kami harap Anda <span className="font-semibold text-gray-900">membaca hasil analisis tersebut secara langsung</span>, lalu <span className="font-bold text-[#E8B100]">mengeklik tombol submit untuk terhubung otomatis dengan Admin <strong className="font-bold">Kunyah</strong> di WhatsApp</span> untuk mendalami detail rekomendasi solusi terbaik bagi Anda.
            </p>

            <p className="text-xs text-gray-400 font-medium">
              Tenang saja, langkah ini 100% gratis, nyaman, dan kerahasiaan data harian Anda sepenuhnya terjamin aman.
            </p>
          </div>
        </section>

        {/* SHORT INFORMATIONAL FAQ SECTION */}
        <section className="py-20 bg-white">
          <div className="w-full max-w-3xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold text-[#E8B100] tracking-wider uppercase">Pertanyaan Umum</span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#1E1E1E]">FAQ Assessment <strong className="font-bold">Kunyah</strong></h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="border border-gray-150 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left py-4 px-5 bg-[#F8F7F2] hover:bg-yellow-50/50 flex justify-between items-center transition-all cursor-pointer font-bold text-sm text-gray-800"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[#E8B100] font-black text-lg select-none">
                      {faqOpen === idx ? "−" : "+"}
                    </span>
                  </button>
                  {faqOpen === idx && (
                    <div className="py-4 px-5 bg-white border-t border-gray-100 text-xs text-gray-500 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <Footer onAdminClick={() => setIsAdminOpen(true)} />
      <OrderNotification />

      {/* Admin Portal Overlay */}
      {isAdminOpen && (
        <AdminPortal onClose={() => setIsAdminOpen(false)} />
      )}
    </div>
  );
}
