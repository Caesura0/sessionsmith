import { useState, useCallback, useEffect } from "react";
import type { NoteTemplate, TemplateField } from "../../dataDictionary";
import { loadNoteTemplate, saveNoteTemplate } from "../storage/noteTemplateStorage";

function slugify(label: string) {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function useNoteTemplate() {
    const [template, setTemplate] = useState<NoteTemplate>(loadNoteTemplate);

    useEffect(() => {
        saveNoteTemplate(template);
    }, [template]);

    const addField = useCallback((label: string, type: "freetext" | "prompt-list") => {
        const baseId = slugify(label) || "field";
        setTemplate(prev => {
            let id = baseId;
            let n = 2;
            const existingIds = new Set(prev.fields.map(f => f.id));
            while (existingIds.has(id)) {
                id = `${baseId}-${n++}`;
            }

            const newField: TemplateField = { id, label, type };
            return {
                ...prev,
                fields: [...prev.fields, newField]
            };
        });
    }, []);

    const updateFieldLabel = useCallback((id: string, newLabel: string) => {
        setTemplate(prev => ({
            ...prev,
            fields: prev.fields.map(f => f.id === id ? { ...f, label: newLabel } : f)
        }));
    }, []);

    const removeField = useCallback((id: string) => {
        setTemplate(prev => ({
            ...prev,
            fields: prev.fields.filter(f => f.id !== id)
        }));
    }, []);

    const reorderFields = useCallback((newOrderIds: string[]) => {
        setTemplate(prev => {
            const fieldMap = new Map(prev.fields.map(f => [f.id, f]));
            const newFields: TemplateField[] = [];
            for (const id of newOrderIds) {
                const f = fieldMap.get(id);
                if (f) newFields.push(f);
            }
            return {
                ...prev,
                fields: newFields
            };
        });
    }, []);

    const toggleFieldVisibility = useCallback((id: string) => {
        setTemplate(prev => ({
            ...prev,
            fields: prev.fields.map(f => f.id === id ? { ...f, isHidden: !f.isHidden } : f)
        }));
    }, []);

    const reloadFromStorage = useCallback(() => {
        setTemplate(loadNoteTemplate());
    }, []);

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
