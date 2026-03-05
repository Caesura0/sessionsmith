import { useState, useEffect } from "react";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import type { PromptSectionKey } from "../../dataDictionary";
import { PromptList } from "./PromptList";

type Props = {
  title: string;
  section: PromptSectionKey;
  selected: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
};

export function FullScreenPicker({
  title,
  section,
  selected,
  onSave,
  onClose,
}: Props) {
  useLockBodyScroll(true);

  const [local, setLocal] = useState<string[]>(selected);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // PromptList internal editing uses Escape, so only close if we aren't editing. 
      // But Since PromptList handles its own Escape, it stops propagation. 
      // If we made it here, no input stopped it.
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-dark-1/95 backdrop-blur-xl text-light-1 text-left animate-in fade-in duration-300">
      <div className="sticky top-0 border-b border-border-subtle bg-dark-3/80 backdrop-blur z-20">
        <div className="flex max-w-5xl items-center gap-2 px-4 py-3 sm:px-6">
          <button
            onClick={onClose}
            className="rounded-xl border border-border-subtle bg-dark-4/50 px-4 py-2 text-sm text-light-4 hover:bg-dark-4 hover:text-light-1 transition-colors"
            aria-label="Close"
          >
            Cancel
          </button>
          <h2 className="ml-2 flex-1 text-lg font-bold tracking-tight">{title}</h2>
          <div className="text-sm font-medium text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-full hidden sm:block">
            {local.length} selected
          </div>
          <button
            onClick={() => setLocal([])}
            className="rounded-xl px-4 py-2 text-sm text-light-4 hover:text-light-1 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => onSave(local)}
            className="rounded-xl bg-accent-blue px-5 py-2 text-sm font-semibold text-white hover:bg-accent-blue-hover shadow-[var(--shadow-glow)] transition-all"
          >
            Done
          </button>
        </div>
      </div>

      <div className="w-full max-w-5xl flex-1 overflow-auto px-4 sm:px-6 py-6 mx-auto">
        <PromptList
          section={section}
          selected={local}
          onChange={setLocal}
        />
      </div>
    </div>
  );
}
