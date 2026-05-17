import { StoryLanguage } from "@prisma/client";

/** Gutendex `languages` uses ISO 639-like codes (`en`, `fr`, …). */
export function gutendexLanguagesToStoryLanguage(
  langs: string[] | undefined
): StoryLanguage {
  const code = langs?.[0]?.toLowerCase().slice(0, 2) ?? "en";
  const map: Record<string, StoryLanguage> = {
    en: StoryLanguage.ENGLISH,
    fr: StoryLanguage.FRENCH,
    es: StoryLanguage.SPANISH,
    de: StoryLanguage.ENGLISH,
    pt: StoryLanguage.PORTUGUESE,
    ru: StoryLanguage.RUSSIAN,
    it: StoryLanguage.ITALIAN,
    ar: StoryLanguage.ARABIC,
    hi: StoryLanguage.HINDI,
    bn: StoryLanguage.BENGALI,
    ur: StoryLanguage.URDU,
    zh: StoryLanguage.MANDARIN,
    no: StoryLanguage.NORWEGIAN,
    th: StoryLanguage.THAI,
  };
  return map[code] ?? StoryLanguage.ENGLISH;
}
