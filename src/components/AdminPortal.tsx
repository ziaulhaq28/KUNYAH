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
  ExternalLink
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
  
  // Apps Script Server Settings State
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>("");
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Fetch leads and configuration from server
  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch("/api/admin/leads");
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
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.appsScriptUrl) {
            setAppsScriptUrl(data.appsScriptUrl);
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
    fetchLeads();
    fetchConfig();
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
    setSyncStatus({ type: "loading", message: "Menyimpan konfigurasi di server..." });

    try {
      const res = await fetch("/api/admin/config", {
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
          message: "Koneksi Google Apps Script berhasil disimpan & didaftarkan aktif!"
        });
        setTimeout(() => {
          setSyncStatus({ type: "idle", message: "" });
        }, 3000);
      } else {
        setSyncStatus({
          type: "error",
          message: data.error || `Gagal menyimpan konfigurasi server (${res.status}).`
        });
      }
    } catch (err: any) {
      setSyncStatus({
        type: "error",
        message: `Terjadi kesalahan rintangan koneksi dengan server: ${err?.message || err}`
      });
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

    setIsSyncingAll(true);
    setSyncStatus({ type: "loading", message: "Mengirim seluruh baris leads harian ke Google Sheet..." });

    try {
      const res = await fetch("/api/admin/sync-all", {
        method: "POST"
      });
      
      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(`Respon server tidak valid (${res.status} ${res.statusText}): ${responseText.substring(0, 150)}`);
      }

      if (res.ok && data.success) {
        setSyncStatus({
          type: "success",
          message: data.message || "Berhasil mengirim seluruh database ke Google Sheet!"
        });
      } else {
        setSyncStatus({
          type: "error",
          message: data.error || "Gagal memproses pengiriman data ke sheet."
        });
      }
    } catch (err: any) {
      setSyncStatus({
        type: "error",
        message: `Gagal terhubung ke modul sinkronisasi server harian: ${err?.message || err}`
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

          {/* Right panel - Lead Table and View */}
          <div className="lg:col-span-7 p-6 overflow-hidden flex flex-col space-y-4">
            
            {/* Search and reload header */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 self-start">
                <Table className="w-4 h-4 text-[#E8B100]" />
                Hasil Assessment Terkumpul ({leads.length})
              </h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-gray-450 absolute left-3 top-1/2 -translate-y-1/2" />
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
                          <div className="text-[10px]"><span className="text-gray-400">Tinggi:</span> {lead.Sleep}</div>
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
                Powered by Google AI Studio
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
