import Form from "next/form";
import Logout from "@/app/actions/auth/logout";
import Link from "next/link";
import { GetUserSession } from "@/app/api/auth/core/session";
import ThemeToggle from "./ThemeToggle";
export default async function NavigationHeader() {
  const user = await GetUserSession();
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-bold text-foreground"
        >
          Lore
        </Link>
        <nav className="flex gap-6 text-sm text-muted-foreground">
        {user?.id && (
          <div>
            <Link
              href="/book/create-book"
              className="transition hover:text-foreground"
            >
              Write
            </Link>
            <Link href={`/user/${user.id}`} className="transition hover:text-foreground">Profile</Link>
           
            </div>
          )}
          <ThemeToggle />
          <Link
            href="/book/my-books"
            className="transition hover:text-foreground"
          >
            My Books
          </Link>
         
          {user?.id ? (
          <Form action={Logout}>
            <button
              type="submit"
              className="transition hover:text-foreground"
            >
              Logout
            </button>
          </Form>
          ) : (
            <Link href="/login" className="transition hover:text-foreground">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
