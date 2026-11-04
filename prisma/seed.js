import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { addDaysIso, shopNow, timeInputToMinutes, weekdayOfIso } from "../src/lib/time.js";

function mins(value) {
  const total = timeInputToMinutes(value);
  if (total == null) throw new Error(`Неверное время ${value}`);
  return total;
}

function workdays(days, count) {
  const today = shopNow().iso;
  const found = [];
  for (let offset = 0; offset < 28 && found.length < count; offset += 1) {
    const iso = addDaysIso(today, offset);
    if (days.includes(weekdayOfIso(iso))) found.push(iso);
  }
  if (found.length < count) {
    throw new Error("Не хватило рабочих дней для мокап-записей");
  }
  return found;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.booking.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.barber.deleteMany();
    await prisma.service.deleteMany();

    const serviceDefs = [
      ["Мужская стрижка", 60, 1800, "Классика, кроп или короткие виски.", 1],
      ["Фейд", 45, 1600, "Плавный или резкий переход, контур под линейку.", 2],
      ["Стрижка и борода", 90, 2600, "Волосы и борода за один визит.", 3],
      ["Моделирование бороды", 30, 900, "Форма, контур и укладка бороды.", 4],
      ["Камуфляж седины", 40, 1400, "Мягкое тонирование без плотного окрашивания.", 5],
      ["Детская стрижка", 40, 1200, "Для детей до 12 лет.", 6],
    ];

    const services = {};
    for (const [name, durationMin, price, description, sortOrder] of serviceDefs) {
      services[name] = await prisma.service.create({
        data: { name, durationMin, price, description, sortOrder },
      });
    }

    const barberDefs = [
      {
        name: "Артём Волков",
        role: "Старший барбер",
        bio: "Держит линию фейда и форму мужской стрижки. В кресле с 2016 года.",
        days: [1, 2, 3, 4, 5, 6],
        start: "10:00",
        end: "20:00",
      },
      {
        name: "Марк Елисеев",
        role: "Барбер",
        bio: "Стрижёт плотные волосы и длинные формы. Смена до позднего вечера.",
        days: [2, 3, 4, 5, 6, 0],
        start: "12:00",
        end: "21:00",
      },
      {
        name: "Илья Сафин",
        role: "Барбер",
        bio: "Борода и камуфляж седины. Спокойная рука на контуре.",
        days: [1, 2, 3, 4, 5],
        start: "11:00",
        end: "19:00",
      },
      {
        name: "Даниил Ким",
        role: "Барбер",
        bio: "Короткие мужские формы и детские стрижки.",
        days: [2, 3, 4, 5, 6],
        start: "10:00",
        end: "18:00",
      },
    ];

    const barbers = {};
    for (const item of barberDefs) {
      barbers[item.name] = await prisma.barber.create({
        data: {
          name: item.name,
          role: item.role,
          bio: item.bio,
          schedules: {
            create: item.days.map((weekday) => ({
              weekday,
              startMin: mins(item.start),
              endMin: mins(item.end),
            })),
          },
        },
      });
    }

    const days = Object.fromEntries(barberDefs.map((item) => [item.name, workdays(item.days, 4)]));

    const appointments = [
      ["Артём Волков", "Мужская стрижка", 0, "10:00", "Иван Петров", "+7 903 111-17-01", "site", "confirmed", ""],
      ["Артём Волков", "Фейд", 0, "12:00", "Сергей Новиков", "+7 917 222-17-02", "telegram", "new", "Покороче на висках"],
      ["Артём Волков", "Моделирование бороды", 0, "15:00", "Олег Мишин", "+7 905 333-17-03", "site", "confirmed", ""],
      ["Артём Волков", "Мужская стрижка", 0, "17:00", "Павел Громов", "+7 960 444-17-04", "site", "cancelled", "Клиент отменил"],
      ["Марк Елисеев", "Стрижка и борода", 0, "12:00", "Кирилл Баев", "+7 927 555-17-05", "site", "confirmed", ""],
      ["Марк Елисеев", "Фейд", 0, "16:00", "Антон Ребров", "+7 919 666-17-06", "site", "new", ""],
      ["Даниил Ким", "Детская стрижка", 0, "10:00", "Марат Садыков", "+7 937 777-17-07", "telegram", "confirmed", "Ребёнку 7 лет"],
      ["Даниил Ким", "Камуфляж седины", 0, "13:00", "Егор Плотников", "+7 906 888-17-08", "site", "new", ""],
      ["Марк Елисеев", "Мужская стрижка", 1, "12:00", "Никита Орлов", "+7 950 101-17-09", "telegram", "confirmed", ""],
      ["Марк Елисеев", "Моделирование бороды", 1, "14:30", "Тимур Валеев", "+7 987 202-17-10", "site", "new", ""],
      ["Марк Елисеев", "Фейд", 1, "18:00", "Роман Шестаков", "+7 912 303-17-11", "site", "confirmed", ""],
      ["Артём Волков", "Стрижка и борода", 1, "11:00", "Денис Куликов", "+7 904 404-17-12", "site", "new", ""],
      ["Илья Сафин", "Мужская стрижка", 0, "11:00", "Глеб Фомин", "+7 953 505-17-13", "site", "confirmed", ""],
      ["Илья Сафин", "Моделирование бороды", 0, "15:00", "Руслан Ахметов", "+7 909 606-17-14", "telegram", "new", ""],
      ["Даниил Ким", "Фейд", 1, "10:00", "Вадим Котов", "+7 921 707-17-15", "site", "confirmed", ""],
      ["Артём Волков", "Мужская стрижка", 2, "18:00", "Пётр Ежов", "+7 936 808-17-16", "telegram", "new", ""],
      ["Марк Елисеев", "Моделирование бороды", 2, "19:00", "Степан Югов", "+7 908 909-17-17", "site", "confirmed", ""],
    ];

    const occupied = new Map();
    for (const row of appointments) {
      const [barberName, serviceName, dayIndex, startLabel, clientName, phone, source, status, comment] = row;
      const barber = barbers[barberName];
      const service = services[serviceName];
      const date = days[barberName][dayIndex];
      const startMin = mins(startLabel);
      const endMin = startMin + service.durationMin;
      const shift = barberDefs.find((item) => item.name === barberName);
      if (startMin < mins(shift.start) || endMin > mins(shift.end)) {
        throw new Error(`${barberName} не покрывает ${date} ${startLabel}`);
      }
      const key = `${barberName}:${date}`;
      const ranges = occupied.get(key) || [];
      if (status !== "cancelled" && ranges.some((item) => item.start < endMin && item.end > startMin)) {
        throw new Error(`Пересечение записи ${clientName} ${date}`);
      }
      if (status !== "cancelled") ranges.push({ start: startMin, end: endMin });
      occupied.set(key, ranges);
      await prisma.booking.create({
        data: {
          barberId: barber.id,
          serviceId: service.id,
          clientName,
          phone,
          date,
          startMin,
          endMin,
          source,
          status,
          comment,
        },
      });
    }

    const total = await prisma.booking.count();
    console.log(`Мокап Кромки готов: 4 мастера, 6 услуг, ${total} заявок. Сегодня ${shopNow().iso}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
