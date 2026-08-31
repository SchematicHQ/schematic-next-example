"use client";

import { Invoices } from "@schematichq/schematic-components/v3";

import "./invoices.css";

export default function InvoicesElementPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-6">
        <h1>Invoices</h1>
        <p className="mt-1 text-muted-fg">
          The v3 Invoices element, styled through its own class names.
        </p>
      </header>
      {/*
        `strings` renames copy by key — the whole integration for a host that
        wants different words in one language, with no i18n stack. The query
        matches /invoices so the two pages show the same rows.
      */}
      <Invoices
        limit={10}
        query={{ includePending: true }}
        showStatus
        strings={{ invoicesHeader: "Billing history" }}
      />
    </div>
  );
}
