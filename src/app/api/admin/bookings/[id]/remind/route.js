import { NextResponse } from "next/server";
import { isId } from "@/lib/barbers";
import { BookingError } from "@/lib/errors";
import { jsonError, requireAdmin } from "@/lib/http";
import { sendManualReminder } from "@/lib/reminders";

export async function POST(_request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    if (!isId(id)) throw new BookingError("Заявка не найдена", 404);
    await sendManualReminder(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
