import { loadNoteTemplate, saveNoteTemplate } from "../storage/noteTemplateStorage";
import { loadPromptLibrary, savePromptLibrary } from "../storage/promptLibraryStorage";
import { loadNoteDraft, saveNoteDraft } from "../storage/noteDraftStorage";
import { STORAGE_KEYS } from "../../dataDictionary";

export interface AppStateData {
    template: any;
    prompts: any;
    draft: any;
}

export function exportAllAppData(): AppStateData {
    return {
        template: loadNoteTemplate(),
        prompts: loadPromptLibrary(),
        draft: loadNoteDraft()
    };
}

export function importAllAppData(data: AppStateData) {
    if (data.template) saveNoteTemplate(data.template);
    if (data.prompts) savePromptLibrary(data.prompts);
    if (data.draft) saveNoteDraft(data.draft);
}

export function downloadBackupFile() {
    const data = exportAllAppData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `notesmith-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function resetAllAppData() {
    localStorage.removeItem(STORAGE_KEYS.promptLibrary);
    localStorage.removeItem(STORAGE_KEYS.noteDraft);
    localStorage.removeItem(STORAGE_KEYS.noteTemplate);
    window.dispatchEvent(new Event('appDataChanged'));
}
