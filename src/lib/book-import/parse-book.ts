import { load } from "cheerio";
import { isTag, type Element as DomElement } from "domhandler";
import { marked } from "marked";
import mammoth from "mammoth";

export type ParsedChapter = {
  title: string;
  html: string;
};

export type ParsedBook = {
  title: string;
  description: string | null;
  chapters: ParsedChapter[];
};

type HeadingTag = "h1" | "h2" | "h3";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphsToHtml(text: string): string {
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return "<p></p>";

  return paragraphs
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function isChapterTitle(text: string): boolean {
  const value = text
    .trim()
    .replace(/^[\s"'“”‘’«»\[\(\-–—]+/u, "")
    .replace(/[\s"'“”‘’»\]\)\.,:;]+$/u, "");

  if (!value || value.length > 100) return false;

  return /^(chapter|ch\.|prologue|epilogue)\b/i.test(value);
}

function chooseHeadingTag($: ReturnType<typeof load>): HeadingTag | null {
  const h1 = $("h1").length;
  const h2 = $("h2").length;
  const h3 = $("h3").length;

  if (h2 >= 2) return "h2";
  if (h1 >= 2) return "h1";
  if (h3 >= 2) return "h3";

  return null;
}

function getBodyChildren($: ReturnType<typeof load>): DomElement[] {
  const body = $("body");
  const nodes = body.length ? body.children() : $.root().children();
  return nodes.toArray().filter((node): node is DomElement => isTag(node));
}

function splitHtmlByHeadingTags(
  html: string,
  fallbackTitle: string
): ParsedBook | null {
  const $ = load(html);
  $("script, style").remove();

  const tag = chooseHeadingTag($);
  if (!tag) return null;

  const chapters: ParsedChapter[] = [];
  const headings = $(tag).toArray();

  for (const heading of headings) {
    const title = $(heading).text().trim() || `Chapter ${chapters.length + 1}`;
    const parts: string[] = [];

    let node = $(heading).next();

    while (node.length) {
      const nodeTag = String(node.prop("tagName") ?? "").toLowerCase();

      if (nodeTag === tag) break;

      parts.push($.html(node));
      node = node.next();
    }

    chapters.push({
      title,
      html: parts.join("").trim() || "<p></p>",
    });
  }

  if (chapters.length < 2) return null;

  return {
    title: fallbackTitle,
    description: null,
    chapters,
  };
}

function splitHtmlByChapterParagraphs(
  html: string,
  fallbackTitle: string
): ParsedBook | null {
  const $ = load(html);
  $("script, style").remove();

  const children = getBodyChildren($);

  const chapters: ParsedChapter[] = [];
  let currentTitle = "Chapter 1";
  let currentHtml: string[] = [];

  function flushChapter() {
    chapters.push({
      title: currentTitle,
      html: currentHtml.join("").trim() || "<p></p>",
    });

    currentHtml = [];
  }

  for (const child of children) {
    const tag = child.name.toLowerCase();

    if (tag === "p") {
      const text = $(child).text().replace(/\s+/g, " ").trim();

      if (isChapterTitle(text)) {
        if (currentHtml.length > 0 || chapters.length > 0) {
          flushChapter();
        }

        currentTitle = text;
        continue;
      }
    }

    currentHtml.push($.html(child));
  }

  flushChapter();

  if (chapters.length < 2) return null;

  return {
    title: fallbackTitle,
    description: null,
    chapters,
  };
}

function parseHtmlBook(html: string, fallbackTitle: string): ParsedBook {
  const fromHeadings = splitHtmlByHeadingTags(html, fallbackTitle);
  if (fromHeadings) return fromHeadings;

  const fromChapterParagraphs = splitHtmlByChapterParagraphs(
    html,
    fallbackTitle
  );

  if (fromChapterParagraphs) return fromChapterParagraphs;

  const $ = load(html);
  $("script, style").remove();

  const bodyHtml = $("body").length
    ? $("body").html()
    : $.root().children().toString();

  return {
    title: fallbackTitle,
    description: null,
    chapters: [
      {
        title: "Chapter 1",
        html: bodyHtml?.trim() || "<p></p>",
      },
    ],
  };
}

function splitPlainTextByChapterTitles(
  text: string,
  fallbackTitle: string
): ParsedBook | null {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  const chapters: ParsedChapter[] = [];
  let currentTitle = "Chapter 1";
  let currentLines: string[] = [];

  function flushChapter() {
    chapters.push({
      title: currentTitle,
      html: paragraphsToHtml(currentLines.join("\n").trim()),
    });

    currentLines = [];
  }

  for (const line of lines) {
    const cleanLine = line.trim();

    if (isChapterTitle(cleanLine)) {
      if (currentLines.join("").trim() || chapters.length > 0) {
        flushChapter();
      }

      currentTitle = cleanLine;
      continue;
    }

    currentLines.push(line);
  }

  flushChapter();

  if (chapters.length < 2) return null;

  return {
    title: fallbackTitle,
    description: null,
    chapters,
  };
}

export function parsePlainText(
  source: string,
  fallbackTitle: string
): ParsedBook {
  const text = source.replace(/^\uFEFF/, "");

  const splitBook = splitPlainTextByChapterTitles(text, fallbackTitle);
  if (splitBook) return splitBook;

  return {
    title: fallbackTitle,
    description: null,
    chapters: [
      {
        title: "Chapter 1",
        html: paragraphsToHtml(text),
      },
    ],
  };
}

function mdToHtml(markdown: string): string {
  return marked.parse(markdown.trim() || "<p></p>", {
    async: false,
  });
}

export function parseMarkdown(
  source: string,
  fallbackTitle: string
): ParsedBook {
  let text = source.replace(/^\uFEFF/, "").trim();
  let title = fallbackTitle;
  let description: string | null = null;

  const titleMatch = text.match(/^#\s+([^\n]+)\n*/);

  if (titleMatch) {
    title = titleMatch[1].trim();
    text = text.slice(titleMatch[0].length);
  }

  const parts = text.split(/\n(?=##\s+)/);

  let chapterParts = parts;

  if (parts[0] && !parts[0].trimStart().startsWith("##")) {
    description = parts[0].trim() || null;
    chapterParts = parts.slice(1);
  }

  const chapters: ParsedChapter[] = chapterParts
    .map((part) => {
      const match = part.match(/^##\s+([^\n]+)(?:\n([\s\S]*))?$/);
      if (!match) return null;

      return {
        title: match[1].trim(),
        html: mdToHtml(match[2] ?? ""),
      };
    })
    .filter((chapter): chapter is ParsedChapter => chapter !== null);

  if (chapters.length === 0) {
    return {
      title,
      description: null,
      chapters: [
        {
          title: "Chapter 1",
          html: mdToHtml(text),
        },
      ],
    };
  }

  return {
    title,
    description,
    chapters,
  };
}

export async function parseDocxToBook(
  buffer: Buffer,
  fallbackTitle: string
): Promise<ParsedBook> {
  const result = await mammoth.convertToHtml(
    { buffer },
    {
      ignoreEmptyParagraphs: true,
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
      ],
    }
  );

  return parseHtmlBook(result.value, fallbackTitle);
}

export async function parseBookFromBuffer(
  buffer: Buffer,
  filename: string,
  opts?: { title?: string }
): Promise<ParsedBook> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";

  const fallbackTitle =
    opts?.title?.trim() ||
    filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .trim() ||
    "Imported book";

  if (ext === "docx") {
    return parseDocxToBook(buffer, fallbackTitle);
  }

  const text = buffer.toString("utf8");

  if (ext === "md" || ext === "markdown") {
    return parseMarkdown(text, fallbackTitle);
  }

  if (ext === "html" || ext === "htm") {
    return parseHtmlBook(text, fallbackTitle);
  }

  if (ext === "txt") {
    return parsePlainText(text, fallbackTitle);
  }

  throw new Error(`Unsupported file type: .${ext || "unknown"}`);
}
