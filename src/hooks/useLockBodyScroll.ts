/**
 * useLockBodyScroll(true) -> disables background page scrolling (overflow: hidden)
 * Cleans up on unmount OR when `locked` becomes false.
 * Uses a block-bodied cleanup so it returns void (required by React types).
 */
import { useEffect } from "react";

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    // SSR guard (Vite SSR / tests)
    if (typeof document === "undefined") return;

    const prev = document.body.style.overflow;

    if (locked) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      // Restore previous value; do not return anything from this function.
      document.body.style.overflow = prev;
    };
  }, [locked]);
}
