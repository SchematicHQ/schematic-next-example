"use client";

import { Credits } from "@/components/billing/Credits";
import { CurrentPlan } from "@/components/billing/CurrentPlan";
import { FeatureUsage } from "@/components/billing/FeatureUsage";
import { IncludedFeatureList } from "@/components/billing/IncludedFeatureList";
import { InvoiceHistory } from "@/components/billing/InvoiceHistory";
import { NextBill } from "@/components/billing/NextBill";
import { PaymentMethodCard } from "@/components/billing/PaymentMethodCard";
import { Panel } from "@/components/ui";

export default function BillingPortalPage() {
  return (
    <div className="w-full">
      <header className="mb-8">
        <h1>Billing portal</h1>
        <p className="mt-1 text-muted-fg">
          Everything about your account in one place, from your plan to how you
          pay for it.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-2">
        <Panel title="Bills and payments">
          <NextBill />
          <PaymentMethodCard />
          <InvoiceHistory />
        </Panel>

        <Panel title="Plan usage">
          <CurrentPlan />
          <IncludedFeatureList />
          <FeatureUsage />
          <Credits />
        </Panel>
      </div>
    </div>
  );
}
