import { shop } from "@/lib/shop";

export function VisitSection() {
  return (
    <section className="band band-alt" id="contact">
      <div className="wrap contact-grid">
        <div>
          <p className="eyebrow">контакт</p>
          <h2>Где мы</h2>
          <p>
            {shop.city}, {shop.street}
          </p>
          <p>{shop.entrance}</p>
          <p>
            <a className="phone" href={shop.phoneHref}>
              {shop.phone}
            </a>
          </p>
          <p className="muted">Салон открыт в часы смен мастеров. Запись идёт по креслам, не по общей двери.</p>
          <p className="cta-row">
            <a className="button" href="/book">
              Записать на кресло
            </a>
          </p>
        </div>
        <div className="city-map" aria-hidden="true">
          <span className="street s1" />
          <span className="street s2" />
          <span className="pin">Кромка</span>
        </div>
      </div>
    </section>
  );
}
