"use client";

import { InvoiceHistory } from "@/components/billing/InvoiceHistory";
import { NextBill } from "@/components/billing/NextBill";

export default function BillingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-6">
        <h1>Billing</h1>
        <p className="mt-1 text-muted-fg">
          What your account will be charged next and what it has been charged
          already.
        </p>
      </header>

      <div className="space-y-6">
        <NextBill />
        <InvoiceHistory />
      </div>
    </div>
  );
}
