"use client";

import DeleteAccountAction from "@/app/actions/auth/delete_account";
import { AreYouSure } from "../modals/ToastIndex";

export default function DeleteAccountButton() {
  return (
    <button
      type="button"
      className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
      onClick={() =>
        AreYouSure({
          message: "Are you sure you want to delete your account?",
          onConfirm: () => {
            void DeleteAccountAction();
          },
        })
      }
    >
      Delete account
    </button>
  );
}
