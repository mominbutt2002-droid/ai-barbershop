import { initials, scheduleLabel } from "@/lib/format";

export function TeamSection({ barbers }) {
  return (
    <section className="band band-dark" id="team">
      <div className="wrap">
        <p className="eyebrow">команда</p>
        <h2>Мастера</h2>
        <div className="masters">
          {barbers.map((barber) => (
            <article key={barber.id} className="master">
              <div className="avatar" aria-hidden="true">
                {initials(barber.name)}
              </div>
              <div>
                <h3>{barber.name}</h3>
                <p className="role">{barber.role}</p>
                <p>{scheduleLabel(barber.schedules)}</p>
                <p className="muted">{barber.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
