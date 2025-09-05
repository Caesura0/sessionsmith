import { useEffect, useState } from "react";

/**
 * Typed localStorage hook.
 * - Reads once on mount
 * - Writes when value changes
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota/security errors
    }
  }, [key, value]);

  return [value, setValue] as const;
}
