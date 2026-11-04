"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUS_LABEL } from "@/lib/format";

export function BookingActions({ id, status, canRemind = false }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function update(next) {
    setPending(true);
    setError("");
    setNote("");
    const response = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Не получилось обновить заявку");
      return;
    }
    router.refresh();
  }

  async function remind() {
    setPending(true);
    setError("");
    setNote("");
    const response = await fetch(`/api/admin/bookings/${id}/remind`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Не получилось отправить напоминание");
      return;
    }
    setNote("Напоминание ушло в Telegram");
  }

  return (
    <div className="request-actions">
      {status === "new" ? (
        <button type="button" className="button" disabled={pending} onClick={() => update("confirmed")}>
          Подтвердить
        </button>
      ) : null}
      {status !== "cancelled" ? (
        <button type="button" className="button danger" disabled={pending} onClick={() => update("cancelled")}>
          Отменить
        </button>
      ) : (
        <button type="button" className="button quiet" disabled={pending} onClick={() => update("new")}>
          Вернуть в смену
        </button>
      )}
      {status !== "cancelled" ? (
        <button
          type="button"
          className="button quiet"
          disabled={pending || !canRemind}
          title={canRemind ? "Отправить клиенту напоминание в Telegram" : "Клиент ещё не писал боту"}
          onClick={remind}
        >
          Напомнить в Telegram
        </button>
      ) : null}
      <span className={`status-${status}`}>{STATUS_LABEL[status]}</span>
      {note ? <span className="muted">{note}</span> : null}
      {error ? (
        <span role="alert" className="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
