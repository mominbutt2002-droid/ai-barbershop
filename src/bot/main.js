import { Bot, InlineKeyboard, Keyboard } from "grammy";
import { createBooking } from "../lib/booking.js";
import { BookingError } from "../lib/errors.js";
import { formatBookingMessage, formatPrice } from "../lib/format.js";
import { prisma } from "../lib/db.js";
import { shop } from "../lib/shop.js";
import { workingDates } from "../lib/openDay.js";
import { startReminderLoop } from "../lib/reminders.js";
import { miniAppUrl } from "../lib/telegram.js";
import { listSlots } from "../lib/slots.js";
import {
  formatMinutes,
  formatRuDate,
  shopNow,
  WEEK_SHORT,
  weekdayOfIso,
} from "../lib/time.js";

const sessions = new Map();
const BOOK_TEXT = /^(записаться|запись|записать|записаться в чате)$/i;

function bookingMenu() {
  const url = miniAppUrl();
  const keys = new Keyboard();
  if (url) keys.webApp("Календарь", url);
  keys.text(url ? "Записаться в чате" : "Записаться");
  return keys.resized().persistent();
}

function sid(ctx) {
  return ctx.chat?.id ?? ctx.from?.id;
}

function keyboard(items, size, draw) {
  const keys = new InlineKeyboard();
  items.forEach((item, index) => {
    if (index > 0 && index % size === 0) keys.row();
    draw(keys, item, index);
  });
  return keys;
}

function slotLabel(slot, anyBarber) {
  return anyBarber
    ? `${formatMinutes(slot.startMin)} · ${slot.barberName.split(" ")[0]}`
    : formatMinutes(slot.startMin);
}

function findSlot(state, text) {
  const slots = state.slots || [];
  const anyBarber = state.barberId === "any";
  const exact = slots.find((slot) => slotLabel(slot, anyBarber) === text);
  if (exact) return exact;
  const match = /^(\d{1,2})[:.](\d{2})$/.exec(text.trim());
  if (!match) return null;
  const startMin = Number(match[1]) * 60 + Number(match[2]);
  return slots.find((slot) => slot.startMin === startMin) || null;
}

async function services() {
  return prisma.service.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
}

async function barbers() {
  return prisma.barber.findMany({
    where: { active: true },
    include: { schedules: true },
    orderBy: { name: "asc" },
  });
}

async function openBooking(ctx) {
  if (ctx.chat?.type !== "private") {
    await ctx.reply("Напишите мне в личные сообщения, чтобы записаться.");
    return;
  }
  const list = await services();
  sessions.set(sid(ctx), { step: "service" });
  const url = miniAppUrl();
  await ctx.reply(
    `${shop.name}, ${shop.city}, ${shop.street}.\n${
      url
        ? "Откройте календарь Mini App или запишитесь кнопками в чате."
        : "Чтобы записаться, нажмите «Записаться» или выберите услугу."
    }`,
    { reply_markup: bookingMenu() },
  );
  if (url) {
    await ctx.reply("Календарь: услуга, мастер, день и время.", {
      reply_markup: new InlineKeyboard().webApp("Открыть календарь", url),
    });
  }
  if (!list.length) {
    await ctx.reply("Сейчас нет услуг в прайсе. Запись на сайте: выберите мастера и время.");
    return;
  }
  await ctx.reply("Какая услуга?", {
    reply_markup: keyboard(list, 1, (keys, service) => {
      keys.text(`${service.name}, ${service.durationMin} мин, ${formatPrice(service.price)}`, `s:${service.id}`);
    }),
  });
}

async function askBarber(ctx, state) {
  const list = await barbers();
  state.step = "barber";
  sessions.set(sid(ctx), state);
  const options = [{ id: "any", name: "Любой свободный" }, ...list];
  await ctx.reply("Какой мастер?", {
    reply_markup: keyboard(options, 1, (keys, barber) => {
      keys.text(barber.name, `b:${barber.id}`);
    }),
  });
}

