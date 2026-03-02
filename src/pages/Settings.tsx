import React from "react";
import { exportPromptLibrary, importPromptLibrary } from "../utils/promptLibraryBackup";
import { usePromptLibrary } from "../hooks/usePromptLibrary";
import { Download, Upload, AlertTriangle } from "lucide-react";

export function Settings() {
    const { reloadFromStorage } = usePromptLibrary();

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>, mode: "merge" | "replace") => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (mode === "replace") {
            if (!window.confirm("WARNING: This will overwrite your entire prompt library. Proceed?")) {
                e.target.value = '';
                return;
            }
        }

        try {
            const summary = await importPromptLibrary(file, mode);
            reloadFromStorage();
            alert(`Import successful (${summary.mode})!\n\nInterventions: +${summary.interventions.added}, ~${summary.interventions.updated}, =${summary.interventions.kept}\nObservations: +${summary.observations.added}, ~${summary.observations.updated}, =${summary.observations.kept}`);
        } catch (err: any) {
            alert(err.message || "Failed to import prompts.");
        } finally {
            e.target.value = ''; // reset input
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-light-4 mt-2">Manage your app configuration and data backups.</p>
            </header>

            <section className="rounded-2xl border border-dark-3 bg-dark-2 overflow-hidden shadow-lg">
                <div className="p-6 border-b border-dark-3/50 bg-dark-3/20">
                    <h2 className="text-lg font-semibold text-white">Prompt Library Backup & Transfer</h2>
                    <p className="text-sm text-light-4 mt-1">Exported backups contain your prompt configuration only. No patient data is included.</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1">
                            <h3 className="font-medium text-white flex items-center gap-2">
                                <Download className="w-4 h-4 text-accent-blue" /> Export Prompts
                            </h3>
                            <p className="text-xs text-light-4 mt-1">Download a JSON file containing all your customized prompts and orderings.</p>
                        </div>
                        <button
                            onClick={exportPromptLibrary}
                            className="rounded-xl bg-accent-blue text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-blue-hover transition-colors focus:ring-2 focus:ring-accent-blue focus:outline-none"
                        >
                            Export to JSON
                        </button>
                    </div>

                    <div className="h-px bg-dark-3 w-full"></div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1">
                            <h3 className="font-medium text-white flex items-center gap-2">
                                <Upload className="w-4 h-4 text-green-500" /> Import Prompts (Merge)
                            </h3>
                            <p className="text-xs text-light-4 mt-1">Combine a backup with your current library. Newer updates will be kept.</p>
                        </div>
                        <label className="rounded-xl border border-dark-4 bg-dark-3 text-white px-5 py-2.5 text-sm font-medium hover:bg-dark-4 transition-colors cursor-pointer text-center inline-block">
                            Merge JSON
                            <input
                                type="file"
                                accept="application/json"
                                className="hidden"
                                onChange={(e) => handleImport(e, "merge")}
                            />
                        </label>
                    </div>

                    <div className="h-px bg-dark-3 w-full"></div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1">
                            <h3 className="font-medium text-red-400 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Import Prompts (Replace)
                            </h3>
                            <p className="text-xs text-light-4 mt-1 text-red-400/80">OVERWRITE your current library with a backup entirely.</p>
                        </div>
                        <label className="rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 px-5 py-2.5 text-sm font-medium hover:bg-red-500/20 transition-colors cursor-pointer text-center inline-block">
                            Replace JSON
                            <input
                                type="file"
                                accept="application/json"
                                className="hidden"
                                onChange={(e) => handleImport(e, "replace")}
                            />
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
}
