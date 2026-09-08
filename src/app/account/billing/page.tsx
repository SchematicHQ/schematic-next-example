"use client";

import { Invoices } from "@schematichq/schematic-components/elements";

import { INVOICE_LIMIT, INVOICE_QUERY, INVOICE_STRINGS } from "@/utils/billing";

export default function AccountBillingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-6">
        <h1>Billing</h1>
        <p className="mt-1 text-muted-fg">
          What your account has been charged, rendered by the packaged element.
        </p>
      </header>

      <div className="space-y-6">
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
