# PayPal AI Hackathon Submission

Requirements checked against the [official rules](https://paypalaihackathon.devpost.com/rules)
on November 2, 2026. Also review the
[FAQ](https://paypalaihackathon.devpost.com/details/faqs) and
[resources](https://paypalaihackathon.devpost.com/resources) before submitting.

Submission deadline: **November 12, 2026, noon PST (3 p.m. EST)**.
Keep judge access available without charge through **December 15, 2026,
8 a.m. PST (11 a.m. EST)**.

## Checklist

- [x] Add a recognizable open-source license at the repository root: MIT.
- [x] Document the live URL, setup, and test walkthrough.
- [ ] Complete the production acceptance record in JUDGE_WALKTHROUGH.md.
- [x] Verify hosted Google login/sign-out with a second account outside Google's test-user list (November 2; existing FieldNote account).
- [ ] Verify a completely new Google account's signup, empty-workspace setup, and sample draft flow.
- [x] Prepare Google access, sample setup, draft-only steps, and optional Sandbox testing instructions in JUDGE_INSTRUCTIONS.md and DEVPOST_DRAFT.md.
- [ ] Add the reviewed judge instructions and any necessary assisted Sandbox access details to the submission form.
- [ ] Keep hosting, Google authentication, and AI access funded/available
      throughout judging.
- [x] Review current source and reachable commit history for secrets (October 10; repeat before publication if content changes).
- [ ] Make the repository public before submission, with the owner's approval.
- [ ] Record functioning app footage in English, under three minutes.
- [ ] Publish the video publicly on YouTube and add its URL to Devpost.
- [x] Prepare the English project description and Google testing-instructions draft (not submitted).
- [ ] Review and enter the final English description and testing instructions in Devpost.
- [ ] Verify meaningful AI and PayPal Sandbox use are visible in the submission.

The repository remains private for now. These documents are preparation, not a
submitted entry or a declaration that every acceptance check has passed.

Prepared materials: [judge instructions](JUDGE_INSTRUCTIONS.md),
[demo script](DEMO_SCRIPT.md),
[Devpost description draft](DEVPOST_DRAFT.md), and
[physical-phone checklist](MOBILE_ACCEPTANCE.md). These are local drafts;
no Devpost fields, repository visibility, or video publication were changed.
The [pre-publication review](PREPUBLICATION_REVIEW.md) records the secrets scan,
dependency check, fixed sign-in redirect finding, and remaining review limits.

## Demo Outline

Aim for approximately 2 minutes 40 seconds, leaving room below the video limit.

| Time | Footage |
| --- | --- |
| 0:00-0:15 | Introduce FieldNote and the solo contractor's invoicing problem. |
| 0:15-0:35 | Show the selected demo customer and owner-controlled price book. |
| 0:35-1:00 | Record a short job note and show its editable transcription. |
| 1:00-1:35 | Generate suggestions, inspect matches, correct a row, and approve. |
| 1:35-2:10 | Create the real Sandbox draft and show matching data in PayPal. |
| 2:10-2:30 | Demonstrate separate send confirmation using a controlled Sandbox recipient. |
| 2:30-2:40 | Close with the live URL and accurately distinguish current features from next steps. |

Record after the acceptance test passes. Do not expose credentials, mailbox
contents, or real customer data. Use only media you own or are permitted to use.
Show the actual flow rather than presenting a mockup as a working integration.

## Scope And Presentation

The AI turns rough work descriptions into catalog-linked suggestions; the owner
controls pricing and recipient selection. PayPal provides actual Sandbox invoice
creation and confirmed sending. The submission should show both integrations.

Do not claim live payments, measured time savings, or broad customer adoption
that the current build and evidence do not support. Invoice-status syncing is
deployed. Actual signed Sandbox created, updated, sent, and paid notifications
are verified, including automatic paid-status persistence after buyer checkout
for a USD 320.00 invoice. A second-account browser run verified audio upload,
transcription, AI extraction, approval, and Sandbox draft creation. The owner
completed send confirmation and payment; the agent verified their results and
automatic paid-status sync. Microphone transcription was checked separately.
The owner also verified native refresh/close warnings in normal production Chrome
tabs, and send cancellation in a local owner session with unchanged database
state. Google sign-in now supplies the judging access route without relying on
general email delivery. A completely new Google account's setup flow and
physical-phone testing remain acceptance gates. See the walkthrough for exact
evidence limits. General email-link delivery still needs custom SMTP if offered
as a judging alternative.
