import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy | FieldNote",
  description: "How FieldNote handles Google sign-in, work notes, audio, AI requests, and PayPal Sandbox invoice data.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy" summary="This policy explains how the FieldNote hackathon demo handles information when you sign in, capture work, use AI, and test PayPal Sandbox invoices.">
      <PolicySection title="Who operates FieldNote">
        <p>FieldNote is operated by the FieldNote project owner. For privacy questions or requests about your information, contact <a href="mailto:n3rd1991@gmail.com">n3rd1991@gmail.com</a>.</p>
        <p>The hosted application is an experimental demonstration. Please use synthetic customer details and Sandbox payment accounts when testing it.</p>
      </PolicySection>

      <PolicySection title="Information we handle">
        <ul>
          <li><strong>Account information:</strong> Google account identifiers, name, email address, profile picture information, and authentication/session metadata supplied through Google sign-in and Supabase Auth. Email-link sign-in, when available, uses the email address you enter.</li>
          <li><strong>Workspace records:</strong> customer names and contact details, service descriptions and prices, job dates, field notes and saved transcripts, generated and reviewed line items, and approval states.</li>
          <li><strong>Invoice records:</strong> the Sandbox recipient, invoice contents, amounts, invoice identifiers and links, status, and related processing or webhook information.</li>
          <li><strong>Audio:</strong> recordings or files you choose, held in the browser for preview and sent for transcription when you select that feature.</li>
          <li><strong>Operational information:</strong> hosting and authentication services may process IP addresses, browser information, timestamps, request metadata, and error/security logs to run and protect the service. If you contact support, we also receive the information you send.</li>
        </ul>
      </PolicySection>

      <PolicySection title="How information is used">
        <p>Information is used to authenticate your account, keep workspace records associated with their owner, save and edit your work, transcribe audio, suggest invoice line items, create and send Sandbox invoices after your actions, update invoice status, and investigate support or security issues.</p>
        <p>The project owner has administrative access to the demo&apos;s services for operation, support, and handling data requests. Account-based access controls restrict ordinary users to their own workspace.</p>
      </PolicySection>

      <PolicySection title="Google account information">
        <p>FieldNote requests basic identity permissions: OpenID, email, and profile. It does not request access to Gmail messages, Google Drive files, contacts, or calendars. Google account information is used for sign-in and account identification.</p>
        <p>FieldNote does not sell Google account information or use it for advertising. Google profile information is not explicitly included in the app&apos;s AI prompts; those requests contain the audio or work content described below.</p>
        <p>FieldNote&apos;s use and transfer of Google account data follows the <a href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>, including its Limited Use requirements.</p>
      </PolicySection>

      <PolicySection title="AI processing and audio">
        <p>When you choose transcription, audio is sent through Vercel AI Gateway to the configured transcription provider. When you choose AI generation, the selected field note and active price-book entries, including descriptions and prices, are sent for processing. The currently configured model provider is OpenAI. Names or other personal information you put into a recording, note, or catalog may therefore be included in that request.</p>
        <p>FieldNote does not save the original audio file in its database or file storage. An unsaved recording&apos;s preview is temporary browser data. Saved transcripts and reviewed work remain in your workspace. Processing providers may retain request information under their own service terms and settings; this is not a promise that every provider immediately deletes audio or prompts.</p>
      </PolicySection>

      <PolicySection title="Services that process information">
        <ul>
          <li><strong>Google:</strong> account authentication and the basic profile information you authorize. See <a href="https://policies.google.com/privacy">Google&apos;s privacy policy</a>.</li>
          <li><strong>Supabase:</strong> authentication, session management, and storage of account and workspace records. See <a href="https://supabase.com/privacy">Supabase&apos;s privacy information</a>.</li>
          <li><strong>Vercel:</strong> website hosting, server-side requests, operational logs, and AI Gateway routing. See <a href="https://vercel.com/legal/privacy-notice">Vercel&apos;s privacy notice</a>.</li>
          <li><strong>OpenAI:</strong> processing the audio or work content submitted to the configured models. See <a href="https://openai.com/enterprise-privacy/">OpenAI&apos;s API and business privacy information</a>.</li>
          <li><strong>PayPal:</strong> the recipient and reviewed invoice data needed to create, send, and track Sandbox invoices. Checkout and payment-account credentials are handled on PayPal&apos;s pages. FieldNote&apos;s forms do not collect payment-card numbers or PayPal passwords.</li>
        </ul>
        <p>These providers operate their own services and may process information in countries other than your own. Their applicable service terms, processing arrangements, and retention settings also govern their handling of information.</p>
      </PolicySection>

      <PolicySection title="Cookies and browser preferences">
        <p>Supabase authentication uses cookies to maintain the session and complete sign-in. FieldNote also stores your Light, Dark, or System appearance choice in browser storage. The application code does not include advertising trackers or a third-party analytics SDK. Hosting and authentication services still process operational information as described above.</p>
      </PolicySection>

      <PolicySection title="Retention and deletion requests">
        <p>Workspace records do not currently expire on an automatic schedule. They remain in the project database until removed by the project owner, including in response to a verified deletion request, or the project is shut down. Provider logs and backups may persist according to the providers&apos; retention arrangements.</p>
        <p>You can edit customer and service information in the app. To request access, correction, an export, or deletion of your account or workspace, email <a href="mailto:n3rd1991@gmail.com">n3rd1991@gmail.com</a> from the address associated with your account. We may ask for information needed to verify ownership. There is currently no self-service account-deletion button. Requests are reviewed and handled according to applicable obligations and the service&apos;s technical capabilities.</p>
        <p>You can also remove FieldNote&apos;s Google connection in <a href="https://myaccount.google.com/connections">your Google Account settings</a>. Revoking that connection does not by itself delete records already saved in FieldNote.</p>
      </PolicySection>

      <PolicySection title="Security and policy changes">
        <p>The hosted service uses HTTPS and account-based database access rules. No system can guarantee complete security. Please keep your sign-in account secure and avoid adding confidential production records to this demo.</p>
        <p>Updates to this policy will appear here with a new updated date. Changes to the use of Google account information will be disclosed before the new use, with further authorization requested where required.</p>
      </PolicySection>
    </PolicyPage>
  );
}
