import { dayOpen } from "@/lib/openDay";
import {
  formatRuDate,
  monthCells,
  MONTHS_NOM,
  WEEK_SHORT,
  weekdayOfIso,
} from "@/lib/time";

export function DayCalendar({
  barbers,
  barberId,
  todayIso,
  cursor,
  date,
  todayKey,
  cursorKey,
  horizonKey,
  onShiftMonth,
  onPickDate,
}) {
  const cells = monthCells(cursor.year, cursor.month);

  return (
    <section>
      <h2>День</h2>
      <div className="month-nav">
        <button
          type="button"
          className="button quiet"
          onClick={() => onShiftMonth(-1)}
          disabled={cursorKey <= todayKey}
        >
          Предыдущий месяц
        </button>
        <p className="month-title">
          {MONTHS_NOM[cursor.month - 1]} {cursor.year}
        </p>
        <button
          type="button"
          className="button quiet"
          onClick={() => onShiftMonth(1)}
          disabled={cursorKey >= horizonKey}
        >
          Следующий месяц
        </button>
      </div>
      <div className="cal-head">
        {["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="cal" role="group" aria-label="Календарь">
        {cells.map((iso, index) =>
          iso ? (
            <button
              key={iso}
              type="button"
              className="cal-day"
              disabled={!dayOpen(barbers, barberId, iso, todayIso)}
              aria-pressed={date === iso}
              aria-current={iso === todayIso ? "date" : undefined}
              onClick={() => onPickDate(iso)}
            >
              <span aria-hidden="true">{Number(iso.slice(-2))}</span>
              <span className="sr-only">
                {WEEK_SHORT[weekdayOfIso(iso)]} {formatRuDate(iso)}
              </span>
            </button>
          ) : (
            <span key={`empty-${index}`} />
          ),
        )}
      </div>
    </section>
  );
}
