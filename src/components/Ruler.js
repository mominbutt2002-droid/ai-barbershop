import { formatMinutes, hourMarks } from "@/lib/time";

export function Ruler({ startMin, endMin, blocks }) {
  const span = endMin - startMin;
  if (span <= 0) return null;
  const marks = hourMarks(startMin, endMin);

  return (
    <div className="ruler" aria-hidden="true">
      <div className="ruler-track">
        {blocks.map((block) => {
          const left = Math.max(0, block.startMin - startMin);
          const width = Math.max(
            0,
            Math.min(endMin, block.endMin) - Math.max(startMin, block.startMin),
          );
          return (
            <span
              key={block.id}
              className="ruler-block"
              style={{
                left: `${(left / span) * 100}%`,
                width: `${(width / span) * 100}%`,
              }}
            />
          );
        })}
      </div>
      <div className="ruler-scale">
        {marks.map((mark) => {
          const pct = ((mark - startMin) / span) * 100;
          const align = pct < 7 ? "start" : pct > 93 ? "end" : "mid";
          return (
            <span key={mark} className={`tick ${align}`} style={{ left: `${pct}%` }}>
              {formatMinutes(mark)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
