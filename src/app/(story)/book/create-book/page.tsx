import Link from "next/link";
import Form from "next/form";
import CreateBook from "@/app/actions/book/create-book";
import CreateBookForm from "./CreateBookForm";

export default function CreateBookPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-xl mx-auto px-4 py-10">
        <Link
          href="/book/my-books"
          className="inline-block text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          ← Back to my books
        </Link>
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-neutral-700">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create a new book
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Add a title, optional description, and a cover image.
            </p>
          </div>
          <CreateBookForm />
        </div>
      </div>
    </div>
  );
}
