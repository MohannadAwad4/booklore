"use server";

import requireUser from "@/app/api/auth/core/require-user";
import { DeleteUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function DeleteAccountAction() {
    const user = await requireUser();
    await DeleteUserSession();
    await prisma.user.delete({ where: { id: user.id } });
    revalidatePath("/");
    redirect("/?openAuth=1");
}