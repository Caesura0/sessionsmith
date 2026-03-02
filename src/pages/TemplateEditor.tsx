import { useState } from "react";
import { useNoteTemplate } from "../hooks/useNoteTemplate";
import type { TemplateField, TemplateFieldType } from "../../dataDictionary";
import { Plus, GripVertical, Trash2, Edit3, AlignLeft, ListTodo, Eye, EyeOff } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../utils/cn";

function SortableFieldItem({
    field,
    onEdit,
    onRemove,
    onToggleVisibility
}: {
    field: TemplateField;
    onEdit: (id: string, newLabel: string) => void;
    onRemove: (id: string) => void;
    onToggleVisibility: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isFreeText = field.type === "freetext";
    const Icon = isFreeText ? AlignLeft : ListTodo;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center justify-between p-3 mb-2 rounded-xl border transition-colors",
                field.isHidden ? "bg-dark-2/50 border-dark-4 opacity-60" : "bg-dark-3",
                isDragging ? "opacity-50 border-accent-blue z-10 relative" : "hover:border-dark-5"
            )}
        >
            <div className="flex items-center gap-3">
                <button
                    className="p-1 cursor-grab active:cursor-grabbing text-dark-5 hover:text-light-3 transition-colors"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-5 h-5" />
                </button>
                <div className="p-2 rounded-lg bg-dark-4 flex items-center justify-center">
                    {field.isHidden ? (
                        <EyeOff className="w-4 h-4 text-dark-5" />
                    ) : (
                        <Icon className={cn("w-4 h-4", isFreeText ? "text-blue-400" : "text-green-400")} />
                    )}
                </div>
                <div>
                    <div className={cn("text-sm font-medium", field.isHidden ? "text-light-5 line-through decoration-dark-4" : "text-light-2")}>
                        {field.label}
                        {field.isHidden && <span className="ml-2 text-xs text-red-400 font-normal no-underline">Hidden</span>}
                    </div>
                    <div className="text-xs text-light-5 uppercase tracking-wider">{field.type}</div>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-80">
                <button
                    onClick={() => onToggleVisibility(field.id)}
                    className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title={field.isHidden ? "Show Section" : "Hide Section"}
                >
                    {field.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                    onClick={() => {
                        const newLabel = window.prompt("Edit section name:", field.label);
                        if (newLabel && newLabel.trim()) {
                            onEdit(field.id, newLabel.trim());
                        }
                    }}
                    className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Rename"
                >
                    <Edit3 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => {
                        if (window.confirm(`Are you sure you want to remove "${field.label}"? Your notes will no longer show this section.`)) {
                            onRemove(field.id);
                        }
                    }}
                    className="p-1.5 hover:text-red-400 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors cursor-pointer"
                    title="Remove Section"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export function TemplateEditor({
    templateManager
}: {
    templateManager: ReturnType<typeof useNoteTemplate>
}) {
    const { template, addField, updateFieldLabel, removeField, reorderFields, toggleFieldVisibility } = templateManager;
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [newType, setNewType] = useState<TemplateFieldType>("freetext");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = template.fields.findIndex(f => f.id === active.id);
            const newIndex = template.fields.findIndex(f => f.id === over.id);
            const newFields = arrayMove(template.fields, oldIndex, newIndex);
            reorderFields(newFields.map(f => f.id));
        }
    }

    function handleAdd() {
        if (!newLabel.trim()) return;
        addField(newLabel.trim(), newType);
        setNewLabel("");
        setIsAdding(false);
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <section className="rounded-2xl border border-dark-3 bg-dark-2 overflow-hidden shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Active Sections</h2>
                        <p className="text-sm text-light-4 mt-1">Drag to reorder. Changes apply immediately to new and existing notes.</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="rounded-xl bg-accent-blue text-white px-4 py-2 text-sm font-medium hover:bg-accent-blue-hover transition-colors focus:ring-2 focus:ring-accent-blue focus:outline-none flex items-center gap-2"
                        disabled={isAdding}
                    >
                        <Plus className="w-4 h-4" /> Add Section
                    </button>
                </div>

                {isAdding && (
                    <div className="mb-6 p-4 rounded-xl border border-accent-blue/40 bg-accent-blue/5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Section Name (e.g. 'Goals', 'Homework')"
                                className="flex-1 rounded-xl bg-dark-3 border border-dark-4 px-4 py-2.5 text-sm text-white placeholder:text-dark-5 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAdd();
                                    if (e.key === 'Escape') setIsAdding(false);
                                }}
                            />
                            <select
                                value={newType}
                                onChange={(e) => setNewType(e.target.value as TemplateFieldType)}
                                className="rounded-xl bg-dark-3 border border-dark-4 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue cursor-pointer"
                            >
                                <option value="freetext">Free Text Box</option>
                                <option value="prompt-list">Prompt Library List</option>
                            </select>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleAdd}
                                    className="rounded-xl bg-accent-blue text-white px-4 py-2.5 text-sm font-medium hover:bg-accent-blue-hover transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="rounded-xl bg-dark-4 text-light-3 px-4 py-2.5 text-sm font-medium hover:bg-dark-5 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={template.fields.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="flex flex-col">
                            {template.fields.map(field => (
                                <SortableFieldItem
                                    key={field.id}
                                    field={field}
                                    onEdit={updateFieldLabel}
                                    onRemove={removeField}
                                    onToggleVisibility={toggleFieldVisibility}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </section>
        </div>
    );
}
