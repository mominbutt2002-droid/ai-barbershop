import crypto from "node:crypto";

export const SESSION_COOKIE = "kromka_session";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  return process.env.SESSION_SECRET || "";
}

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function signSession() {
  if (!secret()) throw new Error("SESSION_SECRET не задан");
  const payload = String(Date.now() + WEEK_MS);
  return `${payload}.${sign(payload)}`;
}

export function readSession(token) {
  if (!token || !secret()) return false;
  const [payload, signature] = String(token).split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  if (!crypto.timingSafeEqual(left, right)) return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && Date.now() <= expires;
}

export function passwordsMatch(input, expected) {
  const left = Buffer.from(String(input));
  const right = Buffer.from(String(expected || ""));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK_MS / 1000,
  };
}
