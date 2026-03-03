import { useState } from "react";
import { useNoteTemplate } from "../hooks/useNoteTemplate";
import { cn } from "../utils/cn";
import { LayoutTemplate, FileText } from "lucide-react";
import { TemplateEditor } from "./TemplateEditor";
import { PromptList as PickerList } from "../components/PromptList";

const EMPTY_SELECTION: string[] = [];

export function PromptSetup() {
    const templateManager = useNoteTemplate();
    const { template } = templateManager;
    const [activeTab, setActiveTab] = useState<string>("structure");

    const tabs = [
        { id: "structure", label: "Note Structure", icon: LayoutTemplate },
        ...template.fields
            .filter(f => f.type === "prompt-list" && !f.isHidden)
            .map(f => ({
                id: f.id,
                label: f.label,
                icon: FileText
            }))
    ];

    return (
        <div className="space-y-6 max-w-5xl h-[calc(100vh-6rem)] flex flex-col pt-2 pb-6 mx-auto">
            <header className="shrink-0 mb-2 px-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">Prompt Setup</h1>
                <p className="text-light-4 mt-2">Configure your note sections and manage prompt libraries.</p>
            </header>

            {/* Tabs Navigation */}
            <div className="flex bg-dark-2 rounded-xl border border-dark-3 p-1 shrink-0 overflow-x-auto hide-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-accent-blue/15 text-accent-blue shadow-sm border border-accent-blue/30"
                                : "text-light-4 hover:bg-dark-3 hover:text-light-2 border border-transparent"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-accent-blue" : "text-dark-5")} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content Area */}
            <section className="flex-1 overflow-auto rounded-2xl border border-dark-3 bg-dark-2/50 backdrop-blur shadow-lg p-4 sm:p-6 mb-8">
                {activeTab === "structure" ? (
                    <TemplateEditor templateManager={templateManager} />
                ) : (
                    <PickerList
                        key={activeTab}
                        section={activeTab}
                        selected={EMPTY_SELECTION}
                        onChange={() => { }}
                        hideControls={false}
                    />
                )}
            </section>
        </div>
    );
}
