"use client";

import { EmbedProvider, PricingTable } from "@schematichq/schematic-components";

export default function Pricing() {
  const apiKey = process.env.NEXT_PUBLIC_SCHEMATIC_PUBLISHABLE_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_SCHEMATIC_API_URL;
  const apiConfig = apiUrl ? { basePath: apiUrl } : undefined;

  return (
    <EmbedProvider apiKey={apiKey} apiConfig={apiConfig} debug>
      <h1 className="text-2xl font-bold mb-4">Pricing</h1>
      <PricingTable callToActionUrl="/usage" />
    </EmbedProvider>
  );
}
