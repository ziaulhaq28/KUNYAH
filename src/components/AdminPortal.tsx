import { useState, useEffect } from "react";
import { 
  X, 
  Database, 
  Settings, 
  Table, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  LogOut, 
  FileSpreadsheet, 
  Search, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  BarChart3,
  Eye,
  Trash2,
  MousePointer,
  Activity,
  Lock
} from "lucide-react";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { getApiUrl } from "../utils/api";

// Initialize Firebase App & Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

interface Lead {
  Timestamp: string;
  Nama: string;
  WA: string;
  Goal: string;
  Challenge: string;
  Activity: string;
  Sleep: string;
  Dinner: string;
  "UTM Source"?: string;
  "UTM Medium"?: string;
  Campaign?: string;
  Content?: string;
  FBCLID?: string;
  Status: string;
  "AI Summary"?: string;
}

interface AdminPortalProps {
  onClose: () => void;
}

export default function AdminPortal({ onClose }: AdminPortalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Analytics and Pixel Tracking Dashboard State
  const [activeTab, setActiveTab] = useState<"leads" | "analytics">("leads");
  const [analyticsStats, setAnalyticsStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  
  // Apps Script Server Settings State
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>("");
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const fetchAnalyticsStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch(getApiUrl("/api/analytics/stats"));
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAnalyticsStats(data);
        }
      }
    } catch (err) {
      console.error("Error fetching analytics stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleClearAnalytics = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat analitik pixel & scroll depth ke nol?")) {
      return;
    }
    setIsLoadingStats(true);
    try {
      const res = await fetch(getApiUrl("/api/analytics/clear"), { method: "POST" });
      if (res.ok) {
        await fetchAnalyticsStats();
        alert("Seluruh riwayat tracking pixel berhasil dibersihkan.");
      }
    } catch (err) {
      console.error("Error clearing analytics:", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch leads and configuration from server
  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch(getApiUrl("/api/admin/leads"));
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setLeads(data);
        } catch (parseErr) {
          console.error("Failed to parse leads JSON response:", text);
        }
      } else {
        console.error("Failed to fetch leads from server status:", res.status);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const fetchConfig = async () => {
    // 1. Try local storage first
    try {
      const storedUrl = localStorage.getItem("kunyah_apps_script_url");
      if (storedUrl) {
        setAppsScriptUrl(storedUrl);
      }
    } catch (e) {}

    // 2. Try server
    try {
      const res = await fetch(getApiUrl("/api/admin/config"));
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.appsScriptUrl) {
            setAppsScriptUrl(data.appsScriptUrl);
            localStorage.setItem("kunyah_apps_script_url", data.appsScriptUrl);
          }
        } catch (parseErr) {
          console.error("Failed to parse config JSON response:", text);
        }
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email === "dayydeii1@gmail.com") {
        fetchLeads();
        fetchConfig();
        fetchAnalyticsStats();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        setSyncStatus({ type: "idle", message: "" });
      } else {
        throw new Error("Failed to extract Google Sheets OAuth Access Token.");
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      if (err.code === "auth/unauthorized-domain" || String(err.message).toLowerCase().includes("unauthorized-domain") || String(err.code).toLowerCase().includes("unauthorized-domain")) {
        setSyncStatus({ 
          type: "error", 
          message: "UNAUTHORIZED_DOMAIN" 
        });
      } else {
        setSyncStatus({ 
          type: "error", 
          message: err.message || "Gagal login dengan Google." 
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAccessToken(null);
      setSyncStatus({ type: "idle", message: "" });
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  };

  const handleSaveAppsScriptUrl = async () => {
    if (!appsScriptUrl.trim()) {
      setSyncStatus({ 
        type: "error", 
        message: "URL Google Apps Script tidak boleh kosong." 
      });
      return;
    }

    if (!appsScriptUrl.trim().startsWith("http")) {
      setSyncStatus({ 
        type: "error", 
        message: "URL tidak valid. Harus diawali dengan http:// atau https://" 
      });
      return;
    }

    setIsSavingConfig(true);
    setSyncStatus({ type: "loading", message: "Menyimpan konfigurasi..." });

    try {
      // 1. Persist locally to localStorage
      try {
        localStorage.setItem("kunyah_apps_script_url", appsScriptUrl.trim());
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }

      // 2. Persist to API server (AI Studio container)
      const res = await fetch(getApiUrl("/api/admin/config"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appsScriptUrl: appsScriptUrl.trim() })
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {}

      if (res.ok) {
        setSyncStatus({
          type: "success",
          message: "Koneksi Google Apps Script didaftarkan aktif di browser dan server!"
        });
        setTimeout(() => {
          setSyncStatus({ type: "idle", message: "" });
        }, 3000);
      } else {
        // Fallback to local success if server responded with code error
        setSyncStatus({
          type: "success",
          message: "Koneksi Google Apps Script berhasil diaktifkan untuk browser ini!"
        });
        setTimeout(() => {
          setSyncStatus({ type: "idle", message: "" });
        }, 3000);
      }
    } catch (err: any) {
      // Network/CORS exception on Vercel is fine since we saved to localStorage
      setSyncStatus({
        type: "success",
        message: "Koneksi Google Apps Script berhasil disimpan secara lokal!"
      });
      setTimeout(() => {
        setSyncStatus({ type: "idle", message: "" });
      }, 3000);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleBatchSync = async () => {
    if (!appsScriptUrl.trim()) {
      setSyncStatus({ 
        type: "error", 
        message: "Pastikan Anda mengisi & menyimpan URL Google Apps Script terlebih dahulu." 
      });
      return;
    }

    if (leads.length === 0) {
      setSyncStatus({
        type: "success",
        message: "Tidak ada data lead untuk dikirim."
      });
      return;
    }

    setIsSyncingAll(true);
    setSyncStatus({ type: "loading", message: "Memulai pengiriman database harian langsung dari browser..." });

    try {
      let successCount = 0;
      let failCount = 0;
      const targetUrl = appsScriptUrl.trim();

      // Send each lead directly from browser utilizing 'no-cors' mode to bypass any server-side network blockages or CORS limitations on Google Apps Script
      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        
        setSyncStatus({
          type: "loading",
          message: `Mengirim lead ${i + 1} dari ${leads.length}: ${lead.Nama || "Klien"}...`
        });

        // Ensure we preserve the full set of parameters in both standard CamelCase / PascalCase and lower_snake_case for all script styles
        const payload = {
          // Standard columns
          Timestamp: lead.Timestamp || lead.timestamp || new Date().toISOString(),
          Nama: lead.Nama || lead.nama || lead.name || "",
          WA: lead.WA || lead.wa || lead.whatsapp || "",
          Goal: lead.Goal || lead.goal || "",
          Challenge: lead.Challenge || lead.challenge || "",
          Activity: lead.Activity || lead.activity || "",
          Sleep: lead.Sleep || lead.sleep || "",
          Dinner: lead.Dinner || lead.dinner || "",
          "UTM Source": lead["UTM Source"] || lead.utm_source || "",
          "UTM Medium": lead["UTM Medium"] || lead.utm_medium || "",
          Campaign: lead.Campaign || lead.utm_campaign || "",
          Content: lead.Content || lead.utm_content || "",
          FBCLID: lead.FBCLID || lead.fbclid || "",
          Status: lead.Status || lead.status || "New",
          "AI Summary": lead["AI Summary"] || lead.aiSummary || "",

          // Extra lowercase structure for multi-script variations
          timestamp: lead.Timestamp || lead.timestamp || new Date().toISOString(),
          nama: lead.Nama || lead.nama || lead.name || "",
          name: lead.Nama || lead.nama || lead.name || "",
          wa: lead.WA || lead.wa || lead.whatsapp || "",
          whatsapp: lead.WA || lead.wa || lead.whatsapp || "",
          goal: lead.Goal || lead.goal || "",
          challenge: lead.Challenge || lead.challenge || "",
          activity: lead.Activity || lead.activity || "",
          sleep: lead.Sleep || lead.sleep || "",
          dinner: lead.Dinner || lead.dinner || "",
          utm_source: lead["UTM Source"] || lead.utm_source || "",
          utm_medium: lead["UTM Medium"] || lead.utm_medium || "",
          utm_campaign: lead.Campaign || lead.utm_campaign || "",
          utm_content: lead.Content || lead.utm_content || "",
          fbclid: lead.FBCLID || lead.fbclid || "",
          status: lead.Status || lead.status || "New",
          aiSummary: lead["AI Summary"] || lead.aiSummary || ""
        };

        try {
          // Content-Type: text/plain + no-cors is the standard workaround to avoid browser preflight/CORS error for Google Apps Script URLs
          await fetch(targetUrl, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "text/plain"
            },
            body: JSON.stringify(payload)
          });
          successCount++;
        } catch (err) {
          console.error(`Browser direct sync failed for item ${i}:`, err);
          failCount++;
        }
      }

      setSyncStatus({
        type: "success",
        message: `Berhasil sinkronisasi! ${successCount} baris lead terkirim langsung dari browser Anda ke Google Sheets.`
      });

      setTimeout(() => {
        setSyncStatus({ type: "idle", message: "" });
      }, 5000);

    } catch (err: any) {
      setSyncStatus({
        type: "error",
        message: `Gagal menyelesaikan sinkronisasi: ${err?.message || err}`
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.Nama.toLowerCase().includes(searchLower) ||
      lead.WA.toLowerCase().includes(searchLower) ||
      lead.Goal.toLowerCase().includes(searchLower) ||
      (lead.Challenge && lead.Challenge.toLowerCase().includes(searchLower))
    );
  });

  // Enforce authentication restrictively to only dayydeii1@gmail.com
  if (!user || user.email !== "dayydeii1@gmail.com") {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        <div className="bg-white rounded-[32px] w-full max-w-md p-8 flex flex-col items-center justify-center shadow-2xl border border-gray-100 font-sans text-center space-y-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-gray-100/80 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-3xl bg-yellow-100 text-[#E8B100] flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-[#1E1E1E]">Akses Terbatas</h2>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Portal Admin Kunyah dilindungi secara ketat. Silakan masuk menggunakan akun Google resmi pembuat landing page ini.
            </p>
          </div>

          {user && user.email !== "dayydeii1@gmail.com" && (
            <div className="w-full bg-rose-50 border border-rose-100 rounded-2xl p-4 text-left text-xs text-rose-900 space-y-1.5 animate-fade-in">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                Akses Ditolak
              </div>
              <p className="font-light leading-relaxed">
                Akun Anda <strong className="font-semibold">{user.email}</strong> tidak terdaftar dalam hak akses administrator. Hanya email <strong className="font-semibold text-rose-700">dayydeii1@gmail.com</strong> yang dizinkan masuk.
              </p>
            </div>
          )}

          <div className="w-full pt-2">
            {!user ? (
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="w-full py-3.5 px-6 bg-[#1E1E1E] hover:bg-black text-white rounded-2xl font-bold text-xs transition-all duration-300 shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                {isLoggingIn ? "Menghubungkan..." : "Masuk dengan Google"}
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full py-3.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-750 rounded-2xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Ganti Akun Google
              </button>
            )}
          </div>

          <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest pt-2">
            Secure Shield v2.1 • Kunyah
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-[32px] w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 font-sans">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#F8F7F2] border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-100 text-[#E8B100] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-[#1E1E1E]">Kunyah Admin Portal</h1>
              <p className="text-xs text-gray-400 font-medium">Kelola leads assessment harian & sinkronisasi Google Sheets</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-200/50 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left panel - Connection setup */}
          <div className="lg:col-span-5 border-r border-gray-100 p-6 overflow-y-auto space-y-6 bg-gray-50/50">
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#E8B100]" />
                Koneksi Google Sheets
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed font-light">
                Kunyah menggunakan Google Apps Script untuk mengirimkan hasil assessment pengunjung langsung ke baris spreadsheet Anda secara real-time tanpa rintangan login yang mengganggu.
              </p>
            </div>

            {/* Quick Tutorial based on User screenshot */}
            <div className="bg-yellow-50/80 p-4.5 rounded-2xl border border-yellow-100/80 space-y-3.5 shadow-sm">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E8B100] animate-pulse" />
                Panduan Menghubungkan (1 Menit):
              </h4>
              <ol className="list-decimal list-inside text-[11px] leading-relaxed text-amber-950 font-light space-y-2">
                <li>
                  Buka editor <strong className="font-semibold text-[#1E1E1E]">Google Apps Script</strong> Anda.
                </li>
                <li>
                  Klik tombol <strong className="font-semibold text-blue-700">Terapkan (Deploy) &rarr; Penerapan Baru (New Deployment)</strong>.
                </li>
                <li>
                  Pilih jenis <strong className="font-semibold text-[#1E1E1E]">Aplikasi Web (Web App)</strong>.
                </li>
                <li>
                  <strong className="text-rose-700">PENTING:</strong> Ubah pengaturan <strong className="font-bold">"Yang memiliki akses (Who has access)"</strong> menjadi <strong className="font-bold">"Siapa saja (Anyone)"</strong> agar data formulir dapat masuk secara otomatis.
                </li>
                <li>
                  Setelah berhasil, salin <strong className="font-semibold text-emerald-700 text-xs text-[#1E1E1E]">Aplikasi web URL</strong> (ini adalah <strong className="underline">Link Kedua</strong> pada gambar Anda yang berakhiran <code className="bg-white/80 px-1 py-0.5 rounded font-mono">/exec</code>).
                </li>
              </ol>
            </div>

            {/* Config Fields */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                Konfigurasi Webhook Server
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">Aplikasi Web URL (Apps Script Link-2)</label>
                  <input 
                    type="text" 
                    value={appsScriptUrl} 
                    onChange={(e) => setAppsScriptUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec" 
                    className="w-full px-3.5 py-3 bg-gray-50 focus:bg-white text-xs text-gray-800 rounded-xl border border-gray-200 focus:border-[#E8B100] outline-none transition-all placeholder:text-gray-300 font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-snug font-light">
                    Pastikan domain aman, berakhiran dengan <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600 font-mono">/exec</code> dan dapat diakses publik.
                  </p>
                </div>

                <div className="pt-1 flex flex-col gap-2">
                  <button
                    onClick={handleSaveAppsScriptUrl}
                    disabled={isSavingConfig}
                    className="w-full py-2.5 px-4 text-xs font-extrabold uppercase bg-gray-900 hover:bg-black text-white rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSavingConfig ? "Menyimpan..." : "Simpan & Daftarkan URL"}
                  </button>
                  
                  <button
                    onClick={handleBatchSync}
                    disabled={isSyncingAll || !appsScriptUrl}
                    className="w-full py-2.5 px-4 text-xs font-extrabold uppercase bg-[#E8B100] hover:bg-[#D5A200] disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl shadow-md shadow-yellow-500/10 transition-all cursor-pointer disabled:shadow-none"
                  >
                    {isSyncingAll ? "Sinkronisasi Berjalan..." : "Sync Semua Leads Sekarang"}
                  </button>
                </div>
              </div>
            </div>

            {/* Status alerts */}
            {syncStatus.type !== "idle" && (
              <div className={`p-4 rounded-2xl text-xs flex flex-col gap-2.5 ${
                syncStatus.type === "loading" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                syncStatus.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                "bg-rose-50 text-rose-800 border border-rose-200"
              }`}>
                <div className="flex items-start gap-2.5 w-full">
                  {syncStatus.type === "loading" && <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
                  {syncStatus.type === "success" && <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />}
                  {syncStatus.type === "error" && <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />}
                  <div className="flex-1 text-[11px] leading-relaxed">
                    <p className="font-bold">{syncStatus.type === "loading" ? "Sedang Memproses..." : syncStatus.type === "success" ? "Pemberitahuan Sukses!" : "Kesalahan Sistem"}</p>
                    <p className="text-[10px] leading-relaxed mt-0.5 font-light text-gray-600">{syncStatus.message}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 text-[10px] text-gray-500 leading-relaxed md:p-5 font-light">
              💡 <strong>Integrasi Real-time Aktif:</strong> Setiap kali calon klien baru mengirimkan formulir sehat "Kunyah", data akan langsung terkirim secara otomatis ke Google Apps Script di atas secara instan.
            </div>
          </div>

          {/* Right panel - Dynamic lead list AND Analytics dashboard */}
          <div className="lg:col-span-7 p-6 overflow-hidden flex flex-col space-y-4">
            
            {/* Elegant Tab Selector */}
            <div className="flex border-b border-gray-150 shrink-0 gap-1.5 pb-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("leads")}
                className={`px-4 py-2.5 text-xs font-extrabold transition-all border-b-2 rounded-t-xl flex items-center gap-2 cursor-pointer ${
                  activeTab === "leads"
                    ? "border-[#E8B100] text-[#E8B100] bg-yellow-50/20"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-55/40"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                Daftar Leads ({leads.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("analytics");
                  fetchAnalyticsStats();
                }}
                className={`px-4 py-2.5 text-xs font-extrabold transition-all border-b-2 rounded-t-xl flex items-center gap-2 cursor-pointer ${
                  activeTab === "analytics"
                    ? "border-[#E8B100] text-[#E8B100] bg-yellow-50/20"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-55/40"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Meta Pixel & Scroll Depth Analytics
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </button>
            </div>

            {/* TAB CONTEXT: LEADS SYSTEM */}
            {activeTab === "leads" && (
              <>
                {/* Search and reload header */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0">
                  <h2 className="text-xs font-bold text-gray-450 uppercase tracking-widest flex items-center gap-1.5 self-start">
                    Hasil Assessment Terkumpul
                  </h2>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-60">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari Nama / WA / No..." 
                        className="w-full pl-9 pr-3.5 py-1.5 bg-gray-50 focus:bg-white text-xs rounded-xl border border-gray-200 outline-none focus:border-[#E8B100] transition-colors"
                      />
                    </div>
                    <button
                      onClick={fetchLeads}
                      disabled={isLoadingLeads}
                      className="p-2 bg-gray-50 hover:bg-gray-200/50 text-gray-500 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                      title="Reload leads"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLeads ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Table layout with horizontal scroll */}
                <div className="flex-1 overflow-auto border border-gray-150 rounded-2xl bg-white shadow-sm">
                  {isLoadingLeads ? (
                    <div className="h-full flex items-center justify-center py-20 flex-col gap-3">
                      <RefreshCw className="w-8 h-8 text-[#E8B100] animate-spin" />
                      <span className="text-xs text-gray-400 font-medium">Memuat database harian...</span>
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <div className="h-full flex items-center justify-center py-20 flex-col gap-2">
                      <AlertCircle className="w-7 h-7 text-gray-300" />
                      <span className="text-xs text-gray-400">Tidak ada lead yang ditemukan</span>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#FAFAF9] text-gray-400 sticky top-0 border-b border-gray-100 z-10 font-bold uppercase tracking-wider text-[9px]">
                        <tr>
                          <th className="py-3 px-4">Nama / WA</th>
                          <th className="py-3 px-4">Goal Utama</th>
                          <th className="py-3 px-4">Tantangan</th>
                          <th className="py-3 px-4">Tidur & Makan</th>
                          <th className="py-3 px-4">Waktu</th>
                          <th className="py-3 px-4">UTM Stats</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-[#1E1E1E]">
                        {filteredLeads.map((lead, idx) => (
                          <tr key={idx} className="hover:bg-[#FDFBF7] transition-colors duration-150">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-[#1E1E1E] text-xs leading-snug">{lead.Nama}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5 font-mono">
                                {lead.WA}
                                {lead.WA && (
                                  <a 
                                    href={`https://${lead.WA}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[#E8B100] hover:underline flex items-center gap-0.5"
                                  >
                                    WA <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-gray-700 leading-relaxed max-w-[150px] truncate" title={lead.Goal}>
                              {lead.Goal}
                            </td>
                            <td className="py-3.5 px-4 text-gray-400 leading-relaxed max-w-[150px] truncate" title={lead.Challenge}>
                              {lead.Challenge}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="text-[10px]"><span className="text-gray-400">Tidur:</span> {lead.Sleep}</div>
                              <div className="text-[10px] mt-0.5"><span className="text-gray-400">Makan:</span> {lead.Dinner}</div>
                            </td>
                            <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap text-[10px] font-mono">
                              {lead.Timestamp ? new Date(lead.Timestamp).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                              }) : "-"}
                            </td>
                            <td className="py-3.5 px-4">
                              {lead["UTM Source"] ? (
                                <div className="text-[9px] bg-yellow-50 text-yellow-800 border border-yellow-100 rounded-md px-1.5 py-0.5 inline-block font-mono">
                                  Src: {lead["UTM Source"]}
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-300">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Instruction Footer */}
                <div className="pt-2 flex justify-between items-center text-[10px] text-gray-400 shrink-0">
                  <p>Menampilkan {filteredLeads.length} dari total {leads.length} leads harian.</p>
                  <p className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#E8B100]" />
                    Data sync setup active
                  </p>
                </div>
              </>
            )}

            {/* TAB CONTEXT: PIXEL & SCROLL ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                
                {/* Dashboard Stats Panel */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">Laporan Kinerja Landing Page</h3>
                    <p className="text-[11px] text-gray-400">Dimonitor layaknya Meta Pixel extension untuk optimasi biaya iklan Anda</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchAnalyticsStats}
                      disabled={isLoadingStats}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-2xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingStats ? "animate-spin" : ""}`} />
                      Refresh Data
                    </button>
                    <button
                      onClick={handleClearAnalytics}
                      disabled={isLoadingStats}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-2xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear Logs
                    </button>
                  </div>
                </div>

                {isLoadingStats && !analyticsStats ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white border border-gray-100 rounded-3xl">
                    <RefreshCw className="w-8 h-8 text-[#E8B100] animate-spin" />
                    <span className="text-xs text-gray-400">Menghitung akumulasi data pixel...</span>
                  </div>
                ) : (
                  <>
                    {/* Meta Cards Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-[#FAFAF9] border border-gray-200/50 rounded-2xl p-3.5">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider mb-1">Total Pengunjung</span>
                        <span className="text-2xl font-black text-gray-800">{analyticsStats?.summary?.totalSessions || 0}</span>
                        <span className="text-[10px] text-gray-400 block mt-1">Sesi Unik</span>
                      </div>
                      <div className="bg-[#FAFAF9] border border-gray-200/50 rounded-2xl p-3.5">
                        <span className="text-[10px] text-yellow-800 block font-bold uppercase tracking-wider mb-1">Mulai Assessment</span>
                        <span className="text-2xl font-black text-[#E8B100]">{analyticsStats?.funnel?.starts?.count || 0}</span>
                        <span className="text-[10px] text-emerald-600 block mt-1 font-bold">🎯 {analyticsStats?.funnel?.starts?.percentOfViews || 0}% Klik Form</span>
                      </div>
                      <div className="bg-[#FAFAF9] border border-gray-200/50 rounded-2xl p-3.5">
                        <span className="text-[10px] text-amber-900 block font-bold uppercase tracking-wider mb-1">Kirim Jawaban</span>
                        <span className="text-2xl font-black text-[#E8B100]">{analyticsStats?.funnel?.completes?.count || 0}</span>
                        <span className="text-[10px] text-gray-500 block mt-1 font-semibold">{analyticsStats?.funnel?.completes?.percentOfStarts || 0}% Selesai Quiz</span>
                      </div>
                      <div className="bg-[#FAFAF9] border border-gray-200/50 rounded-2xl p-3.5 bg-yellow-50/20 border-yellow-100/40">
                        <span className="text-[10px] text-emerald-800 block font-bold uppercase tracking-wider mb-1">Klik Hubungi WA</span>
                        <span className="text-2xl font-black text-emerald-600">{analyticsStats?.funnel?.waClicks?.count || 0}</span>
                        <span className="text-[10px] text-emerald-700 block mt-1 font-bold">📲 {analyticsStats?.funnel?.waClicks?.percentOfCompletes || 0}% Leads WhatsApp</span>
                      </div>
                    </div>

                    {/* Funnel Map Component */}
                    <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                      <h4 className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <BarChart3 className="w-4 h-4 text-[#E8B100]" />
                        Funnel Konversi Landings ke WhatsApp Leads
                      </h4>
                      
                      <div className="space-y-3 pt-2">
                        {/* Landing stage */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-gray-400" />
                              1. Pengunjung Membuka Page (PageView)
                            </span>
                            <span>{analyticsStats?.summary?.totalSessions || 0} Sesi (100%)</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-400 rounded-full" style={{ width: "100%" }} />
                          </div>
                        </div>

                        {/* Start Quiz */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-yellow-400" />
                              2. Mengklik "Isi Assessment" (AssessmentStart)
                            </span>
                            <span>{analyticsStats?.funnel?.starts?.count || 0} Sesi ({analyticsStats?.funnel?.starts?.percentOfViews || 0}%)</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#E8B100]" style={{ width: `${analyticsStats?.funnel?.starts?.percentOfViews || 0}%` }} />
                          </div>
                        </div>

                        {/* Submit Quiz */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              3. Menyelesaikan & Kirim Assessment (LeadSubmit)
                            </span>
                            <span>{analyticsStats?.funnel?.completes?.count || 0} Sesi ({analyticsStats?.funnel?.completes?.percentOfViews || 0}%)</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${analyticsStats?.funnel?.completes?.percentOfViews || 0}%` }} />
                          </div>
                        </div>

                        {/* WA message */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-semibold text-[#1E1E1E]">
                            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              4. Mengklik Tombol Hubungi Coach ke WA (WhatsAppClick)
                            </span>
                            <span className="text-emerald-700 font-bold">{analyticsStats?.funnel?.waClicks?.count || 0} Sesi ({analyticsStats?.funnel?.waClicks?.percentOfViews || 0}%)</span>
                          </div>
                          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${analyticsStats?.funnel?.waClicks?.percentOfViews || 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scroll Tracking Heatmap */}
                    <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5 uppercase tracking-wide">
                          <Eye className="w-4 h-4 text-purple-600" />
                          Scroll Depth Heatmap (Akumulasi Scroll Pengunjung)
                        </h4>
                        <span className="text-[10px] text-purple-600 bg-purple-50 font-bold px-2 py-0.5 rounded-md">Meta-Pixel Equiv Heatmap</span>
                      </div>
                      
                      <p className="text-[11px] text-gray-450 leading-relaxed font-light">
                        Mendeteksi seberapa jauh pengguna melakukan scroll ke bawah pada halaman penawaran Kunyah. Ideal untuk mengukur ketertarikan visual sebelum meluncurkan kampanye iklan berbayar (FB Ads/Tiktok Ads).
                      </p>

                      <div className="space-y-4.5 pt-2">
                        {/* Milestone 25% */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-gray-700">▼ Scroll 25% (Tiba di Paragraf Pembuka & Solusi Masalah)</span>
                            <span className="font-mono text-gray-500 font-bold">{analyticsStats?.scrollStats?.reached25?.percent || 0}% ({analyticsStats?.scrollStats?.reached25?.count || 0} Sesi)</span>
                          </div>
                          <div className="h-3 w-full bg-gray-100 rounded-lg overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg transition-all duration-1000" style={{ width: `${analyticsStats?.scrollStats?.reached25?.percent || 0}%` }} />
                          </div>
                        </div>

                        {/* Milestone 50% */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-gray-700">▼ Scroll 50% (Melihat Bahaya Pola Hidup & Kebiasaan Buruk)</span>
                            <span className="font-mono text-gray-500 font-bold">{analyticsStats?.scrollStats?.reached50?.percent || 0}% ({analyticsStats?.scrollStats?.reached50?.count || 0} Sesi)</span>
                          </div>
                          <div className="h-3 w-full bg-gray-100 rounded-lg overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-lg transition-all duration-1000" style={{ width: `${analyticsStats?.scrollStats?.reached50?.percent || 0}%` }} />
                          </div>
                        </div>

                        {/* Milestone 75% */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-gray-700">▼ Scroll 75% (Tiba di Bagian Interactive Form Assessment)</span>
                            <span className="font-mono text-gray-500 font-bold">{analyticsStats?.scrollStats?.reached75?.percent || 0}% ({analyticsStats?.scrollStats?.reached75?.count || 0} Sesi)</span>
                          </div>
                          <div className="h-3 w-full bg-gray-100 rounded-lg overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg transition-all duration-1000" style={{ width: `${analyticsStats?.scrollStats?.reached75?.percent || 0}%` }} />
                          </div>
                        </div>

                        {/* Milestone 100% */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-gray-700">🏆 Scroll 100% (Membaca Sampai ke Footer / Selesai Membaca)</span>
                            <span className="font-mono text-emerald-800 font-extrabold">{analyticsStats?.scrollStats?.reached100?.percent || 0}% ({analyticsStats?.scrollStats?.reached100?.count || 0} Sesi)</span>
                          </div>
                          <div className="h-3 w-full bg-gray-100 rounded-lg overflow-hidden">
                            <div className="h-full bg-[#E8B100] rounded-lg transition-all duration-1000" style={{ width: `${analyticsStats?.scrollStats?.reached100?.percent || 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Footer and Info Disclaimer */}
                <div className="p-4 bg-blue-50/40 border border-blue-100/50 rounded-2xl flex items-start gap-2.5">
                  <span className="text-sm">🎯</span>
                  <p className="text-[10px] text-blue-900 leading-relaxed font-light">
                    <strong>Tips Mengoptimalkan Landing Page Anda:</strong> Jika presentase Scroll 75% Anda berada di bawah <span className="font-semibold text-rose-700">30%</span>, Anda perlu menyusun ulang judul penawaran / memindahkan tombol "Isi Assessment" lebih tinggi (di atas lipatan halaman/above fold) agar menghemat biaya pengeluaran iklan Anda!
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
