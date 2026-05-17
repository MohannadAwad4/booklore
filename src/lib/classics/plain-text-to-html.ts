/** Escape text for safe insertion into HTML (paragraphs only). */
export function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Turn plain text blocks into simple `<p>` HTML for `PublishedChapterDisplay`. */
export function plainTextBlocksToHtml(blocks: string[]): string {
  return blocks
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => `<p>${escapeHtmlText(b)}</p>`)
    .join("\n");
}
