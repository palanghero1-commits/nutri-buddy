import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
const configuredSecret = process.env.AUTH_SESSION_SECRET || "";
if (isProduction && (!configuredSecret || configuredSecret.startsWith("replace-with-"))) throw new Error("Set AUTH_SESSION_SECRET to a unique random value before starting in production.");
if (configuredSecret && Buffer.byteLength(configuredSecret) < 32) throw new Error("AUTH_SESSION_SECRET must contain at least 32 bytes.");
const secret = configuredSecret || randomBytes(32).toString("base64url");
const tokenLifetimeSeconds = 60 * 60 * 12;

export function createSessionToken(email, role) {
  if (!secret) throw new Error("Set AUTH_SESSION_SECRET to a long random value before using authenticated API routes in production.");
  const payload = Buffer.from(JSON.stringify({ email: String(email).toLowerCase(), role, exp: Math.floor(Date.now() / 1000) + tokenLifetimeSeconds })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readSession(request) {
  if (!secret) return null;
  const token = String(request.headers.authorization || "").match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  let received;
  try { received = Buffer.from(signature, "base64url"); } catch { return null; }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.email || !["admin", "bhw", "user"].includes(session.role) || session.exp <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function sessionHasRole(request, ...roles) {
  const session = readSession(request);
  return session && roles.includes(session.role) ? session : null;
}

export function isPublicApiRequest(method, pathname) {
  return (method === "GET" && (pathname === "/api/health" || pathname === "/api/public-summary")) ||
    (method === "POST" && ["/api/auth/admin-login", "/api/auth/bhw-login", "/api/auth/user-login", "/api/auth/register", "/api/auth/reset-password"].includes(pathname));
}
