import { STORAGE_KEYS } from "../../dataDictionary";
import type { PromptLibrary, PromptItem } from "../../dataDictionary";
import { DEFAULT_INTERVENTIONS, DEFAULT_OBSERVATIONS } from "../data/defaultPrompts";
import type { DefaultPrompt } from "../data/defaultPrompts";

function seedSection(
    defaults: DefaultPrompt[],
    existingItems: PromptItem[] = []
): PromptItem[] {
    const now = Date.now();
    const existingMap = new Map(existingItems.map(item => [item.id, item]));

    const merged: PromptItem[] = [];

    // 1. Add/Update defaults
    defaults.forEach((def, index) => {
        const existing = existingMap.get(def.id);
        if (existing) {
            merged.push({ ...existing });
            existingMap.delete(def.id);
        } else {
            merged.push({
                id: def.id,
                label: def.label,
                group: def.group,
                description: def.description,
                createdAt: now,
                updatedAt: now,
                isCustom: false,
                sortOrder: index,
            });
        }
    });

    // 2. Add remaining custom items
    const customItems = Array.from(existingMap.values()).filter(i => i.isCustom);
    customItems.sort((a, b) => a.sortOrder - b.sortOrder);

    let nextSortOrder = defaults.length;
    customItems.forEach(item => {
        merged.push({
            ...item,
            sortOrder: nextSortOrder++,
        });
    });

    return merged;
}

export function loadPromptLibrary(): PromptLibrary {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.promptLibrary);
        if (raw) {
            const parsed = JSON.parse(raw) as PromptLibrary;
            if (parsed && parsed.version === 1) {
                // Ensure default sections exist and are seeded properly
                const finalSections = { ...parsed.sections };

                if (!finalSections.interventions) {
                    finalSections.interventions = { section: "interventions", items: [] };
                }
                finalSections.interventions.items = seedSection(DEFAULT_INTERVENTIONS, finalSections.interventions.items);

                if (!finalSections.observations) {
                    finalSections.observations = { section: "observations", items: [] };
                }
                finalSections.observations.items = seedSection(DEFAULT_OBSERVATIONS, finalSections.observations.items);

                const finalLibrary: PromptLibrary = {
                    version: 1,
                    sections: finalSections
                };
                savePromptLibrary(finalLibrary);
                return finalLibrary;
            }
        }
    } catch (e) {
        console.error("Failed to load prompt library", e);
    }

    // Seed on first run or on error
    const initialLibrary: PromptLibrary = {
        version: 1,
        sections: {
            interventions: {
                section: "interventions",
                items: seedSection(DEFAULT_INTERVENTIONS, []),
            },
            observations: {
                section: "observations",
                items: seedSection(DEFAULT_OBSERVATIONS, []),
            }
        }
    };
    savePromptLibrary(initialLibrary);
    return initialLibrary;
}

export function savePromptLibrary(library: PromptLibrary) {
    try {
        localStorage.setItem(STORAGE_KEYS.promptLibrary, JSON.stringify(library));
    } catch (e) {
        console.error("Failed to save prompt library", e);
    }
}
