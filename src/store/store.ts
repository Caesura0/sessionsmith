import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import * as idb from 'idb-keyval';
import type { 
    NoteDraft, NoteTemplate, PromptLibrary, 
    FreeTextSectionKey, NoteMeta, PromptSectionKey, 
    TemplateField, PromptItem 
} from '../dataDictionary';
import { createEmptyNoteDraft } from '../dataDictionary';
import { DEFAULT_INTERVENTIONS, DEFAULT_OBSERVATIONS, DEFAULT_MODES, DEFAULT_DURATIONS } from "../data/defaultPrompts";
import type { DefaultPrompt } from "../data/defaultPrompts";

// --- IDB Storage Engine for Zustand ---
const idbStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await idb.get(name)) || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await idb.set(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await idb.del(name);
    },
};

// --- Defaults and Seed Logic ---
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

function seedSection(defaults: DefaultPrompt[], existingItems: PromptItem[] = []): PromptItem[] {
    const now = Date.now();
    const existingMap = new Map(existingItems.map(item => [item.id, item]));
    const merged: PromptItem[] = [];

    defaults.forEach((def, index) => {
        const existing = existingMap.get(def.id);
        if (existing) {
            merged.push({ ...existing });
            existingMap.delete(def.id);
        } else {
            merged.push({
                id: def.id, label: def.label, group: def.group, description: def.description,
                createdAt: now, updatedAt: now, isCustom: false, sortOrder: index,
            });
        }
    });

    const customItems = Array.from(existingMap.values()).filter(i => i.isCustom);
    customItems.sort((a, b) => a.sortOrder - b.sortOrder);
    let nextSortOrder = defaults.length;
    customItems.forEach(item => {
        merged.push({ ...item, sortOrder: nextSortOrder++ });
    });

    return merged;
}

const INITIAL_LIBRARY: PromptLibrary = {
    version: 1,
    sections: {
        interventions: { section: "interventions", items: seedSection(DEFAULT_INTERVENTIONS, []) },
        observations: { section: "observations", items: seedSection(DEFAULT_OBSERVATIONS, []) },
        sessionMode: { section: "sessionMode", items: seedSection(DEFAULT_MODES, []) },
        sessionDuration: { section: "sessionDuration", items: seedSection(DEFAULT_DURATIONS, []) }
    }
};

