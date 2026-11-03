# Google Sign-In

Google sign-in uses Supabase's OAuth flow and the existing `/auth/callback` code
exchange. Email links remain available but still require custom SMTP for general
delivery. A purchased app domain is not required for the Google sign-in route.
For hosted testing, follow [the judge instructions](JUDGE_INSTRUCTIONS.md);
the account setup below is for maintainers deploying their own copy.

## Account Setup

Use a dedicated Google Cloud project, not a client from an unrelated product.
The owner approved creating **FieldNote**, project ID `fieldnote-513517`, with no
organization, no billing account selected, and no paid services enabled.

1. Configure FieldNote's Google Auth Platform branding and support/developer
   contact. The owner must review and agree to Google's User Data Policy.
2. Choose External audience. Check Google's publishing status before judge
   testing. Google documents a test-user-list exception for sign-in requests
   limited to basic name, email, and profile scopes. This app requests only
   those scopes. Verify an actual account outside the project/test-user list;
   adding other scopes would change the audience and verification requirements.
3. Configure only `openid`, `userinfo.email`, and `userinfo.profile` identity
   scopes. Do not request Gmail, Drive, calendar, offline access, or other APIs.
4. Create an OAuth client with application type **Web application**. Use the
   following authorized JavaScript origins:
   - `https://fieldnote-lime.vercel.app`
   - `http://localhost:3000` for local testing only; remove when no longer needed.
5. Add this Google authorized redirect URI, matching the callback shown in the
   Supabase Google provider settings:
   `https://hhawqwpdljfdookbzagz.supabase.co/auth/v1/callback`
6. The owner should handle credential creation and enter the client ID and secret
   directly into Supabase's Google provider form. Never paste the secret into
   chat, source files, a screenshot, or a public environment variable.
7. Enable the Google provider and save only after verifying the correct project,
   client, and callback. Do not disable email confirmation, nonce checks, or RLS.
8. Confirm Supabase's redirect allowlist includes the hosted app callback and the
   localhost callback for local testing. Keep the hosted site URL as the canonical
   app origin. Do not add broad wildcards to production redirect allowlists.

Google's OAuth client secret is stored in Supabase, not in Vercel or the browser.
The Google Cloud project and OAuth client do not need to use the same project
identifier as the Supabase database project.

## Application Behavior

The **Continue with Google** form starts OAuth in a server action using the
existing SSR cookie client. Supabase sets the PKCE verifier cookie before the
browser leaves FieldNote. The callback exchanges the code and saves the session
using the existing SSR client. The return path is validated at both boundaries.

The flow requests basic identity scopes and the account chooser, not offline
access. Provider errors and connection failures show a generic retry message.
Cancellation returns to the login page and retains a safe internal destination.
No provider error description or credential is copied into the page or URL.

Existing account linking follows Supabase's configured identity rules. Verify
the actual account/workspace after login; do not assume a new Google identity
should be given access to another user's records. This feature changes no RLS
policies or ownership fields.

## Verification

- Local unit tests cover identity scopes, safe return paths, origin validation,
  local callbacks, provider failures, and missing or unsafe authorization URLs.
- HTTP smoke tests cover both login methods rendering, private-route redirects,
  missing callback codes, Google cancellation, unsafe return paths, and unsigned
  webhook rejection. They do not create a Google session.
- For local authentication checks, set `FIELDNOTE_TEST_URL=http://localhost:3000`
  and run `node --test --test-name-pattern="login|workspace|callback|Google" tests/hosted-smoke.mjs`.
  The complete `npm run test:hosted` suite also requires webhook configuration:
  the local app intentionally returns 503 when it is absent. Omit the URL
  override to test the live Vercel alias after deployment, where the webhook
  must reject an unsigned request with 401.
- Browser checks must verify an actual Google sign-in, intended return path,
  account identity, sign-out, cancellation, and desktop/narrow-screen rendering.
- Judge readiness requires successful login from a non-test-list Google account,
  or another access method explicitly provided to judges. An owner-only test is
  not sufficient to certify this.

On November 2, 2026, Google sign-in was verified on localhost and the live Vercel
site using an existing second account outside Google's test-user list. The
callback returned to `/app/notes`, Supabase linked the Google identity to the
existing email account, and sign-out protected the workspace again. All 40
regression tests, lint, the production build, and six hosted HTTP checks passed.
Google remains External/Testing with identity scopes only and zero test users;
no Gmail, Drive, or offline access is requested. Physical-phone acceptance is
still pending. Detailed evidence is recorded in JUDGE_WALKTHROUGH.md.

## Displayed App Name And Branding

Google's saved app name is already FieldNote. The app remains in Testing, and
Google currently shows the Supabase callback hostname in the account chooser.
Google requires brand verification to display the configured name. Proposed
public privacy/terms pages, Search Console ownership proof, and publication
steps are tracked in [the branding review](GOOGLE_BRANDING_REVIEW.md). The owner
approved the prepared changes; neither Google approval nor a new chooser label has
been established. Keep the existing callback and identity-only scopes intact.

## Google Button Asset

`public/google-sign-in-icon.png` is Google's official light square icon asset,
downloaded from the pre-approved sign-in asset bundle. The custom button displays
its unchanged G symbol at its intended proportions. Google's branding asset is
not relicensed under this repository's MIT license.

References:
- https://supabase.com/docs/guides/auth/social-sign-in/auth-google
- https://support.google.com/cloud/answer/15549945?hl=en
- https://developers.google.com/identity/branding-guidelines
- https://developers.google.com/static/identity/images/signin-assets.zip
