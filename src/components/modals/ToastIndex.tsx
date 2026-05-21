"use client";

import { openAuthModal } from "@/lib/auth-modal-bridge";
import { toast } from "sonner";

export function toastNotLoggedIn() {
  return toast.error("Not logged in", {
    position: "top-center",
    action: {
      label: "Log in",
      onClick: () => {
        openAuthModal({ tab: "login" });
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

export function ConfirmPublish({
  message,
  onConfirm,
}: {
  message: string;
  onConfirm: () => void;
}) {
  return toast.info(message, {
    position: "top-center",
    duration: 60_000,
    cancel: {
      label: "Cancel",
      onClick: () => {},
    },
    action: {
      label: "Confirm",
      onClick: () => {
        onConfirm();
      },
    },
    actionButtonStyle: {
      background: "var(--button)",
      color: "var(--button-foreground)",
    },
  });
}