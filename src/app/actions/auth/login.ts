'use server';
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { CreateUserSession } from "@/app/api/auth/core/session";
import { redirect } from "next/navigation";

function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) {
      resolve(false);
      return;
    }
    crypto.scrypt(password.normalize(), salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      resolve(hash === derivedKey.toString("hex"));
    });
  });
}
export default async function Login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!email || !password) {
    throw new Error("Missing fields");
  }
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, username: true, passwordHash: true },
  });
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }
  await CreateUserSession(user.id);
  redirect("/book/create-book");
}
