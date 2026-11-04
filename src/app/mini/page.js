import { Suspense } from "react";
import { MiniBooking } from "@/components/MiniBooking";
import { getCatalog, liveToday, withDb } from "@/lib/data";
import { shop } from "@/lib/shop";

export default function MiniPage() {
  return (
    <main className="page tma-page">
      <div className="wrap">
        <p className="eyebrow">запись</p>
        <h1>Календарь Кромки</h1>
        <p className="lead">
          {shop.city}, {shop.street}. Услуга, мастер, день и время — как на сайте.
        </p>
        <Suspense fallback={<p className="muted">Открываю календарь…</p>}>
          <MiniLive />
        </Suspense>
      </div>
    </main>
  );
}

async function MiniLive() {
  const { today, catalog } = await withDb(async () => {
    const today = await liveToday();
    const catalog = await getCatalog();
    return { today, catalog };
  });
  return (
    <MiniBooking todayIso={today.iso} services={catalog.services} barbers={catalog.barbers} />
  );
}
