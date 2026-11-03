"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { resolvedTheme, themePreference, themeStorageKey, type ThemePreference } from "@/lib/theme";

const themeChangeEvent = "fieldnote:appearance-change";

function getPreference() {
  return themePreference(document.documentElement.dataset.themePreference);
}

function getSnapshot() {
  return `${getPreference()}:${document.documentElement.dataset.theme === "dark" ? "dark" : "light"}`;
}

function getServerSnapshot() {
  return "system:light";
}

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = resolvedTheme(preference, window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  function onSystemChange() {
    if (getPreference() === "system") {
      applyTheme("system");
      onChange();
    }
  }
  function onStorage(event: StorageEvent) {
    if (event.key !== null && event.key !== themeStorageKey) return;
    applyTheme(themePreference(event.newValue));
    onChange();
  }
  window.addEventListener(themeChangeEvent, onChange);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", onSystemChange);
  // Account for a system change between the initial script and hydration.
  applyTheme(getPreference());
  return () => {
    window.removeEventListener(themeChangeEvent, onChange);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", onSystemChange);
  };
}

function setPreference(next: ThemePreference) {
  applyTheme(next);
  try { localStorage.setItem(themeStorageKey, next); } catch { /* This tab still keeps the selection. */ }
  window.dispatchEvent(new Event(themeChangeEvent));
}

export function ThemeToggle() {
  const [preference, theme] = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).split(":");
  const dark = theme === "dark";
  const Icon = dark ? Moon : Sun;

  return (
    <div role="group" aria-label="Appearance" className="inline-flex shrink-0 items-center gap-1">
      <button type="button" role="switch" aria-label="Dark mode" aria-checked={dark}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setPreference(dark ? "light" : "dark")}
        className="inline-flex size-11 items-center justify-center rounded-md border border-control bg-surface hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <span aria-hidden="true" className={`relative h-5 w-9 rounded-full ${dark ? "bg-primary" : "bg-line"}`}>
          <span className={`absolute left-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-white text-primary motion-safe:transition-transform ${dark ? "translate-x-4" : "translate-x-0"}`}>
            <Icon size={12} />
          </span>
        </span>
      </button>
      <button type="button" aria-label="Use system theme" aria-pressed={preference === "system"}
        title="Follow device theme" onClick={() => setPreference("system")}
        className={`inline-flex size-11 items-center justify-center rounded-md border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${preference === "system"
          ? "border-primary bg-primary text-white" : "border-control bg-surface text-secondary hover:bg-surface-hover"}`}>
        <Monitor size={17} aria-hidden="true" />
      </button>
    </div>
  );
}
