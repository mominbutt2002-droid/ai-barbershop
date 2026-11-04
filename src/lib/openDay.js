import { addDaysIso, BOOKING_HORIZON_DAYS, weekdayOfIso } from "./time";

export function worksOn(barber, iso) {
  return barber.schedules.some((item) => item.weekday === weekdayOfIso(iso));
}

export function dayOpen(barbers, barberId, iso, todayIso, horizonDays = BOOKING_HORIZON_DAYS) {
  const horizon = addDaysIso(todayIso, horizonDays);
  if (iso < todayIso || iso > horizon) return false;
  if (barberId === "any") return barbers.some((barber) => worksOn(barber, iso));
  const barber = barbers.find((item) => item.id === barberId);
  return Boolean(barber && worksOn(barber, iso));
}

export function workingDates(barbers, barberId, todayIso, days = 14) {
  const dates = [];
  for (let offset = 0; offset < days; offset += 1) {
    const iso = addDaysIso(todayIso, offset);
    if (dayOpen(barbers, barberId, iso, todayIso, days - 1)) dates.push(iso);
  }
  return dates;
}
