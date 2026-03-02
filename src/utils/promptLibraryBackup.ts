import { STORAGE_KEYS } from "../../dataDictionary";
import type { PromptLibrary, PromptItem } from "../../dataDictionary";

export function exportPromptLibrary(): void {
    const data = localStorage.getItem(STORAGE_KEYS.promptLibrary);
    if (!data) {
        throw new Error("No prompt library found in local storage.");
    }

    // Validate it parses and looks like a library
    let library: any;
    try {
        library = JSON.parse(data);
    } catch (e) {
        throw new Error("Local storage contains invalid JSON.");
    }

    if (library?.version !== 1 || !library?.sections) {
        throw new Error("Local storage does not contain a valid PromptLibrary v1.");
    }

    // Generate date string for filename
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const filename = `prompt-library-${yyyy}-${mm}-${dd}.json`;

    // Trigger download
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function isValidLibrary(data: any): data is PromptLibrary {
    if (!data || data.version !== 1 || !data.sections) return false;

    // Basic structural check of interventions/observations
    const { interventions, observations } = data.sections;
    if (!interventions || !observations) return false;
    if (interventions.section !== "interventions" || observations.section !== "observations") return false;
    if (!Array.isArray(interventions.items) || !Array.isArray(observations.items)) return false;

    const isValidItem = (item: any) => {
        return (
            typeof item.id === "string" &&
            typeof item.label === "string" &&
            typeof item.createdAt === "number" &&
            typeof item.updatedAt === "number" &&
            typeof item.isCustom === "boolean" &&
            typeof item.sortOrder === "number"
        );
    };

    if (!interventions.items.every(isValidItem)) return false;
    if (!observations.items.every(isValidItem)) return false;

    return true;
}

function mergeItems(
    existingItems: PromptItem[],
    incomingItems: PromptItem[]
): { merged: PromptItem[]; added: number; updated: number; kept: number } {
    let added = 0;
    let updated = 0;
    let kept = 0;

    const existingMap = new Map(existingItems.map(i => [i.id, i]));
    const mergedMap = new Map<string, PromptItem>();

    // Process incoming
    for (const inc of incomingItems) {
        const ext = existingMap.get(inc.id);
        if (!ext) {
            mergedMap.set(inc.id, inc);
            added++;
        } else {
            if (inc.updatedAt >= ext.updatedAt) {
                mergedMap.set(inc.id, inc);
                updated++;
            } else {
                mergedMap.set(ext.id, ext);
                kept++;
            }
        }
    }

    // Add any existing that weren't in incoming
    for (const ext of existingItems) {
        if (!mergedMap.has(ext.id)) {
            mergedMap.set(ext.id, ext);
            kept++;
        }
    }

    // Convert to array and sort
    const mergedArr = Array.from(mergedMap.values());
    mergedArr.sort((a, b) => {
        const groupA = a.group || "";
        const groupB = b.group || "";
        if (groupA < groupB) return -1;
        if (groupA > groupB) return 1;

        if (a.sortOrder < b.sortOrder) return -1;
        if (a.sortOrder > b.sortOrder) return 1;

        if (a.label < b.label) return -1;
        if (a.label > b.label) return 1;

        return 0;
    });

    // Normalize sortOrder
    mergedArr.forEach((item, index) => {
        item.sortOrder = index;
    });

    return { merged: mergedArr, added, updated, kept };
}

export type ImportSummary = {
    mode: "merge" | "replace";
    interventions: { added: number; updated: number; kept: number; total: number };
    observations: { added: number; updated: number; kept: number; total: number };
};

export async function importPromptLibrary(file: File, mode: "merge" | "replace"): Promise<ImportSummary> {
    const text = await file.text();
    let incoming: any;
    try {
        incoming = JSON.parse(text);
    } catch (e) {
        throw new Error("This file is not a valid JSON document.");
    }

    if (!isValidLibrary(incoming)) {
        throw new Error("This file is not a valid Prompt Library v1 backup.");
    }

    try {
        if (mode === "replace") {
            localStorage.setItem(STORAGE_KEYS.promptLibrary, JSON.stringify(incoming));

            const intCount = incoming.sections.interventions.items.length;
            const obsCount = incoming.sections.observations.items.length;

            return {
                mode: "replace",
                interventions: { added: intCount, updated: 0, kept: 0, total: intCount },
                observations: { added: obsCount, updated: 0, kept: 0, total: obsCount },
            };
        } else {
            // Merge
            const existingData = localStorage.getItem(STORAGE_KEYS.promptLibrary);
            let existing: PromptLibrary | null = null;
            if (existingData) {
                try {
                    const parsed = JSON.parse(existingData);
                    if (isValidLibrary(parsed)) {
                        existing = parsed;
                    }
                } catch (e) {
                    // ignore parsing error for existing, will treat as null
                }
            }

            if (!existing) {
                // Fallback to replace if currently invalid or missing entirely
                localStorage.setItem(STORAGE_KEYS.promptLibrary, JSON.stringify(incoming));
                const intCount = incoming.sections.interventions.items.length;
                const obsCount = incoming.sections.observations.items.length;
                return {
                    mode: "merge",
                    interventions: { added: intCount, updated: 0, kept: 0, total: intCount },
                    observations: { added: obsCount, updated: 0, kept: 0, total: obsCount },
                };
            }

            const intMerge = mergeItems(
                existing.sections.interventions.items,
                incoming.sections.interventions.items
            );

            const obsMerge = mergeItems(
                existing.sections.observations.items,
                incoming.sections.observations.items
            );

            const finalLibrary: PromptLibrary = {
                version: 1,
                sections: {
                    interventions: { section: "interventions", items: intMerge.merged },
                    observations: { section: "observations", items: obsMerge.merged },
                }
            };

            localStorage.setItem(STORAGE_KEYS.promptLibrary, JSON.stringify(finalLibrary));

            return {
                mode: "merge",
                interventions: {
                    added: intMerge.added,
                    updated: intMerge.updated,
                    kept: intMerge.kept,
                    total: intMerge.merged.length
                },
                observations: {
                    added: obsMerge.added,
                    updated: obsMerge.updated,
                    kept: obsMerge.kept,
                    total: obsMerge.merged.length
                }
            };
        }
    } catch (e) {
        throw new Error("Could not save import to this browser. Check storage settings.");
    }
}
