/**
 * Shared Option type for pickers
 */
export type Option = {
    id: string;        // stable ID to store
    label: string;     // human-readable label
    group?: string;    // optional grouping (e.g., "CBT", "Risk", etc.)
    description?: string; // optional help text
  };
  