import Link from "next/link";
import { shop } from "@/lib/shop";
import { LogoMark } from "./LogoMark";

export function Footer() {
  return (
    <footer className="site-foot">
      <div className="wrap foot-grid">
        <div>
          <p className="foot-brand">
            <LogoMark />
            Кромка
          </p>
          <p>Мужские стрижки в Казани. Кресло видно до записи: смена, мастер и свободные окна на сайте.</p>
        </div>
        <div>
          <h2>Салон</h2>
          <ul>
            <li>
              <Link href="/#about">О зале</Link>
            </li>
            <li>
              <Link href="/#services">Услуги</Link>
            </li>
            <li>
              <Link href="/#team">Мастера</Link>
            </li>
            <li>
              <Link href="/book">Запись</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2>Адрес</h2>
          <p>
            {shop.city}, {shop.street}
          </p>
          <p>{shop.entrance}</p>
          <p>
            <a className="phone" href={shop.phoneHref}>
              {shop.phone}
            </a>
          </p>
        </div>
        <div>
          <h2>Запись</h2>
          <p>Выберите услугу, мастера и время. Заявка сразу встаёт в смену.</p>
          <p className="cta-row">
            <Link className="button" href="/book">
              Записать на кресло
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
