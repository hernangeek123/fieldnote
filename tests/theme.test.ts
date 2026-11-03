import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { themeInitScript, themeStorageKey } from "../src/lib/theme";

function initialize(stored: string | null, systemDark: boolean, blocked = false) {
  const dataset: Record<string, string> = {};
  runInNewContext(themeInitScript, {
    document: { documentElement: { dataset } },
    localStorage: { getItem(key: string) {
      assert.equal(key, themeStorageKey);
      if (blocked) throw new Error("Storage blocked");
      return stored;
    } },
    matchMedia: (query: string) => {
      assert.equal(query, "(prefers-color-scheme: dark)");
      return { matches: systemDark };
    },
  });
  return dataset;
}

test("theme bootstrap applies an explicit saved choice before hydration", () => {
  assert.deepEqual(initialize("dark", false), { theme: "dark", themePreference: "dark" });
  assert.deepEqual(initialize("light", true), { theme: "light", themePreference: "light" });
});

test("theme bootstrap follows the device for new, system, or malformed preferences", () => {
  for (const stored of [null, "system", "unexpected", "</script><script>alert(1)</script>"]) {
    assert.deepEqual(initialize(stored, true), { theme: "dark", themePreference: "system" });
    assert.deepEqual(initialize(stored, false), { theme: "light", themePreference: "system" });
  }
});

test("blocked browser storage still initializes the device theme", () => {
  assert.deepEqual(initialize(null, true, true), { theme: "dark", themePreference: "system" });
  assert.deepEqual(initialize(null, false, true), { theme: "light", themePreference: "system" });
});

function luminance(hex: string) {
  const values = hex.match(/[a-f\d]{2}/gi)!.map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}

test("both theme palettes keep readable text, status badges, and action buttons", () => {
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const palettes = [":root", ':root[data-theme="dark"]'].map((selector) => {
    const block = css.slice(css.indexOf(`${selector} {`)).split("}")[0];
    return Object.fromEntries([...block.matchAll(/--([\w-]+): (#[a-f\d]{6});/g)]
      .map((match) => [match[1], match[2]]));
  });
  for (const [index, colors] of palettes.entries()) {
    const pairs = [
      ["foreground", "background"], ["foreground", "surface"],
      ["secondary", "surface"], ["muted", "surface"], ["muted", "background"],
      ["muted", "surface-muted"], ["accent", "surface"], ["accent", "background"],
      ["success", "success-soft"], ["danger", "danger-soft"],
      ["warning", "warning-soft"], ["info", "info-soft"],
      ["secondary", "neutral-soft"],
      ...["primary", "primary-hover", "strong", "strong-hover", "danger-action", "danger-action-hover"]
        .map((token) => ["white", token]),
    ];
    for (const [foreground, background] of pairs) {
      const a = luminance(foreground === "white" ? "#ffffff" : colors[foreground]);
      const b = luminance(colors[background]);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      assert.ok(ratio >= 4.5, `Theme ${index}: ${foreground}/${background} contrast ${ratio.toFixed(2)}`);
    }
  }
});
