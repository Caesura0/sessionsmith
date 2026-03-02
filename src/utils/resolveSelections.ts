import type { PromptLibrary, PromptSectionKey } from "../../dataDictionary";

export function resolveSelectedLabels(
    section: PromptSectionKey,
    selectedIds: string[],
    library: PromptLibrary
): string[] {
    const items = library.sections[section]?.items || [];
    const itemMap = new Map(items.map(i => [i.id, i.label]));

    const resolved: string[] = [];

    for (const id of selectedIds) {
        const label = itemMap.get(id);
        if (label) {
            resolved.push(label);
        } else {
            // Missing prompt handling. We just leave it out to prevent crashing the output.
            // @ts-ignore - Vite specific env check
            if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
                resolved.push(`[Missing prompt: ${id}]`);
            }
        }
    }

    return resolved;
}
