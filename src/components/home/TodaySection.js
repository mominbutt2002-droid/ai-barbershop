import { Ruler } from "@/components/Ruler";
import { formatDuration } from "@/lib/format";
import { formatMinutes } from "@/lib/time";

export function TodaySection({ barbers, loadById }) {
  return (
    <section className="band" id="today">
      <div className="wrap">
        <p className="eyebrow">смена</p>
        <h2>Сегодня в зале</h2>
        <div className="chairs">
          {barbers.map((barber) => {
            const load = loadById[barber.id];
            const shift = load?.shift;
            return (
              <article key={barber.id} className="chair">
                <h3>{barber.name}</h3>
                {shift ? (
                  <>
                    <p className="muted">
                      Занято {formatDuration(load.booked)} из {formatDuration(load.work)}, {load.percent}%
                    </p>
                    <Ruler startMin={shift.startMin} endMin={shift.endMin} blocks={load.bookings} />
                    {load.bookings.length ? (
                      <ul className="times">
                        {load.bookings.map((item) => (
                          <li key={item.id}>
                            {formatMinutes(item.startMin)}–{formatMinutes(item.endMin)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Свободен весь день.</p>
                    )}
                  </>
                ) : (
                  <p>Выходной.</p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
