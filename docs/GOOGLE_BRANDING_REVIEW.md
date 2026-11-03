# Google Branding Preparation — Owner Review

Prepared November 3, 2026. The owner approved the exact policy pages, publication
of the ownership proof, Search Console verification for the named account, and
Google Production/branding submission. At this implementation commit, deployment
and Google's verification results are pending.

## Proposed Pages

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
The pages are proposed operator commitments, not a legal compliance certification.

## Google Configuration

App: FieldNote, Google Cloud project `fieldnote-513517`.

Observed in Google Cloud:

- App name is already **FieldNote**.
- Homepage: `https://fieldnote-lime.vercel.app`.
- Privacy and terms URLs are blank.
- Publishing status is **Testing**. Verification Center says verification is not
  required for that status. No verification submission is in progress.
- Current authorized hosts include the Vercel hostname and the project's
  Supabase callback host. No new scopes or domains have been added.

Proposed policy links after approval and deployment:

- `https://fieldnote-lime.vercel.app/privacy`
- `https://fieldnote-lime.vercel.app/terms`

Google requires brand verification to display the configured app name. Completing
the pages alone does not establish Google approval or guarantee the exact text
of every account-chooser screen. Keep the current Supabase callback intact.

## Domain Ownership

Vercel confirms `fieldnote-lime.vercel.app` is attached to the FieldNote project.
That is separate from Google Search Console ownership verification. Check the
URL-prefix HTML-file or HTML-tag method for this exact site and the Google
account used by the Cloud project. Do not claim ownership of `vercel.app` or
`supabase.co`, and do not buy a domain or enable paid Supabase domain add-ons.

Search Console offered an HTML-tag challenge for the exact URL-prefix property
`https://fieldnote-lime.vercel.app/` under `n3rd1991@gmail.com`. The corresponding
public proof is prepared in the root metadata. The owner approved publishing it
and completing verification, which grants that Google account owner-level Search
Console access for this URL-prefix property. No other site or account is included.

## Publication And Verification Steps

1. Have the owner review the exact policy text and approve publication.
2. Deploy both public pages and footer/login links; verify anonymous access,
   consistent URLs, and rendering in both themes.
3. Prepare Google's site-ownership proof for the exact Vercel URL. Obtain
   action-time approval before granting Search Console ownership or publishing
   an ownership token for a named Google account.
4. Save the approved live policy URLs in FieldNote's Google branding settings.
5. Review the audience/publishing change and Google's verification declarations
   with the owner before the final publish/verification action.
6. Record the actual result. If Google rejects shared-host ownership or requests
   other evidence, preserve working sign-in and report the specific blocker.

## References

- [Google branding requirements](https://support.google.com/cloud/answer/15549049?hl=en)
- [Google brand verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification)
- [Search Console verification methods](https://support.google.com/webmasters/answer/9008080?hl=en)
- [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)
- [Supabase Google sign-in guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
