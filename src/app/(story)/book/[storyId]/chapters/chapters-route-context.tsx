"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

export type ChaptersRouteValue = {
  storyId: string;
  /** Set on `/chapters/[chapterId]`; `null` on `/chapters` (list). */
  chapterId: string | null;
};

const ChaptersRouteContext = createContext<ChaptersRouteValue | null>(null);

export function ChaptersRouteProvider({
  storyId,
  chapterId,
  children,
}: ChaptersRouteValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ storyId, chapterId }),
    [storyId, chapterId]
  );
  return (
    <ChaptersRouteContext.Provider value={value}>
      {children}
    </ChaptersRouteContext.Provider>
  );
}

export function useChaptersRoute(): ChaptersRouteValue {
  const v = useContext(ChaptersRouteContext);
  if (!v) {
    throw new Error(
      "useChaptersRoute must be used under app/.../book/[storyId]/chapters"
    );
  }
  return v;
}

/** Same as `useChaptersRoute` when inside the provider; otherwise `null`. */
export function useChaptersRouteOptional(): ChaptersRouteValue | null {
  return useContext(ChaptersRouteContext);
}
