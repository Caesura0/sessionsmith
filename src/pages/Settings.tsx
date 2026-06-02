import React, { useState } from "react";
import { exportPromptLibrary, importPromptLibrary } from "../utils/promptLibraryBackup";
import { downloadBackupFile, resetAllAppData } from "../utils/appDataSync";
import { usePromptLibrary } from "../hooks/usePromptLibrary";
import { Download, Upload, AlertTriangle, Cloud, CloudUpload, CloudDownload, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useModalStore } from "../store/modalStore";

export function Settings() {
    const { reloadFromStorage } = usePromptLibrary();
    const sync = useAuth();
    const { confirmDialog } = useModalStore();
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
            const confirmed = await confirmDialog({
                title: "Replace Prompt Library",
                message: "WARNING: This will overwrite your entire prompt library. Proceed?",
                danger: true,
                confirmText: "Replace Library"
            });
            if (!confirmed) {
                e.target.value = '';
                return;
            }
        }

        try {
            const summary = await importPromptLibrary(file, mode);
            reloadFromStorage();
            toast.success(`Import successful (${summary.mode})!\n\nInterventions: +${summary.interventions.added}, ~${summary.interventions.updated}, =${summary.interventions.kept}\nObservations: +${summary.observations.added}, ~${summary.observations.updated}, =${summary.observations.kept}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to import prompts.");
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
                    {sync.isLoggedIn && !sync.isGuest && (
                        <button
                            onClick={sync.logout}
                            className="flex items-center gap-2 text-sm text-dark-5 hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    )}
                    {sync.isGuest && (
                        <button
                            onClick={sync.logout}
                            className="flex items-center gap-2 text-sm text-dark-5 hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Leave Guest Mode
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
                        {sync.isGuest ? (
                            <div className="flex flex-col items-center justify-center p-6 bg-dark-3/30 rounded-xl border border-dark-3 text-center">
                                <Cloud className="w-8 h-8 text-light-4 mb-3" />
                                <h3 className="text-white font-medium mb-1">Cloud Sync is Disabled</h3>
                                <p className="text-sm text-light-4 mb-6 max-w-sm">You are currently using SessionSmith as a guest. Sign in with Google to automatically back up your prompts and settings.</p>
                                <button
                                    onClick={sync.login}
                                    className="rounded-xl bg-white text-dark-1 px-6 py-2.5 text-sm font-semibold hover:bg-light-2 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Sign in with Google
                                </button>
                            </div>
                        ) : (
                            <>
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
                                            if (!sync.error) toast.success("Successfully saved to Google Drive!");
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
                                            const confirmed = await confirmDialog({
                                                title: "Restore from Drive",
                                                message: "WARNING: This will overwrite your current templates and prompts. Proceed?",
                                                danger: true,
                                                confirmText: "Restore Data"
                                            });
                                            if (confirmed) {
                                                const success = await sync.pullData();
                                                if (success) {
                                                    reloadFromStorage();
                                                    toast.success("Successfully restored from Google Drive!");
                                                }
                                            }
                                        }}
                                        disabled={sync.isSyncing}
                                        className="rounded-xl border border-dark-4 bg-dark-3 text-white px-5 py-2.5 text-sm font-medium hover:bg-dark-4 transition-colors disabled:opacity-50"
                                    >
                                        {sync.isSyncing ? "Pulling..." : "Pull from Drive"}
                                    </button>
                                </div>
                            </>
                        )}
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
