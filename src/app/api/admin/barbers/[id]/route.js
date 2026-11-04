import { NextResponse } from "next/server";
import { isId, saveBarber } from "@/lib/barbers";
import { BookingError } from "@/lib/errors";
import { jsonError, requireAdmin } from "@/lib/http";

export async function PATCH(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    if (!isId(id)) throw new BookingError("Мастер не найден", 404);
    const body = await request.json();
    const barber = await saveBarber(id, body);
    return NextResponse.json({ barber });
  } catch (error) {
    return jsonError(error);
  }
}
