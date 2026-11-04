import { NextResponse } from "next/server";
import { setBookingStatus } from "@/lib/booking";
import { isId } from "@/lib/barbers";
import { BookingError } from "@/lib/errors";
import { jsonError, requireAdmin } from "@/lib/http";

export async function PATCH(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    if (!isId(id)) throw new BookingError("Заявка не найдена", 404);
    const body = await request.json();
    await setBookingStatus(id, body?.status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
