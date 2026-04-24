"use client";

import type { SessionUser } from "@/app/api/auth/core/session";
import { createContext, useContext, type ReactNode } from "react";

const SessionUserContext = createContext<SessionUser | null>(null);

export function SessionUserProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  return (
    <SessionUserContext.Provider value={user}>
      {children}
    </SessionUserContext.Provider>
  );
}

/** Current viewer from the root layout (server-resolved each navigation). */
export function useUser() {
  return useContext(SessionUserContext);
}

