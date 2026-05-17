import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const PAGE_LINK_BLOCK = 5;

function paginationItems(current: number, total: number): (number | "gap")[] {
  if (total <= 1) return [1];
  if (total <= PAGE_LINK_BLOCK) {
    const out: number[] = [];
    for (let p = 1; p <= total; p++) out.push(p);
    return out;
  }

  const blockStart =
    Math.floor((current - 1) / PAGE_LINK_BLOCK) * PAGE_LINK_BLOCK + 1;
  const blockEnd = Math.min(blockStart + PAGE_LINK_BLOCK - 1, total);

  const out: (number | "gap")[] = [];

  if (blockStart > 1) {
    out.push(1);
    if (blockStart > 2) out.push("gap");
  }

  for (let p = blockStart; p <= blockEnd; p++) {
    out.push(p);
  }

  if (blockEnd < total) {
    out.push("gap");
  }

  return out;
}

type ClassicsPaginationProps = {
  currentPage: number;
  totalPages: number;
  /** Path including leading slash, e.g. `/classics` */
  path: string;
  /** Search text to keep on page links (same as URL `q`) */
  q?: string;
};

export default function ClassicsPagination({
  currentPage,
  totalPages,
  path,
  q,
}: ClassicsPaginationProps) {
  const pages = paginationItems(currentPage, totalPages);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const pageHref = (n: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    sp.set("page", String(n));
    return `${path}?${sp.toString()}`;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={canPrev ? pageHref(currentPage - 1) : pageHref(1)}
            aria-disabled={!canPrev}
            tabIndex={!canPrev ? -1 : undefined}
            className={cn(!canPrev && "pointer-events-none opacity-50")}
          />
        </PaginationItem>

        {pages.map((item, i) =>
          item === "gap" ? (
            <PaginationItem key={`gap-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={pageHref(item)}
                isActive={item === currentPage}
                size="default"
                className="min-w-9"
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href={canNext ? pageHref(currentPage + 1) : pageHref(totalPages)}
            aria-disabled={!canNext}
            tabIndex={!canNext ? -1 : undefined}
            className={cn(!canNext && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export { PAGE_LINK_BLOCK };
