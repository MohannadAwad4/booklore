import { GetUserSession } from "./session";
export default async function RequireUser() {
  const user = await GetUserSession();
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
}