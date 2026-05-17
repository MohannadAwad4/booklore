import { Cormorant_Garamond } from "next/font/google";
import { cn } from "@/lib/utils";

/** Edit these to rebrand the app in one place. */
export const BRAND_NAME_ROOT = "Enki";
export const BRAND_NAME_ACCENT = "doodle";
export const BRAND_NAME = `${BRAND_NAME_ROOT}${BRAND_NAME_ACCENT}`;

export const brandHomeAriaLabel = `${BRAND_NAME} home`;
export const brandTagline = "Read · Write · Discover";

const logoType = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

type BrandWordmarkProps = {
  className?: string;
  showTagline?: boolean;
};

/** Site wordmark — root in ink, accent in primary color. */
export function BrandWordmark({
  className,
  showTagline = false,
}: BrandWordmarkProps) {
  return (
    <span
      role="img"
      aria-label={BRAND_NAME}
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
          {BRAND_NAME_ROOT}
        </span>
        <span
          className={cn(
            "text-[1.75rem] font-bold tracking-[-0.02em] sm:text-[2rem]",
            "text-button",
          )}
        >
          {BRAND_NAME_ACCENT}
        </span>
      </span>

      {showTagline ? (
        <span
          className={cn(
            "mt-1.5 text-[0.5625rem] font-medium uppercase sm:text-[0.625rem]",
            "tracking-[0.38em] text-[#7a5c3e] dark:text-[#b8a898]",
          )}
        >
          {brandTagline}
        </span>
      ) : null}
    </span>
  );
}
