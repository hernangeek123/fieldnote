import type { Metadata } from "next";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "FieldNote",
  description: "Speak the job. Send the invoice. Get paid.",
  // Public Search Console ownership proof for the project owner's Google account.
  verification: { google: "F4P9Geh4LlHnAS43LFdwQqoJ7FpAP6PgT5NcFy_XdPs" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
