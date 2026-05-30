import { useState, ChangeEvent, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  User, 
  Phone,
  X,
  Brain,
  RotateCcw,
  Calendar,
  Compass,
  ChevronDown
} from "lucide-react";

export interface AssessmentAnswers {
  goal: string;
  challenge: string;
  activity: string;
  sleep: string;
  dinner: string;
  name: string;
  whatsapp: string;
}

const QUESTIONS = [
  {
    id: "goal",
    question: "Apa tujuan utama perjalanan kesehatanmu saat ini?",
    subtitle: "Kami menyesuaikan analisis berdasarkan prioritas terpenting kamu.",
    type: "select",
    options: [
      { value: "turun BB", label: "Menurunkan Berat Badan", desc: "Mencapai berat ideal secara sehat dan konsisten" },
      { value: "hidup sehat", label: "Mulai Hidup Lebih Sehat", desc: "Membangun kebiasaan harian yang lebih bugar" },
      { value: "energi tubuh", label: "Meningkatkan Energi Tubuh", desc: "Mengatasi rasa cepat lelah dan lesu sepanjang hari" },
      { value: "menjaga kesehatan", label: "Menjaga Kesehatan Jangka Panjang", desc: "Pencegahan penyakit & menjaga imunitas tubuh" }
    ]
  },
  {
    id: "challenge",
    question: "Apa tantangan terbesar yang sering membuatmu kesulitan?",
    subtitle: "Mengenali rintangan adalah langkah awal dalam merancang solusi realistis.",
    type: "select",
    options: [
      { value: "gagal diet", label: "Diet Selalu Gagal di Tengah Jalan", desc: "Sudah mencoba berbagai metode tapi belum berhasil" },
      { value: "mudah lapar", label: "Mudah Tergoda & Sering Lapar", desc: "Cravings berlebih, terutama saat stress atau malam hari" },
      { value: "sulit konsisten", label: "Sulit Menjaga Konsistensi", desc: "Semangat di awal, namun sulit mempertahankan rutinitas" },
      { value: "bingung mulai", label: "Bingung Harus Mulai dari Mana", desc: "Terlalu banyak informasi yang simpang siur di luar sana" }
    ]
  },
  {
    id: "activity",
    question: "Bagaimana gambaran aktivitas harianmu?",
    subtitle: "Ini mendefinisikan pengeluaran energi alamiah tubuhmu.",
    type: "select",
    options: [
      { value: "dominan duduk", label: "Dominan Duduk / Sedentary", desc: "Bekerja di meja, jarang berolahraga atau berjalan kaki" },
      { value: "aktif ringan", label: "Aktif Ringan", desc: "Banyak berjalan santai, beres-beres, sesekali olahraga" },
      { value: "aktif tinggi", label: "Aktif Tinggi / Intens", desc: "Pekerjaan fisik berat atau rutin olahraga intensif 3-5x seminggu" }
    ]
  },
  {
    id: "sleep",
    question: "Berapa jam rata-rata durasi tidurmu setiap malam?",
    subtitle: "Tidur sangat berpengaruh terhadap regulasi hormon rasa lapar (Ghrelin & Leptin).",
    type: "select",
    options: [
      { value: "kurang dari 5 jam", label: "Kurang dari 5 Jam", desc: "Sering begadang atau kualitas tidur kurang nyenyak" },
      { value: "5–7 jam", label: "Sedang (5 - 7 Jam)", desc: "Cukup stabil namun terkadang masih merasa lelah" },
      { value: "lebih dari 7 jam", label: "Ideal (Lebih dari 7 Jam)", desc: "Kebutuhan tidur tercukupi dengan baik & bangun segar" }
    ]
  },
  {
    id: "dinner",
    question: "Berapa sering kamu makan berat mendekati waktu tidur malam?",
    subtitle: "Pola makan malam berimplikasi langsung terhadap proses metabolisme tubuh di malam hari.",
    type: "select",
    options: [
      { value: "sering", label: "Sering (Hampir setiap hari)", desc: "Makan berat kurang dari 2 jam sebelum tidur" },
      { value: "kadang", label: "Kadang-kadang (2-3x seminggu)", desc: "Tergantung tingkat lapar atau acara sosial" },
      { value: "jarang", label: "Jarang / Hampir Tidak Pernah", desc: "Makan malam selesai minimal 3-4 jam sebelum tidur" }
    ]
  },
  {
    id: "name",
    question: "Siapa nama lengkap atau panggilanmu?",
    subtitle: (
      <>
        Agar tim Coach <strong className="font-bold text-gray-800">Kunyah</strong> bisa menyapamu dengan lebih personal.
      </>
    ),
    type: "text",
    placeholder: "Tulis nama panggilanmu di sini...",
    icon: User
  },
  {
    id: "whatsapp",
    question: "Berapa nomor WhatsApp aktif milikmu?",
    subtitle: (
      <>
        Hasil penilaian awal profil harian Anda akan langsung tampil secara instan di layar begitu Anda menekan tombol di bawah.
      </>
    ),
    type: "tel",
    placeholder: "Contoh: 0812XXXXXXXX / 62812XXXXXXXX",
    icon: Phone
  }
];

