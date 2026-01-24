"use server";
import { DeleteUserSession } from "@/app/api/auth/core/session";
import { redirect } from "next/navigation";
export default async function Logout() {
  await DeleteUserSession();
  redirect("/auth/login");
}
