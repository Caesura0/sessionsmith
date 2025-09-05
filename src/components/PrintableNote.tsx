
//import type { Option } from "../types/options";

/**
 * Data shape we expect from the main form.
 */
export type NoteData = {
  mode: "telephone" | "virtual" | "in-person";
  durationMinutes: 30 | 60 | 90;
  clientUpdate: string;               // free text
  themes: string;                     // free text
  interventions: string[];            // already as labels (not IDs)
  observations: string[];             // already as labels (not IDs)
  plan: string;                       // free text
  nextSessionISO?: string;            // "yyyy-mm-dd" from <input type="date">
};

/**
 * Print-only version of the note.
 * Tip: It's hidden on screen, but shown when printing (via Tailwind print: variant).
 */
export function PrintableNote({ data }: { data: NoteData }) {
  const {
    mode, durationMinutes, clientUpdate, themes,
    interventions, observations, plan, nextSessionISO
  } = data;

  const fmtDate = (iso?: string) => {
    if (!iso) return "";
    // render as YYYY-MM-DD; change to your preferred display if needed
    return iso;
  };

  return (
    <div
      id="print-note"
      className="
        hidden print:block                 /* only visible when printing */
        text-black                          /* force dark text for printers */
        bg-white                            /* white background on paper */
        leading-relaxed text-[12pt]         /* readable print size */
      "
    >
      <h1 className="text-[14pt] font-bold mb-2">Notes</h1>

      <p>
        The client attended the scheduled session on by {mode}. The session lasted approximately {durationMinutes} minutes.
      </p>

      <p className="font-bold mt-3">The client provided an update on the events since last session:</p>
      <p className="whitespace-pre-wrap">{clientUpdate || "\u00A0"}</p>

      <p className="font-bold mt-3">Significant themes within the session focused on:</p>
      <p className="whitespace-pre-wrap">{themes || "\u00A0"}</p>

      <p className="font-bold mt-3">Interventions included:</p>
      {interventions?.length ? (
        <ul className="list-disc pl-6">
          {interventions.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : (
        <p>–</p>
      )}

      <p className="font-bold mt-3">Observations/Client Response:</p>
      {observations?.length ? (
        <ul className="list-disc pl-6">
          {observations.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : (
        <p>–</p>
      )}

      <p className="font-bold mt-3">Plan:</p>
      <p className="whitespace-pre-wrap">{plan || "\u00A0"}</p>

      <p className="font-bold mt-3">The next session was booked for:</p>
      <p>Date of next session - {fmtDate(nextSessionISO)}</p>
    </div>
  );
}
