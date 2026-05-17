import { Cormorant_Garamond } from "next/font/google";
import { cn } from "@/lib/utils";

const logoType = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

type ChapterhouseLogoProps = {
  className?: string;
  showTagline?: boolean;
};

/** Chapterhouse wordmark — editorial serif, warm accent on “house”. */
export function ChapterhouseLogo({
  className,
  showTagline = false,
}: ChapterhouseLogoProps) {
  return (
    <span
      role="img"
      aria-label="Chapterhouse"
      className={cn(
        logoType.className,
        "inline-flex flex-col select-none",
        className,
      )}
    >
      <span className="inline-flex items-baseline leading-none">
        <span
          className={cn(
            "text-[1.75rem] font-semibold tracking-[-0.03em] sm:text-[2rem]",
            "text-[#2c1a0e] dark:text-[#f5ecd7]",
          )}
        >
          Chapter
        </span>
        <span
          className={cn(
            "text-[1.75rem] font-bold tracking-[-0.02em] sm:text-[2rem]",
            "text-button",
          )}
        >
          house
        </span>
      </span>

      {showTagline ? (
        <span
          className={cn(
            "mt-1.5 text-[0.5625rem] font-medium uppercase sm:text-[0.625rem]",
            "tracking-[0.38em] text-[#7a5c3e] dark:text-[#b8a898]",
          )}
        >
          Read · Write · Discover
        </span>
      ) : null}
    </span>
  );
}
