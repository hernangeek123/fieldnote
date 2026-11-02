# FieldNote Demo Script

Target runtime: 2 minutes 40 seconds. This is a recording plan, not completed
footage. Show the working app, with all payments clearly identified as Sandbox.

## Before Recording

- Sign in with **Continue with Google**. The [judge instructions](JUDGE_INSTRUCTIONS.md)
  explain access and the fresh-workspace setup; general email delivery is not configured.
- Use the existing second-account demo workspace, not the owner's mixed sample
  records. Keep Demo Plumbing Customer and the three services below unchanged.
- Confirm the customer uses the controlled Sandbox Personal buyer. Never show
  mailbox contents, magic links, passwords, environment files, or developer keys.
- Check microphone permission, AI availability, and the current deployment.
- Complete the remaining checks in JUDGE_WALKTHROUGH.md and MOBILE_ACCEPTANCE.md.
- Keep the existing paid note available as a clearly identified prior test result.
  Create only one fresh demonstration note when ready to record the full flow.
- Use a normal browser tab for native confirmations. Do not mix footage from
  different invoices without identifying the switch. Leave time for processing;
  shorten waits in editing and label time cuts rather than implying instant work.
- Record the screen and narration separately if helpful. Use no unlicensed music.

## Sample Job

Customer: **Demo Plumbing Customer**.

| Service | Unit price | Quantity | Total |
| --- | ---: | ---: | ---: |
| Chrome kitchen faucet | $120.00 each | 1 | $120.00 |
| Supply line | $15.00 each | 2 | $30.00 |
| Plumbing labor | $85.00 per hour | 2 | $170.00 |
| **Reviewed total** | | | **$320.00** |

Speak: "Replaced the kitchen faucet. Used one chrome kitchen faucet and two
supply lines. Completed two hours of plumbing labor."

The table is the human-reviewed target. Check the actual AI response and correct
it visibly if needed; do not describe a different result from the one on screen.

## Shot List And Narration

| Time | Show | Say |
| --- | --- | --- |
| 0:00-0:15 | FieldNote overview, then New note | "This is FieldNote: speak the job, send the invoice, get paid. It is built for solo service professionals who finish a job with rough notes but still need to turn that work into an accurate bill." |
| 0:15-0:30 | Demo customer and exact price-book prices | "The business owns its customer list and price book. AI helps interpret the work; it does not choose the recipient or invent the business's prices." |
| 0:30-0:55 | Select the customer, record the sample, stop, transcribe | "I select the customer and record what happened." Speak the sample job, then: "The recording becomes editable text, so I can check it before saving." |
| 0:55-1:20 | Save draft, Generate with AI, inspect three rows | "FieldNote suggests line items and matches them to my price book. Here I check one faucet, two supply lines, and two hours of labor. Anything uncertain needs my review." |
| 1:20-1:40 | Review prices, quantities, $320 total; approve | "I remain in control of descriptions, quantities, and prices. The reviewed total is 320 dollars. Approval is a separate step before invoice creation." |
| 1:40-2:00 | Create PayPal draft, show ID, recipient, total and locked review | "Now FieldNote creates an actual PayPal Sandbox invoice draft. Creating it does not send it. The reviewed data is frozen so retries do not silently change this invoice." |
| 2:00-2:25 | Send confirmation, owner-confirmed Sandbox send and buyer checkout | "Sending requires a separate confirmation. This checkout uses a controlled Sandbox buyer, so no real money moves." Have the owner perform sending and payment; keep credential entry out of footage. |
| 2:25-2:40 | FieldNote paid badge without Refresh status, then app URL | "A verified PayPal webhook brings the paid status back into FieldNote. From a rough field note to a reviewed invoice and tracked Sandbox payment, the workflow stays connected." |

If the full checkout cannot fit, show the send and clearly label the paid example
as **Previously completed Sandbox payment**. Never imply a prior payment belongs
to the fresh invoice. Do not use Refresh status when claiming automatic webhook
delivery; if a refresh is necessary, describe it as manual reconciliation.

## Capture List

- Desktop overview with FieldNote's name visible.
- Physical-phone capture/transcription if its acceptance test passes.
- Customer and price-book editing, with no personal customer information.
- AI-generated rows and the human-reviewed USD 320.00 total.
- PayPal Sandbox draft, separate send confirmation, and paid-state result.

Keep unredacted captures private. Use synthetic customer details and mask
account email addresses if they are not needed to explain the workflow. Publish
only after reviewing the final video and receiving the owner's approval.
