"use client";

import { useEffect, useState } from "react";
import { DayCalendar } from "@/components/booking/DayCalendar";
import { SlotList } from "@/components/booking/SlotList";
import { closeMiniApp } from "@/components/TelegramMiniApp";
import { formatPrice } from "@/lib/format";
import { dayOpen } from "@/lib/openDay";
import { shop } from "@/lib/shop";
import { addDaysIso, BOOKING_HORIZON_DAYS, formatMinutes, formatRuDate } from "@/lib/time";

export function BookingSheet({ todayIso, services, barbers, channel = "site", initData = "", telegramUser = null }) {
  const [year, month] = todayIso.split("-").map(Number);
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [cursor, setCursor] = useState({ year, month });
  const [date, setDate] = useState("");
  const [loaded, setLoaded] = useState({ key: "", slots: [], error: "" });
  const [slot, setSlot] = useState(null);
  const [name, setName] = useState(
    [telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(" "),
  );
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(null);

  const horizon = addDaysIso(todayIso, BOOKING_HORIZON_DAYS);
  const requestKey = serviceId && barberId && date ? `${serviceId}|${barberId}|${date}` : "";
  const slots = loaded.key === requestKey ? loaded.slots : [];
  const slotsState = !requestKey ? "idle" : loaded.key === requestKey ? "ready" : "loading";
  const slotError = loaded.key === requestKey ? loaded.error : "";

  useEffect(() => {
    if (!requestKey) return undefined;
    const controller = new AbortController();
    const params = new URLSearchParams({ serviceId, barberId, date });
    fetch(`/api/slots?${params}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Не удалось получить время");
        setLoaded({ key: requestKey, slots: data.slots || [], error: "" });
      })
      .catch((fetchError) => {
        if (fetchError.name === "AbortError") return;
        setLoaded({ key: requestKey, slots: [], error: fetchError.message });
      });
    return () => controller.abort();
  }, [requestKey, serviceId, barberId, date]);

  function pickService(id) {
    setServiceId(id);
    setSlot(null);
    setDone(null);
    setError("");
  }

  function pickBarber(id) {
    setBarberId(id);
    setSlot(null);
    setDone(null);
    setError("");
    if (date && !dayOpen(barbers, id, date, todayIso)) setDate("");
  }

  function pickDate(iso) {
    setDate(iso);
    setSlot(null);
    setError("");
  }

  function shiftMonth(delta) {
    setCursor((current) => {
      const index = current.year * 12 + (current.month - 1) + delta;
      return { year: Math.floor(index / 12), month: (index % 12) + 1 };
    });
  }

  const todayKey = year * 12 + month;
  const cursorKey = cursor.year * 12 + cursor.month;
  const [horizonYear, horizonMonth] = horizon.split("-").map(Number);
  const horizonKey = horizonYear * 12 + horizonMonth;

  async function submit(event) {
    event.preventDefault();
    if (!slot) return;
    setPending(true);
    setError("");
    const mini = channel === "mini";
    const response = await fetch(mini ? "/api/mini/book" : "/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(mini && initData ? { Authorization: `tma ${initData}` } : {}),
      },
      body: JSON.stringify({
        serviceId,
        barberId: slot.barberId,
        date,
        startMin: slot.startMin,
        clientName: name,
        phone,
        comment,
        ...(mini ? { initData } : {}),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Не получилось сохранить запись");
      return;
    }
    setDone(data);
  }

  if (!services.length || !barbers.length) {
    return <p>Запись пока закрыта: в салоне нет услуг или мастеров.</p>;
  }

  if (done?.booking) {
    const item = done.booking;
    return (
      <section className="confirm" aria-live="polite">
        <h2>Запись сохранена</h2>
        <p>
          {item.barberName} ждёт вас {formatRuDate(item.date)}, {formatMinutes(item.startMin)}–
          {formatMinutes(item.endMin)}. Услуга: {item.serviceName}.
        </p>
        <p>Заявка стоит в смене со статусом «новая».</p>
        {done.notified ? (
          <p>Копия ушла в Telegram-группу салона.</p>
        ) : (
          <p>В Telegram-группу сообщение не ушло: бот ещё не подключён.</p>
        )}
        {channel === "mini" ? (
          <p>Напомним в этот чат за час и за 5 минут до визита.</p>
        ) : null}
        <p className="cta-row">
          <button type="button" className="button" onClick={() => setDone(null)}>
            Записать ещё
          </button>
          {channel === "mini" ? (
            <button type="button" className="button quiet" onClick={closeMiniApp}>
              Закрыть
            </button>
          ) : null}
        </p>
      </section>
    );
  }

  return (
    <form className="sheet" onSubmit={submit}>
      <section>
        <h2 id="service-label">Услуга</h2>
        <div className="choices" role="radiogroup" aria-labelledby="service-label">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              role="radio"
              aria-checked={serviceId === service.id}
              className="choice"
              onClick={() => pickService(service.id)}
            >
              <span>{service.name}</span>
              <span>
                {service.durationMin} мин, {formatPrice(service.price)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {serviceId ? (
        <section>
          <h2 id="barber-label">Мастер</h2>
          <div className="choices" role="radiogroup" aria-labelledby="barber-label">
            <button
              type="button"
              role="radio"
              aria-checked={barberId === "any"}
              className="choice"
              onClick={() => pickBarber("any")}
            >
              <span>Любой свободный</span>
              <span>Поставим мастера с пустым креслом</span>
            </button>
            {barbers.map((barber) => (
              <button
                key={barber.id}
                type="button"
                role="radio"
                aria-checked={barberId === barber.id}
                className="choice"
                onClick={() => pickBarber(barber.id)}
              >
                <span>{barber.name}</span>
                <span>{barber.role}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {barberId ? (
        <DayCalendar
          barbers={barbers}
          barberId={barberId}
          todayIso={todayIso}
          cursor={cursor}
          date={date}
          todayKey={todayKey}
          cursorKey={cursorKey}
          horizonKey={horizonKey}
          onShiftMonth={shiftMonth}
          onPickDate={pickDate}
        />
      ) : null}

      {date ? (
        <SlotList
          slotsState={slotsState}
          slotError={slotError}
          slots={slots}
          slot={slot}
          barberId={barberId}
          onPick={setSlot}
        />
      ) : null}

      {slot ? (
        <section className="fields">
          <h2>Контакты</h2>
          <p>
            {formatRuDate(date)}, {formatMinutes(slot.startMin)}–{formatMinutes(slot.endMin)}, {slot.barberName}
          </p>
          <label>
            Имя
            <input
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={80}
            />
          </label>
          <label>
            Телефон
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+7 900 000-00-00"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </label>
          <label>
            Пожелание
            <textarea
              name="comment"
              rows={3}
              maxLength={300}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </label>
          <button className="button" type="submit" disabled={pending}>
            {pending ? "Сохраняю…" : "Записать на кресло"}
          </button>
          <p className="muted">
            Салон: {shop.city}, {shop.street}. Телефон {shop.phone}.
          </p>
        </section>
      ) : null}

      {error ? (
        <p role="alert" className="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
