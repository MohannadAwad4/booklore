"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ReaderMode = "book" | "regular";

type ReaderModeContextValue = {
  readerMode: ReaderMode;
  setReaderMode: (mode: ReaderMode) => void;
};

const ReaderModeContext = createContext<ReaderModeContextValue | null>(null);

export function ReaderModeProvider({ children }: { children: ReactNode }) {
  const [readerMode, setReaderMode] = useState<ReaderMode>("regular");
  const value = useMemo(() => ({ readerMode, setReaderMode }), [readerMode]);

  return (
    <ReaderModeContext.Provider value={value}>
      {children}
    </ReaderModeContext.Provider>
  );
}

export function useReaderMode() {
  const context = useContext(ReaderModeContext);

  if (!context) {
    throw new Error("useReaderMode must be used inside ReaderModeProvider");
  }

  return context;
}
