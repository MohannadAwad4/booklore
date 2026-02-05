import Form from "next/form";
import Logout from "@/app/actions/auth/logout";
import Link from "next/link";
import { GetUserSession } from "@/app/api/auth/core/session";
export default async function NavigationHeader() {
  const user = await GetUserSession();
  return (
    <header className="border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Lore
        </Link>
        <nav className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
        {user?.id && (
            <Link
              href="/book/create-book"
              className="hover:text-gray-900 dark:hover:text-white transition"
            >
              Write
            </Link>
          )}
          <Link
            href="/book/my-books"
            className="hover:text-gray-900 dark:hover:text-white transition"
          >
            My Books
          </Link>
         
          {user?.id ? (
          <Form action={Logout}>
            <button
              type="submit"
              className="hover:text-gray-900 dark:hover:text-white transition"
            >
              Logout
            </button>
          </Form>
          ) : (
            <Link href="/login" className="hover:text-gray-900 dark:hover:text-white transition">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
