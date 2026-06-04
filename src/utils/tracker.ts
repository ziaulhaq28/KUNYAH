import { getApiUrl } from "./api";

// Generate a random session ID or retrieve the existing one for the session
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = sessionStorage.getItem("kunyah_tracker_session_id");
  if (!sessionId) {
    const randomArray = new Uint32Array(4);
    if (typeof window.crypto !== "undefined" && typeof window.crypto.getRandomValues === "function") {
      window.crypto.getRandomValues(randomArray);
    } else {
      randomArray[0] = Math.floor(Math.random() * 1000000);
      randomArray[1] = Math.floor(Math.random() * 1000000);
      randomArray[2] = Math.floor(Math.random() * 1000000);
      randomArray[3] = Math.floor(Math.random() * 1000000);
    }
    sessionId = "sess-" + Array.from(randomArray).map(n => n.toString(36)).join("-");
    sessionStorage.setItem("kunyah_tracker_session_id", sessionId);
  }
  return sessionId;
}

// Track a custom event to our lightweight server-side analytics system
export async function trackAnalyticsEvent(eventName: string, metadata: Record<string, any> = {}) {
  const sessionId = getOrCreateSessionId();
  const timestamp = new Date().toISOString();

  const payload = {
    sessionId,
    timestamp,
    event: eventName,
    metadata: {
      ...metadata,
      referrer: typeof document !== "undefined" ? document.referrer : "",
      href: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : ""
    }
  };

  console.log(`[Kunyah Tracker] Event logged: ${eventName}`, payload);

  try {
    const apiUrl = getApiUrl("/api/analytics/track");
    // Send background tracking beacon/fetch
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "cors" // Explicitly support CORS in production Vercel environments
    }).catch(err => {
      // Quiet fail-safe fallback
      console.warn("Analytics beacon delayed or offline:", err);
    });
  } catch (err) {
    console.warn("Analytics track failed:", err);
  }
}

// Global scroll depth tracking utility
let reportedMilestones = new Set<number>();

export function initScrollDepthTracker() {
  if (typeof window === "undefined") return;

  // Track initial page view event once
  trackAnalyticsEvent("page_view");

  let isDebouncing = false;

  const handleScroll = () => {
    if (isDebouncing) return;
    isDebouncing = true;

    requestAnimationFrame(() => {
      try {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        if (scrollHeight > 100) { // Keep safety margin for tiny window
          const scrollPercent = Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));
          const milestones = [25, 50, 75, 100];

          for (const milestone of milestones) {
            if (scrollPercent >= milestone && !reportedMilestones.has(milestone)) {
              reportedMilestones.add(milestone);
              trackAnalyticsEvent("scroll_depth", { milestone, scrollPercent });
            }
          }
        }
      } catch (err) {
        console.error("Scroll tracker calculations error:", err);
      }
      isDebouncing = false;
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
}
