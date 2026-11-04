import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const envPath = path.join(root, ".env");
const args = ["--project-id", "holy-salad-17819384", "--database-name", "neondb", "--prisma"];
const pooled = execSync(`npx neonctl connection-string ${args.join(" ")} --pooled`, {
  encoding: "utf8",
  cwd: root,
}).trim();
const direct = execSync(`npx neonctl connection-string ${args.join(" ")}`, {
  encoding: "utf8",
  cwd: root,
}).trim();

let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
function setKey(text, key, value) {
  const line = `${key}="${value}"`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(text)) return text.replace(pattern, line);
  return `${text.trim()}\n${line}\n`;
}
env = setKey(env, "DATABASE_URL", pooled);
env = setKey(env, "DIRECT_URL", direct);
fs.writeFileSync(envPath, env);
console.log("Neon URLs written to .env (pooled + direct).");
console.log(`pooled host: ${pooled.match(/@([^/]+)/)?.[1] || "ok"}`);
