/**
 * FullScreenPicker (card-select version)
 * - Click ANYWHERE on a card to toggle selection (no checkbox visuals)
 * - Selected cards are highlighted via background/border
 * - Multi-select preserved
 * - Escape closes; Ctrl/⌘+A selects all visible
 */

import { useEffect, useMemo, useState } from "react";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { cx } from "../utils/cx";
import type { Option } from "../types/options";

type Props = {
  title: string;
  options: Option[];
  selected: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
};

export function FullScreenPicker({ title, options, selected, onSave, onClose }: Props) {
  // Local working copy; parent receives final selection on "Done"
  const [query, setQuery] = useState("");
  const [local, setLocal] = useState<string[]>(selected);

  // Prevent background scroll while overlay is open
  useLockBodyScroll(true);

  // Global shortcuts: Esc closes; Ctrl/⌘+A selects all visible
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setLocal(options.map(o => o.id));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, options]);

  // Text filter: matches label or group (case-insensitive)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      o => o.label.toLowerCase().includes(q) || (o.group?.toLowerCase().includes(q) ?? false)
    );
  }, [query, options]);

  // Group filtered options → [groupName, items[]]
  const byGroup = useMemo(() => {
    const map = new Map<string, Option[]>();
    for (const opt of filtered) {
      const key = opt.group ?? "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(opt);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Utilities
  const isSelected = (id: string) => local.includes(id);
  const toggle = (id: string) =>
    setLocal(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      {/* Header / Actions */}
      <div className="sticky top-0 border-b bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            aria-label="Close"
          >
            Close
          </button>
          <h2 className="ml-2 flex-1 text-lg font-semibold">{title}</h2>
          <div className="text-sm text-gray-600">{local.length} selected</div>
          <button
            onClick={() => setLocal([])}
            className="rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            onClick={() => onSave(local)}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Done
          </button>
        </div>

        {/* Search */}
        <div className="mx-auto max-w-5xl px-4 pb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search options…"
            className="w-full rounded-2xl border bg-white px-4 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
          />
          <div className="mt-2 text-xs text-gray-500">Results: {filtered.length}</div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-5xl flex-1 overflow-auto px-4 py-6  bg-white/90 backdrop-blur">
        <div className="space-y-8">
          {byGroup.map(([group, items]) => {
            const groupIds = items.map(i => i.id);
            const everySelected = groupIds.every(id => local.includes(id));

            return (
              <div key={group}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">{group}</h3>

                  {/* Group toggle: selects all in group if any are missing; otherwise clears group */}
                  <button
                    onClick={() =>
                      setLocal(prev =>
                        everySelected
                          ? prev.filter(x => !groupIds.includes(x))
                          : [...new Set([...prev, ...groupIds])]
                      )
                    }
                    className="text-xs text-gray-600 hover:underline"
                  >
                    Toggle group
                  </button>
                </div>

                {/* Vertical list of full-width cards; clicking the card toggles selection */}
                <ul className="grid grid-cols-2 gap-2">
                  {items.map(opt => {
                    const active = isSelected(opt.id);
                    return (
                      <li key={opt.id}>
                        <button
                          type="button"
                          onClick={() => toggle(opt.id)}
                          aria-pressed={active}             // accessibility hint for toggle buttons
                          className={cx(
                            // full card is the hit target
                            "w-full rounded-2xl border px-4 py-3 text-left transition select-none",
                            // visual states
                            active
                              ? "border-black bg-black text-white"
                              : "border-gray-300 bg-white hover:bg-gray-50 text-black",
                            // focus ring for keyboard users
                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
                          )}
                          // Optional data attribute if you want to style [data-selected=true] in CSS
                          data-selected={active || undefined}
                        >
                          <div className="text-sm font-medium">{opt.label}</div>
                          {opt.description && (
                            <div className="mt-0.5 text-xs text-gray-500">
                              {opt.description}
                            </div>
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
