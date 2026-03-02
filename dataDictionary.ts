/**
 * Data Dictionary (Source of Truth)
 * ---------------------------------
 * Purpose:
 * - Define the canonical data structures and storage keys used by the app.
 * - Keep names/fields consistent across UI, storage, export/import, and formatting.
 * - Provide stable type aliases that other modules can import.
 *
 * Notes:
 * - This is a LOCAL-FIRST app (no server). Persistence is via localStorage.
 * - The template system allows users to define custom sections dynamically.
 */

/* ============================================================================
 * 1) Template System
 * ----------------------------------------------------------------------------
 * A `NoteTemplate` defines the sections available in a note.
 * Sections can be "prompt-list" (selectable items) or "freetext".
 * ========================================================================== */

export type TemplateFieldType = "freetext" | "prompt-list";

export type TemplateField = {
    id: string; // e.g., "interventions", "client-update", "homework"
    type: TemplateFieldType;
    label: string; // e.g., "Interventions", "Client Update", "Homework"
    isHidden?: boolean;
};

export type NoteTemplate = {
    version: 1;
    fields: TemplateField[];
};

export type PromptSectionKey = string; // No longer literally just "interventions" | "observations"
export type FreeTextSectionKey = string;

/* ============================================================================
 * 2) Prompt Library Types
 * ----------------------------------------------------------------------------
 * Prompt Library stores reusable “prompt options” for each prompt-capable section.
 * ========================================================================== */

export type PromptItem = {
    id: string;
    label: string;
    group?: string;
    description?: string;

    createdAt: number;
    updatedAt: number;

    isCustom: boolean;
    sortOrder: number;
};

export type PromptSectionLibrary = {
    section: PromptSectionKey;
    items: PromptItem[];
};

export type PromptLibrary = {
    version: 1;
    sections: Record<PromptSectionKey, PromptSectionLibrary>;
};

/* ============================================================================
 * 3) Note Draft Types
 * ----------------------------------------------------------------------------
 * Note Draft is the user’s current working note.
 * ========================================================================== */

export type SessionMode = "telephone" | "virtual" | "in-person";

export type NoteSelections = Record<PromptSectionKey, string[]>;
export type NoteFreeText = Record<FreeTextSectionKey, string>;

export type NoteMeta = {
    mode: SessionMode;
    durationMinutes: 30 | 60 | 90;
    nextSessionISO: string; // yyyy-mm-dd from <input type="date">
};

export type NoteDraft = {
    version: 1;
    selections: NoteSelections;
    freeText: NoteFreeText;
    meta: NoteMeta;
    updatedAt: number;
};

/* ============================================================================
 * 4) Storage Keys (localStorage)
 * ----------------------------------------------------------------------------
 * Keep these stable; they are your local persistence contract.
 * ========================================================================== */

export const STORAGE_KEYS = {
    promptLibrary: "promptLibrary:v1",
    noteDraft: "noteDraft:v1",
    noteTemplate: "noteTemplate:v1",
} as const;

/* ============================================================================
 * 5) Output Dictionary (Copy/Print)
 * ----------------------------------------------------------------------------
 * Output generation should resolve selections to labels by looking up PromptItems.
 * ========================================================================== */

export type ResolvedNoteData = {
    mode: SessionMode;
    durationMinutes: 30 | 60 | 90;
    nextSessionISO: string;

    // Dynamic map of field ID -> content
    // For freetext it's the raw string.
    // For prompt-list it's the resolved array of labels.
    fields: Record<string, string | string[]>;
};

/* ============================================================================
 * 6) Invariants (Rules we rely on)
 * ----------------------------------------------------------------------------
 * These should be treated as “must not break” assumptions.
 * ========================================================================== */

export const INVARIANTS = {
    idsAreStable: true,
    selectionOrderMatters: true,
    sortOrderControlsList: true,
    localStorageBestEffort: true,
    dynamicTemplates: true,
} as const;

/* ============================================================================
 * 7) Default Value Helpers (optional)
 * ----------------------------------------------------------------------------
 * These are convenient starting shapes for new app state.
 * ========================================================================== */

export function createEmptyNoteDraft(): NoteDraft {
    return {
        version: 1,
        selections: {
            interventions: [],
            observations: [],
        },
        freeText: {
            clientUpdate: "Client reports ",
            themes: "Client presented as ",
            plan: "Writer will continue to support the client in ",
        },
        meta: {
            mode: "telephone",
            durationMinutes: 90,
            nextSessionISO: "",
        },
        updatedAt: Date.now(),
    };
}