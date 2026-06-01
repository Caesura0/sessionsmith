import { useAppStore } from "../store/store";

export function useNoteDraft() {
    const note = useAppStore(state => state.draft);
    const setFreeText = useAppStore(state => state.setDraftFreeText);
    const setMeta = useAppStore(state => state.setDraftMeta);
    const toggleSelection = useAppStore(state => state.toggleDraftSelection);
    const setSelection = useAppStore(state => state.setDraftSelection);
    const moveSelection = useAppStore(state => state.moveDraftSelection);
    const reorderSelection = useAppStore(state => state.reorderDraftSelection);
    const cleanDeletedSelections = useAppStore(state => state.cleanDeletedDraftSelections);

    return {
        note,
        setFreeText,
        setMeta,
        toggleSelection,
        setSelection,
        moveSelection,
        reorderSelection,
        cleanDeletedSelections,
    };
}
