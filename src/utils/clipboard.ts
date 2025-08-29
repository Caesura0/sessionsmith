// src/utils/clipboard.ts
import { buildNoteHTML, buildNotePlainText } from "./noteFormat";
import type { NoteData } from "../components/PrintableNote";

/**
 * Copies both HTML and plain text. Word will prefer HTML (keeps bullets, bold).
 * Requires a user gesture (button click) and a secure context (https or localhost).
 */
export async function copyNoteToClipboard(data: NoteData): Promise<void> {
  const html = buildNoteHTML(data);
  const plain = buildNotePlainText(data);

  // Modern path: write rich clipboard item
  if (navigator.clipboard && "write" in navigator.clipboard && window.ClipboardItem) {
    const item = new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plain], { type: "text/plain" }),
    });
    await navigator.clipboard.write([item]);
    return;
  }

  // Fallback (older browsers): copy plain text
  await navigator.clipboard.writeText(plain);
}
