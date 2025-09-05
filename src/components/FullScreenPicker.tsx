/**
 * FullScreenPicker (card-select + creatable via search)
 * - Click ANYWHERE on a card to toggle selection
 * - "Add" button next to search adds the typed query as a new option
 * - New options persist via localStorage and are auto-selected
 */

import { useEffect, useMemo, useState } from "react";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Option } from "../types/options";

// tiny className joiner
const cx = (...p: Array<string | false | null | undefined>) => p.filter(Boolean).join(" ");

// create a slug id from a label
function slugify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

type Props = {
  title: string;
  options: Option[];
  selected: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
  /** storage namespace for custom options (e.g., "observations", "interventions") */
  storageKey?: string;
};

export function FullScreenPicker({
  title,
  options,
  selected,
  onSave,
  onClose,
  storageKey,
}: Props) {
  useLockBodyScroll(true);

  // persistent custom options for this picker
  const key = `custom-options:${storageKey ?? slugify(title)}`;
  const [customOpts, setCustomOpts] = useLocalStorage<Option[]>(key, []);

  // combined options
  const [allOptions, setAllOptions] = useState<Option[]>(() => [...options, ...customOpts]);
  useEffect(() => setAllOptions([...options, ...customOpts]), [options, customOpts]);

  // selection + search
  const [local, setLocal] = useState<string[]>(selected);
  const [query, setQuery] = useState("");

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setLocal(allOptions.map((o) => o.id));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, allOptions]);

  // filter options by query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allOptions;
    return allOptions.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.group?.toLowerCase().includes(q) ?? false)
    );
  }, [query, allOptions]);

  // group filtered options
  const byGroup = useMemo(() => {
    const map = new Map<string, Option[]>();
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

  // add a new option from the current query; infer group if all results share one
  function addFromQuery() {
    const label = query.trim();
    if (!label) return;

    // infer a group if exactly one group is visible in the filtered view
    let group: string | undefined = undefined;
    const uniqueGroups = new Set(filtered.map((o) => o.group ?? "Other"));
    if (uniqueGroups.size === 1) {
      const first = filtered[0];
      group = first?.group; // may still be undefined -> fine
    }

    addOption(label, group);
    setQuery(""); // clear search after adding
  }

  function addOption(label: string, group?: string) {
    const base = slugify(label) || "item";
    const existing = new Set(allOptions.map((o) => o.id));
    let id = base;
    let n = 2;
    while (existing.has(id)) id = `${base}-${n++}`;

    const opt: Option = { id, label, group };
    setCustomOpts((prev) => [...prev, opt]);   // persist
    setAllOptions((prev) => [...prev, opt]);   // local list
    setLocal((prev) => [...prev, id]);         // auto-select
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 text-white">
      {/* Header / Actions */}
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

        {/* Search + Add */}
        <div className="max-w-5xl px-4 pb-3">
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type to add…"
              className="flex-1 rounded-2xl border border-white/20 bg-white/95 px-4 py-2.5 text-sm text-black outline-none placeholder:text-gray-500 focus:border-gray-400"
            />
            <button
              onClick={addFromQuery}
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

      {/* Content */}
      <div className="w-full max-w-5xl flex-1 overflow-auto px-4 py-6 bg-white text-black">
        <div className="space-y-8">
          {byGroup.map(([group, items]) => {
            const groupIds = items.map((i) => i.id);
            const everySelected = groupIds.every((id) => local.includes(id));
            return (
              <div key={group}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">{group}</h3>
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

                {/* 1 col on mobile, 2 cols on sm+ */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map((opt) => {
                    const active = isSelected(opt.id);
                    return (
                      <li key={opt.id}>
                        <button
                          type="button"
                          onClick={() => toggle(opt.id)}
                          aria-pressed={active}
                          className={cx(
                            "w-full select-none rounded-2xl border px-4 py-3 text-left transition",
                            active
                              ? "border-black bg-black text-white"
                              : "border-gray-300 bg-white hover:bg-gray-50 text-black",
                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
                          )}
                          data-selected={active || undefined}
                        >
                          <div className="text-sm font-medium">{opt.label}</div>
                          {opt.description && (
                            <div className="mt-0.5 text-xs text-gray-500">{opt.description}</div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
