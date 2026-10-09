"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ComponentProps, createContext, ReactNode, useCallback, useContext,
  useEffect, useMemo, useRef, useState,
} from "react";

type Guard = {
  setBlocked: (blocked: boolean) => void;
  isBlocked: () => boolean;
  requestNavigation: (proceed: () => void) => void;
};

const GuardContext = createContext<Guard | null>(null);

export function useNavigationGuard() {
  const guard = useContext(GuardContext);
  if (!guard) throw new Error("Navigation guard provider is missing.");
  return guard;
}

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const blockedRef = useRef(false);
  const [blocked, setBlockedState] = useState(false);
  const [pending, setPending] = useState<{ proceed: () => void } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const keepEditingRef = useRef<HTMLButtonElement>(null);

  const setBlocked = useCallback((value: boolean) => {
    blockedRef.current = value;
    setBlockedState(value);
    if (!value) setPending(null);
  }, []);
  const isBlocked = useCallback(() => blockedRef.current, []);
  const requestNavigation = useCallback((proceed: () => void) => {
    if (blockedRef.current) setPending({ proceed });
    else proceed();
  }, []);
  const guard = useMemo(() => ({ setBlocked, isBlocked, requestNavigation }),
    [setBlocked, isBlocked, requestNavigation]);

  useEffect(() => {
    if (!blocked) return;
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!blockedRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", beforeUnload);

    // Some browsers expose history traversal but do not allow canceling it.
    const navigation = (window as Window & { navigation?: EventTarget & {
      currentEntry?: { key: string };
      traverseTo: (key: string) => { finished: Promise<unknown> };
    } }).navigation;
    let rollback: { from: string; to: string } | null = null;
    let restoring = false;
    function onNavigate(rawEvent: Event) {
      const event = rawEvent as Event & {
        navigationType: string; hashChange: boolean;
        destination: { key: string; sameDocument: boolean };
      };
      if (restoring || !blockedRef.current || event.hashChange
        || event.navigationType !== "traverse") return;
      if (event.cancelable) {
        event.preventDefault();
        requestNavigation(() => {
          void navigation?.traverseTo(event.destination.key).finished.catch(() => {});
        });
      } else if (event.destination.sameDocument && navigation?.currentEntry) {
        rollback = { from: navigation.currentEntry.key, to: event.destination.key };
      }
    }
    function onPopState(event: PopStateEvent) {
      if (!rollback || !navigation) return;
      // Keep Next's route intact while returning to the original history entry.
      event.stopImmediatePropagation();
      if (restoring) return;
      const target = rollback;
      restoring = true;
      void navigation.traverseTo(target.from).finished.then(() => {
        restoring = false;
        rollback = null;
        requestNavigation(() => {
          void navigation.traverseTo(target.to).finished.catch(() => {});
        });
      }).catch(() => {
        restoring = false;
        rollback = null;
      });
    }
    navigation?.addEventListener("navigate", onNavigate);
    window.addEventListener("popstate", onPopState, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      navigation?.removeEventListener("navigate", onNavigate);
      window.removeEventListener("popstate", onPopState, true);
    };
  }, [blocked, requestNavigation]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (pending && !dialog.open) {
      dialog.showModal();
      keepEditingRef.current?.focus();
    } else if (!pending && dialog.open) dialog.close();
  }, [pending]);

  return (
    <GuardContext.Provider value={guard}>
      {children}
      <dialog ref={dialogRef} aria-labelledby="unsaved-title" aria-describedby="unsaved-description"
        onCancel={(event) => { event.preventDefault(); setPending(null); }}
        onClose={() => setPending(null)}
        className="m-auto w-[calc(100%_-_2rem)] max-w-sm rounded-md border border-[#d7ddd7] bg-white p-6 text-[#17201a] shadow-xl backdrop:bg-black/40">
        <h2 id="unsaved-title" className="text-xl font-semibold">Leave this note?</h2>
        <p id="unsaved-description" className="mt-3 text-sm leading-6 text-[#657068]">
          Your unsaved text and recording will be lost.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button ref={keepEditingRef} type="button" onClick={() => setPending(null)}
            className="h-11 rounded-md bg-[#176b3a] px-4 text-sm font-semibold text-white">
            Keep editing
          </button>
          <button type="button" onClick={() => {
            const proceed = pending?.proceed;
            setBlocked(false);
            proceed?.();
          }} className="min-h-11 rounded-md border border-[#d7ddd7] px-4 py-2 text-sm font-semibold text-[#8a2e25]">
            Leave without saving
          </button>
        </div>
      </dialog>
    </GuardContext.Provider>
  );
}

type GuardedLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> & { href: string };

export function GuardedLink({ href, ...props }: GuardedLinkProps) {
  const router = useRouter();
  const guard = useNavigationGuard();
  return <Link {...props} href={href} onNavigate={(event) => {
    if (!guard.isBlocked() || href === window.location.pathname + window.location.search) return;
    event.preventDefault();
    guard.requestNavigation(() => router.push(href, { scroll: props.scroll }));
  }} />;
}

export function GuardedForm(props: Omit<ComponentProps<"form">, "onSubmit">) {
  const guard = useNavigationGuard();
  return <form {...props} onSubmit={(event) => {
    if (!guard.isBlocked()) return;
    event.preventDefault();
    const form = event.currentTarget;
    guard.requestNavigation(() => form.requestSubmit());
  }} />;
}
