import { Suspense } from "react";
import { BookingActions } from "@/components/BookingActions";
import { liveToday, loadBookings, withDb } from "@/lib/data";
import { SOURCE_LABEL, formatDuration } from "@/lib/format";
import { formatMinutes, formatRuDate } from "@/lib/time";

export const metadata = { title: "Заявки" };

const STATUSES = [
  ["all", "Все"],
  ["new", "Новые"],
  ["confirmed", "Подтверждённые"],
  ["cancelled", "Отменённые"],
];

const SOURCES = [
  ["all", "Все источники"],
  ["site", "Сайт"],
  ["telegram", "Telegram"],
];

export default function BookingsPage({ searchParams }) {
  return (
    <Suspense fallback={<p className="muted">Собираю заявки…</p>}>
      <BookingsLive searchParams={searchParams} />
    </Suspense>
  );
}

function hrefFor(status, source) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (source !== "all") params.set("source", source);
  const query = params.toString();
  return query ? `/admin/bookings?${query}` : "/admin/bookings";
}

async function BookingsLive({ searchParams }) {
  const { status, source, rows } = await withDb(async () => {
    await liveToday();
    const params = await searchParams;
    const status = STATUSES.some(([value]) => value === params?.status) ? params.status : "all";
    const source = SOURCES.some(([value]) => value === params?.source) ? params.source : "all";
    const rows = await loadBookings({ status, source });
    return { status, source, rows };
  });

  return (
      <main className="page">
        <div className="wrap">
        <p className="eyebrow">заявки</p>
        <h1>Заявки</h1>
        <div className="filters" aria-label="Статус">
          {STATUSES.map(([value, label]) => (
            <a key={value} href={hrefFor(value, source)} aria-current={status === value ? "true" : undefined}>
              {label}
            </a>
          ))}
        </div>
        <div className="filters" aria-label="Источник">
          {SOURCES.map(([value, label]) => (
            <a key={value} href={hrefFor(status, value)} aria-current={source === value ? "true" : undefined}>
              {label}
            </a>
          ))}
        </div>
        {rows.length ? (
          <ol className="requests">
            {rows.map((item) => (
              <li key={item.id}>
                <strong>
                  {formatRuDate(item.date)}, {formatMinutes(item.startMin)}–{formatMinutes(item.endMin)}
                </strong>
                <span>
                  {item.clientName}, {item.phone}
                </span>
                <span>
                  {item.serviceName}, {formatDuration(item.durationMin)}, {item.barberName}
                </span>
                <span>{SOURCE_LABEL[item.source]}</span>
                {item.comment ? <span className="muted">{item.comment}</span> : null}
                <BookingActions id={item.id} status={item.status} canRemind={item.canRemind} />
              </li>
            ))}
          </ol>
        ) : (
          <p>Таких заявок нет.</p>
        )}
        </div>
      </main>
    );
}
