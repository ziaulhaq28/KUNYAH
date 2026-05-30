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
  
  // Sheet Settings State
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem("kunyah_spreadsheet_id") || "";
  });
  const [sheetName, setSheetName] = useState<string>(() => {
    return localStorage.getItem("kunyah_sheet_name") || "Leads";
  });
  
  const [syncStatus, setSyncStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Handle Auth State Changes using Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAccessToken(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch leads from backend server
  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch("/api/admin/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      } else {
        console.error("Failed to fetch leads from server");
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchLeads();
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
      setSyncStatus({ 
        type: "error", 
        message: err.message || "Gagal login dengan Google." 
      });
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

  const saveSettings = () => {
    localStorage.setItem("kunyah_spreadsheet_id", spreadsheetId.trim());
    localStorage.setItem("kunyah_sheet_name", sheetName.trim());
    setSyncStatus({
      type: "success",
      message: "Pengaturan Spreadsheet disimpan lokal!"
    });
    setTimeout(() => {
      setSyncStatus({ type: "idle", message: "" });
    }, 3000);
  };

  // Sync / Append rows to Google Sheet via REST API v4
  const syncToGoogleSheets = async () => {
    if (!accessToken) {
      setSyncStatus({ 
        type: "error", 
        message: "Silakan hubungkan Google Akun Anda terlebih dahulu." 
      });
      return;
    }

    if (!spreadsheetId.trim()) {
      setSyncStatus({ 
        type: "error", 
        message: "Spreadsheet ID tidak boleh kosong." 
      });
      return;
    }

    setSyncStatus({ type: "loading", message: "Menghubungkan ke Google Sheets API..." });

    try {
      // Ensure we append headers first if sheet is empty or we can just append standard values
      // We append all leads currently in the list
      const rows = leads.map(lead => [
        lead.Timestamp || "",
        lead.Nama || "",
        lead.WA || "",
        lead.Goal || "",
        lead.Challenge || "",
        lead.Activity || "",
        lead.Sleep || "",
        lead.Dinner || "",
        lead["UTM Source"] || "",
        lead["UTM Medium"] || "",
        lead.Campaign || "",
        lead.Content || "",
        lead.FBCLID || "",
        lead.Status || "New",
        lead["AI Summary"] || ""
      ]);

      if (rows.length === 0) {
        setSyncStatus({ 
          type: "success", 
          message: "Tidak ada data lead baru untuk disinkronkan." 
        });
        return;
      }

      const activeSheetName = sheetName.trim() || "Leads";
      const range = `${activeSheetName}!A1`;

      // Google Sheets API batch update or append rows
      // We use append which automatically matches layout
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId.trim()}/values/${range}:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            values: rows
          })
        }
      );

      const resData = await response.json();

      if (response.ok) {
        setSyncStatus({
          type: "success",
          message: `Sukses sinkronisasi! ${rows.length} lead berhasil ditambahkan ke sheet "${activeSheetName}".`
        });
      } else {
        console.error("Sheets API error:", resData);
        setSyncStatus({
          type: "error",
          message: resData.error?.message || "Gagal sinkron Google Sheet. Cek API permissions & Sheet ID."
        });
      }
    } catch (err: any) {
      console.error("Sync error:", err);
      setSyncStatus({
        type: "error",
        message: "Koneksi terputus. Pastikan Spreadsheet ID valid & Anda memiliki hak edit."
      });
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
          <div className="lg:col-span-4 border-r border-gray-100 p-6 overflow-y-auto space-y-6 bg-gray-50/50">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#E8B100]" />
                Koneksi Google Sheets
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed font-light">
                Otorisasi Google di bawah ini untuk mengaktifkan sinkronisasi mandiri ke file spreadsheet milik Anda langsung dari dashboard ini.
              </p>
            </div>

            {/* Auth panel */}
            {!user ? (
              <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm space-y-4 text-center">
                <p className="text-xs text-gray-400">Google Sheets API memerlukan login akun admin</p>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.78 0 3.39.61 4.65 1.8l3.48-3.48C17.98 1.19 15.15 0 12 0 7.31 0 3.26 2.69 1.25 6.62l3.96 3.07C6.16 6.62 8.87 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57l3.77 2.92c2.2-2.03 3.48-5.02 3.48-8.65z" />
                    <path fill="#FBBC05" d="M5.21 14.54c-.23-.69-.37-1.43-.37-2.2s.14-1.51.37-2.2L1.25 7.07c-.83 1.66-1.25 3.53-1.25 5.5s.42 3.84 1.25 5.5l3.96-3.07z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.77-2.92c-1.05.7-2.39 1.13-3.95 1.13-3.13 0-5.78-2.12-6.73-5.04L1.29 17.3c2 3.93 6.05 6.62 10.71 6.62z" />
                  </svg>
                  {isLoggingIn ? "Menghubungkan..." : "Hubungkan ke Google"}
                </button>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-2xl border border-yellow-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-2xs font-extrabold text-emerald-600 uppercase tracking-wider">Terkoneksi</span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold"
                  >
                    <LogOut className="w-3 h-3" /> Logout
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <img 
                    src={user.photoURL || ""} 
                    alt={user.displayName || "Admin"} 
                    className="w-10 h-10 rounded-full border border-[#E8B100]/20"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-800">{user.displayName}</p>
                    <p className="text-[10px] text-gray-400 truncate max-w-[180px]">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Config Fields */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                Target Spreadsheet
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Spreadsheet ID</label>
                  <input 
                    type="text" 
                    value={spreadsheetId} 
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder="Contoh: 1X_abcdef12345..." 
                    className="w-full px-3.5 py-2.5 bg-gray-50 focus:bg-white text-xs text-gray-800 rounded-xl border border-gray-200 focus:border-[#E8B100] outline-none transition-all placeholder:text-gray-300"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                    Salin ID panjang dari URL Google Sheet Anda: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600 font-mono">/d/<strong>SPREADSHEET_ID_DISINI</strong>/edit</code>
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sheet Name (Nama Tab)</label>
                  <input 
                    type="text" 
                    value={sheetName} 
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="Contoh: Leads atau Sheet1" 
                    className="w-full px-3.5 py-2.5 bg-gray-50 focus:bg-white text-xs text-gray-800 rounded-xl border border-gray-200 focus:border-[#E8B100] outline-none transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Pastikan nama tab di Spreadsheet Anda cocok persis.</p>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={saveSettings}
                    className="flex-1 py-2 px-3 text-2xs font-extrabold uppercase bg-gray-100 hover:bg-gray-250 text-gray-600 rounded-xl transition-colors cursor-pointer"
                  >
                    Simpan Saja
                  </button>
                  <button
                    onClick={syncToGoogleSheets}
                    disabled={!user || !spreadsheetId}
                    className="flex-1 py-2 px-3 text-2xs font-extrabold uppercase bg-[#E8B100] hover:bg-[#D5A200] disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl shadow-md shadow-yellow-500/10 transition-all cursor-pointer"
                  >
                    Sync Sekarang
                  </button>
                </div>
              </div>
            </div>

            {/* Status alerts */}
            {syncStatus.type !== "idle" && (
              <div className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 ${
                syncStatus.type === "loading" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                syncStatus.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                "bg-rose-50 text-rose-800 border border-rose-200"
              }`}>
                {syncStatus.type === "loading" && <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
                {syncStatus.type === "success" && <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />}
                {syncStatus.type === "error" && <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />}
                <div>
                  <p className="font-bold">{syncStatus.type === "loading" ? "Proses..." : syncStatus.type === "success" ? "Sukses!" : "Kesalahan"}</p>
                  <p className="text-[11px] leading-relaxed mt-0.5 font-light">{syncStatus.message}</p>
                </div>
              </div>
            )}
            
            <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 text-[10px] text-gray-500 leading-relaxed md:p-5">
              💡 <strong>Integrasi Apps Script Aktif:</strong> Saat pengunjung baru mengisi form assessment, data tetap dikirim secara simultan ke Google Apps Script Anda sebagai backup otomatis demi menjaga redundansi database.
            </div>
          </div>

          {/* Right panel - Lead Table and View */}
          <div className="lg:col-span-8 p-6 overflow-hidden flex flex-col space-y-4">
            
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
