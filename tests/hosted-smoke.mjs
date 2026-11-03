import assert from "node:assert/strict";
import test from "node:test";

const base = process.env.FIELDNOTE_TEST_URL ?? "https://fieldnote-lime.vercel.app";
const request = (path, options = {}) => fetch(`${base}${path}`, {
  ...options,
  redirect: "manual",
  signal: AbortSignal.timeout(15_000),
});

test("hosted login renders the sign-in form", async () => {
  const response = await request("/login");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Email me a sign-in link/);
  assert.match(html, /Continue with Google/);
  assert.match(html, /Appearance/);
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-label="Dark mode"/);
  assert.match(html, /Use system theme/);
  assert.match(html, /fieldnote:appearance:v1/);
});

test("hosted workspace routes require sign-in", async () => {
  for (const path of ["/app", "/app/customers", "/app/catalog", "/app/notes", "/app/notes/new"]) {
    const response = await request(path);
    assert.equal(response.status, 307, path);
    const location = new URL(response.headers.get("location"), base);
    assert.equal(location.origin, base);
    assert.equal(location.pathname, "/login");
    assert.equal(location.searchParams.get("next"), path);
  }
});

test("hosted callback without an authorization code returns a safe error", async () => {
  const response = await request("/auth/callback");
  assert.equal(response.status, 307);
  const location = new URL(response.headers.get("location"), base);
  assert.equal(location.origin, base);
  assert.equal(location.pathname, "/login");
  assert.equal(location.searchParams.get("error"), "That sign-in link is invalid or expired.");
});

test("cancelled Google sign-in returns a safe error and retains an internal destination", async () => {
  const response = await request(`/auth/callback?${new URLSearchParams({
    error: "access_denied", error_description: "Provider-controlled detail", next: "/app/notes",
  })}`);
  assert.equal(response.status, 307);
  const location = new URL(response.headers.get("location"), base);
  assert.equal(location.origin, base);
  assert.equal(location.pathname, "/login");
  assert.equal(location.searchParams.get("error"), "Google sign-in was cancelled or could not be completed. Please try again.");
  assert.equal(location.searchParams.get("next"), "/app/notes");
  assert.equal(location.href.includes("Provider-controlled detail"), false);
});

test("cancelled Google sign-in cannot redirect to an external destination", async () => {
  const response = await request(`/auth/callback?${new URLSearchParams({ error: "access_denied", next: "/\\example.org" })}`);
  assert.equal(response.status, 307);
  const location = new URL(response.headers.get("location"), base);
  assert.equal(location.origin, base);
  assert.equal(location.searchParams.get("next"), "/app");
});

test("hosted webhook rejects an unsigned payment event", async () => {
  const response = await request("/api/paypal/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "WH-UNSIGNED-HOSTED-SMOKE",
      event_type: "INVOICING.INVOICE.PAID",
      resource: { invoice: { id: "INV2-NOT-A-REAL-INVOICE" } },
    }),
  });
  assert.equal(response.status, 401);
});
