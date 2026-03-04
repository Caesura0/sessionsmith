import { useTheme } from "../context/ThemeContext";
import type { VisualTheme } from "../context/ThemeContext";
import { Check, Palette, Moon, Sun, Monitor, Waves } from "lucide-react";
import { cn } from "../utils/cn";

export function VisualThemes() {
    const { theme, setTheme } = useTheme();

    const themes: { id: VisualTheme; label: string; icon: any; description: string; colors: string[] }[] = [
        {
            id: "dark",
            label: "Pro Dark",
            icon: Moon,
            description: "Default sleek dark aesthetic.",
            colors: ["#0a0a0c", "#1c1c1f", "#3b82f6"]
        },
        {
            id: "light",
            label: "Pure Light",
            icon: Sun,
            description: "High contrast, clean and professional.",
            colors: ["#ffffff", "#f8f8f8", "#2563eb"]
        },
        {
            id: "slate",
            label: "Slate Gray",
            icon: Monitor,
            description: "Cool blue-gray tones for focus.",
            colors: ["#0f172a", "#1e293b", "#38bdf8"]
        },
        {
            id: "ocean",
            label: "Deep Ocean",
            icon: Waves,
            description: "Calming teal and navy depth.",
            colors: ["#042f2e", "#134e4a", "#2dd4bf"]
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <div className="flex items-center gap-3 text-accent-purple mb-2">
                    <Palette className="w-8 h-8" />
                    <h1 className="text-3xl font-bold tracking-tight text-white">Visual Themes</h1>
                </div>
                <p className="text-light-4 text-lg">Personalize your NoteSmith experience with a curated color palette.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {themes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                            "group relative overflow-hidden rounded-2xl glass p-6 border transition-all duration-300 text-left focus:outline-none focus:ring-2",
                            theme === t.id
                                ? "border-accent-purple shadow-[var(--shadow-glow-purple)] bg-accent-purple/5"
                                : "border-white/5 hover:border-white/20 hover:bg-white/5 active:scale-[0.98]",
                            theme === t.id ? "ring-accent-purple" : "ring-transparent"
                        )}
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-4 relative z-10">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                                    theme === t.id ? "bg-accent-purple text-white" : "bg-dark-3 text-light-4 group-hover:text-white"
                                )}>
                                    <t.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-accent-purple transition-colors flex items-center gap-2">
                                        {t.label}
                                        {theme === t.id && <Check className="w-4 h-4" />}
                                    </h3>
                                    <p className="text-light-4 text-sm mt-1">{t.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    {t.colors.map((c, i) => (
                                        <div
                                            key={i}
                                            className="w-8 h-2 rounded-full border border-white/10"
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Decorative background circle */}
                            <div
                                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all group-hover:opacity-40"
                                style={{ backgroundColor: t.colors[t.colors.length - 1] }}
                            />
                        </div>
                    </button>
                ))}
            </div>

            <section className="rounded-2xl border border-dark-3 bg-dark-2 p-8 shadow-inner mt-12 bg-opacity-50">
                <h4 className="text-sm font-semibold text-light-3 uppercase tracking-wider mb-4">Preview Info</h4>
                <div className="space-y-4">
                    <p className="text-light-4 text-sm leading-relaxed">
                        Themes automatically update all interface elements including sidebars, inputs, buttons, and text contrast.
                        Note outputs remain standard for high-quality printing.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <div className="px-4 py-2 rounded-xl bg-dark-3 border border-dark-4 text-xs font-mono text-light-3">--bg-app: {themes.find(x => x.id === theme)?.colors[0]}</div>
                        <div className="px-4 py-2 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-xs font-mono text-accent-blue">Primary Accent</div>
                    </div>
                </div>
            </section>
        </div>
    );
}
