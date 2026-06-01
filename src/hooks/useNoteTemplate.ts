import { useAppStore } from "../store/store";

export function useNoteTemplate() {
    const template = useAppStore(state => state.template);
    const addField = useAppStore(state => state.addTemplateField);
    const updateFieldLabel = useAppStore(state => state.updateTemplateFieldLabel);
    const removeField = useAppStore(state => state.removeTemplateField);
    const reorderFields = useAppStore(state => state.reorderTemplateFields);
    const toggleFieldVisibility = useAppStore(state => state.toggleTemplateFieldVisibility);

    // No longer needed with Zustand auto-sync
    const reloadFromStorage = () => {};

    return {
        template,
        addField,
        updateFieldLabel,
        removeField,
        reorderFields,
        toggleFieldVisibility,
        reloadFromStorage
    };
}
