import { useState, useCallback, useEffect } from "react";
import type { PromptLibrary, PromptItem, PromptSectionKey } from "../../dataDictionary";
import { loadPromptLibrary, savePromptLibrary } from "../storage/promptLibraryStorage";

function slugify(label: string) {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function usePromptLibrary() {
    const [library, setLibrary] = useState<PromptLibrary>(loadPromptLibrary);

    useEffect(() => {
        savePromptLibrary(library);
    }, [library]);

    const getItems = useCallback((section: PromptSectionKey): PromptItem[] => {
        const items = library.sections[section]?.items || [];
        return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    }, [library]);

    const addItem = useCallback((section: PromptSectionKey, label: string, group?: string) => {
        const baseObj = slugify(label) || "item";
        let generatedId = baseObj;

        setLibrary(prev => {
            const sectionData = prev.sections[section] || { section, items: [] };
            const items = sectionData.items || [];

            let id = baseObj;
            let n = 2;
            const existingIds = new Set(items.map(i => i.id));
            while (existingIds.has(id)) {
                id = `${baseObj}-${n++}`;
            }

            generatedId = id;

            const maxSortOrder = items.length > 0 ? Math.max(...items.map(i => i.sortOrder)) : 0;
            const now = Date.now();

            const newItem: PromptItem = {
                id,
                label,
                group,
                createdAt: now,
                updatedAt: now,
                isCustom: true,
                sortOrder: maxSortOrder + 1,
            };

            return {
                ...prev,
                sections: {
                    ...prev.sections,
                    [section]: {
                        section,
                        items: [...items, newItem]
                    }
                }
            };
        });

        return generatedId;
    }, []);

    const updateItem = useCallback((section: PromptSectionKey, id: string, patch: { label?: string, group?: string }) => {
        setLibrary(prev => {
            const items = prev.sections[section]?.items || [];
            const now = Date.now();
            const newItems = items.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        ...patch,
                        updatedAt: now,
                    };
                }
                return item;
            });
            return {
                ...prev,
                sections: {
                    ...prev.sections,
                    [section]: {
                        section,
                        items: newItems
                    }
                }
            };
        });
    }, []);

    const deleteItem = useCallback((section: PromptSectionKey, id: string) => {
        setLibrary(prev => {
            const items = prev.sections[section]?.items || [];
            const itemToDelete = items.find(i => i.id === id);
            if (itemToDelete && !itemToDelete.isCustom) {
                return prev;
            }

            const newItems = items.filter(i => i.id !== id);
            return {
                ...prev,
                sections: {
                    ...prev.sections,
                    [section]: {
                        section,
                        items: newItems
                    }
                }
            };
        });
    }, []);

    const moveItem = useCallback((section: PromptSectionKey, id: string, direction: "up" | "down", withinGroup?: boolean) => {
        setLibrary(prev => {
            const items = [...(prev.sections[section]?.items || [])];
            items.sort((a, b) => a.sortOrder - b.sortOrder);

            const idx = items.findIndex(i => i.id === id);
            if (idx === -1) return prev;

            const item = items[idx];
            let targetIdx = -1;

            if (withinGroup) {
                if (direction === "up") {
                    for (let i = idx - 1; i >= 0; i--) {
                        if (items[i].group === item.group) {
                            targetIdx = i;
                            break;
                        }
                    }
                } else {
                    for (let i = idx + 1; i < items.length; i++) {
                        if (items[i].group === item.group) {
                            targetIdx = i;
                            break;
                        }
                    }
                }
            } else {
                targetIdx = direction === "up" ? idx - 1 : idx + 1;
            }

            if (targetIdx < 0 || targetIdx >= items.length) return prev;

            const targetItem = items[targetIdx];
            items[idx] = targetItem;
            items[targetIdx] = item;

            items.forEach((it, index) => {
                it.sortOrder = index;
            });

            return {
                ...prev,
                sections: {
                    ...prev.sections,
                    [section]: {
                        section,
                        items
                    }
                }
            };
        });
    }, []);

    const reorderGroupItems = useCallback((section: PromptSectionKey, orderedGroupIds: string[]) => {
        setLibrary(prev => {
            const items = [...(prev.sections[section]?.items || [])];
            items.sort((a, b) => a.sortOrder - b.sortOrder);

            const indices: number[] = [];
            const groupItems: PromptItem[] = [];
            items.forEach((item, idx) => {
                if (orderedGroupIds.includes(item.id)) {
                    indices.push(idx);
                    groupItems.push(item);
                }
            });

            const itemMap = new Map(groupItems.map(i => [i.id, i]));

            for (let i = 0; i < indices.length; i++) {
                items[indices[i]] = itemMap.get(orderedGroupIds[i])!;
            }

            items.forEach((it, index) => {
                it.sortOrder = index;
            });

            return {
                ...prev,
                sections: {
                    ...prev.sections,
                    [section]: {
                        section,
                        items
                    }
                }
            };
        });
    }, []);

    const reloadFromStorage = useCallback(() => {
        setLibrary(loadPromptLibrary());
    }, []);

    return {
        library,
        getItems,
        addItem,
        updateItem,
        deleteItem,
        moveItem,
        reorderGroupItems,
        reloadFromStorage,
    };
}
