
import type { Option } from "../types/options";

export function getCustomOptions(storageKey: string): Option[] {
  try {
    const raw = localStorage.getItem(`custom-options:${storageKey}`);
    return raw ? (JSON.parse(raw) as Option[]) : [];
  } catch {
    return [];
  }
}

export function mergedOptions(base: Option[], storageKey: string): Option[] {
  return [...base, ...getCustomOptions(storageKey)];
}
