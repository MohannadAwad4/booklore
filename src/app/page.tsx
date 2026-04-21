import BookFeedPage from "./(story)/book/feed-books/page";

type HomeProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    progress?: string;
    genres?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  return <BookFeedPage searchParams={searchParams} />;
}
