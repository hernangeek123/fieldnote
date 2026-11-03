import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Terms of Service | FieldNote",
  description: "Terms for using the FieldNote hackathon demonstration and its AI-assisted PayPal Sandbox workflow.",
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of Service" summary="These terms apply to the FieldNote hackathon demonstration, operated by the FieldNote project owner. The demo is for evaluating a workflow with synthetic data and PayPal Sandbox accounts.">
      <PolicySection title="The demonstration">
        <p>FieldNote lets you maintain a sample customer list and price book, record or type field notes, review AI suggestions, and create and send PayPal Sandbox invoices. The hosted demo is provided free of charge for testing. It is not a production billing service, and its Sandbox payments do not move real money.</p>
      </PolicySection>

      <PolicySection title="Your account and content">
        <p>Use a sign-in account you control and keep it secure. Only enter recordings, customer details, and other content you are authorized to use and have processed by the services described in the <Link href="/privacy">Privacy Policy</Link>. Use synthetic customer information for this demonstration.</p>
        <p>You retain your rights in the content you submit. Using transcription, AI generation, or invoicing sends the relevant content to the service providers needed for that feature. Do not upload passwords, private API keys, real payment-card information, or content you have no right to share.</p>
        <p>Please do not attempt to access another user&apos;s records, interfere with the service, bypass its safeguards, or use it to send abusive or unauthorized invoices. Access may be restricted to protect the demo and its users.</p>
      </PolicySection>

      <PolicySection title="Review AI output before approval">
        <p>Transcripts and AI suggestions can be incomplete or wrong. You are responsible for checking the customer, recipient email, descriptions, catalog matches, quantities, prices, currency, and total before approving or sending an invoice.</p>
        <p>AI suggestions are not an instruction to charge a customer. FieldNote requires a separate review and approval step before invoice creation.</p>
      </PolicySection>

      <PolicySection title="PayPal Sandbox testing">
        <p>The hosted demo uses the project&apos;s configured Sandbox merchant account. Creating a draft does not send it. Sending requires a separate confirmation, and payment testing takes place on PayPal&apos;s hosted pages using a Sandbox Personal buyer.</p>
        <p>Use Sandbox recipients and test funds only. The project&apos;s demonstration accounts are not your personal PayPal account. Once an invoice is reserved, its details and recipient are fixed for retries; later changes to a customer or price book do not rewrite that invoice.</p>
        <p>Google, Supabase, Vercel, the model providers, and PayPal operate separate services whose terms may also apply when you use them.</p>
      </PolicySection>

      <PolicySection title="Availability and limits">
        <p>FieldNote is an experimental prototype provided as available. Features may change, requests may fail, and provider availability or usage limits may affect testing. There is no guarantee of uninterrupted service, error-free AI output, or suitability for production billing.</p>
        <p>Keep your own copy of work you need to retain. FieldNote is not a backup service. These terms do not remove rights or responsibilities that applicable law does not allow to be excluded.</p>
      </PolicySection>

      <PolicySection title="Privacy, requests, and changes">
        <p>The <Link href="/privacy">Privacy Policy</Link> explains account information, work records, AI processing, browser storage, and how to request access or deletion. Questions about these terms can be sent to <a href="mailto:n3rd1991@gmail.com">n3rd1991@gmail.com</a>.</p>
        <p>Changes to these terms will be posted here with an updated date. Review the current terms when returning to use the demonstration.</p>
      </PolicySection>
    </PolicyPage>
  );
}
