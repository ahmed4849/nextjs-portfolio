import { z } from "zod";
import {
  boundary,
  body,
  database,
  getContent,
  json,
  profileSchema,
  projectSchema,
  requireAdmin,
} from "../../../lib/server";
export async function GET(request: Request) {
  return boundary(async () => {
    await requireAdmin(request);
    const content = await getContent();
    const messages = await database()
      .prepare(
        "SELECT id,name,email,message,read,created_at AS createdAt FROM messages ORDER BY created_at DESC LIMIT 200",
      )
      .all();
    return json({ ...content, messages: messages.results });
  });
}
export async function PUT(request: Request) {
  return boundary(async () => {
    await requireAdmin(request, true);
    const profile = profileSchema.parse(await body(request));
    await getContent();
    await database()
      .prepare("UPDATE settings SET value=? WHERE id='profile'")
      .bind(JSON.stringify(profile))
      .run();
    return json({ profile });
  });
}
export async function POST(request: Request) {
  return boundary(async () => {
    await requireAdmin(request, true);
    const input = projectSchema.parse(await body(request));
    await getContent();
    const id = input.id || crypto.randomUUID();
    const exists = await database()
      .prepare("SELECT id FROM projects WHERE id=?")
      .bind(id)
      .first();
    if (exists)
      await database()
        .prepare(
          "UPDATE projects SET title=?,category=?,description=?,stack=?,url=?,theme=? WHERE id=?",
        )
        .bind(
          input.title,
          input.category,
          input.description,
          input.stack,
          input.url,
          input.theme,
          id,
        )
        .run();
    else
      await database()
        .prepare(
          "INSERT INTO projects (id,title,category,description,stack,url,theme,created_at) VALUES (?,?,?,?,?,?,?,?)",
        )
        .bind(
          id,
          input.title,
          input.category,
          input.description,
          input.stack,
          input.url,
          input.theme,
          Date.now(),
        )
        .run();
    return json({ id });
  });
}
export async function PATCH(request: Request) {
  return boundary(async () => {
    await requireAdmin(request, true);
    const { id } = z
      .object({ id: z.string().min(1).max(100) })
      .parse(await body(request));
    await database()
      .prepare("UPDATE messages SET read=1 WHERE id=?")
      .bind(id)
      .run();
    return json({ success: true });
  });
}
export async function DELETE(request: Request) {
  return boundary(async () => {
    await requireAdmin(request, true);
    const { id, type } = z
      .object({
        id: z.string().min(1).max(100),
        type: z.enum(["project", "message"]),
      })
      .parse(await body(request));
    await database()
      .prepare(
        type === "project"
          ? "DELETE FROM projects WHERE id=?"
          : "DELETE FROM messages WHERE id=?",
      )
      .bind(id)
      .run();
    return json({ success: true });
  });
}
