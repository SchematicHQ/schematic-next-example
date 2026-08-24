"use client";

import { Invoices, SchematicStyles } from "@schematichq/schematic-components/v3";


// The v3 Invoices element: reads GET /company/invoices through the access
// token the SchematicProvider holds (see ClientWrapper) — no per-page token
// plumbing or component ID.
export default function InvoicesPage() {
  return (
    <main>
      <SchematicStyles />
      <div style={{ margin: "2rem auto", maxWidth: "480px" }}>
        <Invoices showStatus limit={2} />
      </div>
    </main>
  );
}
