/**
 * API fetch helper that routes to Vercel when the app is bundled locally.
 * In development (next dev), relative paths work fine.
 * In production (static export in Capacitor), we need the absolute Vercel URL.
 */
const API_BASE = (process.env.NEXT_PUBLIC_VERCEL_URL || "").replace(/\/+$/, "");

export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" && API_BASE
    ? `${API_BASE}${input}`
    : input;
  return fetch(url, init);
}
