import { NextResponse } from "next/server";
import { createBooking } from "@/lib/booking";
import { BookingError } from "@/lib/errors";
import { jsonError } from "@/lib/http";
import { parseTelegramUser } from "@/lib/telegram";

export async function POST(request) {
  try {
    const body = await request.json();
    const header = request.headers.get("authorization") || "";
    const initData = header.toLowerCase().startsWith("tma ") ? header.slice(4) : body.initData;
    const user = parseTelegramUser(initData);
    if (!user) throw new BookingError("Откройте запись из Telegram-бота", 401);
    const result = await createBooking({
      ...body,
      source: "telegram",
      telegramChatId: String(user.id),
    });
    return NextResponse.json({ ok: true, notified: result.notified, booking: result.booking });
  } catch (error) {
    return jsonError(error);
  }
}
