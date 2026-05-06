import crypto from "crypto";
import { prisma } from "@/lib/prisma";

type GoogleProfile = {
  sub: string;
  email: string;
  name?: string;
  picture?: string | null;
};

function usernameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "user";
  const safe = local.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 28);
  return safe.length > 0 ? safe : "user";
}

async function allocateUsername(email: string): Promise<string> {
  const base = usernameFromEmail(email);
  for (let i = 0; i < 24; i++) {
    const suffix = i === 0 ? "" : `_${crypto.randomBytes(2).toString("hex")}`;
    const candidate = `${base}${suffix}`.slice(0, 32);
    const taken = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  return `user_${crypto.randomBytes(8).toString("hex")}`;
}

export async function findOrProvisionGoogleUser(
  profile: GoogleProfile
): Promise<{ id: string }> {
  const { sub: googleId, email, name, picture } = profile;
  if (!email?.trim()) {
    throw new Error("Google did not return an email for this account.");
  }

  const byGoogle = await prisma.user.findFirst({
    where: { googleId },
    select: { id: true },
  });
  if (byGoogle) {
    const data: { displayName?: string; avatarUrl?: string | null } = {};
    if (name?.trim()) data.displayName = name.trim();
    if (picture) data.avatarUrl = picture;
    if (Object.keys(data).length > 0) {
      await prisma.user.update({ where: { id: byGoogle.id }, data });
    }
    return byGoogle;
  }

  const byEmail = await prisma.user.findUnique({
    where: { email: email.trim() },
    select: { id: true, googleId: true },
  });

  if (byEmail) {
    if (byEmail.googleId && byEmail.googleId !== googleId) {
      throw new Error(
        "This email is already linked to a different Google account."
      );
    }
    const data: {
      googleId: string;
      displayName?: string;
      avatarUrl?: string | null;
    } = { googleId };
    if (name?.trim()) data.displayName = name.trim();
    if (picture) data.avatarUrl = picture;
    return prisma.user.update({
      where: { id: byEmail.id },
      data,
      select: { id: true },
    });
  }

  const username = await allocateUsername(email.trim());
  return prisma.user.create({
    data: {
      email: email.trim(),
      username,
      googleId,
      passwordHash: null,
      displayName: name?.trim() || null,
      avatarUrl: picture ?? null,
    },
    select: { id: true },
  });
}
