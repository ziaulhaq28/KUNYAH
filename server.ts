import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware
  app.use(express.json());

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
      // The instruction specifically asks to prepare the Apps Script integration payload structure ready.
      const appScriptUrl = process.env.APPS_SCRIPT_URL;
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

      if (appScriptUrl) {
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
          } else {
            console.warn("Apps Script responded with non-ok status:", response.status);
          }
        } catch (err) {
          console.error("Spreadsheet Sync Failed (is APPS_SCRIPT_URL correct?):", err);
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
