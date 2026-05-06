"use client";

import { usePathname } from "next/navigation";

/** Hide global nav on chapter read + write (full-viewport layouts). */
function hideGlobalNav(pathname: string | null) {
  if (!pathname) return false;
  return /\/book\/[^/]+\/chapters\/[^/]+(\/write)?\/?$/.test(pathname);
}

export default function NavigationHeaderGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (hideGlobalNav(pathname)) return null;
  return <>{children}</>;
}
