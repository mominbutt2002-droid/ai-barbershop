"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  ["/admin", "Смена"],
  ["/admin/barbers", "Мастера"],
  ["/admin/bookings", "Заявки"],
];

function isCurrent(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminNav() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login"); // eslint-disable-line @next/next/no-location-assign-relative-destination
  }

  return (
    <nav className="subnav" aria-label="Админка">
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} aria-current={isCurrent(pathname, href) ? "page" : undefined}>
          {label}
        </Link>
      ))}
      <Link href="/">На сайт</Link>
      <button type="button" className="button quiet" onClick={logout} disabled={pending}>
        Выйти
      </button>
    </nav>
  );
}
