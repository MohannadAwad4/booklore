import { load } from "cheerio";
import { marked } from "marked";
import mammoth from "mammoth";

export type ParsedChapter = { title: string; html: string };

export type ParsedBook = {
  title: string;
  description: string | null;
  chapters: ParsedChapter[];
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphsToHtml(text: string): string {
  const paras = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paras.length === 0) return "<p></p>";
  return paras
    .map(
      (p) =>
        `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

/** Split HTML into chapters: each <h1> starts a chapter (title + following siblings until next <h1>). */
export function splitHtmlByH1(html: string, bookTitleFallback: string): ParsedBook {
  const $ = load(html);
  $("script, style").remove();

  const h1s = $("h1");
  if (h1s.length === 0) {
    const inner =
      $("body").length > 0 ? $("body").html() ?? "" : $.root().children().toString();
    const chapterHtml = inner.trim() ? inner : "<p></p>";
    return {
      title: bookTitleFallback,
      description: null,
      chapters: [{ title: "Chapter 1", html: chapterHtml }],
    };
  }

  const chapters: ParsedChapter[] = [];
  h1s.each((i, el) => {
    const title = $(el).text().trim() || `Chapter ${i + 1}`;
    const parts: string[] = [];
    let n = $(el).next();
    while (
      n.length &&
      String(n.prop("tagName") ?? "").toLowerCase() !== "h1"
    ) {
      parts.push($.html(n));
      n = n.next();
    }
    chapters.push({ title, html: parts.join("") || "<p></p>" });
  });

  return {
    title: bookTitleFallback,
    description: null,
    chapters,
  };
}

function mdToHtml(md: string): string {
  return marked.parse(md.trim() || "<p></p>", { async: false });
}

/** Optional `# Book title`, optional preamble, then `## Chapter` blocks. */
export function parseMarkdown(source: string, fallbackTitle: string): ParsedBook {
  let s = source.replace(/^\uFEFF/, "").trim();
  let title = fallbackTitle;
  let description: string | null = null;

  const h1 = s.match(/^#\s+([^\n]+)\n*/);
  if (h1) {
    title = h1[1].trim();
    s = s.slice(h1[0].length);
  }

  const parts = s.split(/\n(?=##\s)/);
  let chapterParts = parts;

  if (parts[0] && !parts[0].trimStart().startsWith("##")) {
    description = parts[0].trim() || null;
    chapterParts = parts.slice(1);
  }

  const chapters: ParsedChapter[] = [];
  for (const part of chapterParts) {
    const m = part.match(/^##\s+([^\n]+)(?:\n([\s\S]*))?$/);
    if (!m) continue;
    chapters.push({
      title: m[1].trim(),
      html: mdToHtml(m[2] ?? ""),
    });
  }

  if (chapters.length === 0) {
    chapters.push({
      title: "Chapter 1",
      html: mdToHtml(s),
    });
    description = null;
  }

  return { title, description, chapters };
}

export function parsePlainText(source: string, bookTitle: string): ParsedBook {
  const text = source.replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
  const blocks = text
    .split(/\n(?=(?:Chapter|CHAPTER|CH\.)\s+[\dIVXLC]+)/i)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length <= 1) {
    return {
      title: bookTitle,
      description: null,
      chapters: [
        {
          title: "Chapter 1",
          html: paragraphsToHtml(blocks[0] ?? text),
        },
      ],
    };
  }

  const chapters: ParsedChapter[] = blocks.map((block, i) => {
    const lines = block.split("\n");
    const first = lines[0]?.trim() ?? "";
    const rest = lines.slice(1).join("\n");
    const stripped = first.replace(
      /^(?:Chapter|CHAPTER|CH\.)\s*[\dIVXLC]+\s*[.:]?\s*/i,
      "",
    );
    const chapterTitle =
      stripped.trim() || first || `Chapter ${i + 1}`;
    return {
      title: chapterTitle,
      html: paragraphsToHtml(rest),
    };
  });

  return { title: bookTitle, description: null, chapters };
}

export async function parseDocxToBook(
  buffer: Buffer,
  fallbackTitle: string,
): Promise<ParsedBook> {
  const { value: html } = await mammoth.convertToHtml({ buffer });
  return splitHtmlByH1(html, fallbackTitle);
}

export async function parseBookFromBuffer(
  buffer: Buffer,
  filename: string,
  opts?: { title?: string },
): Promise<ParsedBook> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const base =
    opts?.title?.trim() ||
    filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim() ||
    "Imported book";

  if (ext === "docx") {
    return parseDocxToBook(buffer, base);
  }

  const text = buffer.toString("utf8");

  if (ext === "md" || ext === "markdown") {
    return parseMarkdown(text, base);
  }

  if (ext === "html" || ext === "htm") {
    return splitHtmlByH1(text, base);
  }

  if (ext === "txt") {
    return parsePlainText(text, base);
  }

  throw new Error(`Unsupported file type: .${ext || "unknown"}`);
}
