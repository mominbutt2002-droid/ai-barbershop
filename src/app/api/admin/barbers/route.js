import { NextResponse } from "next/server";
import { saveBarber } from "@/lib/barbers";
import { jsonError, requireAdmin } from "@/lib/http";

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const barber = await saveBarber(null, body);
    return NextResponse.json({ barber });
  } catch (error) {
    return jsonError(error);
  }
}
