"use client";

import { toast } from "sonner";

const LOGIN_PATH = "/login";

export function toastNotLoggedIn() {
  return toast.error("Not logged in", {
    position: "top-center",
    action: {
      label: "Log in",
      onClick: () => {
        window.location.assign(LOGIN_PATH);
      },
    },
  });
}
 
export function AreYouSure({message, onConfirm}: {message: string, onConfirm: () => void}) {
  return toast.error(message, {
    position: "top-center",
    duration: 60_000,
    cancel: {
      label: "Cancel",
      onClick: () => {},
    },
    action: {
      label: "Delete",
      onClick: () => {
        onConfirm();
      },
    },
  });
}