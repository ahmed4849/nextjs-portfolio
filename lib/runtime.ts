import "server-only";
import { D1RestDatabase } from "./d1-rest";

let connection: D1RestDatabase | undefined;

export function database() {
  connection ??= new D1RestDatabase({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID || "",
    apiToken: process.env.CLOUDFLARE_D1_API_TOKEN || "",
  });
  return connection;
}

export function adminKey() {
  return process.env.ADMIN_KEY;
}

export function clientAddress(request: Request) {
  // Vercel overwrites this header at its proxy. Local runs share one bucket.
  if (!process.env.VERCEL) return "local";
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

export function requestOrigin(request: Request) {
  // Next.js may use an internal hostname in request.url. Host comes from the
  // incoming HTTP authority; browser scripts cannot replace it. Vercel serves HTTPS.
  const url = new URL(request.url);
  const host = request.headers.get("host") || url.host;
  const protocol = process.env.VERCEL ? "https:" : url.protocol;
  return new URL(`${protocol}//${host}`).origin;
}
