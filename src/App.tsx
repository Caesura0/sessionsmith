import { useState, useEffect } from "react";
import { FullScreenPicker } from "./components/FullScreenPicker";
import { usePromptLibrary } from "./hooks/usePromptLibrary";
import { useNoteDraft } from "./hooks/useNoteDraft";
import { resolveSelectedLabels } from "./utils/resolveSelections";
import { InlineSessionLine } from "./components/InlineSessionLine";
import { PrintableNote, type NoteData } from "./components/PrintableNote";
import { copyNoteToClipboard } from "./utils/clipboard";
import { buildNoteHTML } from "./utils/noteFormat"; // for preview
import { exportPromptLibrary, importPromptLibrary } from "./utils/promptLibraryBackup";

export default function App() {
  const { library, updateItem, reloadFromStorage } = usePromptLibrary();
  const {
    note,
    setFreeText,
    setMeta,
    toggleSelection,
    setSelection,
    moveSelection,
    cleanDeletedSelections
  } = useNoteDraft();

  // Cleanup dangling selections on mount or library change
  useEffect(() => {
    const interventionIds = library.sections.interventions?.items.map(i => i.id) || [];
    const observationIds = library.sections.observations?.items.map(i => i.id) || [];
    cleanDeletedSelections("interventions", interventionIds);
    cleanDeletedSelections("observations", observationIds);
  }, [library, cleanDeletedSelections]);

  const [picker, setPicker] = useState<null | "interventions" | "observations">(null);
  const [showPreview, setShowPreview] = useState(false);

  // Destructure for easy access
  const { mode, durationMinutes, nextSessionISO } = note.meta;
  const { clientUpdate, themes, plan } = note.freeText;
  const interventionsIds = note.selections.interventions || [];
  const observationsIds = note.selections.observations || [];

  // Build resolved arrays
  const interventionsLabels = resolveSelectedLabels("interventions", interventionsIds, library);
  const observationsLabels = resolveSelectedLabels("observations", observationsIds, library);

  const noteData: NoteData = {
    mode,
    durationMinutes,
    clientUpdate,
    themes,
    interventions: interventionsLabels,
    observations: observationsLabels,
    plan,
    nextSessionISO,
  };

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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>, mode: "merge" | "replace") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mode === "replace") {
      if (!window.confirm("WARNING: This will overwrite your entire prompt library. Proceed?")) {
        e.target.value = '';
        return;
      }
    }

    try {
      const summary = await importPromptLibrary(file, mode);
      reloadFromStorage();
      alert(`Import successful (${summary.mode})!\n\nInterventions: +${summary.interventions.added}, ~${summary.interventions.updated}, =${summary.interventions.kept}\nObservations: +${summary.observations.added}, ~${summary.observations.updated}, =${summary.observations.kept}`);
    } catch (err: any) {
      alert(err.message || "Failed to import prompts.");
    } finally {
      e.target.value = ''; // reset input
    }
  };

  function renderChips(section: "interventions" | "observations") {
    const ids = section === "interventions" ? interventionsIds : observationsIds;
    if (ids.length === 0) {
      return <div className="text-light-4 mt-2 font-normal">Click to select {section}</div>;
    }

    return (
      <div className="flex flex-col gap-2 mt-2 w-full font-normal">
        {ids.map((id, index) => {
          const label = resolveSelectedLabels(section, [id], library)[0] || `[Unknown: ${id}]`;
          return (
            <div key={id} className="group relative flex items-center justify-between rounded-xl bg-dark-3 px-3 py-2 text-sm w-full transition hover:bg-dark-4">
              <span className="flex-1 pr-4">{label}</span>
              <div className="hidden group-hover:flex items-center gap-1 opacity-80 pl-2 border-l border-white/10">
                <button
                  onClick={(e) => { e.stopPropagation(); moveSelection(section, index, "up"); }}
                  className="p-1 hover:text-white hover:bg-black/20 rounded h-7 w-7 flex items-center justify-center cursor-pointer" title="Move up"
                >↑</button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveSelection(section, index, "down"); }}
                  className="p-1 hover:text-white hover:bg-black/20 rounded h-7 w-7 flex items-center justify-center cursor-pointer" title="Move down"
                >↓</button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newLabel = window.prompt("Edit label:", label);
                    if (newLabel && newLabel.trim()) updateItem(section, id, { label: newLabel.trim() });
                  }}
                  className="p-1 hover:text-white hover:bg-black/20 rounded h-7 w-7 flex items-center justify-center cursor-pointer" title="Edit text"
                >✎</button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelection(section, id); }}
                  className="p-1 hover:text-red-400 hover:bg-black/20 rounded h-7 w-7 flex items-center justify-center text-red-500 cursor-pointer" title="Remove"
                >✕</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-1 text-white font-inter p-6 space-y-6 text-left">
      <h1 className="text-3xl font-bold">Note Taking App</h1>

      <div className="print:hidden space-y-6">
        <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
          <InlineSessionLine
            mode={mode}
            duration={durationMinutes}
            onModeChange={(m) => setMeta({ mode: m })}
            onDurationChange={(d) => setMeta({ durationMinutes: d })}
          />
        </section>

        <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
          <div className="mb-2 text-sm font-semibold text-light-3">Client update</div>
          <textarea
            value={clientUpdate}
            onChange={(e) => setFreeText("clientUpdate", e.target.value)}
            className="w-full rounded-xl border border-dark-4 bg-dark-1 p-3 text-sm outline-none resize-y"
            rows={4}
            placeholder="Type the update…"
          />
        </section>

        <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
          <div className="mb-2 text-sm font-semibold text-light-3">Significant themes</div>
          <textarea
            value={themes}
            onChange={(e) => setFreeText("themes", e.target.value)}
            className="w-full rounded-xl border border-dark-4 bg-dark-1 p-3 text-sm outline-none resize-y"
            rows={4}
            placeholder="Type the themes…"
          />
        </section>

        <section
          className="rounded-2xl border border-dark-3 bg-dark-2 p-4 cursor-pointer hover:border-light-4 transition-colors"
          onClick={() => setPicker("interventions")}
          title="Click to pick interventions"
        >
          <div className="text-sm font-semibold text-light-3">Interventions included</div>
          {renderChips("interventions")}
        </section>

        <section
          className="rounded-2xl border border-dark-3 bg-dark-2 p-4 cursor-pointer hover:border-light-4 transition-colors"
          onClick={() => setPicker("observations")}
          title="Click to pick observations"
        >
          <div className="text-sm font-semibold text-light-3">Observations / Client response</div>
          {renderChips("observations")}
        </section>

        <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
          <div className="mb-2 text-sm font-semibold text-light-3">Plan</div>
          <textarea
            value={plan}
            onChange={(e) => setFreeText("plan", e.target.value)}
            className="w-full rounded-xl border border-dark-4 bg-dark-1 p-3 text-sm outline-none resize-y"
            rows={4}
            placeholder="Writer will continue to support the client in…"
          />
        </section>

        <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4">
          <div className="mb-2 text-sm font-semibold text-light-3">Next session date</div>
          <input
            type="date"
            value={nextSessionISO || ""}
            onChange={(e) => setMeta({ nextSessionISO: e.target.value })}
            className="rounded-xl border border-dark-4 bg-dark-1 p-2 text-sm outline-none cursor-pointer"
          />
        </section>

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

        {showPreview && (
          <div className="rounded-2xl bg-white p-6 text-black shadow-sm text-left">
            <div dangerouslySetInnerHTML={{ __html: buildNoteHTML(noteData) }} />
            <div className="mt-3 text-xs text-gray-600">
              Tip: Select all (Ctrl/⌘+A) then copy — formatting is preserved in Word.
            </div>
          </div>
        )}

        {/* Prompt Library Backup UI */}
        <section className="rounded-2xl border border-dark-3 bg-dark-2 p-4 mt-8">
          <div className="mb-4 text-sm font-semibold text-light-3">Prompts Backup & Transfer</div>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={exportPromptLibrary}
              className="rounded-xl border border-light-3 px-4 py-2 text-sm hover:bg-dark-3 transition-colors"
            >
              Export Prompts (JSON)
            </button>
            <div className="h-4 w-px bg-dark-4 mx-2 hidden sm:block"></div>

            <label className="rounded-xl border border-blue-500/50 text-blue-300 px-4 py-2 text-sm hover:bg-blue-500/10 transition-colors cursor-pointer">
              Import Prompts (Merge)
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => handleImport(e, "merge")}
              />
            </label>

            <label className="rounded-xl border border-red-500/50 text-red-300 px-4 py-2 text-sm hover:bg-red-500/10 transition-colors cursor-pointer">
              Import Prompts (Replace)
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => handleImport(e, "replace")}
              />
            </label>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Exported backups contain your prompt configuration only. No patient data is included.
          </div>
        </section>
      </div>

      <PrintableNote data={noteData} />

      {picker === "interventions" && (
        <FullScreenPicker
          title="Pick interventions"
          section="interventions"
          selected={interventionsIds}
          onClose={() => setPicker(null)}
          onSave={(ids) => {
            setSelection("interventions", ids);
            setPicker(null);
          }}
        />
      )}

      {picker === "observations" && (
        <FullScreenPicker
          title="Pick observations"
          section="observations"
          selected={observationsIds}
          onClose={() => setPicker(null)}
          onSave={(ids) => {
            setSelection("observations", ids);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}
