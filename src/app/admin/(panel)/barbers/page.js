import { Suspense } from "react";
import { BarberManager } from "@/components/BarberManager";
import { listBarbersForAdmin, liveToday, withDb } from "@/lib/data";

export const metadata = { title: "Мастера" };

export default function BarbersPage() {
  return (
    <Suspense fallback={<p className="muted">Открываю мастеров…</p>}>
      <BarbersLive />
    </Suspense>
  );
}

async function BarbersLive() {
  const barbers = await withDb(async () => {
    await liveToday();
    return listBarbersForAdmin();
  });
  return (
    <main className="page">
      <div className="wrap">
        <p className="eyebrow">команда</p>
        <h1>Мастера</h1>
        <p className="lead">Добавьте мастера и отметьте дни со временем смены. Скрытый мастер не попадает в запись.</p>
        <BarberManager barbers={barbers} />
      </div>
    </main>
  );
}
