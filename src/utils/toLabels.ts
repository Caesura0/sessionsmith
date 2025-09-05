// src/utils/toLabels.ts
import type { Option } from "../types/options";

export function toLabels(ids: string[], src: Option[]): string[] {
  const map = new Map(src.map(o => [o.id, o.label] as const));
  return ids
    .map(id => map.get(id) ?? undefined)
    .filter((x): x is string => x != null);
}
