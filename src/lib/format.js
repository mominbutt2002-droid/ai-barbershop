import { shop } from "./shop";
import { formatDuration, formatMinutes, formatRuDate, WEEK_ORDER, WEEK_SHORT } from "./time";

export { formatDuration };

export const STATUS_LABEL = {
  new: "Новая",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
};

export const SOURCE_LABEL = {
  site: "Сайт",
  telegram: "Telegram",
};

export function formatPrice(value) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

export function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

export function scheduleLabel(schedules) {
  if (!schedules?.length) return "График не задан";
  const byDay = Object.fromEntries(schedules.map((item) => [item.weekday, item]));
  const parts = [];
  let index = 0;
  while (index < WEEK_ORDER.length) {
    const weekday = WEEK_ORDER[index];
    const shift = byDay[weekday];
    if (!shift) {
      index += 1;
      continue;
    }
    let end = index;
    while (end + 1 < WEEK_ORDER.length) {
      const next = byDay[WEEK_ORDER[end + 1]];
      if (!next || next.startMin !== shift.startMin || next.endMin !== shift.endMin) break;
      end += 1;
    }
    const from = WEEK_SHORT[WEEK_ORDER[index]];
    const to = WEEK_SHORT[WEEK_ORDER[end]];
    const span = index === end ? from : `${from}–${to}`;
    parts.push(`${span} ${formatMinutes(shift.startMin)}–${formatMinutes(shift.endMin)}`);
    index = end + 1;
  }
  return parts.join(", ");
}

export function formatReminderMessage(booking, kind) {
  const when = `${formatRuDate(booking.date)}, ${formatMinutes(booking.startMin)}–${formatMinutes(booking.endMin)}`;
  const head =
    kind === "hour"
      ? "Через час ждём вас в «Кромке»."
      : kind === "five"
        ? "Через 5 минут ждём вас в «Кромке»."
        : "Напоминание: вы записаны в «Кромке».";
  return [
    head,
    `Услуга: ${booking.serviceName}`,
    `Мастер: ${booking.barberName}`,
    `Когда: ${when}`,
    `Адрес: ${shop.city}, ${shop.street}`,
  ].join("\n");
}

export function formatBookingMessage(booking) {
  const lines = [
    "Новая запись — Кромка",
    `Источник: ${booking.source === "telegram" ? "Telegram" : "сайт"}`,
    `Клиент: ${booking.clientName}`,
    `Телефон: ${booking.phone}`,
    `Услуга: ${booking.serviceName}, ${booking.durationMin} мин`,
    `Мастер: ${booking.barberName}`,
    `Когда: ${formatRuDate(booking.date)}, ${formatMinutes(booking.startMin)}–${formatMinutes(booking.endMin)}`,
  ];
  if (booking.comment) lines.push(`Пожелание: ${booking.comment}`);
  return lines.join("\n");
}

export function oneLine(value, max) {
  const text = String(value || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  return text.slice(0, max);
}
