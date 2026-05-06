import { cookies } from "next/headers";
import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  oauthBaseUrlFromRequest,
  sanitizeOAuthRedirect,
} from "@/lib/oauth-redirect";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the environment.",
      },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const redirectAfter = sanitizeOAuthRedirect(url.searchParams.get("redirect"));

  const state = crypto.randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  cookieStore.set("oauth_redirect", redirectAfter, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  const origin = oauthBaseUrlFromRequest(request);
  const redirectUri = `${origin}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
