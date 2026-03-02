import type { NoteTemplate } from "../../dataDictionary";
import { STORAGE_KEYS } from "../../dataDictionary";

const DEFAULT_TEMPLATE: NoteTemplate = {
    version: 1,
    fields: [
        { id: "clientUpdate", type: "freetext", label: "Client Update" },
        { id: "interventions", type: "prompt-list", label: "Interventions" },
        { id: "observations", type: "prompt-list", label: "Observations" },
        { id: "themes", type: "freetext", label: "Themes" },
        { id: "plan", type: "freetext", label: "Plan" },
    ]
};

export function loadNoteTemplate(): NoteTemplate {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.noteTemplate);
        if (stored) {
            const parsed = JSON.parse(stored) as NoteTemplate;
            // Basic validity check
            if (parsed && typeof parsed === "object" && Array.isArray(parsed.fields)) {
                return parsed;
            }
        }
    } catch (err) {
        console.warn("Failed to parse NoteTemplate from localStorage.", err);
    }
    return DEFAULT_TEMPLATE;
}

export function saveNoteTemplate(template: NoteTemplate): void {
    try {
        localStorage.setItem(STORAGE_KEYS.noteTemplate, JSON.stringify(template));
    } catch (err) {
        console.warn("Failed to save NoteTemplate to localStorage.", err);
    }
}
