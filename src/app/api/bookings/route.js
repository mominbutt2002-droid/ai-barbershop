import { NextResponse } from "next/server";
import { createBooking } from "@/lib/booking";
import { jsonError } from "@/lib/http";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await createBooking({ ...body, source: "site" });
    return NextResponse.json({ ok: true, notified: result.notified, booking: result.booking });
  } catch (error) {
    return jsonError(error);
  }
}
