"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { resolvedTheme, themePreference, themeStorageKey, type ThemePreference } from "@/lib/theme";

const themeChangeEvent = "fieldnote:appearance-change";

function getPreference() {
  return themePreference(document.documentElement.dataset.themePreference);
}

function getServerPreference(): ThemePreference {
  return "system";
}

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = resolvedTheme(preference, window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  function onSystemChange() {
    if (getPreference() === "system") applyTheme("system");
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

export function ThemeSelect() {
  const preference = useSyncExternalStore(subscribe, getPreference, getServerPreference);
  const Icon = preference === "dark" ? Moon : preference === "light" ? Sun : Monitor;

  return (
    <label className="flex items-center gap-2 text-sm text-secondary">
      <Icon size={17} aria-hidden="true" />
      <span className="text-xs font-medium">Appearance</span>
      <select value={preference} onChange={(event) => {
        const next = themePreference(event.target.value);
        applyTheme(next);
        try { localStorage.setItem(themeStorageKey, next); } catch { /* This tab still keeps the selection. */ }
        window.dispatchEvent(new Event(themeChangeEvent));
      }} className="min-h-11 rounded-md border border-control bg-surface px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
