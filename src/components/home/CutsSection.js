const CUTS = [
  { title: "Фейд", hint: "Коротко у виска" },
  { title: "Кроп", hint: "Плотная макушка" },
  { title: "Борода", hint: "Контур и длина" },
  { title: "Машинка", hint: "Ровная длина" },
];

export function CutsSection() {
  return (
    <section className="band" id="gallery">
      <div className="wrap">
        <p className="eyebrow">срезы</p>
        <h2>Как держим линию</h2>
        <ul className="cuts">
          {CUTS.map((cut) => (
            <li key={cut.title} className={`cut cut-${cut.title.length}`}>
              <span>{cut.title}</span>
              <small>{cut.hint}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
