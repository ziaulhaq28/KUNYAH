export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const hostname = window.location.hostname;
  
  // If running on local dev interface, preview container, or the sandbox runner URLs
  if (
    hostname === "localhost" || 
    hostname === "127.0.0.1" || 
    hostname.includes("run.app") || 
    hostname.includes("webcontainer") ||
    hostname.includes("stackblitz")
  ) {
    return cleanPath;
  }
  
  // If running on external deployment like Vercel (kunyah.vercel.app),
  // automatically route API actions to our online container backend.
  return `https://ais-pre-wcxrrczf7xtofhrzwtykfy-258600169716.asia-southeast1.run.app${cleanPath}`;
}
