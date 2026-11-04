"use client";

export function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("kromka-theme", next);
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle}>
      <span className="when-light">Тёмная тема</span>
      <span className="when-dark">Светлая тема</span>
    </button>
  );
}
