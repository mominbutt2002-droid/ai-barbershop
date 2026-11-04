import { prisma } from "./db";
import { BookingError } from "./errors";
import {
  addDaysIso,
  BOOKING_HORIZON_DAYS,
  isValidIso,
  shopNow,
  SLOT_STEP,
  weekdayOfIso,
} from "./time";

function overlaps(bookings, startMin, endMin) {
  return bookings.some(
    (item) => item.startMin < endMin && item.endMin > startMin,
  );
}

function bookedMinutes(barber) {
  return barber.bookings.reduce((sum, item) => sum + (item.endMin - item.startMin), 0);
}

export async function listSlots({ date, serviceId, barberId }) {
  if (!isValidIso(date)) throw new BookingError("Некорректная дата");
  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true },
  });
  if (!service) throw new BookingError("Услуга не найдена");

  const now = shopNow();
  if (date < now.iso || date > addDaysIso(now.iso, BOOKING_HORIZON_DAYS)) return [];

  const weekday = weekdayOfIso(date);
  const barbers = await prisma.barber.findMany({
    where: {
      active: true,
      ...(barberId && barberId !== "any" ? { id: barberId } : {}),
    },
    include: {
      schedules: { where: { weekday } },
      bookings: {
        where: { date, status: { not: "cancelled" } },
      },
    },
    orderBy: { name: "asc" },
  });

  const duration = service.durationMin;

  if (barberId !== "any") {
    const barber = barbers[0];
    const shift = barber?.schedules[0];
    if (!barber || !shift) return [];
    const slots = [];
    for (let start = shift.startMin; start + duration <= shift.endMin; start += SLOT_STEP) {
      if (date === now.iso && start <= now.minutes) continue;
      if (overlaps(barber.bookings, start, start + duration)) continue;
      slots.push({
        startMin: start,
        endMin: start + duration,
        barberId: barber.id,
        barberName: barber.name,
      });
    }
    return slots;
  }

  const starts = new Set();
  for (const barber of barbers) {
    const shift = barber.schedules[0];
    if (!shift) continue;
    for (let start = shift.startMin; start + duration <= shift.endMin; start += SLOT_STEP) {
      starts.add(start);
    }
  }

  const slots = [];
  for (const start of [...starts].sort((a, b) => a - b)) {
    if (date === now.iso && start <= now.minutes) continue;
    const end = start + duration;
    const free = barbers.filter((barber) => {
      const shift = barber.schedules[0];
      if (!shift) return false;
      if (start < shift.startMin || end > shift.endMin) return false;
      return !overlaps(barber.bookings, start, end);
    });
    if (!free.length) continue;
    free.sort(
      (a, b) => bookedMinutes(a) - bookedMinutes(b) || a.name.localeCompare(b.name, "ru"),
    );
    const chosen = free[0];
    slots.push({
      startMin: start,
      endMin: end,
      barberId: chosen.id,
      barberName: chosen.name,
    });
  }
  return slots;
}
