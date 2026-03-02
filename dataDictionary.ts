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
 * - This dictionary intentionally separates:
 *   1) Prompt Library (reusable prompt options)
 *   2) Note Draft (a working note using prompt selections + free text)
 */

/* ============================================================================
 * 1) Section Keys
 * ----------------------------------------------------------------------------
 * A “section” represents a part of the clinical note / UI that may have prompts
 * and/or free-text input.
 *
 * Convention:
 * - Use lowercase, kebab-free identifiers for stability.
 * - Do not rename existing keys; add new keys when expanding.
 * ========================================================================== */

export const SECTION_KEYS = [
    "interventions",
    "observations",
    "clientUpdate",
    "themes",
    "plan",
    "meta",
] as const;

/** Canonical section identifiers used everywhere in the app */
export type SectionKey = (typeof SECTION_KEYS)[number];

/**
 * Prompt-capable sections:
 * - These sections have a selectable list of prompt options (PromptItems).
 */
export type PromptSectionKey = "interventions" | "observations";

/**
 * Free-text sections:
 * - These sections are simple text fields rather than prompt lists.
 */
export type FreeTextSectionKey = "clientUpdate" | "themes" | "plan";

/* ============================================================================
 * 2) Prompt Library Types
 * ----------------------------------------------------------------------------
 * Prompt Library stores reusable “prompt options” for each prompt-capable section.
 * These are the items shown in the FullScreenPicker.
 *
 * - Items can be built-in defaults or user-created.
 * - Items can be edited and reordered.
 * - Items are persisted locally.
 * ========================================================================== */

/**
 * PromptItem
 * ----------
 * A single selectable option in a picker list (e.g., one intervention statement).
 *
 * Field meanings:
 * - id:
 *   - Stable unique identifier.
 *   - Generated via slugify(label) with collision suffixes (-2, -3...).
 *   - Must NOT change after creation (even if label is edited).
 * - label:
 *   - Human-readable text shown in UI and used in output (copy/print).
 * - group:
 *   - Optional category label (e.g., "CBT", "ACT", "Affect", "Therapist Response").
 *   - Used for grouping in the picker UI.
 * - description:
 *   - Optional supporting text (rare; can be omitted).
 * - createdAt / updatedAt:
 *   - Epoch milliseconds for sorting, history, and future audit needs.
 * - isCustom:
 *   - True if created by user at runtime.
 *   - False if seeded from app defaults.
 * - sortOrder:
 *   - Numeric ordering key for list display in a section (and/or within group).
 *   - Lower numbers appear first.
 */
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

/**
 * PromptSectionLibrary
 * --------------------
 * Stores PromptItems for a single prompt-capable section.
 */
export type PromptSectionLibrary = {
    section: PromptSectionKey;
    items: PromptItem[];
};

/**
 * PromptLibrary
 * -------------
 * The complete prompt library across all sections.
 *
 * version:
 * - Used for migrations if schema changes.
 */
export type PromptLibrary = {
    version: 1;
    sections: Record<PromptSectionKey, PromptSectionLibrary>;
};

/* ============================================================================
 * 3) Note Draft Types
 * ----------------------------------------------------------------------------
 * Note Draft is the user’s current working note.
 * It stores:
 * - selected prompt IDs (ordered)
 * - free text fields
 * - session metadata (mode, duration, next date)
 * ========================================================================== */

/**
 * SessionMode
 * ----------
 * Matches the dropdown options used in the session line.
 */
export type SessionMode = "telephone" | "virtual" | "in-person";

/**
 * NoteSelections
 * --------------
 * Ordered selected IDs for prompt sections.
 * Order must be preserved for output formatting.
 */
export type NoteSelections = Record<PromptSectionKey, string[]>;

/**
 * NoteFreeText
 * ------------
 * Free-text inputs.
 */
export type NoteFreeText = Record<FreeTextSectionKey, string>;

/**
 * NoteMeta
 * --------
 * Session metadata used in the header sentence and booking line.
 */
export type NoteMeta = {
    mode: SessionMode;
    durationMinutes: 30 | 60 | 90;
    nextSessionISO: string; // yyyy-mm-dd from <input type="date"> (may be "" if unset)
};

/**
 * NoteDraft
 * ---------
 * The user’s current note state (local-only).
 * This can be persisted for autosave/restore.
 */
export type NoteDraft = {
    version: 1;

    selections: NoteSelections;
    freeText: NoteFreeText;
    meta: NoteMeta;

    updatedAt: number; // epoch ms for autosave freshness
};

/* ============================================================================
 * 4) Storage Keys (localStorage)
 * ----------------------------------------------------------------------------
 * Keep these stable; they are your local persistence contract.
 * ========================================================================== */

/**
 * Storage keys used by the application.
 * If you ever change these, you must implement a migration.
 */
export const STORAGE_KEYS = {
    promptLibrary: "promptLibrary:v1",
    noteDraft: "noteDraft:v1",
} as const;

/* ============================================================================
 * 5) Output Dictionary (Copy/Print)
 * ----------------------------------------------------------------------------
 * Output generation should resolve selections to labels by looking up PromptItems
 * in PromptLibrary (NOT hardcoded arrays), preserving selection order.
 * ========================================================================== */

/**
 * ResolvedNoteData
 * ----------------
 * This is the fully “resolved” output-ready data:
 * - prompt selections are labels (strings), not IDs
 * - free text + meta included
 *
 * This is the shape consumed by:
 * - clipboard formatting (HTML + plain text)
 * - print formatting
 */
export type ResolvedNoteData = {
    mode: SessionMode;
    durationMinutes: 30 | 60 | 90;

    clientUpdate: string;
    themes: string;

    interventions: string[]; // resolved labels in user-defined order
    observations: string[];  // resolved labels in user-defined order

    plan: string;
    nextSessionISO: string;
};

/* ============================================================================
 * 6) Invariants (Rules we rely on)
 * ----------------------------------------------------------------------------
 * These should be treated as “must not break” assumptions.
 * ========================================================================== */

export const INVARIANTS = {
    /**
     * PromptItem IDs are stable and never change, even if label changes.
     */
    idsAreStable: true,

    /**
     * Selection order matters and must be preserved in UI and output.
     */
    selectionOrderMatters: true,

    /**
     * Prompt library list order is controlled by sortOrder.
     */
    sortOrderControlsList: true,

    /**
     * Local storage is best-effort; app must work if persistence fails.
     */
    localStorageBestEffort: true,
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
            clientUpdate: "",
            themes: "",
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