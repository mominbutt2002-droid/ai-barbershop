export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.VERCEL) return;
  const { startReminderLoop } = await import("./lib/reminders");
  startReminderLoop();
}
