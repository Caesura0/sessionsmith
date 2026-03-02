import React, { useState } from "react";
import { exportPromptLibrary, importPromptLibrary } from "../utils/promptLibraryBackup";
import { downloadBackupFile, resetAllAppData } from "../utils/appDataSync";
import { usePromptLibrary } from "../hooks/usePromptLibrary";
import { Download, Upload, AlertTriangle, Cloud, CloudUpload, CloudDownload, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Settings() {
    const { reloadFromStorage } = usePromptLibrary();
    const sync = useAuth();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [wantBackup, setWantBackup] = useState(true);

    const handleReset = async () => {
        if (wantBackup) {
            downloadBackupFile();
        }

        // 1. Wipe local storage to reset to base defaults
        resetAllAppData();

        // 2. If logged in, push these empty defaults to Google Drive to overwrite the cloud backup
        if (sync.isLoggedIn) {
            await sync.pushData();
            sync.logout();
        }

        window.location.reload();
    };

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
                <h1 className="text-3xl font-bold text-white tracking-tight">Import/Export Data</h1>
                <p className="text-light-4 mt-2">Manage your app configuration and data backups.</p>
            </header>

            <section className="rounded-2xl border border-dark-3 bg-dark-2 overflow-hidden shadow-lg mb-8">
                <div className="p-6 border-b border-dark-3/50 bg-dark-3/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Cloud className="w-5 h-5 text-accent-blue" />
                            Google Drive Sync
                        </h2>
                        <p className="text-sm text-light-4 mt-1">Sync your App Data securely to your personal Google Drive.</p>
                    </div>
                    {sync.isLoggedIn && (
                        <button
                            onClick={sync.logout}
                            className="flex items-center gap-2 text-sm text-dark-5 hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    {sync.error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> {sync.error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex-1">
                                <h3 className="font-medium text-white flex items-center gap-2">
                                    <CloudUpload className="w-4 h-4 text-accent-blue" /> Push to Drive
                                </h3>
                                <p className="text-xs text-light-4 mt-1">Upload your current configuration to Google Drive. This replaces the cloud backup.</p>
                            </div>
                            <button
                                onClick={async () => {
                                    await sync.pushData();
                                    if (!sync.error) alert("Successfully saved to Google Drive!");
                                }}
                                disabled={sync.isSyncing}
                                className="rounded-xl bg-accent-blue text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-blue-hover transition-colors disabled:opacity-50"
                            >
                                {sync.isSyncing ? "Pushing..." : "Push to Drive"}
                            </button>
                        </div>

                        <div className="h-px bg-dark-3 w-full"></div>

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex-1">
                                <h3 className="font-medium text-white flex items-center gap-2">
                                    <CloudDownload className="w-4 h-4 text-green-500" /> Pull from Drive
                                </h3>
                                <p className="text-xs text-light-4 mt-1">Download your configuration from Google Drive. <span className="text-red-400">This replaces your local data.</span></p>
                            </div>
                            <button
                                onClick={async () => {
                                    if (window.confirm("WARNING: This will overwrite your current templates and prompts. Proceed?")) {
                                        const success = await sync.pullData();
                                        if (success) {
                                            reloadFromStorage();
                                            alert("Successfully restored from Google Drive!");
                                        }
                                    }
                                }}
                                disabled={sync.isSyncing}
                                className="rounded-xl border border-dark-4 bg-dark-3 text-white px-5 py-2.5 text-sm font-medium hover:bg-dark-4 transition-colors disabled:opacity-50"
                            >
                                {sync.isSyncing ? "Pulling..." : "Pull from Drive"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

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

            <section className="rounded-2xl border border-red-500/20 bg-dark-2 overflow-hidden shadow-lg mt-8 mb-8 pb-4">
                <div className="p-6 border-b border-red-500/20 bg-red-500/5">
                    <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
                    <p className="text-sm text-red-400/80 mt-1">Irreversible, destructive actions.</p>
                </div>

                <div className="p-6">
                    {!showResetConfirm ? (
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex-1">
                                <h3 className="font-medium text-white">Factory Reset</h3>
                                <p className="text-xs text-light-4 mt-1">Disconnect Google Drive, wipe all custom settings, prompts, and templates, and restore to default base application.</p>
                            </div>
                            <button
                                onClick={() => setShowResetConfirm(true)}
                                className="shrink-0 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 px-5 py-2.5 text-sm font-medium hover:bg-red-500/20 transition-colors"
                            >
                                Reset App Settings
                            </button>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <h3 className="font-semibold text-red-400 flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5" /> Are you absolutely sure?
                            </h3>
                            <p className="text-sm text-red-300/90 mb-4">
                                This will permanently delete your templates, prompts, and drafts from this browser AND wipe your configuration saved in Google Drive before safely logging you out.
                            </p>

                            <label className="flex items-center gap-3 mb-6 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={wantBackup}
                                    onChange={(e) => setWantBackup(e.target.checked)}
                                    // the focus-ring might look odd without form styles but basic CSS is okay here
                                    className="w-5 h-5 cursor-pointer accent-red-500"
                                />
                                <span className="text-sm font-medium text-white group-hover:text-red-200 transition-colors">
                                    Save a backup to my computer first (JSON file)
                                </span>
                            </label>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleReset}
                                    className="rounded-xl bg-red-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20"
                                >
                                    Confirm Reset
                                </button>
                                <button
                                    onClick={() => setShowResetConfirm(false)}
                                    className="rounded-xl border border-dark-4 bg-dark-3 text-white px-5 py-2.5 text-sm font-medium hover:bg-dark-4 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
