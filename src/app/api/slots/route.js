import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { listSlots } from "@/lib/slots";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slots = await listSlots({
      date: searchParams.get("date"),
      serviceId: searchParams.get("serviceId"),
      barberId: searchParams.get("barberId") || "any",
    });
    return NextResponse.json({ slots });
  } catch (error) {
    return jsonError(error);
  }
}
