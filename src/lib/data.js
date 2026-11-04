import { connection } from "next/server";
import { prisma } from "./db";
import { serializeBarber } from "./barbers";
import { shopNow, weekdayOfIso } from "./time";

export async function liveToday() {
  await connection();
  return shopNow();
}

export async function withDb(work) {
  try {
    return await work();
  } catch (error) {
    rethrowDb(error);
  }
}

export function rethrowDb(error) {
  console.error(error);
  const message = String(error?.message || "");
  if (
    error?.code === "P2021" ||
    error?.code === "P1003" ||
    message.includes("no such table") ||
    message.includes("does not exist")
  ) {
    throw new Error("База ещё не создана. В папке проекта выполните npm run db:setup.");
  }
  throw error;
}

export async function getCatalog() {
  const [services, barbers] = await Promise.all([
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.barber.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { schedules: true },
    }),
  ]);

  return {
    services: services.map((service) => ({
      id: service.id,
      name: service.name,
      durationMin: service.durationMin,
      price: service.price,
      description: service.description,
    })),
    barbers: barbers.map(serializeBarber),
  };
}

export async function loadDay(date) {
  const weekday = weekdayOfIso(date);
  const barbers = await prisma.barber.findMany({
    orderBy: { name: "asc" },
    include: {
      schedules: true,
      bookings: {
        where: { date, status: { not: "cancelled" } },
        include: { service: true },
        orderBy: { startMin: "asc" },
      },
    },
  });

  return barbers.map((barber) => {
    const shift = barber.schedules.find((item) => item.weekday === weekday) || null;
    const work = shift ? shift.endMin - shift.startMin : 0;
    const booked = shift
      ? barber.bookings.reduce((sum, item) => {
          const from = Math.max(item.startMin, shift.startMin);
          const to = Math.min(item.endMin, shift.endMin);
          return sum + Math.max(0, to - from);
        }, 0)
      : 0;
    return {
      id: barber.id,
      name: barber.name,
      role: barber.role,
      active: barber.active,
      shift: shift ? { startMin: shift.startMin, endMin: shift.endMin } : null,
      work,
      booked,
      percent: work ? Math.round((booked / work) * 100) : 0,
      bookings: barber.bookings.map((item) => ({
        id: item.id,
        clientName: item.clientName,
        phone: item.phone,
        serviceName: item.service.name,
        startMin: item.startMin,
        endMin: item.endMin,
        source: item.source,
        status: item.status,
        comment: item.comment,
        canRemind: Boolean(item.telegramChatId),
      })),
    };
  });
}

export async function loadBookings({ status, source }) {
  const where = {};
  if (status && status !== "all") where.status = status;
  if (source && source !== "all") where.source = source;
  const rows = await prisma.booking.findMany({
    where,
    include: { barber: true, service: true },
    orderBy: [{ date: "asc" }, { startMin: "asc" }],
  });
  return rows.map((item) => ({
    id: item.id,
    clientName: item.clientName,
    phone: item.phone,
    date: item.date,
    startMin: item.startMin,
    endMin: item.endMin,
    source: item.source,
    status: item.status,
    comment: item.comment,
    barberName: item.barber.name,
    serviceName: item.service.name,
    durationMin: item.service.durationMin,
    canRemind: Boolean(item.telegramChatId),
  }));
}

export async function listBarbersForAdmin() {
  const barbers = await prisma.barber.findMany({
    orderBy: { name: "asc" },
    include: { schedules: true },
  });
  return barbers.map(serializeBarber);
}