const CATEGORIES = [
  {
    id: "emotional-eating",
    title: "Emotional / Stress Eating",
    desc: "Sulit mengontrol makan karena stres, craving, atau tekanan emosional.",
    subtitle: "Pola makan tak terkendali dipicu situasi mental & emosional"
  },
  {
    id: "diet-gagal",
    title: "Diet Gagal Berulang",
    desc: "Sudah mencoba berbagai cara namun hasil belum konsisten atau bertahan.",
    subtitle: "Metode ekstrem yang memangkas asupan tanpa membentuk kebiasaan harian"
  },
  {
    id: "sibuk-konsisten",
    title: "Sibuk Sulit Konsisten",
    desc: "Ingin berubah namun aktivitas dan ritme hidup membuat pola sehat sulit dipertahankan.",
    subtitle: "Keterbatasan waktu & manajemen aktivitas menantang kedisiplinan diri"
  },
  {
    id: "bingung-memulai",
    title: "Bingung Memulai",
    desc: "Ingin hidup lebih sehat tetapi belum tahu langkah yang paling sesuai.",
    subtitle: "Simpang siur info kesehatan luar biasa membuat langkah awal terasa berat"
  }
];

export default function AssessmentQuiz() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    goal: "",
    challenge: "",
    activity: "",
    sleep: "",
    dinner: "",
    name: "",
    whatsapp: ""
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [resultsData, setResultsData] = useState<any>(null);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  // States for enhanced landing page items
  const [showIdlePopup, setShowIdlePopup] = useState<boolean>(false);
  const [waClicked, setWaClicked] = useState<boolean>(false);

  // Honeypot field state for absolute anti-spam compliance
  const [honeypot, setHoneypot] = useState<string>("");

  // UTM tracking state capturing queries
  const [tracking, setTracking] = useState({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
    fbclid: ""
  });

  // Calculate matching category based on answers
  const getPrimaryCategoryIndex = () => {
    if (!answers) return 3;
    
    // Check challenges
    if (answers.challenge === "mudah lapar" || answers.dinner === "sering") {
      return 0; // Emotional / Stress Eating
    }
    if (answers.challenge === "gagal diet") {
      return 1; // Diet Gagal Berulang
    }
    if (answers.challenge === "sulit konsisten") {
      return 2; // Sibuk Sulit Konsisten
    }
    if (answers.challenge === "bingung mulai") {
      return 3; // Bingung Memulai
    }

    // Default based on goal
    if (answers.goal === "turun BB") {
      return 1; // Diet Gagal Berulang
    }
    if (answers.goal === "hidup sehat") {
      return 3; // Bingung Memulai
    }

    return 3; // fallback: Bingung Memulai
  };

  // Launch the 60-second idle popup logic
  useEffect(() => {
    if (quizCompleted && !waClicked) {
      const timer = setTimeout(() => {
        const alreadyShown = sessionStorage.getItem("kunyah_idle_popup_shown");
        if (!alreadyShown) {
          setShowIdlePopup(true);
          sessionStorage.setItem("kunyah_idle_popup_shown", "true");
        }
      }, 60000); // 60 seconds
      return () => clearTimeout(timer);
    }
  }, [quizCompleted, waClicked]);

  // Safe tracking helper for standard Meta Pixel structures
  const trackPixelEvent = (eventName: string, data?: any) => {
    console.log(`[Meta Pixel Event]: ${eventName}`, data || "");
    if (typeof window !== "undefined") {
      const fbq = (window as any).fbq;
      if (typeof fbq === "function") {
        try {
          if (eventName === "PageView") {
            fbq("track", "PageView");
          } else if (eventName === "AssessmentStart") {
            fbq("trackCustom", "AssessmentStart", data);
            fbq("track", "InitiateCheckout", data);
          } else if (eventName === "LeadSubmit") {
            fbq("trackCustom", "LeadSubmit", data);
            fbq("track", "Lead", {
              content_name: "Kunyah Lifestyle Assessment",
              status: "Lead",
              ...data
            });
          } else {
            fbq("track", eventName, data);
          }
        } catch (e) {
          console.warn("fbq call error:", e);
        }
      }
    }
  };

  // On mount: capture search query keys & run PageView standard capture
  useEffect(() => {
    if (typeof window !== "undefined") {
      const query = new URLSearchParams(window.location.search);
      const utms = {
        utm_source: query.get("utm_source") || "",
        utm_medium: query.get("utm_medium") || "",
        utm_campaign: query.get("utm_campaign") || "",
        utm_content: query.get("utm_content") || "",
        utm_term: query.get("utm_term") || "",
        fbclid: query.get("fbclid") || ""
      };
      setTracking(utms);

      // Expose manual triggers on window scope for landing page buttons
      (window as any).triggerKunyahAssessmentStart = () => {
        trackPixelEvent("AssessmentStart");
      };

      // PageView event
      trackPixelEvent("PageView");
    }
  }, []);

  const activeQuestion = QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);

  const handleOptionSelect = (value: string) => {
    // If selecting option on the very first question, trigger AssessmentStart
    if (currentStep === 0 && answers.goal === "") {
      trackPixelEvent("AssessmentStart");
    }

    // Trigger active filling event for our notification toast
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("kunyah-assessment-active"));
    }

    setAnswers(prev => ({ ...prev, [activeQuestion.id]: value }));
    setError("");
    // Auto advance for selection questions to reduce friction, like Typeform
    if (currentStep < QUESTIONS.length - 2) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 300);
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Trigger active filling event for our notification toast
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("kunyah-assessment-active"));
    }
    setAnswers(prev => ({ ...prev, [activeQuestion.id]: e.target.value }));
    setError("");
  };

  const handleNext = () => {
    // Trigger start on next click if on step 0
    if (currentStep === 0) {
      trackPixelEvent("AssessmentStart");
    }

    // Validation
    const currentValue = answers[activeQuestion.id as keyof AssessmentAnswers];
    if (!currentValue || currentValue.trim() === "") {
      setError("Isian ini wajib ditentukan atau diisi sebelum melanjutkan.");
      return;
    }

    if (activeQuestion.id === "whatsapp") {
      // Basic WhatsApp validation: numbers only, length at least 9
      const cleaned = currentValue.replace(/\D/g, "");
      if (cleaned.length < 9) {
        setError("Masukkan nomor WhatsApp yang valid (minimal 9 digit angka).");
        return;
      }
    }

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setError("");
    } else {
      submitAssessment();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError("");
    }
  };

  const submitAssessment = async () => {
    // Spammer detection via simple honeypot input evaluation
    if (honeypot.trim() !== "") {
      console.warn("Silently filter honeypot bot interaction");
      setQuizCompleted(true);
      return;
    }

    setSubmitting(true);
    setError("");

    // Standardize WhatsApp format to wa.me/62... prefix here too so client state is synced beautifully
    let cleanedWA = answers.whatsapp.trim().replace(/\D/g, "");
    if (cleanedWA.startsWith("0")) {
      cleanedWA = "62" + cleanedWA.substring(1);
    } else if (!cleanedWA.startsWith("62")) {
      cleanedWA = "62" + cleanedWA;
    }
    const formattedWA = `wa.me/${cleanedWA}`;

    const payload = {
      ...answers,
      whatsapp: formattedWA,
      ...tracking
    };

    try {
      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      const responseText = await response.text();
      let data: any = null;
      let isSuccess = false;
      
      if (response.ok) {
        try {
          data = JSON.parse(responseText);
          if (data && data.success) {
            isSuccess = true;
          }
        } catch (e) {
          console.warn("Server response was not JSON, falling back to safe local evaluation:", responseText);
        }
      }

      if (isSuccess && data) {
        setResultsData(data.data);
      } else {
        // Safe, highly-personalized local rules-based fallback
        const generatedSummary = `Berdasarkan analisis awal, Kak ${answers.name} memiliki motivasi tinggi untuk fokus pada "${answers.goal}". Hambatan terbesar saat ini adalah "${answers.challenge}", didukung oleh pola tidur harian "${answers.sleep}" dan pola makan malam yaitu "${answers.dinner}". Klik tombol WhatsApp di bawah untuk mendiskusikan rancangan perbaikan pola mengunyah & nutrisi bersama Coach!`;
        const fallbackData = {
          Timestamp: new Date().toISOString(),
          Nama: answers.name,
          WA: formattedWA,
          Goal: answers.goal,
          Challenge: answers.challenge,
          Activity: answers.activity,
          Sleep: answers.sleep,
          Dinner: answers.dinner,
          "UTM Source": tracking.utm_source || "",
          "UTM Medium": tracking.utm_medium || "",
          Campaign: tracking.utm_campaign || "",
          Content: tracking.utm_content || "",
          FBCLID: tracking.fbclid || "",
          Status: "New",
          "AI Summary": generatedSummary
        };
        setResultsData(fallbackData);
      }

      setQuizCompleted(true);
      
      // Track LeadSubmit metadata event successfully
      trackPixelEvent("LeadSubmit", {
        name: answers.name,
        goal: answers.goal,
        status: "Lead"
      });

      // Trigger real-time order notification motion
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kunyah-assessment-submitted"));
      }
    } catch (err: any) {
      console.warn("Network error or server down, activating fail-safe local fallback:", err);
      // Fail-soft seamless transition
      const generatedSummary = `Berdasarkan analisis awal, Kak ${answers.name} memiliki motivasi tinggi untuk fokus pada "${answers.goal}". Hambatan terbesar saat ini adalah "${answers.challenge}", didukung pola tidur harian "${answers.sleep}" dan pola makan malam yaitu "${answers.dinner}". Klik tombol WhatsApp di bawah untuk mendiskusikan rancangan perbaikan pola mengunyah & nutrisi bersama Coach!`;
      const fallbackData = {
        Timestamp: new Date().toISOString(),
        Nama: answers.name,
        WA: formattedWA,
        Goal: answers.goal,
        Challenge: answers.challenge,
        Activity: answers.activity,
        Sleep: answers.sleep,
        Dinner: answers.dinner,
        "UTM Source": tracking.utm_source || "",
        "UTM Medium": tracking.utm_medium || "",
        Campaign: tracking.utm_campaign || "",
        Content: tracking.utm_content || "",
        FBCLID: tracking.fbclid || "",
        Status: "New",
        "AI Summary": generatedSummary
      };
      setResultsData(fallbackData);
      setQuizCompleted(true);
      
      trackPixelEvent("LeadSubmit", {
        name: answers.name,
        goal: answers.goal,
        status: "Lead"
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kunyah-assessment-submitted"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Premptive calculation of a beautiful customized WhatsApp link for conversion
  const getWhatsAppLink = (customCategoryTitle?: string) => {
    const matchedCategoryTitle = customCategoryTitle || CATEGORIES[getPrimaryCategoryIndex()].title;
    const coachNumber = "6287826749023"; // Representative/Coach WA number fallback
    
    const text = `Halo tim Kunyah, saya sudah menyelesaikan assessment dan ingin mendiskusikan hasil saya.

Kategori saya:
*${matchedCategoryTitle}*

Saya ingin mendapatkan arahan awal dari tim Kunyah.`;
    
    return `https://wa.me/${coachNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8" id="assessment-widget">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold tracking-wider rounded-full uppercase mb-3">
          <Sparkles className="w-3 h-3 text-[#E8B100]" /> Clean Wellness Onboarding
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1E1E1E] tracking-tight mb-2">
          Diagnostic Assessment Gaya Hidup
        </h2>
        <p className="text-sm md:text-base text-gray-500 max-w-lg mx-auto">
          Analisis 2 menit yang tenang dan komprehensif, terinspirasi oleh standar coaching modern.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!quizCompleted ? (
          <motion.div 
            key="quiz-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-[#F5F3EC] relative overflow-hidden"
          >
            {/* Elegant Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
              <motion.div 
                className="h-full bg-[#E8B100]"
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>

            {/* Stepper info */}
            <div className="flex justify-between items-center text-xs text-gray-400 font-medium mb-6 mt-2">
              <span>PERTANYAAN {currentStep + 1} DARI {QUESTIONS.length}</span>
              <span className="text-[#E8B100] font-semibold">{progressPercent}% SELESAI</span>
            </div>

            {/* Question Body */}
            <div className="min-h-[260px] flex flex-col justify-center">
              <h3 className="text-xl md:text-2xl font-bold font-heading text-[#1E1E1E] leading-tight mb-2">
                {activeQuestion.question}
              </h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {activeQuestion.subtitle}
              </p>

              {/* Error messages */}
              {error && (
                <div className="mb-4 text-xs font-medium text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              {/* Step Render logic */}
              {activeQuestion.type === "select" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {activeQuestion.options?.map((opt) => {
                    const isSelected = answers[activeQuestion.id as keyof AssessmentAnswers] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleOptionSelect(opt.value)}
                        className={`text-left p-4 rounded-2xl border transition-all duration-200 outline-none flex items-start gap-3.5 group cursor-pointer ${
                          isSelected 
                            ? "border-[#E8B100] bg-yellow-50/50 ring-2 ring-[#E8B100]" 
                            : "border-gray-200 hover:border-yellow-300 hover:bg-[#F8F7F2]"
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "bg-[#E8B100] border-[#E8B100]" : "border-gray-350 group-hover:border-[#E8B100]"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold transition-colors ${isSelected ? "text-[#E8B100]" : "text-gray-800"}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="relative mt-6 animate-fade-in" id={`input-container-${activeQuestion.id}`}>
                  <div className="relative">
                    <input
                      type={activeQuestion.type}
                      value={answers[activeQuestion.id as keyof AssessmentAnswers]}
                      onChange={handleTextChange}
                      onFocus={() => {
                        setIsInputFocused(true);
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(new CustomEvent("kunyah-assessment-active"));
                        }
                      }}
                      onBlur={() => setIsInputFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNext();
                      }}
                      placeholder={isInputFocused || String(answers[activeQuestion.id as keyof AssessmentAnswers]).trim() !== "" ? (activeQuestion.id === "name" ? "Tulis nama panggilanmu di sini..." : "Contoh: 0812XXXXXXXX") : ""}
                      className={`w-full text-left text-base md:text-lg py-4 pl-5 pr-4 bg-transparent border rounded-2xl outline-none transition-all duration-300 text-gray-800 font-semibold relative z-10 ${
                        isInputFocused || String(answers[activeQuestion.id as keyof AssessmentAnswers]).trim() !== ""
                          ? "border-[#E8B100] ring-2 ring-[#E8B100]/10"
                          : "border-gray-250 hover:border-[#E8B100]"
                      }`}
                      autoFocus
                    />
                    <span 
                      className={`absolute left-5 pointer-events-none transition-all duration-300 ease-out font-bold whitespace-nowrap px-1.5 z-20 ${
                        isInputFocused || String(answers[activeQuestion.id as keyof AssessmentAnswers]).trim() !== ""
                          ? "top-0 -translate-y-1/2 text-xs text-[#E8B100] bg-white font-extrabold" 
                          : "top-1/2 -translate-y-1/2 text-gray-400 text-base font-semibold"
                      }`}
                    >
                      {activeQuestion.id === "name" ? "Nama" : "Nomor WhatsApp"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quiz Navigation Trigger controls */}
            <div className="flex justify-between items-center border-t border-gray-100 pt-6 mt-8">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  currentStep === 0 
                    ? "text-gray-300 cursor-not-allowed" 
                    : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3.5 bg-[#E8B100] text-white font-bold rounded-2xl hover:bg-[#D5A200] transition-colors shadow-lg shadow-yellow-500/10 cursor-pointer text-sm"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Membuat Analisis...
                  </span>
                ) : currentStep === QUESTIONS.length - 1 ? (
                  <>
                    Kirim & Lihat Analisis <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Lanjutkan <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Hidden honeypot field */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="kunyah_email_confirm"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Small Privacy Notice Below Submit */}
            <p className="text-xs text-gray-400 text-center mt-5 leading-normal max-w-xs md:max-w-md mx-auto animate-pulse">
              Data yang Anda bagikan digunakan untuk kebutuhan assessment dan komunikasi <strong className="font-bold text-gray-700">Kunyah</strong>.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="quiz-results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-[#F5F3EC] text-center"
          >
            <div className="w-16 h-16 bg-yellow-100 text-[#E8B100] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold font-heading text-[#1E1E1E] leading-tight mb-3">
              Assessment berhasil dikirim.
            </h3>
            <p className="text-sm md:text-base text-gray-500 max-w-lg mx-auto mb-8">
              Silakan klik tombol di bawah untuk terhubung langsung dengan Admin <strong className="font-bold text-[#E8B100]">Kunyah</strong> di WhatsApp dan memulai konsultasi gratis Anda.
            </p>

            {/* Custom AI / Rules Generated Assessment Review Panel */}
            <div className="bg-[#F8F7F2] border border-[#F5F3EC] rounded-2xl p-5 md:p-6 text-left mb-8 max-w-xl mx-auto">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-yellow-800 tracking-wide uppercase">
                <Sparkles className="w-4 h-4 text-[#E8B100]" />
                Interactive Diagnostic Profile
              </div>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium">
                "{resultsData?.["AI Summary"]}"
              </p>
              
              <div className="mt-5 pt-4 border-t border-gray-200/50 grid grid-cols-2 gap-4 text-2xs">
                <div>
                  <span className="text-gray-400 block font-medium">Prioritas Goal</span>
                  <span className="text-gray-700 font-bold capitalize">{resultsData?.Goal}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Hambatan</span>
                  <span className="text-gray-700 font-bold capitalize">{resultsData?.Challenge}</span>
                </div>
              </div>
            </div>

            {/* Conversion CTA to WhatsApp Follow Up */}
            <div className="max-w-md mx-auto space-y-4">
              <motion.a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                onClick={() => setWaClicked(true)}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="inline-flex items-center justify-center gap-2.5 w-full bg-[#E8B100] hover:bg-[#D5A200] text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-yellow-500/10 cursor-pointer group hover:scale-[1.04]"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                Hubungi Coach via WhatsApp
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <div className="flex items-center justify-center gap-2 text-2xs text-gray-400 font-medium">
                <Clock className="w-3.5 h-3.5" /> Respons cepat dalam waktu kurang dari 15 menit
              </div>
            </div>

            {/* Elegant bouncing down arrow to alert user about the social validation section below */}
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: [0, 8, 0] }}
              transition={{ 
                opacity: { delay: 0.5, duration: 0.4 },
                y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" } 
              }}
              className="flex flex-col items-center gap-1.5 mt-8 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer select-none"
              onClick={() => {
                const element = document.getElementById("social-validation-section");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-450">Lihat Hasil Analisis Lainnya</span>
              <ChevronDown className="w-4 h-4 text-[#E8B100]" />
            </motion.div>

            {/* NEW FEATURE 1: Social Identity Validation Section */}
            <motion.div 
              id="social-validation-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-14 pt-12 border-t border-gray-100 text-left scroll-mt-6"
            >
              <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
                <span className="text-xs font-bold text-[#E8B100] uppercase tracking-wider">Social Validation</span>
                <h4 className="text-xl md:text-2xl font-extrabold font-heading text-[#1E1E1E]">
                  Banyak Peserta Berada di Salah Satu Fase Ini
                </h4>
                <p className="text-xs md:text-sm text-gray-400 font-semibold max-w-md mx-auto leading-relaxed">
                  Setiap orang memiliki tantangan berbeda, dan banyak peserta Kunyah memulai dari salah satu pola berikut.
                </p>
              </div>

              {/* 4 Categories Visual Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                {CATEGORIES.map((cat, index) => {
                  const isHighlighted = getPrimaryCategoryIndex() === index;
                  const getCategoryIcon = () => {
                    switch(index) {
                      case 0: return <Brain className={`w-5 h-5 ${isHighlighted ? "text-[#E8B100]" : "text-gray-400"}`} />;
                      case 1: return <RotateCcw className={`w-5 h-5 ${isHighlighted ? "text-[#E8B100]" : "text-gray-400"}`} />;
                      case 2: return <Calendar className={`w-5 h-5 ${isHighlighted ? "text-[#E8B100]" : "text-gray-400"}`} />;
                      default: return <Compass className={`w-5 h-5 ${isHighlighted ? "text-[#E8B100]" : "text-gray-400"}`} />;
                    }
                  };

                  return (
                    <motion.div
                      key={cat.id}
                      initial={false}
                      animate={isHighlighted ? {
                        scale: [1, 1.03, 1.03],
                        boxShadow: "0 20px 25px -5px rgb(232 177 0 / 0.08), 0 8px 10px -6px rgb(232 177 0 / 0.08)"
                      } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`relative rounded-2xl p-5 border text-left flex flex-col justify-between transition-all duration-300 ${
                        isHighlighted 
                          ? "border-[#E8B100] bg-yellow-50/20 ring-1 ring-[#E8B100]/20 scale-[1.03]" 
                          : "border-gray-150 bg-white opacity-85 hover:opacity-100"
                      }`}
                    >
                      {isHighlighted && (
                        <span className="absolute -top-3 left-4 bg-[#E8B100] text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow">
                          Paling mendekati hasilmu
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon()}
                          <h5 className={`font-black text-sm md:text-base leading-snug ${isHighlighted ? "text-[#E8B100]" : "text-gray-800"}`}>
                            {cat.title}
                          </h5>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                          {cat.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100/50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-450">
                          {cat.subtitle}
                        </span>
                        {isHighlighted && (
                          <div className="w-2 h-2 rounded-full bg-[#E8B100] animate-ping" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* NEW FEATURE 2: WhatsApp CTA Enhancement */}
            <div className="mt-14 pt-10 border-t border-gray-100 max-w-xl mx-auto text-center space-y-5">
              <div className="space-y-1">
                <h4 className="text-lg md:text-xl font-extrabold text-[#1E1E1E]">
                  Diskusikan Hasilmu Lebih Lanjut
                </h4>
                <p className="text-xs md:text-sm text-gray-400 font-semibold">
                  Hasil assessment adalah langkah awal. Tim Kunyah siap membantu membaca langkah yang lebih sesuai untukmu.
                </p>
              </div>

              <motion.a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                onClick={() => setWaClicked(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                className="inline-flex items-center justify-center gap-2.5 w-full max-w-md bg-[#E8B100] hover:bg-[#D5A200] text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-yellow-500/10 cursor-pointer text-sm"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                Buka WhatsApp
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW FEATURE 3: Idle Popup Reminder modal */}
      <AnimatePresence>
        {showIdlePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background Blur Overlay Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIdlePopup(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Popup Card container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.3, cubicBezier: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full relative z-10 shadow-2xl border border-gray-100 text-center space-y-6"
            >
              {/* Close Button UI */}
              <button 
                onClick={() => setShowIdlePopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header visual icon representation */}
              <div className="w-14 h-14 bg-yellow-50 text-[#E8B100] rounded-full flex items-center justify-center mx-auto border border-yellow-250 shadow-sm animate-bounce">
                <Sparkles className="w-7 h-7 animate-pulse" />
              </div>

              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-black font-heading text-[#1E1E1E]">
                  Hasilmu sudah terbaca.
                </h3>
                <p className="text-xs md:text-sm text-gray-550 leading-relaxed font-semibold">
                  Pak Syafaat dan tim Kunyah menyiapkan arahan awal untuk membantumu mulai lebih tepat.
                </p>
                <p className="text-xs md:text-sm text-gray-700 font-extrabold bg-yellow-50 py-2.5 px-4 rounded-xl border border-yellow-105">
                  Diskusikan sebelum terlewat begitu saja.
                </p>
              </div>

              <div className="pt-2">
                <motion.a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    setWaClicked(true);
                    setShowIdlePopup(false);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#E8B100] hover:bg-[#D5A200] text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-yellow-500/15 cursor-pointer text-sm"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  Buka WhatsApp
                </motion.a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
