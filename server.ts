import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const LEADS_FILE = path.join(process.cwd(), "leads.json");
const CONFIG_FILE = path.join(process.cwd(), "config.json");

// Save and Load config.json on the server
function loadConfig() {
  const defaults = {
    appsScriptUrl: "https://script.google.com/macros/s/AKfycbwf6FwiJTRWfwQ_fwLi29kr0grkb8d3oocIkXaUVCRJj2szLhg7soo4atWe7bz5bpnzVQ/exec"
  };
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      if (data.trim()) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === "object") {
          return { ...defaults, ...parsed };
        }
      }
    }
  } catch (err) {
    console.error("Failed to read config file:", err);
  }
  return defaults;
}

function saveConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save config file:", err);
  }
}

// Robust JSON persistence for harian leads list
function loadLeads(): any[] {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    
    // Fallback/Initial sample leads for interactive feedback
    const sampleLeads = [
      {
        Timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        Nama: "Ahmad Fauzi",
        WA: "wa.me/6281234567890",
        Goal: "Menurunkan berat badan 10kg & memperbaiki stamina untuk bermain dengan anak",
        Challenge: "Sering lembur malam, tergoda ngemil gorengan dan manis setelah jam 9 malam",
        Activity: "Sangat sibuk (Duduk di depan laptop > 8 jam/hari)",
        Sleep: "Kurang tidur (4-5 jam sehari)",
        Dinner: "Makan berat porsi penuh (< 2 jam sebelum tidur)",
        "UTM Source": "instagram",
        "UTM Medium": "ads",
        Status: "New",
        "AI Summary": "Calon klien Ahmad Fauzi bertekad menurunkan berat badan 10kg, namun dibatasi oleh tantangan ngemil malam akibat kelelahan lembur serta kurang tidur. Rekomendasi utama: fokus memundurkan porsi makan berat sebelum jam 7 malam dan memperbaiki sirkadian."
      },
      {
        Timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        Nama: "Siti Rahmawati",
        WA: "wa.me/6287712345678",
        Goal: "Membentuk kebiasaan olahraga teratur & mengurangi begadang",
        Challenge: "Gampang lapar saat stres kerja dan kurang lingkungan pendukung (support system)",
        Activity: "Sedang (Sering berdiri / berjalan kaki ringan)",
        Sleep: "Cukup tidur (7-8 jam)",
        Dinner: "Lupa makan malam / diganti cemilan manis ringan seperti martabak",
        "UTM Source": "tiktok",
        "UTM Medium": "organic",
        Status: "New",
        "AI Summary": "Siti memiliki pola tidur yang baik (7-8 jam) namun terganggu kebiasaan mengganti makan malam penuh dengan cemilan manis saat stres kerja. Disarankan peningkatan konsumsi protein padat di sore hari untuk meredam craving gula."
      },
      {
        Timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
        Nama: "Budi Hartono",
        WA: "wa.me/628999888777",
        Goal: "Menurunkan kadar kolesterol tinggi & merampingkan lingkar perut",
        Challenge: "Kebiasaan makan gorengan bareng rekan kerja di kantor hampir setiap sore",
        Activity: "Sangat pasif (Jarang bergerak / olahraga)",
        Sleep: "Kurang tidur (4-5 jam sehari)",
        Dinner: "Makan berat porsi penuh (2-3 jam sebelum tidur)",
        "UTM Source": "google",
        "UTM Medium": "search",
        Status: "New",
        "AI Summary": "Budi menghadapi kolesterol tinggi dipicu lingkungan kerja yang tinggi konsumsi gorengan serta kurangnya mobilitas fisik. Intervensi terfokus pada pergantian gorengan sore hari dengan buah berserat tinggi & latihan peregangan statis."
      }
    ];
    fs.writeFileSync(LEADS_FILE, JSON.stringify(sampleLeads, null, 2), "utf-8");
    return sampleLeads;
  } catch (err) {
    console.error("Failed to read/prepopulate leads file:", err);
  }
  return [];
}

function saveLead(lead: any) {
  try {
    const leads = loadLeads();
    leads.unshift(lead); // newest lead remains on top for easy visualization
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save lead:", err);
  }
}

const ANALYTICS_FILE = path.join(process.cwd(), "analytics.json");

