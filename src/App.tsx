import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AssessmentQuiz from "./components/AssessmentQuiz";
import OrderNotification from "./components/OrderNotification";
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
      title: "Analisis Profil",
      desc: "Tim Coach Kunyah mempelajari kecenderungan pola hidupmu secara holistik untuk mengidentifikasi hambatan utamanya."
    },
    {
      num: "03",
      title: "Dapatkan Insight",
      desc: "Terima umpan balik personal dan actionable strategis langsung via obrolan WhatsApp tanpa drama penjualan yang agresif."
    }
  ];

  const faqs = [
    {
      q: "Apakah assessment ini berbayar?",
      a: "100% Gratis. Misi Kunyah adalah memetakan hambatan kesehatan utama masyarakat urban Indonesia sebelum menyarankan solusi jangka panjang."
    },
    {
      q: "Berapa lama saya akan mendapatkan hasil analisis?",
      a: "Dokumen insight personal biasanya dipelajari dan dikirimkan oleh tim Coach Kunyah dalam waktu 15-30 menit setelah pengiriman di jam kerja harian."
    },
    {
      q: "Apakah data WhatsApp saya akan aman?",
      a: "Sangat aman. Kami menjamin kerahasiaan data privasi Anda. Kami tidak pernah membagikan atau menjual nomor Anda ke platform pihak ketiga mana pun."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#E8B100]/25 Selection:text-[#1E1E1E]" id="top">
      {/* Premium Header Menu */}
      <Header />

      <main className="pt-24 flex-1">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-16 md:py-24 bg-[#F8F7F2]">
          {/* Subtle Decorative Yellow Orb background */}
          <div className="absolute top-1/4 right-[-10%] w-[400px] h-[400px] rounded-full bg-[#F2B705]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-[-5%] w-[300px] h-[300px] rounded-full bg-[#E8B100]/5 blur-3xl pointer-events-none" />

          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Column Copywriting */}
            <div className="md:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold tracking-wider rounded-full uppercase">
                <Sparkles className="w-3" /> Realistis • Berkelanjutan • Teruji
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-[#1E1E1E] leading-tight">
                Berat Badan Sulit Turun Meski Merasa Sudah Menjaga Makan?
              </h1>
              
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl font-light">
                Temukan pola hidup yang mungkin menghambat progressmu melalui assessment sederhana bersama <span className="font-semibold text-gray-800">Kunyah</span>.
              </p>

              <div>
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
                <p className="text-xs text-gray-400 mt-2.5 pl-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Hanya butuh waktu 2 menit • Gratis selamanya
                </p>
              </div>
            </div>

            {/* Right Column Founder Trust & Lifestyle Image wrapper */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[380px] aspect-[4/5] bg-[#F5F3EC] rounded-[40px] p-6 shadow-2xl border border-white flex flex-col justify-between overflow-hidden">
                {/* Floating Aesthetic Tag */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm shadow px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-3xs font-bold uppercase tracking-wider text-[#1E1E1E]">
                  <span className="w-2 h-2 rounded-full bg-[#E8B100] animate-pulse" /> Community First
                </div>

                {/* Minimalist Illustration/Placeholder of Lifestyle Coach */}
                <div className="my-auto flex flex-col items-center justify-center text-center py-6 space-y-4">
                  <div className="w-24 h-24 rounded-full bg-white shadow-inner flex items-center justify-center border-3 border-yellow-100">
                    {/* SVG Avatar with soft lighting representing coach drg. Muhammad Syafaat */}
                    <svg viewBox="0 0 100 100" className="w-16 h-16 text-gray-600">
                      <circle cx="50" cy="40" r="22" className="fill-yellow-100" />
                      <path d="M50 18c6 0 11 5 11 11s-5 11-11 11-11-5-11-11 5-11 11-11z" fill="#E8B100" />
                      <path d="M50 67c-18 0-30 8-30 18v2h60v-2c0-10-12-18-30-18z" fill="#222222" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-extrabold text-[#1E1E1E]">drg. Muhammad Syafaat</h3>
                    <p className="text-3xs text-yellow-800 font-semibold uppercase tracking-wider">Healthy Productivity Coach</p>
                    <p className="text-xs text-gray-400 mt-1">Founder Kunyah</p>
                  </div>
                </div>

                {/* Micro Testimony Badge */}
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl border border-yellow-100 shadow-sm">
                  <p className="text-2xs text-gray-600 leading-relaxed italic">
                    "Kunci keberhasilan kesehatan jangka panjang terletak pada keselarasan ritme hidup sehari-hari, bukan dari penderitaan diet sekejap."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EMPATHY SECTION */}
        <section className="py-20 md:py-24 bg-white" id="tentang-kunyah">
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

            {/* Problem card grids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {problemCards.map((card) => (
                <div 
                  key={card.id}
                  className="bg-[#F8F7F2] p-6 rounded-3xl border border-[#F5F3EC] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <span className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center text-lg font-black text-[#E8B100] font-heading">
                      {card.id}
                    </span>
                    <h3 className="text-lg font-bold font-heading text-[#1E1E1E] leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 max-w-xl mx-auto">
              <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed">
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
                  Metabolisme tubuh manusia adalah sistem adaptasi yang cerdas. Menghukum diri sendiri dengan kelaparan hanya merusak regulasi hormonal harianmu. Kunyah berfokus memperbaiki pilar-pilar penting ini:
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
            
            {/* Founder Avatar badge visual representation */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full bg-white shadow-md p-2 border-3 border-[#E8B100]">
                  <div className="w-full h-full rounded-full bg-yellow-50 overflow-hidden flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-28 h-28 text-gray-600 mt-4">
                      <circle cx="50" cy="40" r="22" className="fill-yellow-100" />
                      <path d="M50 18c6 0 11 5 11 11s-5 11-11 11-11-5-11-11 5-11 11-11z" fill="#E8B100" />
                      <path d="M50 67c-18 0-30 8-30 18v2h60v-2c0-10-12-18-30-18z" fill="#1E1E1E" />
                    </svg>
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-100 text-[#E8B100] border border-yellow-250 py-1 px-4 rounded-full text-3xs font-extrabold uppercase whitespace-nowrap tracking-wider shadow">
                  Trusted Coach
                </div>
              </div>
            </div>

            {/* Quote details */}
            <div className="md:col-span-8 space-y-6">
              <span className="text-xs font-bold text-[#E8B100] tracking-wider uppercase">Pesan dari Founder</span>
              <h3 className="text-2xl md:text-3xl font-extrabold font-heading text-[#1E1E1E] leading-snug">
                "Pendekatan Kunyah berfokus pada pola hidup harian yang realistis, tanpa diet ekstrem yang menyiksa."
              </h3>
              
              <div className="space-y-1">
                <p className="text-sm font-black text-gray-800">drg. Muhammad Syafaat</p>
                <p className="text-xs text-gray-400 font-medium">Healthy Productivity Coach & Founder Kunyah</p>
              </div>

              <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-light">
                Sebagai seorang praktisi medis sekaligus productivity coach, saya menyadari bahwa kesehatan tidak bisa dipisahkan dari produktivitas kerja harian. Banyak yang gagal bukan karena kurang kemauan, namun karena program yang mereka jalani terlalu menyiksa dan mengganggu konsentrasi hidup produktif. Bersama Kunyah, kita ciptakan langkah transisi yang mulus.
              </p>
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
        <section className="py-20 md:py-28 bg-white" id="assessment">
          <AssessmentQuiz />
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

            <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto font-light">
              Tim Coach Kunyah akan mempelajari seluruh jawaban profil kesehatanmu secara seksama. Kami kemudian akan langsung menghubungi kamu secara santai melalui WhatsApp untuk membagikan <span className="font-semibold text-gray-800">insight awal terpersonalisasi</span> yang relevan dengan kondisi dan kendala pola hidupmu saat ini.
            </p>

            <p className="text-xs text-gray-400 font-medium">
              Tenang saja, tidak ada paksaan berlangganan ataupun spam telepon penjualan yang mengganggu ketenangan Anda.
            </p>
          </div>
        </section>

        {/* SHORT INFORMATIONAL FAQ SECTION */}
        <section className="py-20 bg-white">
          <div className="w-full max-w-3xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold text-[#E8B100] tracking-wider uppercase">Pertanyaan Umum</span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#1E1E1E]">FAQ Assessment Kunyah</h2>
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
      <Footer />
      <OrderNotification />
    </div>
  );
}
