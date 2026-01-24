import Form from "next/form";
import CreateBook from "@/app/actions/book/create-book";
export default function CreateBookPage() {
  return (
    <Form action={CreateBook}>
      <input name="title" placeholder="Book Title" required />
      <input name="description" placeholder="Book Description" required />
      <button type="submit">Create Book</button>
    </Form>
  );
}
