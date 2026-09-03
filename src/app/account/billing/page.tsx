"use client";

import { Invoices, UpcomingBill } from "@schematichq/schematic-components/v3";

import {
  INVOICE_LIMIT,
  INVOICE_QUERY,
  INVOICE_STRINGS,
  UPCOMING_BILL_STRINGS,
} from "@/utils/billing";

export default function AccountBillingPage() {
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
        <UpcomingBill strings={UPCOMING_BILL_STRINGS} />
        <Invoices
          limit={INVOICE_LIMIT}
          query={INVOICE_QUERY}
          showStatus
          strings={INVOICE_STRINGS}
        />
      </div>
    </div>
  );
}