// Load tracking logs or generate realistic sample events for instant dashboard graphs
function loadAnalyticsEvents(): any[] {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, "utf-8");
      if (data.trim()) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }

    // Pre-populate with beautiful, organic looking sample logs for marketing insights
    const sampleEvents: any[] = [];
    const now = Date.now();
    const sessionsCount = 215; // Total mock visitors/sessions

    // Seed data with organic flow distribution:
    // PageViews (100%) -> Scroll 25% (78%) -> Scroll 50% (54%) -> Scroll 75% (37%) -> Scroll 100% (23%)
    // AssessmentStart (42%) -> LeadSubmit (24%) -> WhatsAppClick (15%)

    for (let i = 0; i < sessionsCount; i++) {
      const sessId = `sess-sample-${100000 + i}`;
      const delayMs = i * 45 * 60000; // spread over the last 1-2 days
      const eventTime = new Date(now - delayMs).toISOString();

      // All landed
      sampleEvents.push({ sessionId: sessId, timestamp: eventTime, event: "page_view", metadata: {} });

      // Scroll depths
      if (i % 10 < 8) { // 80% reached scroll depth 25%
        sampleEvents.push({ sessionId: sessId, timestamp: eventTime, event: "scroll_depth", metadata: { milestone: 25, scrollPercent: 28 } });
      }
      if (i % 10 < 5) { // 50% reached scroll depth 50%
        sampleEvents.push({ sessionId: sessId, timestamp: eventTime, event: "scroll_depth", metadata: { milestone: 50, scrollPercent: 55 } });
      }
      if (i % 10 < 3) { // 30% reached scroll depth 75%
        sampleEvents.push({ sessionId: sessId, timestamp: eventTime, event: "scroll_depth", metadata: { milestone: 75, scrollPercent: 78 } });
      }
      if (i % 10 < 2) { // 20% reached scroll depth 100%
        sampleEvents.push({ sessionId: sessId, timestamp: eventTime, event: "scroll_depth", metadata: { milestone: 100, scrollPercent: 100 } });
      }

      // Conversion funnel
      if (i % 10 < 4) { // 40% started assessment
        sampleEvents.push({ sessionId: sessId, timestamp: eventTime, event: "assessment_start", metadata: {} });

        if (i % 10 < 2.2) { // ~22% completed assessment
          sampleEvents.push({ sessionId: sessId, timestamp: eventTime, event: "assessment_complete", metadata: {} });

          if (i % 10 < 1.3) { // ~13% clicked WhatsApp
            sampleEvents.push({ sessionId: sessId, timestamp: eventTime, event: "whatsapp_click", metadata: {} });
          }
        }
      }
    }

    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(sampleEvents, null, 2), "utf-8");
    return sampleEvents;
  } catch (err) {
    console.error("Failed to load / prepopulate analytics:", err);
  }
  return [];
}

