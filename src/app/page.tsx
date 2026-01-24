import Editor from "../components/rich-text-editor";

import Logout from "./actions/auth/logout";
import Form from "next/form";
import BookFeedPage from "./(story)/book/feed-books/page";
export default function Home() {
  return <BookFeedPage />;
}
