# FieldNote Judge Instructions

Open [FieldNote](https://fieldnote-lime.vercel.app/login) in a desktop or phone
browser. The hosted demo uses PayPal Sandbox. The main test ends with an unsent
USD 320.00 invoice draft; payment testing is optional.

## 1. Sign In With Google

Choose **Continue with Google** and use your own Google account. Google may show
`hhawqwpdljfdookbzagz.supabase.co`, FieldNote's authentication service, on the
account or consent screen. The requested information is your name, email, and
profile picture. Continue back to the FieldNote workspace.

There is no separate FieldNote password or email-link step for this route.
Email links remain in the interface, but general email delivery is not configured;
use Google for judging. If your organization's Google policy blocks access,
contact the submitter through Devpost with the visible error and browser name.

Each account has its own workspace. A first visit starts without demo customers,
services, or notes. Existing accounts keep their own records.

## 2. Add The Sample Customer And Price Book

In **Customers**, use **Add customer** with:

- **Name:** Demo Plumbing Customer
- **Email:** `sb-jhla153143388@personal.example.com`
- **Phone** and **Service address:** leave blank.

This is the project's synthetic PayPal Sandbox recipient for the draft-only test,
not a real customer or a FieldNote sign-in account. Its password is not needed to
create a draft. For optional payment testing, use your own Sandbox buyer instead,
as described below.

In **Price book**, add these three services. Enter prices as dollars, not cents;
descriptions may be left blank.

| Service name | Price | Per |
| --- | ---: | --- |
| Chrome kitchen faucet | 120.00 | each |
| Supply line | 15.00 | each |
| Plumbing labor | 85.00 | hour |

If these entries already exist in your workspace, reuse them after checking the
prices. Pencil buttons let you edit customers and services.

## 3. Capture And Review The Job

Choose **New note**, select **Demo Plumbing Customer**, and keep today's date.
Choose **Record note**, allow microphone access, and say:

> Replaced the kitchen faucet. Used one chrome kitchen faucet and two supply
> lines. Completed two hours of plumbing labor.

Choose **Stop recording**, then **Transcribe recording**. Play back the recording
and correct the text if needed. You can also upload a short supported audio file
up to 4 MB, or type the example directly to test the text-to-invoice path.
Recording is limited to two minutes. Typing does not exercise transcription.

Choose **Save draft**, then **Generate with AI** on the saved note. Review the
price-book selections, descriptions, quantities, and prices:

| Item | Quantity | Unit price | Line total |
| --- | ---: | ---: | ---: |
| Chrome kitchen faucet | 1 | $120.00 | $120.00 |
| Supply line | 2 | $15.00 | $30.00 |
| Plumbing labor | 2 | $85.00 | $170.00 |
| **Reviewed total** | | | **$320.00** |

AI suggestions can vary. Correct any unmatched item or wrong quantity before
choosing **Approve note**. This is the expected human-reviewed result.

## 4. Create The PayPal Sandbox Draft

Choose **Create PayPal draft**. In FieldNote, check the invoice number, draft
status, sample recipient, and USD 320.00 reviewed total. Choose **Refresh status**
and reload the note: the invoice number should stay the same and the line-item
editor should be locked. The note stays reviewed until the invoice is sent.

The main test is complete here. Creating a draft does not send it. Leave
**Send invoice** unused for this draft-only test. **Open in PayPal** is an optional
merchant view that requires separate Sandbox merchant access; the draft can be
checked in FieldNote without that login.

## Optional: Send And Sandbox Payment

To test payment independently, use a PayPal Sandbox Personal buyer you control.
Create a separate demo customer with that buyer's Sandbox email and a new note
using the same sample job. Select that customer before creating the invoice:
changing a customer later does not change an existing invoice's recipient.

After creating the new draft, choose **Send invoice** and cancel once to verify
the draft remains unsent. Choose **Send invoice** again, verify the Sandbox
recipient, and confirm when ready. The note should become invoiced and the
invoice status should become sent.

Choose **View payment page** and complete checkout yourself with your Sandbox
Personal buyer. This uses test funds. Return to FieldNote and reload the note to
check for paid status from the PayPal webhook. **Refresh status** performs manual
reconciliation if needed; distinguish that from an automatic webhook update.

The project buyer above is for the unsent draft example. Its login and the
project merchant's login are not shared in these instructions. If you need
assisted Sandbox access, contact the submitter through Devpost. Keep API keys,
personal account passwords, and real payment details out of the testing notes.

## If A Step Fails

- If sign-in is cancelled, return to the login page and choose **Continue with
  Google** again in the same browser.
- If the workspace is empty, follow the customer and price-book setup above.
- If microphone capture is unavailable, upload audio or type the sample, and
  report which path you used.
- If AI is unavailable, keep the saved draft and report the visible error.
  Manually entered line items can test review and invoicing, but do not verify AI.
- If invoice creation reports an error, stay on the same note and use its retry
  action when available. Include the note URL and visible error in your report;
  omit sign-in links and credentials.

Google sign-in, the sample workflow, and Sandbox paid-status sync have recorded
desktop verification. Physical-phone acceptance remains pending. Detailed dated
evidence is in [the acceptance record](JUDGE_WALKTHROUGH.md).
