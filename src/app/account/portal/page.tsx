"use client";

import { Credits } from "@/components/billing/Credits";
import { FeatureUsage } from "@/components/billing/FeatureUsage";
import { InvoiceHistory } from "@/components/billing/InvoiceHistory";
import { NextBill } from "@/components/billing/NextBill";
import { PaymentMethodCard } from "@/components/billing/PaymentMethodCard";
import { Panel } from "@/components/ui";

export default function BillingPortalPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-8">
        <h1>Billing portal</h1>
        <p className="mt-1 text-muted-fg">
          Everything about your account in one place, from your plan to how you
          pay for it.
        </p>
      </header>

      <div className="space-y-8">
        <Panel title="Bills and payments">
          <NextBill />
          <PaymentMethodCard />
          <InvoiceHistory />
        </Panel>

        <Panel title="Plan usage">
          <FeatureUsage />
          <Credits />
        </Panel>
      </div>
    </div>
  );
}
