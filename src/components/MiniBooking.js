"use client";

import { BookingSheet } from "@/components/BookingSheet";
import { useTelegramMiniApp } from "@/components/TelegramMiniApp";

export function MiniBooking({ todayIso, services, barbers }) {
  const { user, initData, ready } = useTelegramMiniApp();
  if (!ready) return <p className="muted">Открываю Telegram…</p>;
  return (
    <>
      {!initData ? (
        <p className="muted">
          Чтобы сохранить заявку из Telegram, откройте эту страницу кнопкой «Календарь» в боте. Сейчас календарь можно посмотреть.
        </p>
      ) : null}
      <BookingSheet
        todayIso={todayIso}
        services={services}
        barbers={barbers}
        channel="mini"
        initData={initData}
        telegramUser={user}
      />
    </>
  );
}
