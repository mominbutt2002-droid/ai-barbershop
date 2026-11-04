import { prisma } from "./db";
import { BookingError } from "./errors";
import { formatBookingMessage, oneLine } from "./format";
import { notifyGroup } from "./notify";
import { findChatIdByPhone } from "./reminders";
import { listSlots } from "./slots";
import {
  addDaysIso,
  BOOKING_HORIZON_DAYS,
  isValidIso,
  shopNow,
  SLOT_STEP,
  weekdayOfIso,
} from "./time";

function snapshot(booking) {
  return {
    id: booking.id,
    clientName: booking.clientName,
    phone: booking.phone,
    serviceName: booking.service.name,
    durationMin: booking.service.durationMin,
    barberName: booking.barber.name,
    barberId: booking.barberId,
    date: booking.date,
    startMin: booking.startMin,
    endMin: booking.endMin,
    source: booking.source,
    status: booking.status,
    comment: booking.comment,
  };
}

export async function createBooking(input) {
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, active: true },
  });
  if (!service) throw new BookingError("Услуга не найдена");
  if (!isValidIso(input.date)) throw new BookingError("Некорректная дата");

  const startMin = Number(input.startMin);
  if (!Number.isInteger(startMin) || startMin < 0 || startMin >= 24 * 60) {
    throw new BookingError("Некорректное время");
  }
  if (startMin % SLOT_STEP !== 0) throw new BookingError("Время не попадает в сетку записи");

  const clientName = oneLine(input.clientName, 80);
  const phone = oneLine(input.phone, 30);
  const comment = oneLine(input.comment, 300);
  const digits = phone.replace(/\D/g, "");
  if (clientName.length < 2) throw new BookingError("Укажите имя");
  if (digits.length < 10 || digits.length > 15) throw new BookingError("Укажите телефон");
  if (input.source !== "site" && input.source !== "telegram") {
    throw new BookingError("Некорректный источник");
  }

  const now = shopNow();
  if (input.date < now.iso) throw new BookingError("Этот день уже прошёл");
  if (input.date > addDaysIso(now.iso, BOOKING_HORIZON_DAYS)) {
    throw new BookingError("Запись открыта на 60 дней вперёд");
  }
  if (input.date === now.iso && startMin <= now.minutes) {
    throw new BookingError("Это время уже прошло");
  }

  const endMin = startMin + service.durationMin;
  const weekday = weekdayOfIso(input.date);
  let barberId = input.barberId;

  if (barberId === "any") {
    const slots = await listSlots({
      date: input.date,
      serviceId: service.id,
      barberId: "any",
    });
    const slot = slots.find((item) => item.startMin === startMin);
    if (!slot) throw new BookingError("На это время нет свободного мастера");
    barberId = slot.barberId;
  }

  const barber = await prisma.barber.findFirst({
    where: { id: barberId, active: true },
    include: { schedules: true },
  });
  if (!barber) throw new BookingError("Мастер не найден");
  const shift = barber.schedules.find((item) => item.weekday === weekday);
  if (!shift || startMin < shift.startMin || endMin > shift.endMin) {
    throw new BookingError("Мастер в это время не работает");
  }

  const telegramChatId =
    String(input.telegramChatId || "").trim() || (await findChatIdByPhone(phone));

  const booking = await prisma.$transaction(async (tx) => {
    const clash = await tx.booking.findFirst({
      where: {
        barberId: barber.id,
        date: input.date,
        status: { not: "cancelled" },
        startMin: { lt: endMin },
        endMin: { gt: startMin },
      },
    });
    if (clash) throw new BookingError("Это время уже занято");
    return tx.booking.create({
      data: {
        barberId: barber.id,
        serviceId: service.id,
        clientName,
        phone,
        date: input.date,
        startMin,
        endMin,
        source: input.source,
        status: "new",
        comment,
        telegramChatId: telegramChatId || null,
      },
      include: { barber: true, service: true },
    });
  });

  const view = snapshot(booking);
  const message = formatBookingMessage(view);
  let notified = false;
  try {
    notified = await notifyGroup(message);
  } catch (error) {
    console.error("Не удалось отправить заявку в Telegram", error);
  }
  console.info(
    `Запись сохранена: ${view.date} ${view.barberName}, telegram: ${notified ? "да" : "нет"}`,
  );
  return { booking: view, notified, message };
}

export async function setBookingStatus(id, status) {
  if (!["new", "confirmed", "cancelled"].includes(status)) {
    throw new BookingError("Некорректный статус");
  }
  const current = await prisma.booking.findUnique({ where: { id } });
  if (!current) throw new BookingError("Заявка не найдена", 404);
  if (status !== "cancelled") {
    const clash = await prisma.booking.findFirst({
      where: {
        id: { not: id },
        barberId: current.barberId,
        date: current.date,
        status: { not: "cancelled" },
        startMin: { lt: current.endMin },
        endMin: { gt: current.startMin },
      },
    });
    if (clash) throw new BookingError("Это время уже занимает другая заявка");
  }
  return prisma.booking.update({ where: { id }, data: { status } });
}
