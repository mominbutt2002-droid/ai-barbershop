import { prisma } from "./db";
import { BookingError } from "./errors";
import { WEEK_ORDER } from "./time";

export function isId(value) {
  return typeof value === "string" && /^[a-z0-9]{8,32}$/i.test(value);
}

export function serializeBarber(barber) {
  return {
    id: barber.id,
    name: barber.name,
    role: barber.role,
    bio: barber.bio,
    active: barber.active,
    schedules: [...barber.schedules]
      .map((item) => ({
        weekday: item.weekday,
        startMin: item.startMin,
        endMin: item.endMin,
      }))
      .sort((a, b) => WEEK_ORDER.indexOf(a.weekday) - WEEK_ORDER.indexOf(b.weekday)),
  };
}

export function parseBarberPayload(body) {
  const name = String(body?.name || "").replace(/\s+/g, " ").trim();
  const role = String(body?.role || "").replace(/\s+/g, " ").trim();
  const bio = String(body?.bio || "").replace(/\s+/g, " ").trim();
  const active = body?.active !== false;
  if (name.length < 2 || name.length > 80) throw new BookingError("Укажите имя мастера");
  if (role.length < 2 || role.length > 60) throw new BookingError("Укажите роль мастера");
  if (bio.length > 400) throw new BookingError("Описание слишком длинное");
  if (!Array.isArray(body?.schedules) || body.schedules.length === 0) {
    throw new BookingError("Отметьте хотя бы один рабочий день");
  }

  const seen = new Set();
  const schedules = body.schedules.map((item) => {
    const weekday = Number(item?.weekday);
    const startMin = Number(item?.startMin);
    const endMin = Number(item?.endMin);
    if (!WEEK_ORDER.includes(weekday) || seen.has(weekday)) {
      throw new BookingError("Проверьте дни недели");
    }
    seen.add(weekday);
    if (
      !Number.isInteger(startMin) ||
      !Number.isInteger(endMin) ||
      startMin < 0 ||
      endMin > 24 * 60 ||
      startMin >= endMin
    ) {
      throw new BookingError("Проверьте часы смены");
    }
    if (endMin - startMin < 30) throw new BookingError("Смена короче 30 минут");
    return { weekday, startMin, endMin };
  });

  return { name, role, bio, active, schedules };
}

export async function saveBarber(id, payload) {
  const data = parseBarberPayload(payload);
  let barberId = id;

  if (barberId) {
    const existing = await prisma.barber.findUnique({ where: { id: barberId } });
    if (!existing) throw new BookingError("Мастер не найден", 404);
    await prisma.$transaction(async (tx) => {
      await tx.barber.update({
        where: { id: barberId },
        data: {
          name: data.name,
          role: data.role,
          bio: data.bio,
          active: data.active,
        },
      });
      await tx.schedule.deleteMany({ where: { barberId } });
      await tx.schedule.createMany({
        data: data.schedules.map((item) => ({ ...item, barberId })),
      });
    });
  } else {
    const created = await prisma.barber.create({
      data: {
        name: data.name,
        role: data.role,
        bio: data.bio,
        active: data.active,
        schedules: { create: data.schedules },
      },
    });
    barberId = created.id;
  }

  const full = await prisma.barber.findUnique({
    where: { id: barberId },
    include: { schedules: true },
  });
  return serializeBarber(full);
}
