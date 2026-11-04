export function Glyph({ name }) {
  if (name.includes("Фейд")) {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M10 40c4-10 24-10 28 0" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M18 26v10M24 28v10M30 26v10" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (name.includes("Бород")) {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M14 18c0-6 4-10 10-10s10 4 10 10v8c0 8-4 14-10 14s-10-6-10-14z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M18 22h12" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (name.includes("машинк") || name.includes("Машин")) {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="16" y="8" width="16" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M20 30v8M28 30v8M18 14h12" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="16" cy="16" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="32" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l8 8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
