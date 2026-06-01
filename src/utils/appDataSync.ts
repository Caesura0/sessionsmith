import { useAppStore } from "../store/store";

export interface AppStateData {
    template: any;
    prompts: any;
    draft: any;
}

export function exportAllAppData(): AppStateData {
    const state = useAppStore.getState();
    return {
        template: state.template,
        prompts: state.library,
        draft: state.draft
    };
}

export function importAllAppData(data: AppStateData) {
    const state = useAppStore.getState();
    if (data.template) state.setTemplate(data.template);
    if (data.prompts) state.setLibrary(data.prompts);
    if (data.draft) state.setDraft(data.draft);
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
    useAppStore.getState().resetAllData();
}
