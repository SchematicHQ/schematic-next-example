"use client";

import { InvoiceHistory } from "@/components/billing/InvoiceHistory";
import { NextBill } from "@/components/billing/NextBill";
import { PaymentMethodsList } from "@/components/billing/PaymentMethodsList";

export default function BillingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-6">
        <h1>Billing</h1>
        <p className="mt-1 text-muted-fg">
          What your account will be charged next, how it pays, and what it has
          been charged already, built on the elements hooks in this app&apos;s
          own markup.
        </p>
      </header>

      <div className="space-y-6">
        <NextBill />
        <PaymentMethodsList />
        <InvoiceHistory />
      </div>
    </div>
  );
}
