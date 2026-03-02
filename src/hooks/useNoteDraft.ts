import { useState, useCallback, useEffect } from "react";
import type { NoteDraft, FreeTextSectionKey, NoteMeta, PromptSectionKey } from "../../dataDictionary";
import { loadNoteDraft, saveNoteDraft } from "../storage/noteDraftStorage";

export function useNoteDraft() {
    const [note, setNote] = useState<NoteDraft>(loadNoteDraft);

    useEffect(() => {
        saveNoteDraft(note);
    }, [note]);

    const setFreeText = useCallback((key: FreeTextSectionKey, value: string) => {
        setNote(prev => ({
            ...prev,
            freeText: {
                ...prev.freeText,
                [key]: value
            },
            updatedAt: Date.now()
        }));
    }, []);

    const setMeta = useCallback((patch: Partial<NoteMeta>) => {
        setNote(prev => ({
            ...prev,
            meta: {
                ...prev.meta,
                ...patch
            },
            updatedAt: Date.now()
        }));
    }, []);

    const toggleSelection = useCallback((section: PromptSectionKey, id: string) => {
        setNote(prev => {
            const current = prev.selections[section] || [];
            const exists = current.includes(id);
            const newSelections = exists ? current.filter(x => x !== id) : [...current, id];

            return {
                ...prev,
                selections: {
                    ...prev.selections,
                    [section]: newSelections
                },
                updatedAt: Date.now()
            };
        });
    }, []);

    const setSelection = useCallback((section: PromptSectionKey, ids: string[]) => {
        setNote(prev => ({
            ...prev,
            selections: {
                ...prev.selections,
                [section]: ids
            },
            updatedAt: Date.now()
        }));
    }, []);

    const moveSelection = useCallback((section: PromptSectionKey, index: number, direction: "up" | "down") => {
        setNote(prev => {
            const current = [...(prev.selections[section] || [])];
            if (direction === "up" && index > 0) {
                const temp = current[index - 1];
                current[index - 1] = current[index];
                current[index] = temp;
            } else if (direction === "down" && index < current.length - 1) {
                const temp = current[index + 1];
                current[index + 1] = current[index];
                current[index] = temp;
            } else {
                return prev;
            }
            return {
                ...prev,
                selections: {
                    ...prev.selections,
                    [section]: current
                },
                updatedAt: Date.now()
            };
        });
    }, []);

    const reorderSelection = useCallback((section: PromptSectionKey, newOrderIds: string[]) => {
        setNote(prev => ({
            ...prev,
            selections: {
                ...prev.selections,
                [section]: newOrderIds
            },
            updatedAt: Date.now()
        }));
    }, []);

    const cleanDeletedSelections = useCallback((section: PromptSectionKey, availableIds: string[]) => {
        setNote(prev => {
            const current = prev.selections[section] || [];
            const cleaned = current.filter(id => availableIds.includes(id));
            if (cleaned.length !== current.length) {
                return {
                    ...prev,
                    selections: {
                        ...prev.selections,
                        [section]: cleaned
                    },
                    updatedAt: Date.now()
                };
            }
            return prev;
        });
    }, []);

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
