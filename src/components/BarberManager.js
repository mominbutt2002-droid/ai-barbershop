"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { scheduleLabel } from "@/lib/format";
import { minutesToTimeInput, timeInputToMinutes, WEEK_LONG, WEEK_ORDER } from "@/lib/time";

function blankWeek() {
  return WEEK_ORDER.map((weekday) => ({
    weekday,
    enabled: weekday !== 0,
    startMin: 10 * 60,
    endMin: 20 * 60,
  }));
}

function weekFrom(schedules) {
  return WEEK_ORDER.map((weekday) => {
    const found = schedules.find((item) => item.weekday === weekday);
    return {
      weekday,
      enabled: Boolean(found),
      startMin: found?.startMin ?? 10 * 60,
      endMin: found?.endMin ?? 20 * 60,
    };
  });
}

function blankForm() {
  return { id: null, name: "", role: "Барбер", bio: "", active: true, days: blankWeek() };
}

function formFrom(barber) {
  return {
    id: barber.id,
    name: barber.name,
    role: barber.role,
    bio: barber.bio,
    active: barber.active,
    days: weekFrom(barber.schedules),
  };
}

export function BarberManager({ barbers: initialBarbers }) {
  const router = useRouter();
  const [barbers, setBarbers] = useState(initialBarbers);
  const [form, setForm] = useState(initialBarbers[0] ? formFrom(initialBarbers[0]) : blankForm());
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function patchDay(weekday, patch) {
    setForm((current) => ({
      ...current,
      days: current.days.map((day) => (day.weekday === weekday ? { ...day, ...patch } : day)),
    }));
  }

  async function save(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const schedules = form.days
      .filter((day) => day.enabled)
      .map(({ weekday, startMin, endMin }) => ({ weekday, startMin, endMin }));
    const response = await fetch(form.id ? `/api/admin/barbers/${form.id}` : "/api/admin/barbers", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        role: form.role,
        bio: form.bio,
        active: form.active,
        schedules,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Не получилось сохранить мастера");
      return;
    }
    setBarbers((current) => {
      const exists = current.some((item) => item.id === data.barber.id);
      const next = exists
        ? current.map((item) => (item.id === data.barber.id ? data.barber : item))
        : [...current, data.barber];
      return next.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    });
    setForm(formFrom(data.barber));
    setMessage("Смена сохранена");
    router.refresh();
  }

  return (
    <div className="split">
      <div>
        <div className="row-actions">
          <button type="button" className="button quiet" onClick={() => setForm(blankForm())}>
            Новый мастер
          </button>
        </div>
        <ul className="people">
          {barbers.map((barber) => (
            <li key={barber.id}>
              <button
                type="button"
                className="person"
                aria-pressed={form.id === barber.id}
                onClick={() => setForm(formFrom(barber))}
              >
                <strong>{barber.name}</strong>
                <span>{barber.active ? scheduleLabel(barber.schedules) : "Скрыт из записи"}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form className="fields" onSubmit={save}>
        <h2>{form.id ? "Правка мастера" : "Новый мастер"}</h2>
        <label>
          Имя
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
            minLength={2}
            maxLength={80}
          />
        </label>
        <label>
          Роль
          <input
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            required
            minLength={2}
            maxLength={60}
          />
        </label>
        <label>
          О мастере
          <textarea
            rows={3}
            maxLength={400}
            value={form.bio}
            onChange={(event) => setForm({ ...form, bio: event.target.value })}
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => setForm({ ...form, active: event.target.checked })}
          />
          Показывать в записи
        </label>
        <fieldset className="week">
          <legend>Дни и часы</legend>
          {form.days.map((day) => (
            <div className="dayline" key={day.weekday}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={(event) => patchDay(day.weekday, { enabled: event.target.checked })}
                />
                {WEEK_LONG[day.weekday].charAt(0).toUpperCase() + WEEK_LONG[day.weekday].slice(1)}
              </label>
              <input
                type="time"
                step="1800"
                disabled={!day.enabled}
                value={minutesToTimeInput(day.startMin)}
                aria-label={`${WEEK_LONG[day.weekday]}, начало`}
                onChange={(event) => {
                  const startMin = timeInputToMinutes(event.target.value);
                  if (startMin !== null) patchDay(day.weekday, { startMin });
                }}
              />
              <input
                type="time"
                step="1800"
                disabled={!day.enabled}
                value={minutesToTimeInput(day.endMin)}
                aria-label={`${WEEK_LONG[day.weekday]}, конец`}
                onChange={(event) => {
                  const endMin = timeInputToMinutes(event.target.value);
                  if (endMin !== null) patchDay(day.weekday, { endMin });
                }}
              />
            </div>
          ))}
        </fieldset>
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Сохраняю…" : "Сохранить смену"}
        </button>
        {message ? <p className="ok">{message}</p> : null}
        {error ? (
          <p role="alert" className="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
