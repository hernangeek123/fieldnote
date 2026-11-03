# Pre-Publication Review

## Release Outcome

On November 3, after reviewing the prepared release and author-identity exposure,
the owner explicitly approved making `hernangeek123/fieldnote` public under MIT.
GitHub's API confirmed `visibility: public`. The owner separately accepted the
Official Rules and Devpost terms at the final action. Devpost then displayed
**Project submitted!** for https://devpost.com/software/fieldnote.

The tested security release is commit `e0285c9`, production deployment
`dpl_CpxazV7Kh5gXxZ8MiX5c5ogKUkUx` (Ready). All seven hosted checks passed after
deployment. The final full-history scan at that commit covered 29 commits and
697,335 bytes, with no leaks. The refreshed 100-file candidate directory scan
covered 381,630 bytes, with no leaks. These findings are scoped checks, not a
comprehensive security certification. Ongoing judge access remains necessary.

## November 3 Release Candidate

The owner requested completion and submission of the entire hackathon entry.
Public-repository approval and final terms acceptance were separate final
actions; this section records the review completed before requesting them.

- Gitleaks 8.30.1 scanned all 28 reachable commits with full history, full
  redaction, and no allow-comment suppression: no leaks found (683,102 bytes).
- A fresh 100-file publication candidate, built from tracked and non-ignored
  files, passed the directory scan: no leaks found (379,065 bytes).
- Exact comparisons checked the two non-public credential values present in
  local configuration against history, candidate files, and 17 generated client
  bundle files: no matches and no sensitive historical paths found. This is not
  a claim to know or compare credentials absent from local configuration.
- The dependency audit identified critical Next.js and high Zod/Undici
  advisories after the October review. Updated Next.js and eslint-config-next
  from 16.3.8 to 16.4.4, Zod from 4.6.5 to 4.6.7, and the existing transitive
  Undici from 7.30.0 to 7.30.1. No application logic or schema was changed.
- All 44 regression tests, lint, and the production build passed after updates.
  The production dependency audit reports **zero known vulnerabilities**. The
  all-dependency install audit still reports 16 moderate development-dependency
  findings; this release does not claim a clean all-dependency audit.
- Seven hosted smoke checks passed before the dependency deployment; repeat
  them once the updated release is ready.
- The public video and three gallery images use reviewed, redacted real app
  footage, synthetic data, and Sandbox labels. Raw captures and media tooling
  remain outside the repository. No login credentials are in the judge guide.
- GitHub reports private visibility, main branch, and owner admin permission.
  Only `.env.example` is tracked among environment/key paths.
- Git history attributes commits to **Hernan** and **Hernan Gonzalez Acosta**,
  email **n3rd1991@gmail.com**. Public release will expose that normal Git
  attribution alongside source, docs, and history. No identity rewrite was made.

Evidence reports remain outside the repository in `fieldnote-security-review`:
`history-2026-11-03-redacted.json` and `candidate-2026-11-03-redacted.json`.

Relevant advisories:
- https://github.com/advisories/GHSA-2464-fhr4-w9xw
- https://github.com/advisories/GHSA-673q-mjm6-r5xr
- https://github.com/advisories/GHSA-mrhx-c7xc-m3w5

## October 10 Review

Reviewed October 10, 2026, starting from `a5a1fce`, including the prepared demo
documents and the redirect hardening in this change. This is a scoped secrets
and credential-exposure review, not a penetration test or security certification.
The repository remains private; publication still requires owner approval.

## Checks And Results

- Gitleaks 8.30.1 scanned all 17 pre-existing reachable commits using
  `--log-opts="--all --full-history"`, built-in detection rules, full redaction,
  and no `gitleaks:allow` comment suppression. No leaks were reported.
- A separate Gitleaks directory scan covered the current tracked and non-ignored
  candidate files, including the new demo documents. No leaks were reported.
  Ignored environment files, build output, dependencies, and Vercel local
  configuration were deliberately excluded from the publication candidate.
- Exact-value comparisons checked the two credential values configured in local
  `.env.local` against reachable patch history and commit metadata, candidate
  files, and the generated browser bundle. No matches were found. Values were
  read only in local process memory and never printed or uploaded.
- Historical path checks found no committed local environment files, Vercel
  local configuration, or private-key files. `.env.example` is intentionally
  tracked. `.env.local`, `.vercel`, `.next`, and PEM files are ignored.
- The remote branch/tag inventory contained only `main` at the reviewed base.
  GitHub repository metadata confirmed private visibility.
- Credential-bearing PayPal, AI, and Supabase admin modules use `server-only`.
  Only the Supabase URL, publishable key, and app origin use `NEXT_PUBLIC_`.
  The webhook verifies signatures before database lookup or privileged writes.
- `npm audit --omit=dev` reported zero known production vulnerabilities at review
  time. This does not certify dependencies against unknown vulnerabilities.
- All 35 regression tests, lint, and the production build including TypeScript
  passed after the redirect fix. The prior four hosted smoke checks passed;
  they do not exercise a successful sign-in callback with a real email code.

## Fixed Finding

The login action and successful authentication callback previously accepted any
return path starting with one slash, provided it did not start with two slashes.
Browser URL parsing can interpret backslashes and stripped control characters
as an external authority, bypassing that string check.

Both handlers now use `safeRedirectPath`. It rejects external and malformed
paths, normalizes valid internal routes using the URL parser, and checks that
normalization cannot produce a network-path reference when resolved again.
Unsafe input falls back to `/app`. Four focused tests cover normal routes,
queries/fragments, malformed authorities, control characters, missing/non-text
values, and same-origin resolution after normalization.

The finding was reproduced with a benign local URL-parser check, not by sending
a sign-in email or redirecting an authenticated user. No credential compromise
was established and no credentials or Git history were rewritten.

## Reproduction And Evidence

Gitleaks was downloaded from its official GitHub release. The Windows x64 archive
was checked against the release's SHA-256 checksum before execution:

`d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e`

Example history check using an installed scanner:

```bash
gitleaks git --log-opts="--all --full-history" --ignore-gitleaks-allow --redact=100 .
npm audit --omit=dev
npm test
npm run lint
npm run build
```

Scan reports and the one-off exact-value checker are kept outside the repository
in the local `fieldnote-security-review` folder. They are not publication assets.
Scanner source and usage: https://github.com/gitleaks/gitleaks

## Before Going Public

- Repeat the history and candidate scans after any new source or documentation
  changes, and inspect every newly staged file.
- Review commit author identity: normal Git attribution can reveal author names
  and email addresses. No identity/history rewrite was performed by this review.
- Review screenshots and video separately. The repository scan does not certify
  screen recordings, external attachments, GitHub caches, or deleted remote refs.
- Do not include real customer information, mailbox contents, sign-in links,
  API secrets, or personal Sandbox login credentials in public instructions.
- Use the verified Google judging route and repeat its preflight before
  submission, including a completely new account's setup flow. Complete
  physical-phone acceptance and final video review. General email delivery
  requires custom SMTP only if offered as an alternative login method.
- Obtain owner approval before changing repository visibility or publishing video
  or submission materials. This review changes none of those settings.
