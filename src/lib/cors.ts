import { NextResponse } from "next/server";

/** Allowed origins that can call our API routes from the browser. */
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "capacitor://localhost",
  "file://",
];

/** Allowed HTTP methods for CORS preflight. */
const ALLOWED_METHODS = "GET, POST, PUT, DELETE, PATCH, OPTIONS";

/** Allowed request headers. */
const ALLOWED_HEADERS = "Content-Type, Authorization, X-API-Key";

/**
 * Return the appropriate `Access-Control-Allow-Origin` value for the request.
 */
function getAllowOrigin(req: Request): string {
  const origin = req.headers.get("origin") || "";
  if (!origin) return "*";
  // Allow any known origin
  for (const allowed of ALLOWED_ORIGINS) {
    if (origin === allowed || origin.startsWith(allowed)) {
      return origin;
    }
  }
  // Allow Capacitor / WebView / localhost origins
  if (origin.includes("capacitor") || origin.includes("localhost") || origin.includes("file://")) {
    return origin;
  }
  // Fall back to the requesting origin
  return origin;
}

/**
 * Add CORS headers to any NextResponse.
 */
export function addCorsHeaders(res: NextResponse, req: Request): NextResponse {
  const origin = getAllowOrigin(req);
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  res.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Vary", "Origin");
  return res;
}

/**
 * Respond to a CORS preflight (OPTIONS) request.
 * Always returns a Response (never null) so it's compatible with Next.js route handler types.
 */
export function handleCorsPreflight(req: Request): NextResponse {
  const status = req.method === "OPTIONS" ? 204 : 405;
  const origin = getAllowOrigin(req);
  const res = new NextResponse(null, { status });
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  res.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Max-Age", "86400");
  res.headers.set("Vary", "Origin");
  return res;
}
