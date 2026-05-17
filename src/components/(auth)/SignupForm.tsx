"use client";

import Form from "next/form";
import { useActionState } from "react";
import {
  signUpAction,
  type SignUpFormState,
} from "@/app/actions/auth/signup";

const fieldClass =
  "w-full rounded-lg border border-border px-3 py-2 text-foreground placeholder:text-muted-foreground";

const initialSignUpState: SignUpFormState = {};

type SignupFormProps = {
  standalone?: boolean;
  anchorSubmitToBottom?: boolean;
};

function fieldError(
  errors: SignUpFormState["errors"],
  key: "email" | "username" | "password"
) {
  const msg = errors?.[key]?.[0];
  if (!msg) return null;
  return (
    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
      {msg}
    </p>
  );
}

export default function SignupForm({
  standalone = false,
  anchorSubmitToBottom = false,
}: SignupFormProps) {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialSignUpState
  );

  const heading = standalone ? (
    <h1 className="text-xl font-semibold text-foreground">Sign up</h1>
  ) : null;

  const errs = state.errors;

  const fields = (
    <>
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        autoComplete="email"
        className={fieldClass}
        disabled={isPending}
        aria-invalid={errs?.email ? true : undefined}
      />
      {fieldError(errs, "email")}
      <input
        name="username"
        type="text"
        placeholder="Username"
        required
        autoComplete="username"
        className={fieldClass}
        disabled={isPending}
        aria-invalid={errs?.username ? true : undefined}
      />
      {fieldError(errs, "username")}
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        autoComplete="new-password"
        className={fieldClass}
        disabled={isPending}
        aria-invalid={errs?.password ? true : undefined}
      />
      {fieldError(errs, "password")}
    </>
  );

  const formError =
    errs?._form?.[0] != null ? (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {errs._form[0]}
      </p>
    ) : null;

  const submit = (
    <button
      type="submit"
      disabled={isPending}
      className="global-button hover:bg-button/90 w-full shrink-0 disabled:opacity-60"
    >
      {isPending ? "Creating account…" : "Create account"}
    </button>
  );

  if (anchorSubmitToBottom) {
    return (
      <div className="mx-auto flex h-full min-h-0 w-full max-w-sm flex-col p-6">
        {heading ? <div className="shrink-0 pb-4">{heading}</div> : null}
        <Form
          action={formAction}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="shrink-0 space-y-3">
            {fields}
            {formError}
          </div>
          <div className="min-h-0 flex-1" aria-hidden />
          {submit}
        </Form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 p-6">
      {heading}
      <Form action={formAction} className="space-y-3">
        {fields}
        {formError}
        {submit}
      </Form>
    </div>
  );
}
