import { useState } from "react";
import { useNoteTemplate } from "../hooks/useNoteTemplate";
import { cn } from "../utils/cn";
import { LayoutTemplate, FileText } from "lucide-react";
import { TemplateEditor } from "./TemplateEditor";
import { PromptList as PickerList } from "../components/PromptList";
import { usePromptLibrary } from "../hooks/usePromptLibrary";


export function PromptSetup() {
    const templateManager = useNoteTemplate();
    const { template } = templateManager;
    const { updateItemsGroup } = usePromptLibrary();

    const [activeTab, setActiveTab] = useState<string>("structure");
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [groupInput, setGroupInput] = useState<{ isOpen: boolean, value: string }>({ isOpen: false, value: "" });

    function handleGroupSelected() {
        const val = groupInput.value.trim();
        if (!val || selectedItems.length === 0) return;

        // This relies on the current activeTab being the prompt section key
        updateItemsGroup(activeTab as any, selectedItems, val);

        setGroupInput({ isOpen: false, value: "" });
        setSelectedItems([]);
    }

    const tabs = [
        { id: "structure", label: "Note Structure", icon: LayoutTemplate },
        { id: "sessionMode", label: "Session Modes", icon: FileText },
        { id: "sessionDuration", label: "Session Durations", icon: FileText },
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
            <header className="shrink-0 mb-4 px-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Prompt Setup</h1>
                    <p className="text-light-4 mt-2">Configure your note sections and manage prompt libraries.</p>
                </div>

                {/* Multi-select Action Bar (Static in Header) */}
                {selectedItems.length > 0 && activeTab !== "structure" && (
                    <div className="flex bg-accent-blue/10 border border-accent-blue/20 rounded-xl p-2 items-center gap-3">
                        <span className="text-sm font-medium text-accent-blue whitespace-nowrap pl-2">
                            {selectedItems.length} Selected
                        </span>
                        <div className="flex gap-2 items-center">
                            {groupInput.isOpen ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        autoFocus
                                        value={groupInput.value}
                                        onChange={e => setGroupInput({ isOpen: true, value: e.target.value })}
                                        placeholder="Subgroup Name..."
                                        className="text-xs bg-dark-3 border border-dark-4 text-white px-2 py-1.5 rounded-lg outline-none focus:border-accent-blue w-32"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleGroupSelected();
                                            if (e.key === 'Escape') setGroupInput({ isOpen: false, value: "" });
                                        }}
                                    />
                                    <button onClick={handleGroupSelected} className="text-xs bg-accent-blue hover:bg-accent-blue-hover text-white px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm">
                                        Save
                                    </button>
                                    <button onClick={() => setGroupInput({ isOpen: false, value: "" })} className="text-xs bg-dark-4 hover:bg-dark-5 text-light-3 px-2 py-1.5 rounded-lg transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => setGroupInput({ isOpen: true, value: "" })} className="text-xs bg-accent-blue hover:bg-accent-blue-hover text-white px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm whitespace-nowrap">
                                        Add to Subgroup
                                    </button>
                                    <button onClick={() => setSelectedItems([])} className="text-xs bg-dark-4 hover:bg-dark-5 text-light-3 px-3 py-1.5 rounded-lg transition-colors">
                                        Clear
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Tabs Navigation */}
            <div className="flex bg-dark-2 rounded-xl border border-dark-3 p-1 shrink-0 overflow-x-auto hide-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setSelectedItems([]);
                            setGroupInput({ isOpen: false, value: "" });
                        }}
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
                        selected={selectedItems}
                        onChange={setSelectedItems}
                        hideControls={false}
                    />
                )}
            </section>
        </div>
    );
}
