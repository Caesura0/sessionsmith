// InlineSessionLine.tsx
import { useState } from "react";

/** Session “mode” options shown in the first dropdown */
const MODE_OPTIONS = [
  { value: "telephone", label: "telephone" },
  { value: "virtual",   label: "virtual" },
  { value: "in-person", label: "in person" },
] as const;
type Mode = typeof MODE_OPTIONS[number]["value"];

/** Duration options (minutes) shown in the second dropdown */
const DURATION_OPTIONS = [30, 60, 90] as const;

export function InlineSessionLine() {
  // Controlled state for both dropdowns
  const [mode, setMode] = useState<Mode>("telephone");
  const [duration, setDuration] = useState<number>(90);

  return (
    <p className="text-base leading-7 text-white">
      {/* Static copy */}
      The client attended the scheduled session on{" "}

      {/* Dropdown #1: mode */}
      <InlineSelect
        ariaLabel="Session mode"
        value={mode}
        onChange={(v) => setMode(v as Mode)}
        className="mx-1"
      >
        {MODE_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </InlineSelect>

      {/* Punctuation + more copy */}
      . The session lasted approximately{" "}

      {/* Dropdown #2: duration */}
      <InlineSelect
        ariaLabel="Session duration (minutes)"
        value={String(duration)}
        onChange={(v) => setDuration(Number(v))}
        className="mx-1"
      >
        {DURATION_OPTIONS.map(min => (
          <option key={min} value={min}>{min}</option>
        ))}
      </InlineSelect>

      {" "}minutes.
    </p>
  );
}

/**
 * Small inline-styled <select> that blends into sentences.
 * - Keeps height compact
 * - Matches your dark theme tokens (bg-dark-1/2, border-dark-4, text-light-1)
 * - Uses aria-label for accessibility since we hide a visible label in the sentence
 */
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
          // Inline sizing & spacing so it sits nicely in text
          "align-baseline text-sm",
          "px-2 py-1 rounded-lg",
          // Theme + borders
          "bg-dark-2 text-light-1 border border-dark-4",
          // Remove blue glow; add subtle focus ring that fits your palette
          "outline-none focus:border-light-3 focus:ring-1 focus:ring-light-3",
          // Make it feel clickable
          "cursor-pointer"
        ].join(" ")}
      >
        {children}
      </select>
    </span>
  );
}