async function askDate(ctx, state) {
  const list = await barbers();
  const dates = workingDates(list, state.barberId, shopNow().iso, 14);
  state.step = "date";
  sessions.set(sid(ctx), state);
  if (!dates.length) {
    await ctx.reply("В ближайшие 14 дней нет смены. Выберите другого мастера или /cancel.");
    return;
  }
  await ctx.reply("Какой день?", {
    reply_markup: keyboard(dates, 1, (keys, iso) => {
      keys.text(`${WEEK_SHORT[weekdayOfIso(iso)]}, ${formatRuDate(iso)}`, `d:${iso}`);
    }),
  });
}

async function acceptTime(ctx, state, slot) {
  state.startMin = slot.startMin;
  state.endMin = slot.endMin;
  state.assignedId = slot.barberId;
  state.assignedName = slot.barberName;
  state.step = "name";
  sessions.set(sid(ctx), state);
  await ctx.reply("Как к вам обращаться?", { reply_markup: bookingMenu() });
}

async function askTime(ctx, state) {
  let slots;
  try {
    slots = await listSlots({
      date: state.date,
      serviceId: state.serviceId,
      barberId: state.barberId,
    });
  } catch (error) {
    console.error("Не удалось получить слоты", error);
    await ctx.reply("Не получилось получить время. Выберите день ещё раз или /cancel.");
    return;
  }
  state.step = "time";
  state.slots = slots;
  sessions.set(sid(ctx), state);
  if (!slots.length) {
    await ctx.reply("В этот день свободного времени нет. Выберите другой день или напишите час, например 14:00.");
    return;
  }
  const anyBarber = state.barberId === "any";
  const reply = new Keyboard();
  slots.forEach((slot, index) => {
    if (index > 0 && index % 3 === 0) reply.row();
    reply.text(slotLabel(slot, anyBarber));
  });
  reply.row().text("Другой день").text("Записаться");
  try {
    await ctx.reply("Какое время? Нажмите кнопку или напишите час, например 14:00.", {
      reply_markup: reply.resized(),
    });
  } catch (error) {
    console.error("Клавиатура времени не принята", error);
    const list = slots.map((slot) => slotLabel(slot, anyBarber)).join(", ");
    await ctx.reply(`Напишите время из списка:\n${list}`, { reply_markup: bookingMenu() });
  }
}

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", async (ctx) => {
  await openBooking(ctx);
});

bot.command("book", async (ctx) => {
  await openBooking(ctx);
});

bot.command("cancel", async (ctx) => {
  sessions.delete(sid(ctx));
  await ctx.reply("Запись остановлена. Начните снова командой /start.", { reply_markup: bookingMenu() });
});

bot.on("callback_query:data", async (ctx) => {
  const chatType = ctx.chat?.type ?? ctx.callbackQuery.message?.chat?.type;
  if (chatType && chatType !== "private") {
    await ctx.answerCallbackQuery();
    return;
  }
  const data = ctx.callbackQuery.data;
  const state = sessions.get(sid(ctx));
  if (!state) {
    await ctx.answerCallbackQuery({ text: "Нажмите /start" });
    return;
  }

  const expects = {
    service: "s:",
    barber: "b:",
    date: "d:",
    time: "t:",
    confirm: "ok:",
  }[state.step];

  if (!expects || !data.startsWith(expects)) {
    await ctx.answerCallbackQuery({ text: "Сначала закончите текущий шаг" });
    return;
  }
  await ctx.answerCallbackQuery();

  if (data.startsWith("s:")) {
    state.serviceId = data.slice(2);
    await askBarber(ctx, state);
    return;
  }
  if (data.startsWith("b:")) {
    state.barberId = data.slice(2);
    await askDate(ctx, state);
    return;
  }
  if (data.startsWith("d:")) {
    state.date = data.slice(2);
    await askTime(ctx, state);
    return;
  }
  if (data.startsWith("t:")) {
    const startMin = Number(data.slice(2));
    const slot = state.slots?.find((item) => item.startMin === startMin);
    if (!slot) {
      await ctx.reply("Это время уже недоступно. Выберите другое.");
      return;
    }
    await acceptTime(ctx, state, slot);
    return;
  }
  if (data === "ok:0") {
    await openBooking(ctx);
    return;
  }
  if (data === "ok:1") {
    try {
      const result = await createBooking({
        serviceId: state.serviceId,
        barberId: state.assignedId,
        date: state.date,
        startMin: state.startMin,
        clientName: state.clientName,
        phone: state.phone,
        source: "telegram",
        telegramChatId: String(sid(ctx)),
      });
      sessions.delete(sid(ctx));
      const tail = result.notified
        ? "Заявка в смене и в группе салона. Напомню за час и за 5 минут."
        : "Заявка в смене. В группу сообщение не ушло. Напомню за час и за 5 минут.";
      await ctx.reply(`Запись сохранена.\n${result.message}\n\n${tail}`, { reply_markup: bookingMenu() });
    } catch (error) {
      const message = error instanceof BookingError ? error.message : "Не получилось сохранить запись";
      await ctx.reply(`${message}. Выберите время ещё раз или /cancel.`);
      await askTime(ctx, state);
    }
  }
});

