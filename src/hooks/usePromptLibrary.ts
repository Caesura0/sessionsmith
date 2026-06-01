import { useCallback } from "react";
import { useAppStore } from "../store/store";
import type { PromptSectionKey, PromptItem } from "../dataDictionary";

export function usePromptLibrary() {
    const library = useAppStore(state => state.library);
    const addItem = useAppStore(state => state.addLibraryItem);
    const updateItem = useAppStore(state => state.updateLibraryItem);
    const updateItemsGroup = useAppStore(state => state.updateLibraryItemsGroup);
    const deleteItem = useAppStore(state => state.deleteLibraryItem);
    const moveItem = useAppStore(state => state.moveLibraryItem);
    const reorderGroupItems = useAppStore(state => state.reorderLibraryGroupItems);

    const getItems = useCallback((section: PromptSectionKey): PromptItem[] => {
        const items = library.sections[section]?.items || [];
        return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    }, [library]);

    // No longer needed with Zustand auto-sync, but kept for compatibility if called
    const reloadFromStorage = useCallback(() => {}, []);

    return {
        library,
        getItems,
        addItem,
        updateItem,
        updateItemsGroup,
        deleteItem,
        moveItem,
        reorderGroupItems,
        reloadFromStorage,
    };
}
