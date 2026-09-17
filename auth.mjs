import { createHmac, timingSafeEqual } from "node:crypto";

const secret = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "nutri-track-local-development-secret";
if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("AUTH_SECRET must be configured in production.");
}
const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const decode = (value) => JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
const sign = (value) => createHmac("sha256", secret).update(value).digest("base64url");

export function createAuthToken(user) {
  const payload = { email: user.email, role: user.role, assignedArea: user.assignedArea ?? user.assigned_area ?? "", exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 };
  const body = `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}`;
  return `${body}.${sign(body)}`;
}

export function readAuthToken(request) {
  const header = request.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  try {
    const [headerPart, payloadPart, signature] = token.split(".");
    const body = `${headerPart}.${payloadPart}`;
    const expected = sign(body);
    if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const payload = decode(payloadPart);
    return payload.exp > Math.floor(Date.now() / 1000) && payload.email && payload.role ? payload : null;
  } catch {
    return null;
  }
}

export function requireRole(auth, roles) {
  return auth && roles.includes(auth.role);
}
