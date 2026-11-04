import { NextResponse } from "next/server";
import { configureTelegram } from "@/bot/main";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function allowed(request) {
  const secret = process.env.CRON_SECRET || process.env.SESSION_SECRET;
  const header = request.headers.get("authorization") || "";
  return Boolean(secret) && header === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!allowed(request)) {
    return NextResponse.json({ error: "Нужен ключ" }, { status: 401 });
  }
  await configureTelegram();
  return NextResponse.json({ ok: true });
}
