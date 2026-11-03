export type ThemePreference = "light" | "dark" | "system";

export const themeStorageKey = "fieldnote:appearance:v1";

export function themePreference(value: unknown): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

export function resolvedTheme(preference: ThemePreference, systemDark: boolean) {
  return preference === "system" ? systemDark ? "dark" : "light" : preference;
}

// Runs before page content paints; storage can be unavailable in private browsers.
export const themeInitScript = `(()=>{let p="system";try{const s=localStorage.getItem(${JSON.stringify(themeStorageKey)});if(s==="light"||s==="dark")p=s;}catch{}const r=document.documentElement;r.dataset.themePreference=p;r.dataset.theme=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";})();`;
