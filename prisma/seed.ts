import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_GENRES } from "../src/lib/genres";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const genre of DEFAULT_GENRES) {
      await prisma.genre.upsert({
        where: { name: genre.name },
        update: {
          slug: genre.slug,
        },
        create: {
          name: genre.name,
          slug: genre.slug,
        },
      });
    }

    console.log(`Seeded ${DEFAULT_GENRES.length} genres.`);

    const publicBooksEmail =
      process.env.PUBLIC_BOOKS_EMAIL?.trim() || "public_books@books.chapterhouse";

    // Optional: classics also auto-create `public_books` on first import via getPublicBooksAuthorId().
    await prisma.user.upsert({
      where: { username: "public_books" },
      update: {
        displayName:
          process.env.PUBLIC_BOOKS_DISPLAY_NAME?.trim() ||
          "Public domain classics",
      },
      create: {
        email: publicBooksEmail,
        username: "public_books",
        passwordHash: null,
        displayName:
          process.env.PUBLIC_BOOKS_DISPLAY_NAME?.trim() ||
          "Public domain classics",
        bio: "Imported Project Gutenberg works. Not a login account.",
      },
    });
    console.log("Ensured system user public_books for Gutenberg imports.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
