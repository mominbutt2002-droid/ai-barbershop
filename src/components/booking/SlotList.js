import { formatMinutes } from "@/lib/time";

export function SlotList({ slotsState, slotError, slots, slot, barberId, onPick }) {
  return (
    <section>
      <h2>Время</h2>
      {slotsState === "loading" ? <p className="muted">Смотрю свободные кресла…</p> : null}
      {slotError ? (
        <p role="alert" className="alert">
          {slotError}
        </p>
      ) : null}
      {slotsState === "ready" && !slotError && slots.length === 0 ? (
        <p>В этот день свободного времени нет.</p>
      ) : null}
      <div className="slots" role="radiogroup" aria-label="Свободное время">
        {slots.map((item) => (
          <button
            key={`${item.barberId}-${item.startMin}`}
            type="button"
            role="radio"
            aria-checked={slot?.startMin === item.startMin && slot?.barberId === item.barberId}
            className="chip"
            onClick={() => onPick(item)}
          >
            {formatMinutes(item.startMin)}
            {barberId === "any" ? `, ${item.barberName.split(" ")[0]}` : ""}
          </button>
        ))}
      </div>
    </section>
  );
}
