interface AddTagsProps {
  limit?: number;
  placeholder?: string;
  tags: string[];
  setTags: (tags: string[]) => void;
}

export default function AddTags({
  limit = 25,
  placeholder = "Type a tag and press Enter…",
  tags,
  setTags,
}: AddTagsProps) {
  const seen = new Set(tags);

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (tags.length >= limit) return;
    const word = e.currentTarget.value.trim();
    if (!word || seen.has(word)) return;
    seen.add(word);
    setTags([...tags, word]);
    e.currentTarget.value = "";
  }

  function removeTag(index: number) {
    setTags(tags.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-lg border border-border bg-background p-2">
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag, index) => (
          <span
            key={`${tag}:${index}`}
            className="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-sm text-foreground"
          >
            <span className="truncate">{tag}</span>
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={() => removeTag(index)}
              className="shrink-0 rounded px-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          disabled={tags.length >= limit}
          placeholder={tags.length >= limit ? `Limit reached` : placeholder}
          onKeyDown={addTag}
          className="min-w-[10rem] flex-1 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-border focus:bg-muted/40"
          aria-label="Add tag"
        />
      </div>
    </div>
  );
}
