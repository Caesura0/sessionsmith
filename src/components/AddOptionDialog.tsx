import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (label: string, group?: string) => void;
  defaultGroup?: string;
};

export function AddOptionDialog({ open, onClose, onSave, defaultGroup }: Props) {
  const [label, setLabel] = useState("");
  const [group, setGroup] = useState(defaultGroup ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setLabel("");
      setGroup(defaultGroup ?? "");
      // focus first field
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, defaultGroup]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 text-black shadow-lg">
        <h3 className="mb-3 text-lg font-semibold">Add option</h3>

        <label className="block text-sm font-medium">Label</label>
        <input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-400"
          placeholder='e.g. "Client noted increased hopefulness"'
        />

        <label className="mt-3 block text-sm font-medium">Group (optional)</label>
        <input
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-400"
          placeholder='e.g. "Therapist Response"'
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!label.trim()) return;
              onSave(label.trim(), group.trim() || undefined);
              onClose();
            }}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
