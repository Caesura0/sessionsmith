import type { SessionMode, PromptItem } from "../../dataDictionary";

export function InlineSessionLine({
  mode,
  duration,
  modeOptions,
  durationOptions,
  onModeChange,
  onDurationChange,
}: {
  mode: SessionMode;
  duration: number;
  modeOptions: PromptItem[];
  durationOptions: PromptItem[];
  onModeChange: (m: SessionMode) => void;
  onDurationChange: (d: number) => void;
}) {
  return (
    <p className="text-base leading-7 text-white">
      The client attended the scheduled session on{" "}
      <InlineSelect
        ariaLabel="Session mode"
        value={mode}
        onChange={(v) => onModeChange(v)}
        className="mx-1"
      >
        {modeOptions.map(opt => (
          <option key={opt.id} value={opt.label}>{opt.label}</option>
        ))}
      </InlineSelect>

      . The session lasted approximately{" "}

      <InlineSelect
        ariaLabel="Session duration (minutes)"
        value={String(duration)}
        onChange={(v) => onDurationChange(Number(v))}
        className="mx-1"
      >
        {durationOptions.map(opt => (
          <option key={opt.id} value={opt.label}>{opt.label}</option>
        ))}
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
          "bg-black/20 text-white border border-white/10 backdrop-blur-md",
          "outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple",
          "hover:bg-black/40 cursor-pointer transition-colors"
        ].join(" ")}
      >
        {children}
      </select>
    </span>
  );
}