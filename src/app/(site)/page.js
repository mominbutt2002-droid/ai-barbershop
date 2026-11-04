import { Suspense } from "react";
import { AboutSection } from "@/components/home/AboutSection";
import { CutsSection } from "@/components/home/CutsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { TeamSection } from "@/components/home/TeamSection";
import { TodaySection } from "@/components/home/TodaySection";
import { VisitSection } from "@/components/home/VisitSection";
import { getCatalog, liveToday, loadDay, withDb } from "@/lib/data";

export default function HomePage() {
  return (
    <Suspense fallback={<p className="muted wrap page-pad">Смотрю кресла на сегодня…</p>}>
      <HomeLive />
    </Suspense>
  );
}

async function HomeLive() {
  const { services, barbers, loadById } = await withDb(async () => {
    const today = await liveToday();
    const { services, barbers } = await getCatalog();
    const board = await loadDay(today.iso);
    const loadById = Object.fromEntries(board.map((item) => [item.id, item]));
    return { services, barbers, loadById };
  });

  return (
    <main>
      <HeroSection />
      <ServicesSection services={services} />
      <AboutSection barbers={barbers} services={services} />
      <TodaySection barbers={barbers} loadById={loadById} />
      <TeamSection barbers={barbers} />
      <CutsSection />
      <VisitSection />
    </main>
  );
}
