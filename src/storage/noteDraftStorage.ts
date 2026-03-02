import { STORAGE_KEYS, createEmptyNoteDraft } from "../../dataDictionary";
import type { NoteDraft } from "../../dataDictionary";

export function loadNoteDraft(): NoteDraft {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.noteDraft);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.version === 1) {
                return parsed as NoteDraft;
            }
        }
    } catch (e) {
        console.error("Failed to load note draft", e);
    }
    return createEmptyNoteDraft();
}

export function saveNoteDraft(draft: NoteDraft) {
    try {
        localStorage.setItem(STORAGE_KEYS.noteDraft, JSON.stringify(draft));
        window.dispatchEvent(new Event('appDataChanged'));
    } catch (e) {
        console.error("Failed to save note draft", e);
    }
}
