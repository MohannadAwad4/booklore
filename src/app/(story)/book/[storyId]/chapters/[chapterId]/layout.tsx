import { ChaptersRouteProvider } from "../chapters-route-context";

/** Nests over `chapters/layout` so `chapterId` is set for this subtree only. */
export default async function ChapterIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storyId: string; chapterId: string }>;
}) {
  const { storyId, chapterId } = await params;
  return (
    <ChaptersRouteProvider storyId={storyId} chapterId={chapterId}>
      {children}
    </ChaptersRouteProvider>
  );
}
