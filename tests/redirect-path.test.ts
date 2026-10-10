import assert from "node:assert/strict";
import test from "node:test";
import { safeRedirectPath } from "../src/lib/auth/redirect-path";

test("sign-in return paths preserve internal routes, queries, and fragments", () => {
  for (const path of ["/", "/app", "/app/notes/new", "/app/notes?status=draft#recent",
    "/app/customers?name=Demo%20Customer", "/app?next=https://example.org"]) {
    assert.equal(safeRedirectPath(path), path);
  }
  assert.equal(safeRedirectPath("/app/notes/../customers"), "/app/customers");
});

test("sign-in return paths reject external and browser-normalized authority forms", () => {
  for (const path of ["https://example.org", "//example.org", "///example.org",
    "/\\example.org", "/app/..//example.org", "/%2e%2e//example.org",
    "/\t/example.org", "/\n/example.org", " /app", "/app\u0000", "/app\u007f",
    "javascript:alert(1)", "app/notes", ""]) {
    assert.equal(safeRedirectPath(path), "/app");
  }
});

test("missing and non-text sign-in return paths use the workspace fallback", () => {
  for (const value of [null, undefined, 42, {}, ["/app/notes"], new Blob(["/app/notes"])]) {
    assert.equal(safeRedirectPath(value), "/app");
  }
});

test("validated return paths remain same-origin when resolved again by the callback", () => {
  for (const path of ["/app", "/app?next=//example.org", "/%2fexample.org", "/%5cexample.org",
    "/app/..//example.org", "/\\example.org", "/%2e/..//example.org"]) {
    const destination = new URL(safeRedirectPath(path), "https://fieldnote-lime.vercel.app");
    assert.equal(destination.origin, "https://fieldnote-lime.vercel.app");
  }
});
