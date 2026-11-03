# PayPal AI Hackathon Submission

Requirements checked against the [official rules](https://paypalaihackathon.devpost.com/rules)
on November 3, 2026. Also review the
[FAQ](https://paypalaihackathon.devpost.com/details/faqs) and
[resources](https://paypalaihackathon.devpost.com/resources) before submitting.

Submission deadline: **November 12, 2026, noon PST (3 p.m. EST)**.
Keep judge access available without charge through **December 15, 2026,
8 a.m. PST (11 a.m. EST)**.

## Checklist

- [x] Add a recognizable open-source license at the repository root: MIT.
- [x] Document the live URL, setup, and test walkthrough.
- [x] Update the production acceptance record (November 3; owner-reported final phone/fresh-user checks distinguished from agent evidence).
- [x] Verify hosted Google login/sign-out with a second account outside Google's test-user list (November 2; existing FieldNote account).
- [x] Owner reported the remaining fresh-Google-user and physical-phone checks complete (November 3).
- [x] Prepare Google access, sample setup, draft-only steps, and optional Sandbox testing instructions in JUDGE_INSTRUCTIONS.md and DEVPOST_DRAFT.md.
- [x] Save the reviewed judge instructions in the submission form; main test needs no PayPal password.
- [ ] Keep hosting, Google authentication, and AI access funded/available
      throughout judging.
- [x] Review current source and reachable commit history for secrets (October 10; repeat before publication if content changes).
- [ ] Make the repository public before submission, with the owner's approval.
- [x] Record functioning app footage in English, under three minutes (November 3; 2:13 narrated export).
- [x] Publish the video publicly on YouTube: https://youtu.be/Gh-7FGhkBLE (Mike Wayne; November 3).
- [x] Save and verify the YouTube URL in the Devpost draft (November 3; persisted after reopening Project details).
- [x] Prepare the English project description and Google testing-instructions draft (not submitted).
- [x] Save the final English story, testing instructions, technology tags, screenshots, app/repo links, and owner-confirmed organizer answers in Devpost.
- [x] Verify meaningful AI and PayPal Sandbox use are visible in the public demo and submission draft.
- [ ] Accept the final terms with action-time approval and verify successful submission.

Video publication details are in [the demo record](DEMO_VIDEO.md).
The repository remains private for now. These documents are preparation, not a
submitted entry or a declaration that every acceptance check has passed.

Prepared materials: [judge instructions](JUDGE_INSTRUCTIONS.md),
[demo script](DEMO_SCRIPT.md),
[Devpost description draft](DEVPOST_DRAFT.md), and
[physical-phone checklist](MOBILE_ACCEPTANCE.md). The project story and organizer
fields are saved in Devpost, and the video is public. Repository publication and
final acceptance of Devpost's terms remain pending.
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
