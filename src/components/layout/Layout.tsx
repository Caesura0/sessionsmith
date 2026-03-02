import { Link, Outlet, useLocation } from "react-router-dom";
import { CopyPlus, Settings, Home as HomeIcon, LayoutTemplate } from "lucide-react";
import { cn } from "../../utils/cn";

export function Layout() {
    const location = useLocation();

    const primaryLinks = [
        { name: "Home", href: "/", icon: HomeIcon },
        { name: "Editor", href: "/editor", icon: CopyPlus },
    ];

    const configLinks = [
        { name: "Prompt Setup", href: "/prompt-setup", icon: LayoutTemplate },
        { name: "Import/Export Data", href: "/settings", icon: Settings },
    ];

    function NavLink({ link }: { link: any }) {
        const isActive = location.pathname.startsWith(link.href) && (link.href !== '/' || location.pathname === '/');
        return (
            <Link
                key={link.name}
                to={link.href}
                title={link.name}
                className={cn(
                    "flex items-center justify-center sm:justify-start px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                    isActive
                        ? "bg-accent-blue/10 text-accent-blue font-medium shadow-sm border border-accent-blue/20"
                        : "text-light-4 hover:bg-dark-3 hover:text-white border border-transparent"
                )}
            >
                <link.icon className={cn("w-5 h-5 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                <span className="ml-3 hidden sm:block whitespace-nowrap">{link.name}</span>
            </Link>
        );
    }

    return (
        <div className="flex h-screen w-full bg-dark-1 text-light-2 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[4.5rem] sm:w-64 border-r border-dark-3 bg-dark-2 flex flex-col shrink-0 transition-all duration-300">
                <div className="h-16 flex items-center justify-center sm:justify-start sm:px-6 border-b border-dark-3 text-white">
                    <CopyPlus className="w-6 h-6 text-accent-blue" />
                    <span className="ml-3 font-semibold text-lg hidden sm:block tracking-wide">NoteSmith</span>
                </div>

                <nav className="flex-1 flex flex-col gap-6 p-3 overflow-y-auto mt-2">
                    <div className="flex flex-col gap-2">
                        <div className="hidden sm:block text-xs font-semibold text-dark-5 uppercase tracking-wider px-3 mb-1">Menu</div>
                        {primaryLinks.map((link) => <NavLink key={link.href} link={link} />)}
                    </div>
                </nav>

                <div className="p-3 border-t border-dark-3 w-full flex flex-col gap-2">
                    <div className="hidden sm:block text-xs font-semibold text-dark-5 uppercase tracking-wider px-3 mb-1">Configuration</div>
                    {configLinks.map((link) => <NavLink key={link.href} link={link} />)}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-y-auto relative">
                <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-10 w-full animate-in fade-in duration-500 fill-mode-both h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
