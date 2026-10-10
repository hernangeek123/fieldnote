const baseOrigin = "https://fieldnote.invalid";

export function safeRedirectPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/app";
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code <= 0x20 || code === 0x7f || character === "\\") return "/app";
  }

  try {
    const target = new URL(value, baseOrigin);
    // Normalizing dot segments can turn a path into a network-path reference.
    if (target.origin !== baseOrigin || target.pathname.startsWith("//")) return "/app";
    return target.pathname + target.search + target.hash;
  } catch {
    return "/app";
  }
}
