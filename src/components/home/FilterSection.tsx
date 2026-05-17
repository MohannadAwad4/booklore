"use client";
import { Children, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { StoryCategory, StoryProgress } from "@prisma/client";
import type { GenreListItem } from "@/lib/types";
import { categoryOptions, progressOptions } from "@/lib/options";
import Select, {
  MultiValue,
  components,
  type StylesConfig,
  type ValueContainerProps,
} from "react-select";
import type { GroupBase } from "react-select";

type GenreOption = { value: string; label: string };

type CategoryOption = (typeof categoryOptions)[number];
type ProgressOption = (typeof progressOptions)[number];

function createThemedFilterSelectStyles<
  Option,
  IsMulti extends boolean,
>(): StylesConfig<Option, IsMulti, GroupBase<Option>> {
  return {
    control: (base, state) => ({
      ...base,
      fontFamily: "var(--font-sans)",
      fontSize: "14px",
      minHeight: 36,
      height: 36,
      borderRadius: "var(--radius-lg)",
      backgroundColor: "var(--background)",
      borderColor: state.isFocused ? "var(--ring)" : "var(--border)",
      boxShadow: state.isFocused ? "0 0 0 1px var(--ring)" : "none",
      "&:hover": { borderColor: "var(--ring)" },
    }),
    valueContainer: (base) => ({
      ...base,
      paddingTop: 0,
      paddingBottom: 0,
      height: 34,
      maxHeight: 34,
      alignItems: "center",
    }),
    menu: (base) => ({
      ...base,
      fontFamily: "var(--font-sans)",
      fontSize: "14px",
      backgroundColor: "var(--popover)",
      zIndex: 50,
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
    }),
    menuList: (base) => ({
      ...base,
      backgroundColor: "var(--popover)",
      paddingTop: 4,
      paddingBottom: 4,
    }),
    option: (base, state) => {
      const selected = state.isSelected;
      return {
        ...base,
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        backgroundColor: selected
          ? "var(--select-option-selected-bg)"
          : state.isFocused
            ? "var(--accent)"
            : "transparent",
        color: selected
          ? "var(--select-option-selected-fg)"
          : "var(--popover-foreground)",
        // Inset ring: same box as unselected rows (no margin/border layout shift).
        boxShadow: selected ? "inset 0 0 0 1px var(--ring)" : base.boxShadow,
        ":active": {
          backgroundColor: selected
            ? "var(--select-option-selected-bg)"
            : "var(--accent)",
        },
      };
    },
    singleValue: (base) => ({
      ...base,
      color: "var(--foreground)",
    }),
    input: (base) => ({
      ...base,
      color: "var(--foreground)",
    }),
    placeholder: (base) => ({
      ...base,
      color: "var(--muted-foreground)",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: 34,
      color: "var(--muted-foreground)",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "var(--muted-foreground)",
      ":hover": { color: "var(--foreground)" },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "var(--muted-foreground)",
      ":hover": { color: "var(--foreground)" },
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "var(--border)",
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: "var(--muted-foreground)",
    }),
  };
}

function GenreValueContainer(
  props: ValueContainerProps<GenreOption, true, GroupBase<GenreOption>>
) {
  const { children, getValue } = props;
  const values = getValue();
  const count = values.length;
  if (count === 0) {
    return (
      <components.ValueContainer {...props}>
        {children}
      </components.ValueContainer>
    );
  }
  const kids = Children.toArray(children);
  const inputChild = kids[kids.length - 1];
  const first = values[0];
  const extra = count - 1;
  return (
    <components.ValueContainer {...props}>
      <span className="text-foreground flex min-w-0 shrink items-center gap-1 pl-1 text-sm">
        <span className="truncate">{first.label}</span>
        {extra > 0 ? (
          <span className="text-muted-foreground shrink-0 tabular-nums">
            +{extra}
          </span>
        ) : null}
      </span>
      {inputChild}
    </components.ValueContainer>
  );
}

const themedCategoryStyles = createThemedFilterSelectStyles<
  CategoryOption,
  false
>();
const themedProgressStyles = createThemedFilterSelectStyles<
  ProgressOption,
  false
>();
const genreSelectStyles = createThemedFilterSelectStyles<GenreOption, true>();

export default function FilterSection({ genres }: { genres: GenreListItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<StoryCategory | null>(null);
  const [progress, setProgress] = useState<StoryProgress | null>(null);
  const [genreSelection, setGenreSelection] = useState<MultiValue<GenreOption>>(
    []
  );
  const router = useRouter();
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !search.trim() &&
      !category &&
      !progress &&
      genreSelection.length === 0
    ) {
      router.push("/");
      return;
    }
    const sp = new URLSearchParams();
    if (search.trim()) sp.set("q", search.trim());
    if (category) sp.set("category", category.toLocaleLowerCase());
    if (progress) sp.set("progress", progress.toLocaleLowerCase());
    const base = sp.toString();
    let url = base ? `/?${base}` : "/";
    if (genreSelection.length > 0) {
      const genres = genreSelection.map((g) => g.value).join(",");
      url += `${base ? "&" : "?"}genres=${genres}`;
    }
    router.push(url);
  };
  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full min-w-0 flex-row flex-wrap items-center justify-center gap-2"
    >
      <div className="relative min-w-[8rem] shrink-0 sm:w-56">
        <input
          id="feed-filter-q"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border py-1 pr-10 pl-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="text-muted-foreground hover:bg-accent hover:text-foreground absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors"
        >
          <Search className="size-4 shrink-0" strokeWidth={2} />
        </button>
      </div>
      <div className="w-[9.5rem] shrink-0">
        <Select<CategoryOption, false>
          instanceId="feed-filter-category"
          aria-label="Category"
          placeholder="Category"
          isClearable
          styles={themedCategoryStyles}
          options={categoryOptions}
          value={
            category
              ? (categoryOptions.find((o) => o.value === category) ?? null)
              : null
          }
          onChange={(opt) =>
            setCategory(opt ? (opt.value as StoryCategory) : null)
          }
        />
      </div>
      <div className="w-[9.5rem] shrink-0">
        <Select<ProgressOption, false>
          instanceId="feed-filter-progress"
          aria-label="Status"
          placeholder="Status"
          isClearable
          styles={themedProgressStyles}
          options={progressOptions}
          value={
            progress
              ? (progressOptions.find((o) => o.value === progress) ?? null)
              : null
          }
          onChange={(opt) =>
            setProgress(opt ? (opt.value as StoryProgress) : null)
          }
        />
      </div>
      <div className="w-56 shrink-0">
        <Select<GenreOption, true>
          instanceId="feed-filter-genres"
          aria-label="Genre"
          placeholder="Genre"
          isMulti
          isClearable
          hideSelectedOptions={false}
          closeMenuOnSelect={false}
          blurInputOnSelect={false}
          components={{ ValueContainer: GenreValueContainer }}
          styles={genreSelectStyles}
          options={genres.map((genre) => ({
            value: genre.slug,
            label: genre.name,
          }))}
          value={genreSelection}
          onChange={(opts) => setGenreSelection(opts ?? [])}
        />
      </div>
      <button
        type="submit"
        aria-label="Apply filters"
        className="bg-button text-button-foreground hover:bg-button/90 flex size-9 shrink-0 items-center justify-center rounded-md transition-colors"
      >
        <Filter className="size-4 shrink-0" strokeWidth={2} />
      </button>
      <Link
        href="/classics"
        className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-9 shrink-0 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors"
      >
        Classics
      </Link>
    </form>
  );
}
