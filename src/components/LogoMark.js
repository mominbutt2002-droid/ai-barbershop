export function LogoMark({ className = "logo-mark" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="24" cy="24" r="14" fill="var(--gold)" />
      <circle cx="24" cy="24" r="6" fill="var(--navy)" />
    </svg>
  );
}