function saveAnalyticsEvent(event: any) {
  try {
    const events = loadAnalyticsEvents();
    events.push(event);
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(events, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save analytics event:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware
  app.use(express.json());

  // Handle CORS for external frontend hosting (e.g. Vercel)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });

  // Lazy initialize GoogleGenAI client (robust structure)
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to rules-based summary.");
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // API endpoint for assessment submission
  app.post("/api/assessment/submit", async (req, res) => {
    try {
      const { 
        name, 
        whatsapp, 
        goal, 
        challenge, 
        activity, 
        sleep, 
        dinner,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        fbclid
      } = req.body;
      
      if (!name || !whatsapp) {
        return res.status(400).json({ error: "Nama dan nomor WhatsApp wajib diisi." });
      }

      // Format WhatsApp format to have wa.me/62... prefix
      let formattedWhatsapp = String(whatsapp).trim();
      let cleanedDigits = formattedWhatsapp.replace(/\D/g, "");
      if (cleanedDigits.startsWith("0")) {
        cleanedDigits = "62" + cleanedDigits.substring(1);
      } else if (!cleanedDigits.startsWith("62")) {
        cleanedDigits = "62" + cleanedDigits;
      }
      formattedWhatsapp = `wa.me/${cleanedDigits}`;

      // Generate AI Summary using Gemini API or fallback
      let aiSummary = "";
      const ai = getGeminiClient();
      
      if (ai) {
        const prompt = `
Anda adalah Healthy Lifestyle Coach dari brand "Kunyah" di Indonesia (fokus pada penurunan berat badan & pola hidup sehat realistis berkelanjutan). 
Buatlah ringkasan analisis gaya hidup (lifestyle profile) singkat dalam 2-3 kalimat untuk calon klien ini berdasarkan input:
- Nama: ${name}
- WhatsApp: ${formattedWhatsapp}
- Goal utama: ${goal}
- Tantangan terbesar: ${challenge}
- Aktivitas harian: ${activity}
- Durasi tidur: ${sleep}
- Makan malam: ${dinner}

Berikan ringkasan yang sangat ramah, memotivasi, dan optimis menggunakan Bahasa Indonesia yang profesional dan empati tinggi. Temukan benang merah masalah mereka secara singkat (misal: pentingnya manajemen makan malam/tidur untuk konsistensi/progress) tanpa menghakimi atau terkesan mendikte secara berlebihan. Cocok untuk catatan spreadsheet dan dikirim via chat follow-up. Do not wrap in markdown quotes. Just return the raw paragraph text.
`;
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
          });
          aiSummary = response.text ? response.text.trim() : "Profil berhasil dianalisis. Menunggu follow up.";
        } catch (err: any) {
          console.error("Gemini API Error:", err);
          aiSummary = `${name} ingin fokus pada "${goal}" dengan tantangan utama "${challenge}". Kondisi tidur: ${sleep}, kebiasaan makan malam: ${dinner}. Perlu pembinaan berkala via WhatsApp.`;
        }
      } else {
        // Human-like premium local fallback rules in case API key is not present
        aiSummary = `Klien ${name} bertekad mencapai "${goal}" dengan kendala "${challenge}". Pola aktivitas harian ${activity}, pola tidur ${sleep}, dan kebiasaan makan malam ${dinner}. Siap berkolaborasi untuk merancang program hidup sehat yang berkelanjutan.`;
      }

      const timestamp = new Date().toISOString();
      const status = "New";

      // Integration placeholder for Apps Script & Spreadsheet
      // Loaded dynamically from saved configurations
      const config = loadConfig();
      const appScriptUrl = config.appsScriptUrl || process.env.APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbwf6FwiJTRWfwQ_fwLi29kr0grkb8d3oocIkXaUVCRJj2szLhg7soo4atWe7bz5bpnzVQ/exec";
      let postedToSpreadsheet = false;

      // Log the payload containing the exact 14 columns in sequence AND deep case fallbacks for maximum robust mapping
      const spreadsheetData = {
        // EXACT SEQUENCE & CASE MATCHERS FOR THE 14 SPREADSHEET HEADERS
        Timestamp: timestamp,
        Nama: name,
        WA: formattedWhatsapp,
        Goal: goal,
        Challenge: challenge,
        Activity: activity,
        Sleep: sleep,
        Dinner: dinner,
        "UTM Source": utm_source || "",
        "UTM Medium": utm_medium || "",
        Campaign: utm_campaign || "",
        Content: utm_content || "",
        FBCLID: fbclid || "",
        Status: status,

        // DEEP LOWERCASE FALLBACKS AND PROPERTY COINCIDENCES FOR MULTIPLE APPS SCRIPT PATTERNS
        timestamp: timestamp,
        nama: name,
        name: name,
        wa: formattedWhatsapp,
        whatsapp: formattedWhatsapp,
        goal: goal,
        challenge: challenge,
        activity: activity,
        sleep: sleep,
        dinner: dinner,
        utm_source: utm_source || "",
        utm_medium: utm_medium || "",
        utm_campaign: utm_campaign || "",
        utm_content: utm_content || "",
        fbclid: fbclid || "",
        status: status,

        // RESULTS METADATA & INTERACTIVE DISPLAY BACKUPS
        "AI Summary": aiSummary,
        aiSummary: aiSummary,
        "ai summary": aiSummary,
        aisummary: aiSummary
      };

      console.log("--- GOOGLE SPREADSHEET ROW LOG ---");
      console.log(JSON.stringify(spreadsheetData, null, 2));

      // Save submission to our robust local JSON database file harian
      saveLead(spreadsheetData);

      if (appScriptUrl) {
        console.log("Triggering robust Apps Script Sync to URL:", appScriptUrl);
        
        // 1. First Attempt: POST JSON (the standard modern method)
        try {
          const response = await fetch(appScriptUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(spreadsheetData)
          });
          if (response.ok) {
            postedToSpreadsheet = true;
            console.log("Apps Script Sync Status: Success via POST JSON");
          } else {
            console.warn("POST JSON responded with non-ok status:", response.status);
          }
        } catch (err) {
          console.error("POST JSON attempt failed, trying urlencoded...", err);
        }

        // 2. Second Attempt (URL-encoded POST): For Apps Scripts configured to pull from e.parameter in doPost(e)
        if (!postedToSpreadsheet) {
          try {
            const formBody = new URLSearchParams();
            Object.entries(spreadsheetData).forEach(([key, val]) => {
              formBody.append(key, String(val));
            });

            const responseForm = await fetch(appScriptUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: formBody.toString()
            });
            if (responseForm.ok) {
              postedToSpreadsheet = true;
              console.log("Apps Script Sync Status: Success via POST Form URL-encoded");
            } else {
              console.warn("POST Form URL-encoded responded with non-ok status:", responseForm.status);
            }
          } catch (errForm) {
            console.error("POST Form URL-encoded attempt failed, trying query parameters GET...", errForm);
          }
        }

        // 3. Third Attempt (GET searchParams): For Apps Scripts configured using doGet(e) and e.parameter
        if (!postedToSpreadsheet) {
          try {
            const getUrl = new URL(appScriptUrl);
            Object.entries(spreadsheetData).forEach(([key, val]) => {
              getUrl.searchParams.append(key, String(val));
            });

            const responseGet = await fetch(getUrl.toString(), {
              method: "GET"
            });
            if (responseGet.ok) {
              postedToSpreadsheet = true;
              console.log("Apps Script Sync Status: Success via GET Query Parameters");
            } else {
              console.warn("GET responded with non-ok status:", responseGet.status);
            }
          } catch (errGet) {
            console.error("GET attempt failed. Sync incomplete.", errGet);
          }
        }
      }

      return res.status(200).json({
        success: true,
        data: spreadsheetData,
        postedToSpreadsheet,
        appsScriptConfigured: !!appScriptUrl,
      });

    } catch (error: any) {
      console.error("Submit Error:", error);
      return res.status(500).json({ error: "Gagal memproses assessment harian. Silakan coba lagi." });
    }
  });

  // API endpoint for admin to list leads
  app.get("/api/admin/leads", (req, res) => {
    try {
      const leads = loadLeads();
      return res.status(200).json(leads);
    } catch (error) {
      console.error("Failed to load admin leads:", error);
      return res.status(500).json({ error: "Gagal memuat database leads." });
    }
  });

  // Get Admin Apps Script Settings
  app.get("/api/admin/config", (req, res) => {
    try {
      const config = loadConfig();
      return res.status(200).json(config);
    } catch (err) {
      return res.status(500).json({ error: "Gagal memuat konfigurasi server." });
    }
  });

  // Save Admin Apps Script Settings
  app.post("/api/admin/config", (req, res) => {
    try {
      const { appsScriptUrl } = req.body;
      if (!appsScriptUrl || !appsScriptUrl.startsWith("http")) {
        return res.status(400).json({ error: "URL tidak valid. URL harus diawali dengan http:// atau https://" });
      }
      const config = loadConfig();
      config.appsScriptUrl = appsScriptUrl.trim();
      saveConfig(config);
      return res.status(200).json({ success: true, config });
    } catch (err) {
      return res.status(500).json({ error: "Gagal menyimpan konfigurasi server." });
    }
  });

  // Sync all accumulated leads to Google Sheet via Apps Script
  app.post("/api/admin/sync-all", async (req, res) => {
    try {
      const config = loadConfig();
      const url = config.appsScriptUrl;
      if (!url) {
        return res.status(400).json({ error: "Google Apps Script URL belum dikonfigurasi di server." });
      }

      const leads = loadLeads();
      if (leads.length === 0) {
        return res.status(200).json({ success: true, count: 0, message: "Tidak ada data lead untuk dikirim." });
      }

      console.log(`Starting Batch Sync of ${leads.length} leads in parallel to ${url}`);

      // Sync in parallel via Promise.all so it completes instantly
      const syncPromises = leads.map(async (lead) => {
        try {
          // Attempt 1: POST JSON
          let response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lead),
          });

          if (response.ok) {
            return true;
          }

          // Attempt 2: urlencoded Form
          const formBody = new URLSearchParams();
          Object.entries(lead).forEach(([key, val]) => {
            formBody.append(key, String(val));
          });
          const responseForm = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formBody.toString()
          });

          return responseForm.ok;
        } catch (err) {
          console.error("Error syncing individual lead in parallel sync-all loop:", err);
          return false;
        }
      });

      const results = await Promise.all(syncPromises);
      const successCount = results.filter(Boolean).length;
      const failCount = results.length - successCount;

      return res.status(200).json({
        success: true,
        total: leads.length,
        successCount,
        failCount,
        message: `Sinkronisasi selesai! ${successCount} baris berhasil dikirim, ${failCount} gagal.`
      });

    } catch (err) {
      console.error("Batch sync exception:", err);
      return res.status(500).json({ error: "Terjadi kesalahan internal saat sinkronisasi massal." });
    }
  });

  // Track an incoming analytics event
  app.post("/api/analytics/track", (req, res) => {
    try {
      const { sessionId, timestamp, event, metadata } = req.body;
      if (!sessionId || !event) {
        return res.status(400).json({ error: "sessionId & event are required" });
      }

      // Format event name for unified support (both lowercase & PascalCase)
      let canonicalEvent = String(event).toLowerCase();
      // Keep support for standard event tags standardizing on lower snake case internally
      if (canonicalEvent === "pageview") canonicalEvent = "page_view";
      if (canonicalEvent === "leadsubmit") canonicalEvent = "assessment_complete";
      if (canonicalEvent === "assessmentstart") canonicalEvent = "assessment_start";

      const logEntry = {
        sessionId,
        timestamp: timestamp || new Date().toISOString(),
        event: canonicalEvent,
        metadata: metadata || {}
      };

      saveAnalyticsEvent(logEntry);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Error logging analytics payload:", err);
      return res.status(500).json({ error: "Failed to persist event" });
    }
  });

  // Fetch compiled statistics for the Admin Dashboard
  app.get("/api/analytics/stats", (req, res) => {
    try {
      const events = loadAnalyticsEvents();
      
      // Calculate totals and distinct counts
      const uniqueSessions = new Set<string>();
      
      // Funnel session sets
      const viewSessions = new Set<string>();
      const startSessions = new Set<string>();
      const completeSessions = new Set<string>();
      const waSessions = new Set<string>();

      // Scroll depths session maps (each session records milestones)
      const scroll25Sessions = new Set<string>();
      const scroll50Sessions = new Set<string>();
      const scroll75Sessions = new Set<string>();
      const scroll100Sessions = new Set<string>();

      let totalHits = 0;

      for (const ev of events) {
        const sess = ev.sessionId;
        const name = String(ev.event).toLowerCase();
        uniqueSessions.add(sess);
        totalHits++;

        if (name === "page_view" || name === "pageview") {
          viewSessions.add(sess);
        } else if (name === "assessment_start" || name === "assessmentstart") {
          startSessions.add(sess);
        } else if (name === "assessment_complete" || name === "leadsubmit") {
          completeSessions.add(sess);
        } else if (name === "whatsapp_click" || name === "whatsappclick") {
          waSessions.add(sess);
        } else if (name === "scroll_depth") {
          const m = ev.metadata?.milestone;
          if (m === 25) scroll25Sessions.add(sess);
          else if (m === 50) scroll50Sessions.add(sess);
          else if (m === 75) scroll75Sessions.add(sess);
          else if (m === 100) scroll100Sessions.add(sess);
        }
      }

      const totalUniqueCount = uniqueSessions.size || 1; // avoid divide by zero

      const funnel = {
        views: {
          total: totalHits, // approximate hits
          unique: viewSessions.size || uniqueSessions.size // fallback
        },
        starts: {
          count: startSessions.size,
          percentOfViews: Math.round(((startSessions.size) / (viewSessions.size || totalUniqueCount)) * 100)
        },
        completes: {
          count: completeSessions.size,
          percentOfStarts: Math.round(((completeSessions.size) / (startSessions.size || 1)) * 100),
          percentOfViews: Math.round(((completeSessions.size) / (viewSessions.size || totalUniqueCount)) * 100)
        },
        waClicks: {
          count: waSessions.size,
          percentOfCompletes: Math.round(((waSessions.size) / (completeSessions.size || 1)) * 100),
          percentOfViews: Math.round(((waSessions.size) / (viewSessions.size || totalUniqueCount)) * 100)
        }
      };

      const scrollStats = {
        totalSessions: totalUniqueCount,
        reached25: {
          count: scroll25Sessions.size,
          percent: Math.round((scroll25Sessions.size / totalUniqueCount) * 100)
        },
        reached50: {
          count: scroll50Sessions.size,
          percent: Math.round((scroll50Sessions.size / totalUniqueCount) * 100)
        },
        reached75: {
          count: scroll75Sessions.size,
          percent: Math.round((scroll75Sessions.size / totalUniqueCount) * 100)
        },
        reached100: {
          count: scroll100Sessions.size,
          percent: Math.round((scroll100Sessions.size / totalUniqueCount) * 100)
        }
      };

      return res.status(200).json({
        success: true,
        summary: {
          totalSessions: totalUniqueCount,
          totalEventsRecord: events.length
        },
        funnel,
        scrollStats
      });

    } catch (err) {
      console.error("Error generating stats report:", err);
      return res.status(500).json({ error: "Failed to compile stats reporting" });
    }
  });

  // Endpoint to clear trackers if needed
  app.post("/api/analytics/clear", (req, res) => {
    try {
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify([], null, 2), "utf-8");
      return res.status(200).json({ success: true, message: "Analytics logs cleared successfully" });
    } catch (err) {
      return res.status(500).json({ error: "Failed to clear logs" });
    }
  });

  // Serve static files / Vite HMR
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server loaded and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
