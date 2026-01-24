import Editor from "@/components/rich-text-editor";
export default async function ChapterEditPage({
  params,
}: {
  params: { storyId: string; chapterId: string };
}) {
  const { storyId, chapterId } = await params;
  if(!storyId || !chapterId) {
    return <div>Invalid story or chapter ID</div>;
  }
  return (
    <div>
      <h1></h1>
      <p>Story ID: {storyId}</p>
      <p>Chapter ID: {chapterId}</p>
      <Editor/>
    </div>
  );
}
