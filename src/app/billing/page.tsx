"use client";

import { InvoiceHistory } from "@/components/billing/InvoiceHistory";

export default function BillingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-6">
        <h1>Billing</h1>
        <p className="mt-1 text-muted-fg">
          What your account has been charged, built on the v3 data hooks in this
          app&apos;s own markup.
        </p>
      </header>

      <div className="space-y-6">
        <InvoiceHistory />
      </div>
    </div>
  );
}
