import { useState, useEffect, useMemo } from "react";
import { Copy, Eye, EyeOff, Printer, Trash2, Edit3, ArrowUp, ArrowDown } from "lucide-react";
import { FullScreenPicker } from "../components/FullScreenPicker";
import { usePromptLibrary } from "../hooks/usePromptLibrary";
import { useNoteDraft } from "../hooks/useNoteDraft";
import { useNoteTemplate } from "../hooks/useNoteTemplate";
import { resolveSelectedLabels } from "../utils/resolveSelections";
import { InlineSessionLine } from "../components/InlineSessionLine";
import { PrintableNote, type NoteData } from "../components/PrintableNote";
import { copyNoteToClipboard } from "../utils/clipboard";
import { buildNoteHTML } from "../utils/noteFormat"; // for preview

export function Editor() {
    const { template } = useNoteTemplate();
    const { library, updateItem } = usePromptLibrary();
    const {
        note,
        setFreeText,
        setMeta,
        toggleSelection,
        setSelection,
        moveSelection,
        cleanDeletedSelections
    } = useNoteDraft();

    // Cleanup dangling selections on mount or library/template change
    useEffect(() => {
        for (const field of template.fields) {
            if (field.type === "prompt-list" && !field.isHidden) {
                const validIds = library.sections[field.id]?.items.map(i => i.id) || [];
                cleanDeletedSelections(field.id, validIds);
            }
        }
    }, [template, library, cleanDeletedSelections]);

    const [picker, setPicker] = useState<null | { id: string; label: string }>(null);
    const [showPreview, setShowPreview] = useState(false);

    const { mode, durationMinutes, nextSessionISO } = note.meta;

    // Resolve note data shape based on dynamic fields
    const noteData: NoteData = useMemo(() => {
        const fieldsData = template.fields
            .filter(field => !field.isHidden)
            .map(field => {
                if (field.type === "prompt-list") {
                    const ids = note.selections[field.id] || [];
                    const labels = resolveSelectedLabels(field.id, ids, library);
                    return { id: field.id, label: field.label, content: labels };
                } else {
                    const text = note.freeText[field.id] || "";
                    return { id: field.id, label: field.label, content: text };
                }
            });

        return {
            mode,
            durationMinutes,
            nextSessionISO,
            fields: fieldsData
        };
    }, [template, note, library, mode, durationMinutes, nextSessionISO]);

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

    function renderChips(sectionId: string, label: string) {
        const ids = note.selections[sectionId] || [];
        if (ids.length === 0) {
            return <div className="text-light-4 mt-2 font-normal text-sm italic">Click anywhere in this box to select {label.toLowerCase()}...</div>;
        }

        return (
            <div className="flex flex-col gap-2 mt-3 w-full font-normal">
                {ids.map((id, index) => {
                    const resolvedLabel = resolveSelectedLabels(sectionId, [id], library)[0] || `[Unknown: ${id}]`;
                    return (
                        <div key={id} className="group relative flex items-center justify-between rounded-xl bg-dark-2 border border-white/5 px-4 py-3 w-full transition-all hover:bg-dark-3 hover:border-white/10 shadow-sm">
                            <span className="flex-1 pr-4 text-sm font-medium">{resolvedLabel}</span>
                            <div className="hidden group-hover:flex items-center gap-1 opacity-80 pl-3 border-l border-white/10">
                                <button
                                    onClick={(e) => { e.stopPropagation(); moveSelection(sectionId, index, "up"); }}
                                    className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Move up"
                                ><ArrowUp className="w-4 h-4" /></button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); moveSelection(sectionId, index, "down"); }}
                                    className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Move down"
                                ><ArrowDown className="w-4 h-4" /></button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newLabel = window.prompt("Edit label:", resolvedLabel);
                                        if (newLabel && newLabel.trim()) updateItem(sectionId, id, { label: newLabel.trim() });
                                    }}
                                    className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Edit text"
                                ><Edit3 className="w-4 h-4" /></button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleSelection(sectionId, id); }}
                                    className="p-1.5 hover:text-red-400 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors cursor-pointer ml-1" title="Remove"
                                ><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl pb-24 text-left mx-auto">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Note Editor</h1>
                    <p className="text-light-4">Draft your session note. Changes are saved locally.</p>
                </div>
                <div className="flex items-center gap-2 print:hidden backdrop-blur-md bg-dark-2/80 rounded-2xl p-1.5 border border-white/5 shadow-lg">
                    <button
                        onClick={handleCopy}
                        className="rounded-xl flex items-center gap-2 bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-accent-blue-hover transition-colors focus:ring-2 focus:ring-accent-blue focus:outline-none"
                    >
                        <Copy className="w-4 h-4" /> Copy
                    </button>
                    <button
                        onClick={() => setShowPreview((v) => !v)}
                        className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-dark-3 transition-colors text-light-3"
                        title="Toggle copyable preview"
                    >
                        {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-dark-3 transition-colors text-light-3"
                        title="Print to PDF"
                    >
                        <Printer className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="print:hidden space-y-6">
                <section className="rounded-2xl border border-dark-3 bg-dark-2 p-5 shadow-sm transition-colors hover:border-dark-4">
                    <InlineSessionLine
                        mode={mode}
                        duration={durationMinutes}
                        onModeChange={(m) => setMeta({ mode: m })}
                        onDurationChange={(d) => setMeta({ durationMinutes: d })}
                    />
                </section>

                {/* Dynamic Fields Mapping */}
                {template.fields.filter(f => !f.isHidden).map(field => {
                    if (field.type === "freetext") {
                        const val = note.freeText[field.id] || "";
                        return (
                            <section key={field.id} className="rounded-2xl border border-dark-3 bg-dark-2 overflow-hidden shadow-sm transition-all focus-within:border-accent-blue/50 focus-within:ring-1 focus-within:ring-accent-blue/50">
                                <div className="px-5 py-3 border-b border-dark-3/50 bg-dark-3/20 flex items-center justify-between">
                                    <span className="text-sm font-medium text-light-3">{field.label}</span>
                                </div>
                                <textarea
                                    value={val}
                                    onChange={(e) => setFreeText(field.id, e.target.value)}
                                    className="w-full bg-transparent p-5 text-sm outline-none resize-y min-h-[120px] text-light-2 placeholder:text-dark-5"
                                    placeholder={`Type the ${field.label.toLowerCase()}…`}
                                />
                            </section>
                        );
                    } else if (field.type === "prompt-list") {
                        const selectedCount = (note.selections[field.id] || []).length;
                        return (
                            <section
                                key={field.id}
                                className="rounded-2xl border border-dark-3 bg-dark-2 shadow-sm transition-all hover:border-accent-blue/40 cursor-pointer overflow-hidden group"
                                onClick={() => setPicker({ id: field.id, label: field.label })}
                            >
                                <div className="px-5 py-3 border-b border-dark-3/50 bg-dark-3/20 flex items-center justify-between group-hover:bg-accent-blue/5 transition-colors">
                                    <span className="text-sm font-medium text-light-3 group-hover:text-accent-blue transition-colors">{field.label}</span>
                                    <span className="text-xs font-medium bg-dark-4 text-light-4 px-2 py-0.5 rounded-full">{selectedCount} selected</span>
                                </div>
                                <div className="p-5">
                                    {renderChips(field.id, field.label)}
                                </div>
                            </section>
                        );
                    }
                    return null;
                })}

                <section className="rounded-2xl border border-dark-3 bg-dark-2 overflow-hidden shadow-sm transition-all focus-within:border-accent-blue/50 focus-within:ring-1 focus-within:ring-accent-blue/50 flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                    <span className="text-sm font-medium text-light-3">Next session date</span>
                    <input
                        type="date"
                        value={nextSessionISO || ""}
                        onChange={(e) => setMeta({ nextSessionISO: e.target.value })}
                        className="rounded-xl border border-dark-4 bg-dark-1 px-4 py-2 text-sm font-medium text-white outline-none cursor-pointer focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
                    />
                </section>

                {showPreview && (
                    <div className="rounded-2xl bg-white p-6 shadow-xl text-left border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="text-black prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: buildNoteHTML(noteData) }} />
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                                Preview Mode
                            </div>
                            <div className="text-xs text-gray-400">
                                Tip: Press Ctrl/⌘+A to select all, then copy.
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <PrintableNote data={noteData} />

            {picker && (
                <FullScreenPicker
                    title={`Pick ${picker.label}`}
                    section={picker.id}
                    selected={note.selections[picker.id] || []}
                    onClose={() => setPicker(null)}
                    onSave={(ids) => {
                        setSelection(picker.id, ids);
                        setPicker(null);
                    }}
                />
            )}
        </div>
    );
}
