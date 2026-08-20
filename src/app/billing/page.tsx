"use client";

import {
  CreditUsage,
  IncludedFeatures,
  Invoices,
  MeteredFeatures,
  PlanManager,
  UpcomingBill,
} from "@schematichq/schematic-components/v3";

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-6 py-4">
        <h1 className="text-2xl font-bold mb-1">Billing</h1>
        <p className="text-muted-foreground mb-6">
          Your plan, usage, and invoices.
        </p>

        <div className="space-y-4">
          <PlanManager
            className="schematic-card"
            onChangePlan={() => {
              console.debug("plan changed");
            }}
          />
          <IncludedFeatures className="schematic-card" />
          <MeteredFeatures className="schematic-card" />
          <CreditUsage className="schematic-card" />
          <Invoices className="schematic-card" limit={5} />
          <UpcomingBill className="schematic-card" />
        </div>
      </div>
    </div>
  );
}