function slugify(label: string) {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// --- Store Definition ---
export interface AppState {
    draft: NoteDraft;
    library: PromptLibrary;
    template: NoteTemplate;
    _hasHydrated: boolean;
    
    // Actions
    setHasHydrated: (state: boolean) => void;
    setAllData: (draft: NoteDraft, library: PromptLibrary, template: NoteTemplate) => void;
    resetAllData: () => void;

    // Draft Actions
    setDraftFreeText: (key: FreeTextSectionKey, value: string) => void;
    setDraftMeta: (patch: Partial<NoteMeta>) => void;
    toggleDraftSelection: (section: PromptSectionKey, id: string) => void;
    setDraftSelection: (section: PromptSectionKey, ids: string[]) => void;
    moveDraftSelection: (section: PromptSectionKey, index: number, direction: "up" | "down") => void;
    reorderDraftSelection: (section: PromptSectionKey, newOrderIds: string[]) => void;
    cleanDeletedDraftSelections: (section: PromptSectionKey, availableIds: string[]) => void;
    setDraft: (draft: NoteDraft) => void;

    // Template Actions
    addTemplateField: (label: string, type: "freetext" | "prompt-list") => void;
    updateTemplateFieldLabel: (id: string, newLabel: string) => void;
    removeTemplateField: (id: string) => void;
    reorderTemplateFields: (newOrderIds: string[]) => void;
    toggleTemplateFieldVisibility: (id: string) => void;
    setTemplate: (template: NoteTemplate) => void;

    // Library Actions
    addLibraryItem: (section: PromptSectionKey, label: string, group?: string) => string;
    updateLibraryItemsGroup: (section: PromptSectionKey, ids: string[], groupName: string) => void;
    updateLibraryItem: (section: PromptSectionKey, id: string, patch: { label?: string, group?: string }) => void;
    deleteLibraryItem: (section: PromptSectionKey, id: string) => void;
    moveLibraryItem: (section: PromptSectionKey, id: string, direction: "up" | "down", withinGroup?: boolean) => void;
    reorderLibraryGroupItems: (section: PromptSectionKey, orderedGroupIds: string[]) => void;
    setLibrary: (library: PromptLibrary) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            draft: createEmptyNoteDraft(),
            library: INITIAL_LIBRARY,
            template: DEFAULT_TEMPLATE,
            _hasHydrated: false,

            setHasHydrated: (state) => set({ _hasHydrated: state }),
            setAllData: (draft, library, template) => set({ draft, library, template }),
            resetAllData: () => set({ draft: createEmptyNoteDraft(), library: INITIAL_LIBRARY, template: DEFAULT_TEMPLATE }),

            // --- Draft Actions ---
            setDraftFreeText: (key, value) => set((state) => ({
                draft: { ...state.draft, freeText: { ...state.draft.freeText, [key]: value }, updatedAt: Date.now() }
            })),
            setDraftMeta: (patch) => set((state) => ({
                draft: { ...state.draft, meta: { ...state.draft.meta, ...patch }, updatedAt: Date.now() }
            })),
            toggleDraftSelection: (section, id) => set((state) => {
                const current = state.draft.selections[section] || [];
                const newSelections = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
                return { draft: { ...state.draft, selections: { ...state.draft.selections, [section]: newSelections }, updatedAt: Date.now() } };
            }),
            setDraftSelection: (section, ids) => set((state) => ({
                draft: { ...state.draft, selections: { ...state.draft.selections, [section]: ids }, updatedAt: Date.now() }
            })),
            moveDraftSelection: (section, index, direction) => set((state) => {
                const current = [...(state.draft.selections[section] || [])];
                if (direction === "up" && index > 0) {
                    [current[index - 1], current[index]] = [current[index], current[index - 1]];
                } else if (direction === "down" && index < current.length - 1) {
                    [current[index + 1], current[index]] = [current[index], current[index + 1]];
                } else {
                    return state;
                }
                return { draft: { ...state.draft, selections: { ...state.draft.selections, [section]: current }, updatedAt: Date.now() } };
            }),
            reorderDraftSelection: (section, newOrderIds) => set((state) => ({
                draft: { ...state.draft, selections: { ...state.draft.selections, [section]: newOrderIds }, updatedAt: Date.now() }
            })),
            cleanDeletedDraftSelections: (section, availableIds) => set((state) => {
                const current = state.draft.selections[section] || [];
                const cleaned = current.filter(id => availableIds.includes(id));
                if (cleaned.length !== current.length) {
                    return { draft: { ...state.draft, selections: { ...state.draft.selections, [section]: cleaned }, updatedAt: Date.now() } };
                }
                return state;
            }),
            setDraft: (draft) => set({ draft }),

            // --- Template Actions ---
            addTemplateField: (label, type) => set((state) => {
                const baseId = slugify(label) || "field";
                let id = baseId;
                let n = 2;
                const existingIds = new Set(state.template.fields.map(f => f.id));
                while (existingIds.has(id)) { id = `${baseId}-${n++}`; }
                return { template: { ...state.template, fields: [...state.template.fields, { id, label, type }] } };
            }),
            updateTemplateFieldLabel: (id, newLabel) => set((state) => ({
                template: { ...state.template, fields: state.template.fields.map(f => f.id === id ? { ...f, label: newLabel } : f) }
            })),
            removeTemplateField: (id) => set((state) => ({
                template: { ...state.template, fields: state.template.fields.filter(f => f.id !== id) }
            })),
            reorderTemplateFields: (newOrderIds) => set((state) => {
                const fieldMap = new Map(state.template.fields.map(f => [f.id, f]));
                const newFields = newOrderIds.map(id => fieldMap.get(id)).filter(Boolean) as TemplateField[];
                return { template: { ...state.template, fields: newFields } };
            }),
            toggleTemplateFieldVisibility: (id) => set((state) => ({
                template: { ...state.template, fields: state.template.fields.map(f => f.id === id ? { ...f, isHidden: !f.isHidden } : f) }
            })),
            setTemplate: (template) => set({ template }),

            // --- Library Actions ---
            addLibraryItem: (section, label, group) => {
                const baseObj = slugify(label) || "item";
                let generatedId = baseObj;
                set((state) => {
                    const sectionData = state.library.sections[section] || { section, items: [] };
                    const items = sectionData.items || [];
                    let id = baseObj;
                    let n = 2;
                    const existingIds = new Set(items.map(i => i.id));
                    while (existingIds.has(id)) { id = `${baseObj}-${n++}`; }
                    generatedId = id;
                    const maxSortOrder = items.length > 0 ? Math.max(...items.map(i => i.sortOrder)) : 0;
                    const now = Date.now();
                    return {
                        library: {
                            ...state.library,
                            sections: {
                                ...state.library.sections,
                                [section]: { section, items: [...items, { id, label, group, createdAt: now, updatedAt: now, isCustom: true, sortOrder: maxSortOrder + 1 }] }
                            }
                        }
                    };
                });
                return generatedId;
            },
            updateLibraryItemsGroup: (section, ids, groupName) => set((state) => {
                const items = state.library.sections[section]?.items || [];
                const now = Date.now();
                const idSet = new Set(ids);
                const newItems = items.map(item => idSet.has(item.id) ? { ...item, group: groupName, updatedAt: now } : item);
                return { library: { ...state.library, sections: { ...state.library.sections, [section]: { section, items: newItems } } } };
            }),
            updateLibraryItem: (section, id, patch) => set((state) => {
                const items = state.library.sections[section]?.items || [];
                const now = Date.now();
                const newItems = items.map(item => item.id === id ? { ...item, ...patch, updatedAt: now } : item);
                return { library: { ...state.library, sections: { ...state.library.sections, [section]: { section, items: newItems } } } };
            }),
            deleteLibraryItem: (section, id) => set((state) => {
                const items = state.library.sections[section]?.items || [];
                const itemToDelete = items.find(i => i.id === id);
                if (itemToDelete && !itemToDelete.isCustom) return state;
                const newItems = items.filter(i => i.id !== id);
                return { library: { ...state.library, sections: { ...state.library.sections, [section]: { section, items: newItems } } } };
            }),
            moveLibraryItem: (section, id, direction, withinGroup) => set((state) => {
                const items = [...(state.library.sections[section]?.items || [])];
                items.sort((a, b) => a.sortOrder - b.sortOrder);
                const idx = items.findIndex(i => i.id === id);
                if (idx === -1) return state;
                const item = items[idx];
                let targetIdx = -1;
                if (withinGroup) {
                    if (direction === "up") {
                        for (let i = idx - 1; i >= 0; i--) { if (items[i].group === item.group) { targetIdx = i; break; } }
                    } else {
                        for (let i = idx + 1; i < items.length; i++) { if (items[i].group === item.group) { targetIdx = i; break; } }
                    }
                } else {
                    targetIdx = direction === "up" ? idx - 1 : idx + 1;
                }
                if (targetIdx < 0 || targetIdx >= items.length) return state;
                [items[idx], items[targetIdx]] = [items[targetIdx], items[idx]];
                items.forEach((it, index) => { it.sortOrder = index; });
                return { library: { ...state.library, sections: { ...state.library.sections, [section]: { section, items } } } };
            }),
            reorderLibraryGroupItems: (section, orderedGroupIds) => set((state) => {
                const items = [...(state.library.sections[section]?.items || [])];
                items.sort((a, b) => a.sortOrder - b.sortOrder);
                const indices: number[] = [];
                const groupItems: PromptItem[] = [];
                items.forEach((item, idx) => {
                    if (orderedGroupIds.includes(item.id)) { indices.push(idx); groupItems.push(item); }
                });
                const itemMap = new Map(groupItems.map(i => [i.id, i]));
                for (let i = 0; i < indices.length; i++) { items[indices[i]] = itemMap.get(orderedGroupIds[i])!; }
                items.forEach((it, index) => { it.sortOrder = index; });
                return { library: { ...state.library, sections: { ...state.library.sections, [section]: { section, items } } } };
            }),
            setLibrary: (library) => set({ library }),
        }),
        {
            name: 'notesmith-storage',
            storage: createJSONStorage(() => idbStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHasHydrated(true);
                    
                    // Run seeding logic upon hydration to ensure defaults are present
                    const finalSections = { ...state.library.sections };
                    finalSections.interventions = { section: "interventions", items: seedSection(DEFAULT_INTERVENTIONS, finalSections.interventions?.items || []) };
                    finalSections.observations = { section: "observations", items: seedSection(DEFAULT_OBSERVATIONS, finalSections.observations?.items || []) };
                    finalSections.sessionMode = { section: "sessionMode", items: seedSection(DEFAULT_MODES, finalSections.sessionMode?.items || []) };
                    finalSections.sessionDuration = { section: "sessionDuration", items: seedSection(DEFAULT_DURATIONS, finalSections.sessionDuration?.items || []) };
                    
                    state.setLibrary({ ...state.library, sections: finalSections });
                }
            }
        }
    )
);
