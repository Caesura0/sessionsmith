import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type VisualTheme = "dark" | "light" | "slate" | "ocean";

interface ThemeContextType {
    theme: VisualTheme;
    setTheme: (theme: VisualTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<VisualTheme>(() => {
        const stored = localStorage.getItem("notesmith_theme");
        return (stored as VisualTheme) || "dark";
    });

    useEffect(() => {
        localStorage.setItem("notesmith_theme", theme);

        // Remove all theme classes first
        const root = document.documentElement;
        root.classList.remove("theme-dark", "theme-light", "theme-slate", "theme-ocean");
        root.classList.add(`theme-${theme}`);

        // Also update standard accessibility meta or body colors if needed
        document.body.className = theme === "light" ? "bg-white text-zinc-900" : "bg-dark-1 text-light-2";
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
