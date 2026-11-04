import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import {
  passwordsMatch,
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
} from "@/lib/session";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const password = body?.password;
    const expected = process.env.ADMIN_PASSWORD;
    if (typeof password !== "string" || password.length > 200 || !expected || !passwordsMatch(password, expected)) {
      return NextResponse.json({ error: "Пароль не подошёл" }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, signSession(), sessionCookieOptions());
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
