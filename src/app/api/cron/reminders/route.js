import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function allowed(request) {
  const secret = process.env.CRON_SECRET || process.env.SESSION_SECRET;
  const cron = request.headers.get("x-vercel-cron");
  const header = request.headers.get("authorization") || "";
  if (cron) return true;
  return Boolean(secret) && header === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!allowed(request)) {
    return NextResponse.json({ error: "Нужен ключ" }, { status: 401 });
  }
  await sendDueReminders();
  return NextResponse.json({ ok: true });
}
