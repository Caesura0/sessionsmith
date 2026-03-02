import type { SessionMode } from "../../dataDictionary";

export function InlineSessionLine({
  mode,
  duration,
  onModeChange,
  onDurationChange,
}: {
  mode: SessionMode;
  duration: number;
  onModeChange: (m: SessionMode) => void;
  onDurationChange: (d: 30 | 60 | 90) => void;
}) {
  return (
    <p className="text-base leading-7 text-white">
      The client attended the scheduled session on{" "}
      <InlineSelect
        ariaLabel="Session mode"
        value={mode}
        onChange={(v) => onModeChange(v as SessionMode)}
        className="mx-1"
      >
        <option value="telephone">telephone</option>
        <option value="virtual">virtual</option>
        <option value="in-person">in-person</option>
      </InlineSelect>

      . The session lasted approximately{" "}

      <InlineSelect
        ariaLabel="Session duration (minutes)"
        value={String(duration)}
        onChange={(v) => onDurationChange(Number(v) as 30 | 60 | 90)}
        className="mx-1"
      >
        <option value={30}>30</option>
        <option value={60}>60</option>
        <option value={90}>90</option>
      </InlineSelect>

      {" "}minutes.
    </p>
  );
}

function InlineSelect(props: {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const { ariaLabel, value, onChange, children, className } = props;
  return (
    <span className={className}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "align-baseline text-sm",
          "px-2 py-1 rounded-lg",
          "bg-dark-2 text-light-1 border border-dark-4",
          "outline-none focus:border-light-3 focus:ring-1 focus:ring-light-3",
          "cursor-pointer"
        ].join(" ")}
      >
        {children}
      </select>
    </span>
  );
}