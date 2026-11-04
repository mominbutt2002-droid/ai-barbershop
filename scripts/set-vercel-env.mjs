import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env"), "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  env[trimmed.slice(0, eq).trim()] = value;
}

if (!env.CRON_SECRET) env.CRON_SECRET = env.SESSION_SECRET || "kromka-cron";
if (!env.TELEGRAM_WEBHOOK_SECRET) {
  env.TELEGRAM_WEBHOOK_SECRET = String(env.SESSION_SECRET || "kromka")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 256);
}
if (!env.SHOP_TIMEZONE) env.SHOP_TIMEZONE = "Europe/Moscow";

const names = [
  "DATABASE_URL",
  "DIRECT_URL",
  "ADMIN_PASSWORD",
  "SESSION_SECRET",
  "BOT_TOKEN",
  "GROUP_CHAT_ID",
  "CRON_SECRET",
  "TELEGRAM_WEBHOOK_SECRET",
  "SHOP_TIMEZONE",
];
if (process.env.SET_WEBAPP_URL) {
  env.WEBAPP_URL = process.env.SET_WEBAPP_URL;
  names.push("WEBAPP_URL");
}

for (const name of names) {
  const value = env[name];
  if (!value) {
    console.log(`skip ${name}`);
    continue;
  }
  execSync(
    `npx vercel env add ${name} --environment production,preview,development --yes --force --sensitive`,
    { cwd: root, input: value, stdio: ["pipe", "inherit", "inherit"], shell: true },
  );
  console.log(`set ${name}`);
}
