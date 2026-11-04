import crypto from "node:crypto";

const MAX_AGE_SEC = 24 * 60 * 60;

export function miniAppUrl() {
  const raw = String(process.env.WEBAPP_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (!raw.startsWith("https://")) return "";
  return raw.endsWith("/mini") ? raw : `${raw}/mini`;
}

export function parseTelegramUser(initData) {
  const token = process.env.BOT_TOKEN;
  const raw = String(initData || "");
  if (!token || !raw) return null;
  const params = new URLSearchParams(raw);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const dataCheck = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(token).digest();
  const computed = crypto.createHmac("sha256", secretKey).update(dataCheck).digest();
  let given;
  try {
    given = Buffer.from(hash, "hex");
  } catch {
    return null;
  }
  if (computed.length !== given.length || !crypto.timingSafeEqual(computed, given)) return null;
  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate) || Math.abs(Date.now() / 1000 - authDate) > MAX_AGE_SEC) return null;
  try {
    const user = JSON.parse(params.get("user") || "null");
    if (!user?.id) return null;
    return user;
  } catch {
    return null;
  }
}
