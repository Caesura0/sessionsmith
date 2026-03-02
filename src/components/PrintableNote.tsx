
export type NoteData = {
  mode: "telephone" | "virtual" | "in-person";
  durationMinutes: 30 | 60 | 90;
  nextSessionISO?: string;
  // Dynamic fields from the template
  // Key = field.id, Value = string (for freetext) or string[] (for prompt-lists)
  fields: {
    id: string;
    label: string;
    content: string | string[];
  }[];
};

export function PrintableNote({ data }: { data: NoteData }) {
  const { mode, durationMinutes, nextSessionISO, fields } = data;

  const fmtDate = (iso?: string) => {
    if (!iso) return "Not Documented";
    return iso;
  };

  return (
    <div
      id="print-note"
      className="
        hidden print:block
        text-black
        bg-white
        leading-relaxed text-[12pt]
      "
    >
      <h1 className="text-[14pt] font-bold mb-2">Session Notes</h1>

      <p>
        The client attended the scheduled session on by {mode}. The session lasted approximately {durationMinutes} minutes.
      </p>

      {fields.map((field) => {
        const { id, label, content } = field;

        return (
          <div key={id} className="mt-3">
            <p className="font-bold mb-1">{label}:</p>
            {Array.isArray(content) ? (
              content.length > 0 ? (
                <ul className="list-disc ml-10">
                  {content.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="ml-6">–</p>
              )
            ) : (
              <p className="whitespace-pre-wrap ml-6">{content || "\u00A0"}</p>
            )}
          </div>
        );
      })}

      <p className="font-bold mt-3">The next session was booked for:</p>
      <p>Date of next session - {fmtDate(nextSessionISO)}</p>
    </div>
  );
}
