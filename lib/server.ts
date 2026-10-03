import { database, adminKey, clientAddress, requestOrigin } from "./runtime";
import { z } from "zod";
import {
  defaultProfile,
  sampleProjects,
  type Profile,
  type Project,
} from "./content";

export { database } from "./runtime";
export const safeUrl = z
  .string()
  .max(1000)
  .refine((v) => {
    if (!v) return true;
    try {
      return ["https:", "http:"].includes(new URL(v).protocol);
    } catch {
      return false;
    }
  }, "Use a valid http or https URL.");
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  role: z.string().trim().min(1).max(120),
  headline: z.string().trim().min(1).max(160),
  bio: z.string().trim().max(3000),
  email: z.union([z.literal(""), z.string().email().max(254)]),
  github: safeUrl,
  linkedin: safeUrl,
  skills: z.string().trim().max(1000),
  available: z.boolean(),
});
export const projectSchema = z.object({
  id: z.string().max(100).optional(),
  title: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(3000),
  stack: z.string().trim().max(500),
  url: safeUrl,
  theme: z.enum(["orbit", "form"]),
});
export async function body(request: Request) {
  const raw = await request.text();
  if (raw.length > 16000)
    throw new HttpError(413, "That submission is too large.");
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Please send valid form data.");
  }
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function json(value: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}
export async function boundary(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof z.ZodError)
      return json(
        { error: error.issues[0]?.message || "Invalid form data." },
        400,
      );
    if (error instanceof HttpError)
      return json({ error: error.message }, error.status);
    console.error("Portfolio request failed", error);
    return json(
      { error: "This service is temporarily unavailable. Please try again." },
      503,
    );
  }
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== requestOrigin(request))
    throw new HttpError(403, "This request is not allowed.");
}
async function key() {
  const secret = adminKey();
  if (!secret || secret.length < 32)
    throw new Error("Admin access unavailable");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
function hex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
export async function hash(value: string) {
  return hex(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}
export async function passwordMatches(value: string) {
  const secret = adminKey();
  if (!secret) throw new Error("Admin access unavailable");
  const a = await hash(value),
    b = await hash(secret);
  let mismatch = 0;
  for (let i = 0; i < a.length; i++)
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
export async function sessionToken() {
  const expiry = String(Date.now() + 8 * 60 * 60 * 1000);
  const signature = hex(
    await crypto.subtle.sign(
      "HMAC",
      await key(),
      new TextEncoder().encode(`portfolio:${expiry}`),
    ),
  );
  return `${expiry}.${signature}`;
}
export async function authorized(request: Request) {
  const value = request.headers
    .get("cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("portfolio_session="))
    ?.slice(18);
  if (!value) return false;
  const [expiry, signature] = value.split(".");
  if (
    !/^\d{13}$/.test(expiry || "") ||
    !/^[a-f0-9]{64}$/.test(signature || "") ||
    Number(expiry) <= Date.now() ||
    Number(expiry) > Date.now() + 8 * 60 * 60 * 1000 + 60000
  )
    return false;
  return crypto.subtle.verify(
    "HMAC",
    await key(),
    Uint8Array.from(signature.match(/../g)!, (v) => parseInt(v, 16)),
    new TextEncoder().encode(`portfolio:${expiry}`),
  );
}
export async function requireAdmin(request: Request, mutation = false) {
  if (mutation) checkOrigin(request);
  if (!(await authorized(request)))
    throw new HttpError(401, "Please sign in to manage your portfolio.");
}
export function sessionCookie(request: Request, token: string, maxAge = 28800) {
  const secure = new URL(requestOrigin(request)).protocol === "https:" ? "; Secure" : "";
  return `portfolio_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}
export async function rateLimit(
  request: Request,
  purpose: string,
  limit: number,
  windowSeconds: number,
) {
  const now = Date.now();
  const db = database();
  const id = await hash(
    `${purpose}:${clientAddress(request)}:${Math.floor(now / (windowSeconds * 1000))}`,
  );
  const row = await db
    .prepare(
      "INSERT INTO rate_limits (id,count,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count",
    )
    .bind(id, now + windowSeconds * 1000)
    .first<{ count: number }>();
  if (!row || row.count > limit)
    throw new HttpError(429, "Too many attempts. Please try again later.");
  await db
    .prepare("DELETE FROM rate_limits WHERE expires_at < ?")
    .bind(now)
    .run();
}
export async function getContent(): Promise<{
  profile: Profile;
  projects: Project[];
}> {
  const db = database();
  const existing = await db
    .prepare("SELECT value FROM settings WHERE id='profile'")
    .first<{ value: string }>();
  if (!existing) {
    await db.batch([
      ...sampleProjects.map((p) =>
        db
          .prepare(
            "INSERT OR IGNORE INTO projects (id,title,category,description,stack,url,theme,created_at) SELECT ?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id='profile')",
          )
          .bind(
            p.id,
            p.title,
            p.category,
            p.description,
            p.stack,
            p.url,
            p.theme,
            Date.now(),
          ),
      ),
      db
        .prepare(
          "INSERT OR IGNORE INTO settings (id,value) VALUES ('profile',?)",
        )
        .bind(JSON.stringify(defaultProfile)),
    ]);
  }
  const profile = await db
    .prepare("SELECT value FROM settings WHERE id='profile'")
    .first<{ value: string }>();
  const rows = await db
    .prepare(
      "SELECT id,title,category,description,stack,url,theme FROM projects ORDER BY created_at ASC,id ASC",
    )
    .all<Project>();
  return {
    profile: profileSchema.parse(JSON.parse(profile!.value)),
    projects: rows.results,
  };
}
