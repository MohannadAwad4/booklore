export type OpenAuthOptions = {
  tab?: "login" | "register";
};

type OpenAuthHandler = (opts?: OpenAuthOptions) => void;

let openAuthHandler: OpenAuthHandler | null = null;

/** Called from `AuthModalProvider` — registers the live opener. */
export function registerOpenAuthHandler(handler: OpenAuthHandler | null) {
  openAuthHandler = handler;
}

/** Open the global auth dialog (toasts, URL sync, `/login` handoff, etc.). */
export function openAuthModal(opts?: OpenAuthOptions) {
  openAuthHandler?.(opts);
}
