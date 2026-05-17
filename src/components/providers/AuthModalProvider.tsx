"use client";

import LoginForm from "@/components/(auth)/LoginForm";
import SignupForm from "@/components/(auth)/SignupForm";
import { useUser } from "@/components/providers/SessionUserProvider";
import {
  openAuthModal,
  registerOpenAuthHandler,
  type OpenAuthOptions,
} from "@/lib/auth-modal-bridge";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tab = "login" | "register";

type AuthModalContextValue = {
  openAuth: (opts?: OpenAuthOptions) => void;
  closeAuth: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

const OPEN_AUTH_QUERY = "openAuth";

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}

function AuthUrlSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const flag = searchParams.get(OPEN_AUTH_QUERY);
    if (flag !== "1" && flag !== "true") return;

    openAuthModal({ tab: "login" });

    const next = new URLSearchParams(searchParams.toString());
    next.delete(OPEN_AUTH_QUERY);
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  return null;
}

export function AuthNavTrigger() {
  const { openAuth } = useAuthModal();
  return (
    <button
      type="button"
      className="global-button"
      onClick={() => openAuth({ tab: "login" })}
    >
      Login
    </button>
  );
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("login");
  const user = useUser();

  const openAuth = useCallback((opts?: OpenAuthOptions) => {
    setTab(opts?.tab ?? "login");
    setOpen(true);
  }, []);

  const closeAuth = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (user && open) {
      setOpen(false);
    }
  }, [user, open]);

  useLayoutEffect(() => {
    registerOpenAuthHandler(openAuth);
    return () => registerOpenAuthHandler(null);
  }, [openAuth]);

  const value = useMemo(
    () => ({ openAuth, closeAuth }),
    [openAuth, closeAuth]
  );

  const title = tab === "login" ? "Log in" : "Sign up";
  const linkBtn =
    "text-primary font-medium underline-offset-2 transition-colors hover:underline";

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <AuthUrlSync />
      </Suspense>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="grid min-h-[28rem] grid-rows-[auto_1fr_auto] sm:min-h-[30rem]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl leading-tight font-semibold">
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
            {tab === "login" ? (
              <LoginForm
                anchorSubmitToBottom
                onAuthenticated={closeAuth}
              />
            ) : (
              <SignupForm anchorSubmitToBottom />
            )}
          </div>
          <DialogFooter className="!flex-col border-border bg-muted/40 sm:!flex-col">
            {tab === "login" ? (
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className={linkBtn}
                  onClick={() => setTab("register")}
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  className={linkBtn}
                  onClick={() => setTab("login")}
                >
                  Log in
                </button>
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthModalContext.Provider>
  );
}
