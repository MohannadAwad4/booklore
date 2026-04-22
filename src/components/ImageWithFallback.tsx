"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState, type ReactNode } from "react";

export type ImageWithFallbackProps = Omit<ImageProps, "src" | "onError"> & {
  src: string | null | undefined;
  /** Shown when `src` is empty or the image fails to load (e.g. Lucide placeholder). */
  fallback: ReactNode;
};

export default function ImageWithFallback({
  src,
  fallback,
  fill,
  className,
  width,
  height,
  ...rest
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const trimmed = src?.trim() ?? "";

  if (!trimmed || failed) {
    if (fill) {
      return (
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-muted/90 dark:bg-muted/70 ${className ?? ""}`.trim()}
        >
          {fallback}
        </div>
      );
    }
    const w = typeof width === "number" ? width : 100;
    const h = typeof height === "number" ? height : 100;
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden bg-muted text-muted-foreground ${className ?? ""}`.trim()}
        style={{ width: w, height: h }}
      >
        {fallback}
      </div>
    );
  }

  return (
    <Image
      {...rest}
      {...(fill
        ? { fill: true }
        : {
            width: width as number,
            height: height as number,
          })}
      src={trimmed}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
