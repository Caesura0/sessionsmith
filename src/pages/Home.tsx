import { Link } from "react-router-dom";
import { PenLine, Settings, ArrowRight } from "lucide-react";
import { usePromptLibrary } from "../hooks/usePromptLibrary";

export function Home() {
    const { library } = usePromptLibrary();
    const intCount = library?.sections?.interventions?.items?.length || 0;
    const obsCount = library?.sections?.observations?.items?.length || 0;

    return (
        <div className="space-y-8 max-w-3xl">
            <header className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-2">Good morning, Clinician.</h1>
                <p className="text-light-4 text-lg">Ready to write your next session note?</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <Link
                    to="/editor"
                    className="group relative overflow-hidden rounded-2xl glass p-6 border border-white/5 hover:border-accent-blue/50 transition-all duration-300 hover:shadow-[var(--shadow-glow)] focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-accent-blue/20"></div>
                    <div className="relative">
                        <div className="h-12 w-12 rounded-xl bg-accent-blue/20 flex items-center justify-center mb-4 text-accent-blue">
                            <PenLine className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-accent-blue transition-colors">Start a Draft</h2>
                        <p className="text-light-4 text-sm mb-6">Open the editor to compose a new session note with your custom prompts.</p>
                        <div className="flex items-center text-sm font-medium text-accent-blue">
                            Open Editor <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                <Link
                    to="/settings"
                    className="group relative overflow-hidden rounded-2xl glass p-6 border border-white/5 hover:border-accent-purple/50 transition-all duration-300 hover:shadow-[var(--shadow-glow-purple)] focus:outline-none focus:ring-2 focus:ring-accent-purple"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-accent-purple/20"></div>
                    <div className="relative">
                        <div className="h-12 w-12 rounded-xl bg-accent-purple/20 flex items-center justify-center mb-4 text-accent-purple">
                            <Settings className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-accent-purple transition-colors">Manage Prompts</h2>
                        <p className="text-light-4 text-sm mb-6">You have {intCount} interventions and {obsCount} observations configured.</p>
                        <div className="flex items-center text-sm font-medium text-accent-purple">
                            Open Settings <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
