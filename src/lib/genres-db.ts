import { prisma } from "@/lib/prisma";
import type { GenreListItem } from "@/lib/types";
import { DEFAULT_GENRES } from "@/lib/genres";

/** Prod DBs often skip `prisma db seed` — upsert defaults when the table is empty. */
export async function ensureDefaultGenres(): Promise<void> {
  const count = await prisma.genre.count();
  if (count > 0) return;

  await prisma.$transaction(
    DEFAULT_GENRES.map((genre) =>
      prisma.genre.upsert({
        where: { name: genre.name },
        update: { slug: genre.slug },
        create: { name: genre.name, slug: genre.slug },
      }),
    ),
  );
}

export async function listGenresForPicker(): Promise<GenreListItem[]> {
  await ensureDefaultGenres();
  return prisma.genre.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}
