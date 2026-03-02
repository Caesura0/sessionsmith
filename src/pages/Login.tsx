import { useAuth } from "../context/AuthContext";
import { CopyPlus, Cloud, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function Login() {
    const { isLoggedIn, login, pullData, isSyncing, error } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function hydrateAndRedirect() {
            if (isLoggedIn) {
                // Pull immediately on successful login to overlay local state
                await pullData();
                navigate("/");
            }
        }
        hydrateAndRedirect();
    }, [isLoggedIn, navigate, pullData]);

    // If suddenly rendering while already logged in (but not in effect yet), just flash a loading screen
    if (isLoggedIn) {
        return (
            <div className="flex h-screen w-full bg-dark-1 items-center justify-center">
                <div className="flex flex-col items-center animate-pulse text-accent-blue">
                    <Cloud className="w-12 h-12 mb-4" />
                    <p className="font-medium">Syncing with Google Drive...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-dark-1 items-center justify-center p-4">
            <div className="max-w-md w-full rounded-2xl border border-dark-3 bg-dark-2 overflow-hidden shadow-2xl p-8 sm:p-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-accent-blue/10 rounded-2xl flex items-center justify-center mb-6">
                    <CopyPlus className="w-8 h-8 text-accent-blue" />
                </div>

                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">NoteSmith</h1>
                <p className="text-light-4 text-center mb-10 text-sm">Sign in to securely sync your templates and prompts to your personal Google Drive.</p>

                {error && (
                    <div className="w-full mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex flex-col gap-1 items-center text-center">
                        <AlertTriangle className="w-5 h-5 mb-1" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    onClick={login}
                    disabled={isSyncing}
                    className="w-full rounded-xl bg-white text-dark-1 px-6 py-4 text-base font-semibold hover:bg-light-2 transition-colors focus:ring-4 focus:ring-white/20 focus:outline-none flex items-center justify-center gap-3 shadow-lg"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {isSyncing ? "Connecting..." : "Continue with Google"}
                </button>

                <p className="mt-8 text-xs text-dark-5 text-center px-4">
                    NoteSmith uses the restricted Google Drive AppData folder to securely store your configuration. It cannot access your personal files.
                </p>
            </div>
        </div>
    );
}