bot.on("message:text", async (ctx) => {
  if (ctx.chat?.type !== "private") return;
  const state = sessions.get(sid(ctx));
  const text = ctx.message.text.trim();
  if (text.startsWith("/") && !BOOK_TEXT.test(text.slice(1))) return;
  if (!state || BOOK_TEXT.test(text)) {
    await openBooking(ctx);
    return;
  }
  if (state.step === "time") {
    if (text === "Другой день") {
      await askDate(ctx, state);
      return;
    }
    const slot = findSlot(state, text);
    if (!slot) {
      await ctx.reply("Нажмите время на клавиатуре или напишите час, например 14:00.");
      return;
    }
    await acceptTime(ctx, state, slot);
    return;
  }
  if (state.step === "name") {
    if (text.length < 2) {
      await ctx.reply("Имя короткое. Напишите, как к вам обращаться.");
      return;
    }
    state.clientName = text;
    state.step = "phone";
    sessions.set(sid(ctx), state);
    await ctx.reply("Телефон для связи с салоном.");
    return;
  }
  if (state.step === "phone") {
    const digits = text.replace(/\D/g, "");
    if (digits.length < 10) {
      await ctx.reply("Нужен телефон, хотя бы 10 цифр.");
      return;
    }
    const service = await prisma.service.findUnique({ where: { id: state.serviceId } });
    state.phone = text;
    state.step = "confirm";
    sessions.set(sid(ctx), state);
    const preview = formatBookingMessage({
      source: "telegram",
      clientName: state.clientName,
      phone: state.phone,
      serviceName: service?.name || "Услуга",
      durationMin: service?.durationMin || state.endMin - state.startMin,
      barberName: state.assignedName,
      date: state.date,
      startMin: state.startMin,
      endMin: state.endMin,
    });
    await ctx.reply(`${preview}\n\nПодтвердить запись?`, {
      reply_markup: new InlineKeyboard().text("Подтвердить", "ok:1").text("Начать заново", "ok:0"),
    });
  }
});

bot.catch((error) => {
  console.error("Сбой бота", error);
});

export { bot };

export function webhookSecret() {
  return String(process.env.TELEGRAM_WEBHOOK_SECRET || process.env.SESSION_SECRET || "")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 256);
}

export async function configureTelegram() {
  if (!process.env.BOT_TOKEN) return;
  const url = miniAppUrl();
  await bot.api.setMyCommands([
    { command: "start", description: "Записаться на кресло" },
    { command: "book", description: "Новая запись" },
    { command: "cancel", description: "Остановить запись" },
  ]);
  await bot.api.setChatMenuButton({
    menu_button: url
      ? { type: "web_app", text: "Календарь", web_app: { url } }
      : { type: "commands" },
  });
  const origin = String(process.env.WEBAPP_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (url) console.log(`Mini App: ${url}`);
  const useWebhook = Boolean(process.env.VERCEL) || process.env.TELEGRAM_WEBHOOK === "1";
  if (useWebhook && origin.startsWith("https://")) {
    const secret = webhookSecret();
    await bot.api.setWebhook(`${origin}/api/telegram`, secret ? { secret_token: secret } : {});
    console.log(`Webhook: ${origin}/api/telegram`);
  } else if (!url) {
    console.log("Mini App выключен: задайте WEBAPP_URL=https://ваш-домен.");
  }
}

export async function startBot() {
  startReminderLoop();
  await bot.api.deleteWebhook();
  await configureTelegram();
  await bot.start({
    onStart: () => console.log("Бот Кромки слушает Telegram"),
  });
}
