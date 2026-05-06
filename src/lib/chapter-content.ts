/**
 * True if stored chapter body has readable text (HTML stripped, whitespace collapsed).
 */
export function chapterHasNonEmptyContent(
  content: string | null | undefined
): boolean {
  if (content == null) return false;
  const text = content
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}
