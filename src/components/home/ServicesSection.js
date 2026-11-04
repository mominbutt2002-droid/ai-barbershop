import { Glyph } from "@/components/Glyph";
import { formatPrice } from "@/lib/format";

export function ServicesSection({ services }) {
  return (
    <section className="band band-alt" id="services">
      <div className="wrap">
        <p className="eyebrow">прайс</p>
        <h2>Услуги салона</h2>
        <ul className="service-grid">
          {services.map((service) => (
            <li key={service.id} className="service-card">
              <span className="glyph">
                <Glyph name={service.name} />
              </span>
              <h3>{service.name}</h3>
              <p>
                {service.durationMin} мин · {formatPrice(service.price)}
              </p>
              <p>{service.description}</p>
              <a href="/book">Записать</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
