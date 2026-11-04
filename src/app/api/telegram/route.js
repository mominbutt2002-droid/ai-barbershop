import { webhookCallback } from "grammy";
import { bot, webhookSecret } from "@/bot/main";
import { sendDueReminders } from "@/lib/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handleUpdate = webhookCallback(bot, "std/http", {
  secretToken: webhookSecret() || undefined,
});

export async function POST(request) {
  const response = await handleUpdate(request);
  sendDueReminders().catch((error) => console.error("Сбой напоминаний", error));
  return response;
}
