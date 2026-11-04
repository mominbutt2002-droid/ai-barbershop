export function AboutSection({ barbers, services }) {
  return (
    <section className="band" id="about">
      <div className="wrap about-grid">
        <div className="about-visual" aria-hidden="true">
          <span className="about-panel" />
          <span className="about-badge">
            Баумана
            <strong>17</strong>
          </span>
        </div>
        <div>
          <p className="eyebrow">о зале</p>
          <h2>Три кресла на втором этаже</h2>
          <p className="lead">
            Вход с красной полосой. Очереди на общую дверь нет: запись идёт к конкретному мастеру и видно, чем занята смена.
          </p>
          <ul className="stats">
            <li>
              <strong>{barbers.length}</strong>
              <span>мастера в зале</span>
            </li>
            <li>
              <strong>{services.length}</strong>
              <span>услуги в прайсе</span>
            </li>
            <li>
              <strong>2</strong>
              <span>этаж, дверь с полосой</span>
            </li>
            <li>
              <strong>45</strong>
              <span>минут на слот</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
