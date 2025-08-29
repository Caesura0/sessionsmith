/**
 * App.tsx
 * - The main form users see (client update, themes, interventions, observations, next date)
 * - Clicking “Interventions” or “Observations” opens a full-screen selector
 * - State lives here; the FullScreenPicker is a controlled child
 */

import { useState } from "react";
import { FullScreenPicker } from "./components/FullScreenPicker";
import { INTERVENTIONS, OBSERVATIONS } from "./data/option";
import type { Option } from "./types/options";
import { InlineSessionLine } from "./components/InlineSessionLine";
import { PrintableNote, type NoteData } from "./components/PrintableNote";



// Utility that converts IDs → labels for display
function toLabels(ids: string[], src: Option[]) {
  return ids.map((id) => src.find((o) => o.id === id)?.label).filter(Boolean) as string[];
}

export default function App() {

    const [mode, setMode] = useState<"telephone"|"virtual"|"in-person">("telephone");
    const [duration, setDuration] = useState<30|60|90>(90);
    const [clientUpdate, setClientUpdate] = useState("");
    const [themes, setThemes] = useState("");

    // Multi-select state (IDs)
    const [interventions, setInterventions] = useState<string[]>([]);
    const [observations, setObservations] = useState<string[]>([]);

    //
    const [interventionsIds, setInterventionsIds] = useState<string[]>([]);
    const [observationsIds, setObservationsIds] = useState<string[]>([]);

    // Which picker is open? (null = none)
    const [picker, setPicker] = useState<null | "interventions" | "observations">(null);

    //emotional regulation state
    
    const [plan, setPlan] = useState("emotional regulation");
    // Simple controlled date string (yyyy-mm-dd)
    const [nextDate, setNextDate] = useState("");


  // Build the data object for the print component
  const noteData: NoteData = {
    mode,
    durationMinutes: duration,
    clientUpdate,
    themes,
    interventions: toLabels(interventionsIds, INTERVENTIONS),
    observations: toLabels(observationsIds, OBSERVATIONS),
    plan,
    nextSessionISO: nextDate,
  };

  const handlePrint = () => {
    // Show system dialog -> choose “Save as PDF”
    window.print();
  };


  return (
    <div className="min-h-screen bg-dark-1 text-white font-inter p-6 space-y-6">
      <h1 className="text-3xl font-bold">Note Taking App</h1>


      <div className="print:hidden p-6 space-y-6">

        {/* session info (dropdowns) */}
        <div className=" bg-dark-1 text-white font-inter  space-y-6">
        <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
            <InlineSessionLine />
        </section>
        </div>




      {/* Client update (free text) */}
      <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
        <div className="mb-2 text-sm font-semibold text-light-3">Client update</div>
        <textarea
          className="w-full rounded-xl border border-dark-4 bg-dark-1 p-3 text-sm outline-none"
          rows={4}
          placeholder="Type the update…"
        />
      </section>

      {/* Themes (free text) */}
      <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
        <div className="mb-2 text-sm font-semibold text-light-3">Significant themes</div>
        <textarea
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

        {interventions.length ? (
          <div className="flex flex-wrap gap-2">
            {toLabels(interventions, INTERVENTIONS).map((label) => (
              <span key={label} className="rounded-full bg-dark-3 px-3 py-1 text-sm">
                {label}
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

        {observations.length ? (
          <div className="flex flex-wrap gap-2">
            {toLabels(observations, OBSERVATIONS).map((label) => (
              <span key={label} className="rounded-full bg-dark-3 px-3 py-1 text-sm">
                {label}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-light-4">Click to select observations</div>
        )}
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

      {/* Save (stub) */}
      <div className="pt-2">
        <button
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-dark-1 hover:bg-light-1"
          onClick={() => {
            // TODO: persist to API/localStorage/etc.
            console.log({ interventions, observations, nextDate });
          }}
        >
          Save
        </button>
      </div>

      {/* Full-screen pickers (modal-style overlays) */}
      {picker === "interventions" && (
        <FullScreenPicker
          title="Pick interventions"
          options={INTERVENTIONS}
          selected={interventions}
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
          selected={observations}
          onClose={() => setPicker(null)}
          onSave={(ids) => {
            setObservations(ids);
            setPicker(null);
          }}
        />
      )}

        
        </div>
       



        {/* Your selectors for interventions/observations should set interventionsIds/observationsIds */}
        {/* ... */}

        <div className="pt-2">
          <button
            onClick={handlePrint}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-dark-1 hover:bg-light-1"
          >
            Print / Save PDF
          </button>
        </div>


      {/* PRINT-ONLY AREA (renders the formatted note) */}
      <PrintableNote data={noteData} />
    </div>
  );
}
