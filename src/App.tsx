/**
 * App.tsx
 * - Main form (client update, themes, interventions, observations, next date)
 * - Clicking “Interventions” or “Observations” opens a full-screen selector
 * - Supports copy-to-clipboard (rich HTML) and print-to-PDF
 */

import { useState } from "react";
import { FullScreenPicker } from "./components/FullScreenPicker";
import { mergedOptions } from "./utils/optionStore";
import { toLabels } from "./utils/toLabels";
import { INTERVENTIONS, OBSERVATIONS } from "./data/option"; // ← plural
import type { Option } from "./types/options";
import { InlineSessionLine } from "./components/InlineSessionLine";
import { PrintableNote, type NoteData } from "./components/PrintableNote";
import { copyNoteToClipboard } from "./utils/clipboard";
import { buildNoteHTML } from "./utils/noteFormat"; // for preview

export default function App() {
  // Session info shown inline (your InlineSessionLine may own its own state;
  // these are placeholders—wire them up if you want the line to drive these)
  const [mode] = useState<"telephone" | "virtual" | "in-person">("telephone");
  const [duration] = useState<30 | 60 | 90>(90);

  // Free text fields
  const [clientUpdate, setClientUpdate] = useState("");
  const [themes, setThemes] = useState("");
  const [plans, setPlans] = useState("Writer will continue to support the client in ");

  // Multi-select IDs
  const [interventionsIds, setInterventions] = useState<string[]>([]);
  const [observationsIds, setObservations] = useState<string[]>([]);

  // Which picker is open?
  const [picker, setPicker] = useState<null | "interventions" | "observations">(null);

  // Merge base + custom options for display/print/copy
  const obsAll: Option[] = mergedOptions(OBSERVATIONS, "observations");
  const intAll: Option[] = mergedOptions(INTERVENTIONS, "interventions");

  const obsLabels = toLabels(observationsIds, obsAll);
  const intLabels = toLabels(interventionsIds, intAll);

  // Date
  const [nextDate, setNextDate] = useState(""); // yyyy-mm-dd

  // Build data for printing/copying — use merged lists so custom items resolve
  const noteData: NoteData = {
    mode,
    durationMinutes: duration,
    clientUpdate,
    themes,
    interventions: toLabels(interventionsIds, intAll),
    observations: toLabels(observationsIds, obsAll),
    plan: plans, // ← use the textarea value
    nextSessionISO: nextDate,
  };

  // Clipboard & preview
  const [showPreview, setShowPreview] = useState(false);

  async function handleCopy() {
    try {
      await copyNoteToClipboard(noteData);
      alert("Copied to clipboard (rich format) – paste into Word.");
    } catch (e) {
      console.error(e);
      alert("Could not copy automatically. Open the preview and copy manually.");
      setShowPreview(true);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-dark-1 text-white font-inter p-6 space-y-6">
      <h1 className="text-3xl font-bold">Note Taking App</h1>

      {/* All interactive UI is hidden in print */}
      <div className="print:hidden space-y-6">
        {/* Session info (Inline line with dropdowns) */}
        <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
          <InlineSessionLine />
        </section>

        {/* Client update */}
        <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
          <div className="mb-2 text-sm font-semibold text-light-3">Client update</div>
          <textarea
            value={clientUpdate}
            onChange={(e) => setClientUpdate(e.target.value)}
            className="w-full rounded-xl border border-dark-4 bg-dark-1 p-3 text-sm outline-none"
            rows={4}
            placeholder="Type the update…"
          />
        </section>

        {/* Themes */}
        <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
          <div className="mb-2 text-sm font-semibold text-light-3">Significant themes</div>
          <textarea
            value={themes}
            onChange={(e) => setThemes(e.target.value)}
            className="w-full rounded-xl border border-dark-4 bg-dark-1 p-3 text-sm outline-none"
            rows={4}
            placeholder="Type the themes…"
          />
        </section>

        {/* Interventions picker trigger */}
        <section
          className="rounded-2xl border border-dark-3 bg-dark-2 p-4 cursor-pointer hover:border-light-4"
          onClick={() => setPicker("interventions")}
          title="Click to pick interventions"
        >
          <div className="mb-2 text-sm font-semibold text-light-3">Interventions included</div>
          {intLabels.length ? (
            <div className="flex flex-wrap gap-2">
              {intLabels.map((l) => (
                <span key={l} className="rounded-full bg-dark-3 px-3 py-1 text-sm">
                  {l}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-light-4">Click to select interventions</div>
          )}
        </section>

        {/* Observations picker trigger */}
        <section
          className="rounded-2xl border border-dark-3 bg-dark-2 p-4 cursor-pointer hover:border-light-4"
          onClick={() => setPicker("observations")}
          title="Click to pick observations"
        >
          <div className="mb-2 text-sm font-semibold text-light-3">Observations / Client response</div>
          {obsLabels.length ? (
            <div className="flex flex-wrap gap-2">
              {obsLabels.map((l) => (
                <span key={l} className="rounded-full bg-dark-3 px-3 py-1 text-sm">
                  {l}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-light-4">Click to select observations</div>
          )}
        </section>

        {/* Plan */}
        <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
          <div className="mb-2 text-sm font-semibold text-light-3">Plan</div>
          <textarea
            value={plans}
            onChange={(e) => setPlans(e.target.value)}
            className="w-full rounded-xl border border-dark-4 bg-dark-1 p-3 text-sm outline-none"
            rows={4}
            placeholder="Writer will continue to support the client in…"
          />
        </section>

        {/* Next session date */}
        <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
          <div className="mb-2 text-sm font-semibold text-light-3">Next session date</div>
          <input
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            className="rounded-xl border border-dark-4 bg-dark-1 p-2 text-sm outline-none"
          />
        </section>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-dark-1 hover:bg-light-1"
          >
            Copy formatted to clipboard
          </button>

          <button
            onClick={() => setShowPreview((v) => !v)}
            className="rounded-xl border border-light-3 px-4 py-2 text-sm hover:bg-dark-2"
          >
            {showPreview ? "Hide" : "Show"} copyable preview
          </button>

          <button
            onClick={handlePrint}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-dark-1 hover:bg-light-1"
          >
            Print / Save PDF
          </button>
        </div>

        {/* Copyable preview (uses same HTML as clipboard) */}
        {showPreview && (
          <div className="rounded-2xl bg-white p-6 text-black shadow-sm">
            <div dangerouslySetInnerHTML={{ __html: buildNoteHTML(noteData) }} />
            <div className="mt-3 text-xs text-gray-600">
              Tip: Select all (Ctrl/⌘+A) then copy — formatting is preserved in Word.
            </div>
          </div>
        )}
      </div>

      {/* PRINT-ONLY AREA (renders the formatted note) */}
      <PrintableNote data={noteData} />

      {/* Full-screen pickers (modal overlays) */}
      {picker === "interventions" && (
        <FullScreenPicker
          title="Pick interventions"
          options={INTERVENTIONS}
          selected={interventionsIds}
          storageKey="interventions" // ← important for custom option persistence
          onClose={() => setPicker(null)}
          onSave={(ids) => {
            setInterventions(ids);
            setPicker(null);
          }}
        />
      )}

      {picker === "observations" && (
        <FullScreenPicker
          title="Pick observations"
          options={OBSERVATIONS}
          selected={observationsIds}
          storageKey="observations" // ← important for custom option persistence
          onClose={() => setPicker(null)}
          onSave={(ids) => {
            setObservations(ids);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}
