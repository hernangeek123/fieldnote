# Google Branding Publication And Review

Updated November 3, 2026. The owner approved the exact policy pages, publication
of the ownership proof, Search Console verification for the named account, and
Google Production/branding submission. Publication and ownership verification
are complete; branding approval is waiting on Google's ownership propagation.

## Verified Outcome

- Live policy pages, footer/login links, and public ownership tag deployed in
  commit `0c6dcf3bde035f5e5054ff3c3a1b089a6afb7a6d`, Vercel deployment
  `dpl_7Pv6NryVxRheU7pPVjniMhVX6oBx` (Ready).
- Lint, production build, and all seven hosted HTTP checks passed. Policy pages
  were checked in dark desktop and light narrow-screen layouts.
- Search Console showed **Ownership verified** for the exact URL-prefix
  `https://fieldnote-lime.vercel.app/`, account `n3rd1991@gmail.com`, HTML tag
  method. Its FieldNote property opened successfully after verification.
- Google Auth Platform audience is **External / In production**.
- Branding was submitted. Google's automated result says the homepage is not
  registered to the owner yet and instructs waiting **24 hours after ownership
  verification before retrying**, so its systems can update.
- No Google branding approval or changed account-chooser label is claimed.

The review dialog's exact issue was: “The website of your home page URL
"https://fieldnote-lime.vercel.app" is not registered to you.” Search Console's
success was observed separately; the review result explicitly directs allowing
24 hours for propagation. Do not appeal or repeatedly resubmit during this wait.

## Published Pages

- `/privacy`: Google identity information, workspace/invoice records, temporary
  browser audio, AI requests through Vercel AI Gateway to OpenAI, service
  providers, authentication cookies, theme storage, retention and data requests.
- `/terms`: free experimental demo, permitted test content, human review of AI,
  Sandbox-only invoices, availability limits, privacy, and contact.
- Operator: **FieldNote project owner**. Public contact:
  **n3rd1991@gmail.com**. The owner explicitly approved this display description
  and contact on November 3.

The retention text reflects the current implementation: no automatic expiry of
workspace records, manual handling of verified data requests, and possible
provider log/backup retention. It does not claim immediate deletion by every
provider, zero data retention, certification, or a self-service deletion feature.
The pages are owner-approved operator commitments, not a legal compliance
certification.

## Google Configuration

App: FieldNote, Google Cloud project `fieldnote-513517`.

Observed in Google Cloud:

- App name is already **FieldNote**.
- Homepage: `https://fieldnote-lime.vercel.app`.
- Privacy: `https://fieldnote-lime.vercel.app/privacy`.
- Terms: `https://fieldnote-lime.vercel.app/terms`.
- Publishing status is **In production**, External audience. Identity-only scopes
  were preserved; no Gmail, Drive, or offline access was added.
- Current authorized hosts include the Vercel hostname and the project's
  Supabase callback host. No new scopes or domains have been added.

Live policy links saved in Google branding:

- `https://fieldnote-lime.vercel.app/privacy`
- `https://fieldnote-lime.vercel.app/terms`

Google requires brand verification to display the configured app name. Completing
the pages alone does not establish Google approval or guarantee the exact text
of every account-chooser screen. Keep the current Supabase callback intact.

## Domain Ownership

Vercel confirms `fieldnote-lime.vercel.app` is attached to the FieldNote project.
Search Console additionally verified the exact URL-prefix with the HTML-tag
method for the Google account used by the Cloud project. This does not establish
ownership of `vercel.app` or `supabase.co`. Do not buy a domain or enable paid
Supabase domain add-ons as part of this task.

Search Console offered an HTML-tag challenge for the exact URL-prefix property
`https://fieldnote-lime.vercel.app/` under `n3rd1991@gmail.com`. The corresponding
public proof is deployed in the root metadata. Keep it there to retain verified
ownership. The owner approved and completed verification, granting that Google
account owner-level Search Console access for this URL-prefix property. No other
site or account is included. No domain purchase or paid add-on was activated.

## Remaining Verification Steps

1. Wait until no earlier than **November 4, 2026, noon America/New_York
   (17:00 UTC)**, which is safely over 24 hours after verification.
2. In FieldNote's Google Auth Platform Branding page, open **View issues**,
   select **I have fixed the issues**, and request re-verification. The owner
   already authorized branding review; no additional scopes or credentials are
   part of that authorization.
3. Observe the actual result. Publish approved branding if Google presents a
   separate publish step. If ownership still fails, inspect the exact issue
   and Google's review options without claiming ownership of provider domains.
4. Start a fresh Google sign-in from the live app and verify the actual chooser
   label and successful callback. Do not assume a saved app name is displayed.
5. Record the result. Preserve the current callback, scopes, policies, and tag.

The local policy-preview server was stopped after publication. No application
records, invoices, payment state, OAuth secrets, or billing settings were changed
by this publication/review task. A completely fresh Google-user workflow and
physical-phone acceptance remain separate pre-submission checks.

## References

- [Google branding requirements](https://support.google.com/cloud/answer/15549049?hl=en)
- [Google brand verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification)
- [Search Console verification methods](https://support.google.com/webmasters/answer/9008080?hl=en)
- [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)
- [Supabase Google sign-in guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
