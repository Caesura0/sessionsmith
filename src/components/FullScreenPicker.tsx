import { useEffect, useMemo, useState } from "react";
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
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { usePromptLibrary } from "../hooks/usePromptLibrary";
import type { PromptSectionKey, PromptItem } from "../../dataDictionary";

const cx = (...p: Array<string | false | null | undefined>) => p.filter(Boolean).join(" ");

type Props = {
  title: string;
  section: PromptSectionKey;
  selected: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
};

function SortablePickerItem({
  opt, active, editingId, editValue, setEditValue, handleEditSave, setEditingId,
  toggle, moveItem, section, handleEditStart, handleDelete, isSearchActive
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
    <li ref={setNodeRef} style={style} className={cx("relative group text-left", isDragging && "shadow-xl rounded-2xl")}>
      {editingId === opt.id ? (
        <div className="w-full rounded-2xl border border-blue-500 bg-white px-4 py-3 flex gap-2 items-center">
          <input
            autoFocus
            type="text"
            className="flex-1 bg-transparent text-sm text-black outline-none"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEditSave();
              if (e.key === "Escape") setEditingId(null);
            }}
            onBlur={handleEditSave}
          />
          <div className="text-xs text-gray-400">Enter to save</div>
        </div>
      ) : (
        <div className={cx(
          "w-full flex items-stretch justify-between rounded-2xl border transition overflow-hidden text-left",
          active
            ? "border-black bg-black text-white"
            : "border-gray-300 bg-white hover:bg-gray-50 text-black",
        )}>
          {!isSearchActive && (
            <div
              {...attributes}
              {...listeners}
              className="flex items-center pl-3 pr-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
              title="Drag to reorder"
            >
              ⋮⋮
            </div>
          )}
          <button
            type="button"
            onClick={() => toggle(opt.id)}
            aria-pressed={active}
            className={cx(
              "flex-1 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-black",
              isSearchActive ? "px-4" : "pr-4 pl-1"
            )}
          >
            <div className="text-sm font-medium">{opt.label}</div>
            {opt.description && (
              <div className="mt-0.5 text-xs opacity-70">{opt.description}</div>
            )}
          </button>
          <div className="hidden group-hover:flex items-center space-x-1 pr-3 pl-2">
            {!isSearchActive && (
              <>
                <button onClick={(e) => { e.stopPropagation(); moveItem(section, opt.id, "up", true); }} className="p-1 hover:bg-gray-300/50 rounded flex items-center justify-center w-7 h-7" title="Move up">↑</button>
                <button onClick={(e) => { e.stopPropagation(); moveItem(section, opt.id, "down", true); }} className="p-1 hover:bg-gray-300/50 rounded flex items-center justify-center w-7 h-7" title="Move down">↓</button>
              </>
            )}
            <button onClick={(e) => { e.stopPropagation(); handleEditStart(opt); }} className="p-1 hover:bg-gray-300/50 rounded flex items-center justify-center w-7 h-7" title="Edit">✎</button>
            {opt.isCustom && (
              <button onClick={(e) => { e.stopPropagation(); handleDelete(opt.id); }} className="p-1 hover:bg-gray-300/50 rounded flex items-center justify-center w-7 h-7 text-red-500 hover:text-red-700" title="Delete">✕</button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

export function FullScreenPicker({
  title,
  section,
  selected,
  onSave,
  onClose,
}: Props) {
  useLockBodyScroll(true);

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
    setLocal(prev => prev.filter(id => validIds.has(id)));
  }, [allOptions]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editingId) {
        if (e.key === "Escape") setEditingId(null);
        return;
      }

      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setLocal(allOptions.map((o) => o.id));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, allOptions, editingId]);

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
  const toggle = (id: string) =>
    setLocal((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

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
    setLocal((prev) => [...prev, newId]);
  }

  function handleDelete(id: string) {
    if (window.confirm("Delete this custom prompt?")) {
      deleteItem(section, id);
      setLocal(prev => prev.filter(x => x !== id));
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
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 text-white text-left">
      <div className="sticky top-0 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="flex max-w-5xl items-center gap-2 px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
            aria-label="Close"
          >
            Close
          </button>
          <h2 className="ml-2 flex-1 text-lg font-semibold">{title}</h2>
          <div className="text-sm text-white/70">{local.length} selected</div>
          <button
            onClick={() => setLocal([])}
            className="rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10"
          >
            Clear
          </button>
          <button
            onClick={() => onSave(local)}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Done
          </button>
        </div>

        <div className="max-w-5xl px-4 pb-3">
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type to add…"
              className="flex-1 rounded-2xl border border-white/20 bg-white/95 px-4 py-2.5 text-sm text-black outline-none placeholder:text-gray-500 focus:border-gray-400"
            />
            <button
              onClick={handleAddFromQuery}
              disabled={!query.trim()}
              className="rounded-xl border border-white/20 px-3 py-2 text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
              title="Add the typed text as a new option"
            >
              + Add
            </button>
          </div>
          <div className="mt-2 text-xs text-white/70">Results: {filtered.length}</div>
        </div>
      </div>

      <div className="w-full max-w-5xl flex-1 overflow-auto px-4 py-6 bg-white text-black">
        <div className="space-y-8 text-left">
          {byGroup.map(([group, items]) => {
            const groupIds = items.map((i) => i.id);
            const everySelected = groupIds.every((id) => local.includes(id));
            return (
              <div key={group} className="text-left">
                <div className="mb-2 flex items-center justify-between text-left">
                  <h3 className="text-sm font-semibold text-gray-800 text-left">{group}</h3>
                  <button
                    onClick={() =>
                      setLocal((prev) =>
                        everySelected
                          ? prev.filter((x) => !groupIds.includes(x))
                          : [...new Set([...prev, ...groupIds])]
                      )
                    }
                    className="text-xs text-gray-600 hover:underline"
                  >
                    Toggle group
                  </button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, items)}
                >
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
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
                        />
                      ))}
                    </SortableContext>
                  </ul>
                </DndContext>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
