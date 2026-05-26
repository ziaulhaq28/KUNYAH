import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ClipboardList } from "lucide-react";

// List of Indonesian Names (various regions & styles to make it completely natural)
const INDONESIA_NAMES = [
  "Agus Prasetyo", "Siti Aminah", "Budi Santoso", "Dewi Lestari", "Rizky Ramadhan",
  "Sri Wahyuni", "Aditya Nugroho", "Rina Amelia", "Andi Saputra", "Putri Rahayu",
  "Dian Sastrowardoyo", "Eko Prasetyo", "Rudi Hermawan", "Mega Utami", "Ahmad Fauzi",
  "Sari Indah", "Wahyu Hidayat", "Lia Wijaya", "Tri Handoko", "Hadi Sunyoto",
  "Nur Hasanah", "Yanto Wijaya", "Rian Hidayat", "Endang Susilowati", "Kartika Sari",
  "Bambang Pamungkas", "Yuliana Dewi", "Heri Setiawan", "Slamet Riyadi", "Anisa Fitriani",
  "Dedi Irawan", "Lestari Putri", "Joko Susilo", "Fitri Handayani", "Iwan Setiawan",
  "Supriadi", "Aulia Rahman", "Basuki Tjahaja", "Gita Gutawa", "Indah Permatasari",
  "Rizki Amelia", "Dimas Anggara", "Rangga Wijaya", "Sarah Sechan", "Daniel Saputra"
];

// List of Indonesian assessment objectives / health actions
const KUNYAH_ACTIONS = [
  "Mengevaluasi hambatan menurunkan berat badan",
  "Menganalisis kecukupan jam tidur & pola makan malam",
  "Mencari solusi metabolisme tubuh terhambat",
  "Mengevaluasi pola aktivitas harian & olahraga harian",
  "Menganalisis pemicu berat badan stuck/sulit turun",
  "Merancang pola makan teratur & porsi ideal",
  "Mencari panduan menurunkan lingkar perut",
  "Mendeteksi korelasi kualitas tidur dengan berat badan"
];

export default function OrderNotification() {
  const [notification, setNotification] = useState<{ name: string; action: string } | null>(null);
  const [shownCount, setShownCount] = useState<number>(0);
  const [lastTriggeredAt, setLastTriggeredAt] = useState<number>(0);

  // Play browser-synthesized notification double-beep sound natively
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Beep 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.value = 880; // A5 pitch
      gain1.gain.setValueAtTime(0.04, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.1);

      // Beep 2 (Slightly higher pitch shortly after)
      setTimeout(() => {
        try {
          if (ctx.state === "closed") return;
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.value = 1100; // C#6 pitch
          gain2.gain.setValueAtTime(0.04, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.12);
        } catch (e) {
          console.debug("Audio play blocked:", e);
        }
      }, 110);
    } catch (e) {
      console.debug("AudioContext blocked or uninitialized. Normal for background pages:", e);
    }
  };

  // Helper to trigger a fresh notification
  const triggerNotification = () => {
    const randomName = INDONESIA_NAMES[Math.floor(Math.random() * INDONESIA_NAMES.length)];
    const randomAction = KUNYAH_ACTIONS[Math.floor(Math.random() * KUNYAH_ACTIONS.length)];

    setNotification({
      name: randomName,
      action: randomAction
    });
    setShownCount(prev => prev + 1);
    setLastTriggeredAt(Date.now());
    playBeep();

    // Auto-dismiss after 3 seconds exactly as requested
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  useEffect(() => {
    // TRIGGER 1: Trigger after exactly 8 seconds in the landing page
    const timer = setTimeout(() => {
      if (shownCount === 0) {
        triggerNotification();
      }
    }, 8000);

    // TRIGGER 2 & 3: Listen for active assessment filling events with a minimum spacing of 15s
    const handleAssessmentActive = () => {
      if (shownCount < 3 && !notification) {
        const timeSinceLast = Date.now() - lastTriggeredAt;
        // Spaced out nicely to prevent flashing/overlap
        if (timeSinceLast > 15000) {
          triggerNotification();
        }
      }
    };

    window.addEventListener("kunyah-assessment-active", handleAssessmentActive);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("kunyah-assessment-active", handleAssessmentActive);
    };
  }, [shownCount, notification, lastTriggeredAt]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, x: -80, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.2 } }}
          className="fixed bottom-4 left-4 z-[99999] max-w-[340px] w-[calc(100vw-32px)] bg-white rounded-2xl shadow-xl shadow-black/10 border border-[#F2B705]/20 p-4 font-sans focus:outline-none"
          id="order-notification-toast"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center border border-yellow-100 text-[#E8B100]">
              <ClipboardList className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] uppercase tracking-wider text-amber-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} /> KIRIM ASSESSMENT
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-1.5 bg-amber-500"></span>
                </span>
              </div>
              
              <p className="text-xs text-gray-800 font-semibold mt-0.5 truncate leading-snug">
                {notification.name}
              </p>
              
              <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
                baru saja mengirim assessment kesehatan
              </p>
              
              <p className="text-[10px] text-[#E8B100] italic font-semibold mt-1 bg-yellow-50/50 py-0.5 px-1.5 rounded border border-yellow-100/30 truncate">
                &ldquo;{notification.action}&rdquo;
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
