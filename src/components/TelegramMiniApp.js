"use client";

import { useEffect, useState } from "react";

export function useTelegramMiniApp() {
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      const webApp = window.Telegram?.WebApp;
      if (!webApp) {
        setReady(true);
        return;
      }
      webApp.ready();
      webApp.expand();
      document.documentElement.dataset.theme = webApp.colorScheme === "dark" ? "dark" : "light";
      document.documentElement.classList.add("tma");
      setUser(webApp.initDataUnsafe?.user || null);
      setInitData(webApp.initData || "");
      setReady(true);
      webApp.onEvent?.("themeChanged", () => {
        document.documentElement.dataset.theme = webApp.colorScheme === "dark" ? "dark" : "light";
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  return { user, initData, ready };
}

export function closeMiniApp() {
  window.Telegram?.WebApp?.close?.();
}
