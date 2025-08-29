/**
 * Small className joiner (like clsx)
 * Filters falsy values and joins with spaces.
 */
export function cx(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
  }
  