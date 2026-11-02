import assert from "node:assert/strict";
import test from "node:test";
import { googleSignInError, startGoogleSignIn } from "../src/lib/auth/google-sign-in";

const origin = "https://fieldnote-lime.vercel.app";
const authorize = "https://hhawqwpdljfdookbzagz.supabase.co/auth/v1/authorize?provider=google";

test("Google sign-in requests only identity scopes and preserves an internal return path", async () => {
  const result = await startGoogleSignIn(origin, "/app/notes?status=draft", async (input) => {
    assert.equal(input.provider, "google");
    assert.equal(input.options.scopes, "openid email profile");
    assert.deepEqual(input.options.queryParams, { prompt: "select_account" });
    const callback = new URL(input.options.redirectTo);
    assert.equal(callback.origin, origin);
    assert.equal(callback.pathname, "/auth/callback");
    assert.equal(callback.searchParams.get("next"), "/app/notes?status=draft");
    return { data: { url: authorize }, error: null };
  });
  assert.deepEqual(result, { url: authorize });
});

test("Google sign-in replaces unsafe return destinations with the workspace", async () => {
  for (const next of ["//example.org", "/\\example.org", "/app/..//example.org", null]) {
    await startGoogleSignIn(origin, next, async (input) => {
      assert.equal(new URL(input.options.redirectTo).searchParams.get("next"), "/app");
      return { data: { url: authorize }, error: null };
    });
  }
});

test("Google sign-in rejects missing, malformed, credential-bearing and insecure origins before OAuth", async () => {
  for (const site of [undefined, "invalid", "javascript:alert(1)", "http://example.org", "https://user:password@example.org"]) {
    assert.deepEqual(await startGoogleSignIn(site, "/app", async () => {
      assert.fail("Invalid origins must not start OAuth");
    }), { error: googleSignInError });
  }
});

test("Google sign-in supports a local callback for development", async () => {
  const result = await startGoogleSignIn("http://localhost:3000", "/app", async (input) => {
    assert.equal(new URL(input.options.redirectTo).origin, "http://localhost:3000");
    return { data: { url: authorize }, error: null };
  });
  assert.ok(result.url);
});

test("Google sign-in hides provider errors and handles network failures and missing URLs", async () => {
  for (const response of [{ data: { url: null }, error: null },
    { data: { url: authorize }, error: { message: "internal provider detail" } },
    { data: { url: "javascript:alert(1)" }, error: null },
    { data: { url: "http://example.org/authorize" }, error: null },
    { data: { url: "https://user:password@example.org" }, error: null }]) {
    assert.deepEqual(await startGoogleSignIn(origin, "/app", async () => response), { error: googleSignInError });
  }
  assert.deepEqual(await startGoogleSignIn(origin, "/app", async () => {
    throw new Error("internal network detail");
  }), { error: googleSignInError });
});
