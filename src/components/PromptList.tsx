import { useState, useMemo, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePromptLibrary } from "../hooks/usePromptLibrary";
import type { PromptSectionKey, PromptItem } from "../../dataDictionary";
import { cn } from "../utils/cn";
import { Search, Plus } from "lucide-react";

function SortablePickerItem({
    opt, active, editingId, editValue, setEditValue, handleEditSave, setEditingId,
    toggle, moveItem, section, handleEditStart, handleDelete, isSearchActive, hideControls
}: {
    opt: PromptItem;
    active: boolean;
    editingId: string | null;
    editValue: string;
    setEditValue: (v: string) => void;
    handleEditSave: () => void;
    setEditingId: (id: string | null) => void;
    toggle: (id: string) => void;
    moveItem: (s: PromptSectionKey, id: string, dir: "up" | "down", wg?: boolean) => void;
    section: PromptSectionKey;
    handleEditStart: (opt: PromptItem) => void;
    handleDelete: (id: string) => void;
    isSearchActive: boolean;
    hideControls?: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: opt.id, disabled: isSearchActive });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <li ref={setNodeRef} style={style} className={cn("relative group text-left", isDragging && "shadow-xl rounded-2xl")}>
            {editingId === opt.id ? (
                <div className="w-full rounded-2xl border border-accent-blue bg-dark-2 px-4 py-3 flex gap-2 items-center">
                    <input
                        autoFocus
                        type="text"
                        className="flex-1 bg-transparent text-sm text-white outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave();
                            if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={handleEditSave}
                    />
                    <div className="text-xs text-light-4 font-medium">↵ to save</div>
                </div>
            ) : (
                <div className={cn(
                    "w-full flex items-stretch justify-between rounded-2xl border transition-all overflow-hidden text-left",
                    active
                        ? "border-accent-blue bg-accent-blue/10 text-white"
                        : "border-dark-3/50 bg-dark-2 hover:bg-dark-3 hover:border-dark-3 text-light-2",
                )}>
                    {!isSearchActive && (
                        <div
                            {...attributes}
                            {...listeners}
                            className="flex items-center pl-3 pr-1 cursor-grab active:cursor-grabbing text-dark-4 hover:text-light-4 transition-colors"
                            title="Drag to reorder"
                        >
                            ⋮⋮
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => toggle(opt.id)}
                        aria-pressed={active}
                        className={cn(
                            "flex-1 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-blue",
                            isSearchActive ? "px-4" : "pr-4 pl-1"
                        )}
                    >
                        <div className="text-sm font-medium">{opt.label}</div>
                        {opt.description && (
                            <div className="mt-0.5 text-xs opacity-70">{opt.description}</div>
                        )}
                    </button>
                    {!hideControls && (
                        <div className="flex items-center space-x-1 pr-3 pl-2 border-l border-white/5 bg-dark-2/50 backdrop-blur-sm">
                            {!isSearchActive && (
                                <>
                                    <button onClick={(e) => { e.stopPropagation(); moveItem(section, opt.id, "up", true); }} className="p-1 hover:bg-white/10 hover:text-white rounded flex items-center justify-center w-7 h-7 transition-colors" title="Move up">↑</button>
                                    <button onClick={(e) => { e.stopPropagation(); moveItem(section, opt.id, "down", true); }} className="p-1 hover:bg-white/10 hover:text-white rounded flex items-center justify-center w-7 h-7 transition-colors" title="Move down">↓</button>
                                </>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); handleEditStart(opt); }} className="p-1 hover:bg-white/10 hover:text-white rounded flex items-center justify-center w-7 h-7 transition-colors" title="Edit text">✎</button>
                            {opt.isCustom && (
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(opt.id); }} className="p-1 hover:bg-red-500/20 text-red-400 hover:text-red-500 rounded flex items-center justify-center w-7 h-7 transition-colors" title="Delete">✕</button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </li>
    );
}

type PromptListProps = {
    section: PromptSectionKey;
    selected: string[];
    onChange?: (selectedIds: string[]) => void;
    hideControls?: boolean;
};

export function PromptList({ section, selected, onChange, hideControls }: PromptListProps) {
    const { getItems, addItem, updateItem, deleteItem, moveItem, reorderGroupItems } = usePromptLibrary();
    const allOptions = getItems(section);

    const [local, setLocal] = useState<string[]>(selected);
    const [query, setQuery] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        const validIds = new Set(allOptions.map(o => o.id));
        const next = local.filter(id => validIds.has(id));
        if (next.length !== local.length) {
            setLocal(next);
            if (onChange) {
                onChange(next);
            }
        }
    }, [allOptions, local, onChange]);

    useEffect(() => {
        // Sync external changes only if they differ
        if (selected.length !== local.length || !selected.every((v, i) => v === local[i])) {
            setLocal(selected);
        }
    }, [selected, local]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return allOptions;
        return allOptions.filter(
            (o) => o.label.toLowerCase().includes(q) || (o.group?.toLowerCase().includes(q) ?? false)
        );
    }, [query, allOptions]);

    const byGroup = useMemo(() => {
        const map = new Map<string, PromptItem[]>();
        for (const opt of filtered) {
            const g = opt.group ?? "Other";
            if (!map.has(g)) map.set(g, []);
            map.get(g)!.push(opt);
        }
        return Array.from(map.entries());
    }, [filtered]);

    const isSelected = (id: string) => local.includes(id);

    const toggle = (id: string) => {
        setLocal((prev) => {
            const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
            if (onChange) onChange(next);
            return next;
        });
    };

    function handleAddFromQuery() {
        const label = query.trim();
        if (!label) return;

        let group: string | undefined = undefined;
        const uniqueGroups = new Set(filtered.map((o) => o.group ?? "Other"));
        if (uniqueGroups.size === 1) {
            const first = filtered[0];
            group = first?.group;
        }

        const newId = addItem(section, label, group);
        setQuery("");

        setLocal((prev) => {
            const next = [...prev, newId];
            if (onChange) onChange(next);
            return next;
        });
    }

    function handleDelete(id: string) {
        if (window.confirm("Delete this custom prompt?")) {
            deleteItem(section, id);
            setLocal(prev => {
                const next = prev.filter(x => x !== id);
                if (onChange) onChange(next);
                return next;
            });
        }
    }

    function handleEditStart(opt: PromptItem) {
        setEditingId(opt.id);
        setEditValue(opt.label);
    }

    function handleEditSave() {
        if (!editingId) return;
        const val = editValue.trim();
        if (val) {
            updateItem(section, editingId, { label: val });
        }
        setEditingId(null);
    }

    function handleDragEnd(event: DragEndEvent, groupItems: PromptItem[]) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const groupIds = groupItems.map(i => i.id);
            const oldIndex = groupIds.indexOf(active.id as string);
            const newIndex = groupIds.indexOf(over.id as string);

            const newOrderIds = arrayMove(groupIds, oldIndex, newIndex);
            reorderGroupItems(section, newOrderIds);
        }
    }

    const isSearchActive = query.trim().length > 0;

    return (
        <div className="flex flex-col h-full w-full">
            {/* Search Bar Segment */}
            <div className="px-1 pb-4">
                <div className="relative group flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-4 group-focus-within:text-accent-blue transition-colors">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddFromQuery();
                            }
                        }}
                        placeholder="Search limits, add missing prompts..."
                        className="w-full rounded-2xl border border-dark-3 bg-dark-2 pl-10 pr-4 py-2.5 text-sm text-light-1 outline-none placeholder:text-dark-5 focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 transition-all shadow-sm"
                    />
                    {isSearchActive && (
                        <button
                            onClick={handleAddFromQuery}
                            disabled={!query.trim()}
                            className="absolute inset-y-1.5 right-1.5 rounded-xl bg-accent-blue text-white px-3 py-1 text-xs font-medium hover:bg-accent-blue-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-white flex items-center gap-1"
                            title="Add as new option"
                        >
                            <Plus className="w-3 h-3" /> Add String
                        </button>
                    )}
                </div>
            </div>

            {/* List Segment */}
            <div className="flex-1 w-full space-y-8 text-left h-full">
                {byGroup.map(([group, items]) => {
                    const groupIds = items.map((i) => i.id);
                    const everySelected = groupIds.every((id) => local.includes(id));
                    return (
                        <div key={group} className="text-left">
                            <div className="mb-2.5 flex items-center justify-between text-left px-1">
                                <h3 className="text-xs font-semibold text-light-4 uppercase tracking-wider">{group}</h3>
                                <button
                                    onClick={() => {
                                        setLocal((prev) => {
                                            const next = everySelected
                                                ? prev.filter((x) => !groupIds.includes(x))
                                                : [...new Set([...prev, ...groupIds])];
                                            if (onChange) onChange(next);
                                            return next;
                                        });
                                    }}
                                    className="text-xs text-dark-4 hover:text-accent-blue hover:underline transition-colors"
                                >
                                    {everySelected ? "Deselect Group" : "Select Group"}
                                </button>
                            </div>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => handleDragEnd(e, items)}
                            >
                                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-left">
                                    <SortableContext items={groupIds} strategy={rectSortingStrategy}>
                                        {items.map((opt) => (
                                            <SortablePickerItem
                                                key={opt.id}
                                                opt={opt}
                                                active={isSelected(opt.id)}
                                                editingId={editingId}
                                                editValue={editValue}
                                                setEditValue={setEditValue}
                                                handleEditSave={handleEditSave}
                                                setEditingId={setEditingId}
                                                toggle={toggle}
                                                moveItem={moveItem}
                                                section={section}
                                                handleEditStart={handleEditStart}
                                                handleDelete={handleDelete}
                                                isSearchActive={isSearchActive}
                                                hideControls={hideControls}
                                            />
                                        ))}
                                    </SortableContext>
                                </ul>
                            </DndContext>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-10 px-4 text-dark-5 rounded-2xl border border-dashed border-dark-4">
                        <p>No prompts found.</p>
                        {isSearchActive && (
                            <p className="mt-1">Press <kbd className="bg-dark-3 px-1.5 py-0.5 rounded text-[10px] text-light-4">Enter</kbd> to add "{query}" to the library.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
