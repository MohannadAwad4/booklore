"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreateUserSession } from "@/app/api/auth/core/session";
import crypto from "crypto";

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex").normalize();
}

function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password.normalize(), salt, 64, (error, hash) => {
      if (error) reject(error);
      resolve(`${salt}:${hash.toString("hex")}`);
    });
  });
}

export default async function SignUp(formData: FormData) {
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!email || !username || !password) {
    throw new Error("Missing required fields");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const newUser = await prisma.user.create({
    data: { email, username, passwordHash },
  });

  await CreateUserSession(newUser.id);

  redirect("/book/create-book");
}
