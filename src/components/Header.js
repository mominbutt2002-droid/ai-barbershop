"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoMark } from "./LogoMark";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <header className="mast">
      <div className="wrap mast-inner">
        <Link className="brand" href="/" onClick={close}>
          <LogoMark />
          Кромка
        </Link>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Закрыть" : "Меню"}
        </button>
        <nav id="site-nav" className={open ? "mast-nav is-open" : "mast-nav"} aria-label="Разделы">
          <Link href="/#about" onClick={close}>
            Салон
          </Link>
          <Link href="/#services" onClick={close}>
            Услуги
          </Link>
          <Link href="/#team" onClick={close}>
            Мастера
          </Link>
          <Link href="/book" onClick={close}>
            Запись
          </Link>
          <Link href="/admin" onClick={close}>
            Админка
          </Link>
          <ThemeToggle />
          <Link className="button" href="/book" onClick={close}>
            Записать на кресло
          </Link>
        </nav>
      </div>
    </header>
  );
}
