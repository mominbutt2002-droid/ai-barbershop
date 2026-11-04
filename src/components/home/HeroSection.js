import { HeroBackdrop } from "@/components/HeroBackdrop";
import { shop } from "@/lib/shop";

export function HeroSection() {
  return (
    <section className="hero">
      <HeroBackdrop />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="where">
            {shop.city}, {shop.street}
          </p>
          <p className="hero-kicker">режем чисто</p>
          <h1 className="sign">Кромка</h1>
          <p className="hero-line">барбершоп</p>
          <p className="lead">
            Мужские стрижки, фейд и борода. Кресло выбираете сами: день, время и мастер видны до записи.
          </p>
          <p className="cta-row">
            <a className="button" href="/book">
              Записать на кресло
            </a>
            <a className="play" href="#today">
              <span>Сегодня в зале</span>
            </a>
          </p>
        </div>
        <div className="hero-art">
          <span className="orb orb-a" aria-hidden="true" />
          <span className="orb orb-b" aria-hidden="true" />
          <video
            className="cut-loop"
            src="/demo/cut.mp4"
            poster="/demo/cut-01.jpg"
            muted
            loop
            playsInline
            autoPlay
            aria-label="ИИ-ролик стрижки в кресле Кромки"
          />
        </div>
      </div>
    </section>
  );
}
