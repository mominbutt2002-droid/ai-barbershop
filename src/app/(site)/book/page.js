import { Suspense } from "react";
import { BookingSheet } from "@/components/BookingSheet";
import { getCatalog, liveToday, withDb } from "@/lib/data";
import { shop } from "@/lib/shop";

export const metadata = { title: "Запись" };

export default function BookPage() {
  return (
    <main className="page">
      <div className="wrap">
        <p className="eyebrow">запись</p>
        <h1>Запись на кресло</h1>
        <p className="lead">
          Выберите услугу, мастера и свободное время. Или позвоните{" "}
          <a className="phone" href={shop.phoneHref}>
            {shop.phone}
          </a>
          .
        </p>
        <Suspense fallback={<p className="muted">Открываю запись…</p>}>
          <BookLive />
        </Suspense>
      </div>
    </main>
  );
}

async function BookLive() {
  const { today, catalog } = await withDb(async () => {
    const today = await liveToday();
    const catalog = await getCatalog();
    return { today, catalog };
  });
  return (
    <BookingSheet todayIso={today.iso} services={catalog.services} barbers={catalog.barbers} />
  );
}
