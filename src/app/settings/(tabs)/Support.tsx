"use client";

import { useState } from "react";
import EmailSupport from "@/app/actions/support/email-support";
import { useUser } from "@/components/providers/SessionUserProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const toastOpts = { position: "top-center" as const };

export default function Support() {
  const user = useUser();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const form = e.currentTarget;
    const result = await EmailSupport(new FormData(form));
    setPending(false);
    if (result.success) {
      toast.success("Message sent.", toastOpts);
      form.reset();
    } else {
      toast.error(result.message, toastOpts);
    }
  }

  const fieldClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <CardTitle>Contact support</CardTitle>
        <CardDescription>
          Send a message to the Lore team. We reply to the email on your
          account.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="support-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="support-email"
              type="email"
              name="email"
              defaultValue={user?.email ?? ""}
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="support-subject" className="text-sm font-medium text-foreground">
              Subject
            </label>
            <input
              id="support-subject"
              type="text"
              name="subject"
              placeholder="What do you need help with?"
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="support-message" className="text-sm font-medium text-foreground">
              Message
            </label>
            <textarea
              id="support-message"
              name="message"
              placeholder="Describe your question or issue…"
              required
              rows={5}
              className={`${fieldClass} min-h-[120px] resize-y`}
            />
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
