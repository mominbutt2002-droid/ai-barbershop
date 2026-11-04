import dotenv from "dotenv";

dotenv.config();

async function main() {
  if (!process.env.BOT_TOKEN) {
    console.log("BOT_TOKEN не задан. Бот не запущен. Сайт сохраняет заявки и без него.");
    return;
  }
  const { startBot } = await import("./main.js");
  await startBot();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
