import { prisma } from "@/lib/prisma";

/** System account for imported Project Gutenberg classics. Created on first classic import if absent. */
export const PUBLIC_BOOKS_USERNAME = "public_books" as const;

const DEFAULT_EMAIL = "public_books@books.chapterhouse";

/**
 * Returns the `public_books` user id, creating that row if needed (no manual seed required for classics).
 */
export async function getPublicBooksAuthorId(): Promise<string> {
  const email = process.env.PUBLIC_BOOKS_EMAIL?.trim() || DEFAULT_EMAIL;
  const displayName =
    process.env.PUBLIC_BOOKS_DISPLAY_NAME?.trim() || "Public domain classics";

  const user = await prisma.user.upsert({
    where: { username: PUBLIC_BOOKS_USERNAME },
    update: {},
    create: {
      email,
      username: PUBLIC_BOOKS_USERNAME,
      passwordHash: null,
      displayName,
      bio: "Imported Project Gutenberg works. Not a login account.",
    },
    select: { id: true },
  });
  return user.id;
}
