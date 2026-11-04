import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readSession, SESSION_COOKIE } from "./session";
import { BookingError } from "./errors";

export async function requireAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!readSession(token)) {
    return NextResponse.json({ error: "Нужен вход в админку" }, { status: 401 });
  }
  return null;
}

export function jsonError(error) {
  if (error instanceof BookingError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Не получилось выполнить запрос" }, { status: 500 });
}
