import { ChaptersRouteProvider } from "./chapters-route-context";

export default async function ChaptersLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  return (
    <ChaptersRouteProvider storyId={storyId} chapterId={null}>
      {children}
    </ChaptersRouteProvider>
  );
}
