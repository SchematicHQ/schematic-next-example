/** The v3 elements the demo can render, by URL slug. Plain module: the
 * server page reads it, so it must not carry a "use client" directive. */
export const ELEMENTS = {
  "pricing-table": "PricingTable",
  "plan-manager": "PlanManager",
  "included-features": "IncludedFeatures",
  "metered-features": "MeteredFeatures",
  "credit-usage": "CreditUsage",
  invoices: "Invoices",
  "upcoming-bill": "UpcomingBill",
} as const;

export type ElementSlug = keyof typeof ELEMENTS;
