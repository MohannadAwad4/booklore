/** Only used by `prisma/seed.ts`. At runtime, load genres with `prisma.genre.findMany`. */
export const DEFAULT_GENRES = [
  { name: "Fantasy", slug: "fantasy" },
  { name: "Science Fiction", slug: "science-fiction" },
  { name: "Romance", slug: "romance" },
  { name: "Mystery", slug: "mystery" },
  { name: "Thriller", slug: "thriller" },
  { name: "Horror", slug: "horror" },
  { name: "Historical Fiction", slug: "historical-fiction" },
  { name: "Literary Fiction", slug: "literary-fiction" },
  { name: "Young Adult", slug: "young-adult" },
  { name: "Adventure", slug: "adventure" },
  { name: "Contemporary Fiction", slug: "contemporary-fiction" },
  { name: "Poetry", slug: "poetry" },
  { name: "Drama", slug: "drama" },
  { name: "Comedy", slug: "comedy" },
  { name: "Slice of Life", slug: "slice-of-life" },
  { name: "Kids", slug: "kids" },
  { name: "Supernatural", slug: "supernatural" },
] as const;

export const GENRE_LABEL_TO_SLUG = Object.fromEntries(
  DEFAULT_GENRES.map((genre) => [genre.name, genre.slug]),
) as Record<string, string>;

export type DefaultGenreName = (typeof DEFAULT_GENRES)[number]["name"];

export type GenreSlug = (typeof GENRE_LABEL_TO_SLUG)[keyof typeof GENRE_LABEL_TO_SLUG];