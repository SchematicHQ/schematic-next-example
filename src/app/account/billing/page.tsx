"use client";

import {
  Invoices,
  PaymentMethods,
  UpcomingBill,
} from "@schematichq/schematic-components/elements";

import { INVOICE_LIMIT, INVOICE_QUERY, INVOICE_STRINGS } from "@/utils/billing";

export default function AccountBillingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-6">
        <h1>Billing</h1>
        <p className="mt-1 text-muted-fg">
          Keep track of what you pay for and make changes whenever you need to.
        </p>
      </header>

      <div className="space-y-6">
        <UpcomingBill />
        <PaymentMethods />
        <Invoices
          limit={INVOICE_LIMIT}
          query={INVOICE_QUERY}
          strings={INVOICE_STRINGS}
        />
      </div>
    </div>
  );
}
