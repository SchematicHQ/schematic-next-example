"use client";

import { InvoiceHistory } from "@/components/billing/InvoiceHistory";
import { NextBill } from "@/components/billing/NextBill";
import { PaymentMethodCard } from "@/components/billing/PaymentMethodCard";
import { Panel } from "@/components/ui";

export default function AccountPortalPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-8">
        <h1>Account portal</h1>
        <p className="mt-1 text-muted-fg">
          What your account will be charged next, how it pays, and what it has
          been charged already, built on the elements hooks in this app&apos;s
          own markup.
        </p>
      </header>

      <Panel title="Billing">
        <NextBill />
        <PaymentMethodCard />
        <InvoiceHistory />
      </Panel>
    </div>
  );
}
