"use client";

export default function Error({ error, reset }) {
  const known = /База ещё не создана/.test(error.message || "");
  return (
    <main className="page">
      <div className="wrap">
      <h1>Не получилось открыть страницу</h1>
      <p>
        {known
          ? error.message
          : "Данные салона сейчас не читаются. Проверьте, что база создана командой npm run db:setup."}
      </p>
      <button type="button" className="button" onClick={() => reset()}>
        Повторить
      </button>
      </div>
    </main>
  );
}
