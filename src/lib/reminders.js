import { prisma } from "./db";
import { BookingError } from "./errors";
import { formatReminderMessage } from "./format";
import { sendTelegram } from "./notify";
import { minutesUntil, shopNow } from "./time";

function viewOf(booking) {
  return {
    id: booking.id,
    clientName: booking.clientName,
    serviceName: booking.service.name,
    barberName: booking.barber.name,
    date: booking.date,
    startMin: booking.startMin,
    endMin: booking.endMin,
  };
}

function phoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "");
}

export async function findChatIdByPhone(phone) {
  const digits = phoneDigits(phone);
  if (digits.length < 10) return null;
  const rows = await prisma.booking.findMany({
    where: { telegramChatId: { not: null } },
    select: { phone: true, telegramChatId: true },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return rows.find((row) => phoneDigits(row.phone) === digits)?.telegramChatId || null;
}

async function claimAndSend(booking, kind) {
  if (!process.env.BOT_TOKEN) return;
  const field = kind === "hour" ? "reminderHourSent" : "reminderFiveSent";
  const claimed = await prisma.booking.updateMany({
    where: {
      id: booking.id,
      [field]: false,
      status: { not: "cancelled" },
      telegramChatId: { not: null },
    },
    data: { [field]: true },
  });
  if (claimed.count === 0) return;
  const result = await sendTelegram(booking.telegramChatId, formatReminderMessage(viewOf(booking), kind));
  if (result.ok) {
    console.info(`Напоминание ${kind} отправлено: ${booking.id}`);
    return;
  }
  if (result.retry) {
    await prisma.booking.update({ where: { id: booking.id }, data: { [field]: false } });
  }
}

export async function sendDueReminders(now = shopNow()) {
  const rows = await prisma.booking.findMany({
    where: {
      status: { not: "cancelled" },
      telegramChatId: { not: null },
      date: { gte: now.iso },
      OR: [{ reminderHourSent: false }, { reminderFiveSent: false }],
    },
    include: { barber: true, service: true },
  });

  for (const booking of rows) {
    const remaining = minutesUntil(booking.date, booking.startMin, now);
    if (remaining <= 0) continue;
    if (remaining <= 5 && !booking.reminderFiveSent) {
      await claimAndSend(booking, "five");
      continue;
    }
    if (remaining <= 60 && remaining > 5 && !booking.reminderHourSent) {
      await claimAndSend(booking, "hour");
    }
  }
}

export async function sendManualReminder(id) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { barber: true, service: true },
  });
  if (!booking) throw new BookingError("Заявка не найдена", 404);
  if (booking.status === "cancelled") {
    throw new BookingError("Отменённую заявку напоминать не нужно");
  }
  if (!booking.telegramChatId) {
    throw new BookingError("У клиента нет Telegram: он ещё не писал боту");
  }
  const remaining = minutesUntil(booking.date, booking.startMin);
  if (remaining <= 0) throw new BookingError("Это время уже прошло");
  const result = await sendTelegram(
    booking.telegramChatId,
    formatReminderMessage(viewOf(booking), "manual"),
  );
  if (!result.ok) {
    throw new BookingError("Telegram не принял напоминание. Проверьте BOT_TOKEN и что клиент писал боту.");
  }
  return true;
}

export function startReminderLoop() {
  if (globalThis.__kromkaReminderLoop) return;
  globalThis.__kromkaReminderLoop = true;
  console.info("Напоминания Кромки включены: за час и за 5 минут");
  const tick = () => {
    sendDueReminders().catch((error) => console.error("Сбой напоминаний", error));
  };
  tick();
  setInterval(tick, 30_000);
}
