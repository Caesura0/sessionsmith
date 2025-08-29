// src/utils/noteFormat.ts
import type { NoteData } from "../components/PrintableNote";

/** Simple HTML escape for user text inserted into HTML templates */
function esc(s: string) {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Convert string[] to <ul><li>… */
function listHtml(items?: string[]) {
  if (!items || items.length === 0) return "<p>–</p>";
  return `<ul>${items.map(li => `<li>${esc(li)}</li>`).join("")}</ul>`;
}

/** Join list items for plain text */
function listText(items?: string[]) {
  if (!items || items.length === 0) return "–";
  return items.map(li => `- ${li}`).join("\n");
}

/** Generates HTML that pastes cleanly into Word/Docs/Email */
export function buildNoteHTML(d: NoteData): string {
  const dateStr = d.nextSessionISO || "";
  return `<!doctype html>
<html><head><meta charset="utf-8"></head><body>
  <div style="font-family: system-ui,Segoe UI,Roboto,Arial; line-height:1.45; color:#000;">
    <h1 style="font-size:14pt; margin:0 0 8pt 0;">Notes</h1>

    <p>The client attended the scheduled session on by ${esc(d.mode)}. The session lasted approximately ${d.durationMinutes} minutes.</p>

    <p><strong>The client provided an update on the events since last session:</strong></p>
    <p>${esc(d.clientUpdate).replace(/\n/g,"<br>") || "&nbsp;"}</p>

    <p><strong>Significant themes within the session focused on:</strong></p>
    <p>${esc(d.themes).replace(/\n/g,"<br>") || "&nbsp;"}</p>

    <p><strong>Interventions included:</strong></p>
    ${listHtml(d.interventions)}

    <p><strong>Observations/Client Response:</strong></p>
    ${listHtml(d.observations)}

    <p><strong>Plan:</strong></p>
    <p>${esc(d.plan).replace(/\n/g,"<br>") || "&nbsp;"}</p>

    <p><strong>The next session was booked for:</strong></p>
    <p>Date of next session - ${esc(dateStr)}</p>
  </div>
</body></html>`;
}

/** Plain-text fallback (for older browsers / permissions) */
export function buildNotePlainText(d: NoteData): string {
  const dateStr = d.nextSessionISO || "";
  return [
    "Notes",
    `The client attended the scheduled session on by ${d.mode}. The session lasted approximately ${d.durationMinutes} minutes.`,
    "The client provided an update on the events since last session:",
    d.clientUpdate || "",
    "Significant themes within the session focused on:",
    d.themes || "",
    "Interventions included:",
    listText(d.interventions),
    "Observations/Client Response:",
    listText(d.observations),
    "Plan:",
    d.plan || "",
    "The next session was booked for:",
    `Date of next session - ${dateStr}`
  ].join("\n");
}
