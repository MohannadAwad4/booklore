"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreateUserSession } from "@/app/api/auth/core/session";
import { signUpSchema } from "@/lib/validations/auth";
import { Prisma } from "@prisma/client";
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

export type SignUpFormState = {
  errors?: {
    email?: string[];
    username?: string[];
    password?: string[];
    _form?: string[];
  };
};

export async function signUpAction(
  _prevState: SignUpFormState,
  formData: FormData
): Promise<SignUpFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, username, password } = parsed.data;

  const existingEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingEmail) {
    return {
      errors: { email: ["An account with this email already exists"] },
    };
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (existingUsername) {
    return {
      errors: { username: ["This username is already taken"] },
    };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  try {
    const newUser = await prisma.user.create({
      data: { email, username, passwordHash },
    });

    await CreateUserSession(newUser.id);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        errors: {
          _form: ["This email or username is already in use."],
        },
      };
    }
    return {
      errors: { _form: ["Something went wrong. Please try again."] },
    };
  }

  redirect("/book/create-book");
}
