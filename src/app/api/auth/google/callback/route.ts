import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CreateUserSession } from "@/app/api/auth/core/session";
import { findOrProvisionGoogleUser } from "@/lib/google-oauth-user";
import {
  oauthBaseUrlFromRequest,
  sanitizeOAuthRedirect,
} from "@/lib/oauth-redirect";

export const runtime = "nodejs";

function loginErrorUrl(base: string, message: string): URL {
  const u = new URL("/login", base);
  u.searchParams.set("error", message);
  return u;
}

export async function GET(request: Request) {
  const base = oauthBaseUrlFromRequest(request);
  const url = new URL(request.url);
  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    return NextResponse.redirect(
      loginErrorUrl(base, oauthError).toString(),
      302
    );
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(
      loginErrorUrl(base, "invalid_oauth_state").toString(),
      302
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      loginErrorUrl(base, "oauth_not_configured").toString(),
      302
    );
  }

  const redirectUri = `${base}/api/auth/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      loginErrorUrl(base, "token_exchange_failed").toString(),
      302
    );
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenJson.access_token;
  if (!accessToken) {
    return NextResponse.redirect(
      loginErrorUrl(base, "no_access_token").toString(),
      302
    );
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(
      loginErrorUrl(base, "userinfo_failed").toString(),
      302
    );
  }

  const profile = (await userRes.json()) as {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
  };

  if (!profile.sub || !profile.email) {
    return NextResponse.redirect(
      loginErrorUrl(base, "incomplete_profile").toString(),
      302
    );
  }

  try {
    const user = await findOrProvisionGoogleUser({
      sub: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture ?? null,
    });
    await CreateUserSession(user.id);
  } catch (e) {
    console.error("[google/callback]", e);
    return NextResponse.redirect(
      loginErrorUrl(base, "sign_in_failed").toString(),
      302
    );
  }

  const redirectAfter = sanitizeOAuthRedirect(
    cookieStore.get("oauth_redirect")?.value ?? null
  );
  cookieStore.delete("oauth_redirect");

  return NextResponse.redirect(new URL(redirectAfter, base).toString(), 302);
}
