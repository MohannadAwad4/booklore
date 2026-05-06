"use server";

import { Resend } from "resend";
import requireUser from "@/app/api/auth/core/require-user";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Must be a domain you verified in Resend, or Resend's test sender for development. */
const DEFAULT_RESEND_FROM = "Lore <onboarding@resend.dev>";

export default async function EmailSupport(formData: FormData) {
  try {
    const user = await requireUser();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!subject || !message) {
      return { success: false, message: "Subject and message are required." };
    }

    const to = process.env.SUPPORT_EMAIL?.trim();
    if (!to) {
      return { success: false, message: "Support email is not configured." };
    }

    const from = process.env.RESEND_FROM?.trim() || DEFAULT_RESEND_FROM;

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: user.email,
      subject: `[Support] ${subject}`,
      text: `From account: ${user.email}\n\n${message}`,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Something went wrong. Try again.";
    return { success: false, message };
  }
}