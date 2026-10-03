import { z } from "zod";
import {
  authorized,
  boundary,
  body,
  checkOrigin,
  json,
  passwordMatches,
  rateLimit,
  sessionCookie,
  sessionToken,
} from "../../../lib/server";
export async function GET(request: Request) {
  return boundary(async () => json({ authorized: await authorized(request) }));
}
export async function POST(request: Request) {
  return boundary(async () => {
    checkOrigin(request);
    await rateLimit(request, "login", 10, 900);
    const { password } = z
      .object({ password: z.string().min(1).max(200) })
      .parse(await body(request));
    if (!(await passwordMatches(password)))
      return json({ error: "That access key is incorrect." }, 401);
    return json({ authorized: true }, 200, {
      "Set-Cookie": sessionCookie(request, await sessionToken()),
    });
  });
}
export async function DELETE(request: Request) {
  return boundary(async () => {
    checkOrigin(request);
    return json({ authorized: false }, 200, {
      "Set-Cookie": sessionCookie(request, "", 0),
    });
  });
}
