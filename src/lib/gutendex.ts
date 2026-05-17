import { BRAND_NAME } from "@/components/brand-wordmark";

/** Gutendex / Project Gutenberg mirror API — https://gutendex.com/ */

const GUTENDEX_USER_AGENT = `Mozilla/5.0 (compatible; ${BRAND_NAME}Classics/1.0)`;

export type GutendexAuthor = {
  name: string;
  birth_year?: number;
  death_year?: number;
};

export type GutendexClassicBook = {
  id: number;
  title: string;
  authors: GutendexAuthor[];
  translators?: GutendexAuthor[];
  subjects?: string[];
  bookshelves?: string[];
  languages?: string[];
  summaries?: string[];
  media_type?: string;
  download_count: number;
  formats?: Record<string, string>;
};

export function pickCoverUrl(formats?: Record<string, string>): string | null {
  if (!formats) return null;
  for (const key of ["image/jpeg", "image/jpg", "image/png"] as const) {
    const url = formats[key];
    if (typeof url === "string" && /^https?:\/\//i.test(url)) return url;
  }
  for (const [mime, url] of Object.entries(formats)) {
    if (
      mime.startsWith("image/") &&
      typeof url === "string" &&
      /^https?:\/\//i.test(url)
    ) {
      return url;
    }
  }
  return null;
}

export function formatGutendexCount(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

/** Prefer UTF-8 plain text (e.g. `.txt.utf-8`), then generic `text/plain`. */
export function gutendexPlainTextUrl(
  formats?: Record<string, string>
): string | null {
  if (!formats) return null;
  const utf8 = formats["text/plain; charset=utf-8"];
  if (typeof utf8 === "string" && /^https?:\/\//i.test(utf8)) return utf8;
  const plain = formats["text/plain"];
  if (typeof plain === "string" && /^https?:\/\//i.test(plain)) return plain;
  return null;
}

/** Gutenberg HTML reader URL (often `*.html.images`). */
export function gutendexHtmlUrl(
  formats?: Record<string, string>
): string | null {
  if (!formats) return null;
  const html = formats["text/html"];
  if (typeof html === "string" && /^https?:\/\//i.test(html)) return html;
  return null;
}

const MAX_INLINE_PLAIN_CHARS = 1_200_000;

export async function fetchGutenbergPlainText(url: string): Promise<
  | { ok: true; text: string; truncated: boolean }
  | { ok: false; error: string }
> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": GUTENDEX_USER_AGENT,
      },
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const text = await res.text();
    if (text.length > MAX_INLINE_PLAIN_CHARS) {
      return {
        ok: true,
        text:
          text.slice(0, MAX_INLINE_PLAIN_CHARS) +
          "\n\n[… Text truncated for this page — open Plain text or HTML below for the full work. …]",
        truncated: true,
      };
    }
    return { ok: true, text, truncated: false };
  } catch {
    return { ok: false, error: "Could not load text" };
  }
}

/** Full plain text for server-side import (uncached, no truncation). */
export async function fetchGutenbergPlainTextFull(
  url: string
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": GUTENDEX_USER_AGENT,
      },
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const text = await res.text();
    return { ok: true, text };
  } catch {
    return { ok: false, error: "Could not load text" };
  }
}

export async function fetchGutendexBook(
  id: number
): Promise<GutendexClassicBook | null> {
  try {
    const res = await fetch(`https://gutendex.com/books/${id}/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as GutendexClassicBook;
  } catch {
    return null;
  }
}

/** MIME types we surface as readable / downloadable (order = preference). */
const FORMAT_LABELS: { mime: string; label: string }[] = [
  { mime: "text/html", label: "Read (HTML)" },
  { mime: "application/epub+zip", label: "EPUB" },
  { mime: "application/x-mobipocket-ebook", label: "Kindle (MOBI)" },
  { mime: "text/plain; charset=utf-8", label: "Plain text (UTF-8)" },
  { mime: "text/plain", label: "Plain text" },
  { mime: "application/pdf", label: "PDF" },
];

export function gutendexFormatLinks(
  formats?: Record<string, string>
): { href: string; label: string; mime: string }[] {
  if (!formats) return [];
  const out: { href: string; label: string; mime: string }[] = [];
  const seen = new Set<string>();
  for (const { mime, label } of FORMAT_LABELS) {
    const href = formats[mime];
    if (
      typeof href === "string" &&
      /^https?:\/\//i.test(href) &&
      !seen.has(href)
    ) {
      seen.add(href);
      out.push({ href, label, mime });
    }
  }
  for (const [mime, href] of Object.entries(formats)) {
    if (
      !mime.startsWith("image/") &&
      typeof href === "string" &&
      /^https?:\/\//i.test(href) &&
      !seen.has(href)
    ) {
      seen.add(href);
      out.push({ href, label: mime, mime });
    }
  }
  return out;
}
