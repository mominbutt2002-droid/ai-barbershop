import { Suspense } from "react";
import { BookingActions } from "@/components/BookingActions";
import { Ruler } from "@/components/Ruler";
import { liveToday, loadDay, withDb } from "@/lib/data";
import { SOURCE_LABEL, STATUS_LABEL, formatDuration } from "@/lib/format";
import { addDaysIso, formatDayHeading, formatMinutes, isValidIso } from "@/lib/time";

export const metadata = { title: "Смена" };

export default function AdminDayPage({ searchParams }) {
  return (
    <Suspense fallback={<p className="muted">Собираю смену…</p>}>
      <DayLive searchParams={searchParams} />
    </Suspense>
  );
}

async function DayLive({ searchParams }) {
  const { today, date, visible, prev, next } = await withDb(async () => {
    const today = await liveToday();
    const params = await searchParams;
    const requested = typeof params?.date === "string" ? params.date : today.iso;
    const date = isValidIso(requested) ? requested : today.iso;
    const board = await loadDay(date);
    const visible = board.filter((barber) => barber.active || barber.bookings.length);
    return {
      today,
      date,
      visible,
      prev: `/admin?date=${addDaysIso(date, -1)}`,
      next: `/admin?date=${addDaysIso(date, 1)}`,
    };
  });

  return (
      <main className="page">
        <div className="wrap">
        <p className="eyebrow">смена</p>
        <h1>
          {formatDayHeading(date)}
          {date === today.iso ? ", сегодня" : ""}
        </h1>
        <p className="muted">Отменённые заявки не занимают кресло.</p>
        <form className="day-nav" action="/admin">
          <a href={prev}>Предыдущий день</a>
          <label>
            День
            <input type="date" name="date" defaultValue={date} />
          </label>
          <button className="button quiet" type="submit">
            Показать
          </button>
          <a href={next}>Следующий день</a>
        </form>

        <div className="chairs">
          {visible.map((barber) => (
            <article key={barber.id} className="chair">
              <h2>{barber.name}</h2>
              <p className="role">{barber.role}</p>
              {!barber.active ? <p className="muted">Скрыт из записи.</p> : null}
              {barber.shift ? (
                <>
                  <p>
                    Занято {formatDuration(barber.booked)} из {formatDuration(barber.work)}, {barber.percent}%
                  </p>
                  <Ruler
                    startMin={barber.shift.startMin}
                    endMin={barber.shift.endMin}
                    blocks={barber.bookings}
                  />
                  {barber.bookings.length ? (
                    <ol className="appointments">
                      {barber.bookings.map((item) => (
                        <li key={item.id}>
                          <span>
                            {formatMinutes(item.startMin)}–{formatMinutes(item.endMin)}
                          </span>
                          <span>
                            {item.clientName}, {item.phone}
                          </span>
                          <span>{item.serviceName}</span>
                          <span>
                            {SOURCE_LABEL[item.source]}, {STATUS_LABEL[item.status]}
                          </span>
                          {item.comment ? <span className="muted">{item.comment}</span> : null}
                          <BookingActions id={item.id} status={item.status} canRemind={item.canRemind} />
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>Записей нет, кресло свободно.</p>
                  )}
                </>
              ) : (
                <p>Выходной.</p>
              )}
            </article>
          ))}
        </div>
        </div>
      </main>
    );
}
