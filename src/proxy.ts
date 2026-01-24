// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/book/create-book",
    "/book/my-books",
    "/book/:storyId/chapters/:chapterId*",
    "/book/:storyId/chapters",
  ],
};

export function proxy(request: NextRequest) {
  const sessionId = request.cookies.get("user_session")?.value;

  if (!sessionId) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
