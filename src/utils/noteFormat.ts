// src/utils/noteFormat.ts
import type { NoteData } from "../components/PrintableNote";

function esc(s: string) {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function listHtml(items?: string[]) {
  if (!items || items.length === 0) return "<p style=\"margin-left: 20px;\">–</p>";
  return `<ul style=\"margin-left: 20px; padding-left: 20px;\">${items.map(li => `<li>${esc(li)}</li>`).join("")}</ul>`;
}

function listText(items?: string[]) {
  if (!items || items.length === 0) return "  –";
  return items.map(li => `  - ${li}`).join("\n");
}

export function buildNoteHTML(d: NoteData): string {
  const dateStr = d.nextSessionISO || "Not Documented";

  let fieldsHtml = "";
  for (const field of d.fields) {
    fieldsHtml += `<p><strong>${esc(field.label)}:</strong></p>\n`;
    if (Array.isArray(field.content)) {
      fieldsHtml += listHtml(field.content) + "\n";
    } else {
      const formatted = esc(field.content).replace(/\n/g, "<br>");
      fieldsHtml += `<p style=\"margin-left: 20px;\">${formatted || "&nbsp;"}</p>\n`;
    }
  }

  return `<!doctype html>
<html><head><meta charset="utf-8"></head><body>
  <div style="font-family: system-ui,Segoe UI,Roboto,Arial; line-height:1.45; color:#000;">
    <h1 style="font-size:14pt; margin:0 0 8pt 0;">Session Notes</h1>

    <p>The client attended the scheduled session on by ${esc(d.mode)}. The session lasted approximately ${d.durationMinutes} minutes.</p>

    ${fieldsHtml}

    <p><strong>The next session was booked for:</strong></p>
    <p>Date of next session - ${esc(dateStr)} ${d.nextSessionMode && dateStr !== "Not Documented" ? `(${esc(d.nextSessionMode)})` : ""}</p>
  </div>
</body></html>`;
}

export function buildNotePlainText(d: NoteData): string {
  const dateStr = d.nextSessionISO || "Not Documented";

  const lines = [
    "Session Notes",
    `The client attended the scheduled session on by ${d.mode}. The session lasted approximately ${d.durationMinutes} minutes.`,
    ""
  ];

  for (const field of d.fields) {
    lines.push(`${field.label}:`);
    if (Array.isArray(field.content)) {
      lines.push(listText(field.content));
    } else {
      const indented = field.content.split("\n").map(l => `  ${l}`).join("\n");
      lines.push(indented || "  ");
    }
    lines.push(""); // Spacing
  }

  lines.push("The next session was booked for:");
  lines.push(`Date of next session - ${dateStr} ${d.nextSessionMode && dateStr !== "Not Documented" ? `(${d.nextSessionMode})` : ""}`);

  return lines.join("\n");
}
