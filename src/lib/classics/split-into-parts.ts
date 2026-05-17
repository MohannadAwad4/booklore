const DEFAULT_MAX_PART_CHARS = 80_000;

/**
 * Split long plain text into ordered parts, preferring paragraph boundaries
 * (`\n\n`) so each part stays under `maxPartChars` when possible.
 */
export function splitPlainTextIntoParts(
  text: string,
  maxPartChars: number = DEFAULT_MAX_PART_CHARS
): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n{2,}/);
  const parts: string[] = [];
  let current = "";

  const flush = () => {
    const t = current.trim();
    if (t) parts.push(t);
    current = "";
  };

  for (const p of paragraphs) {
    const chunk = p.trim();
    if (!chunk) continue;

    if (chunk.length > maxPartChars) {
      flush();
      for (let i = 0; i < chunk.length; i += maxPartChars) {
        parts.push(chunk.slice(i, i + maxPartChars).trim());
      }
      continue;
    }

    const candidate = current ? `${current}\n\n${chunk}` : chunk;
    if (candidate.length <= maxPartChars) {
      current = candidate;
    } else {
      flush();
      current = chunk;
    }
  }
  flush();
  return parts.length > 0 ? parts : [normalized];
}
