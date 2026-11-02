import "server-only";
import { safeRedirectPath } from "./redirect-path";

type OAuthOptions = {
  provider: "google";
  options: { redirectTo: string; scopes: string; queryParams: { prompt: string } };
};
type StartOAuth = (options: OAuthOptions) => Promise<{
  data: { url: string | null };
  error: unknown;
}>;

export const googleSignInError = "Google sign-in could not be started. Please try again.";
export const googleCallbackError = "Google sign-in was cancelled or could not be completed. Please try again.";

export async function startGoogleSignIn(origin: string | undefined, next: unknown, start: StartOAuth) {
  try {
    if (!origin) return { error: googleSignInError };
    const site = new URL(origin);
    if (!["https:", "http:"].includes(site.protocol) || site.username || site.password
      || (site.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(site.hostname))) {
      return { error: googleSignInError };
    }
    const callback = new URL("/auth/callback", site.origin);
    callback.searchParams.set("next", safeRedirectPath(next));
    const { data, error } = await start({
      provider: "google",
      options: {
        redirectTo: callback.href,
        scopes: "openid email profile",
        queryParams: { prompt: "select_account" },
      },
    });
    if (error || !data.url) return { error: googleSignInError };
    const destination = new URL(data.url);
    if ((destination.protocol !== "https:" && !(destination.protocol === "http:"
      && ["localhost", "127.0.0.1", "[::1]"].includes(destination.hostname)))
      || destination.username || destination.password) {
      return { error: googleSignInError };
    }
    return { url: destination.href };
  } catch {
    return { error: googleSignInError };
  }
}
